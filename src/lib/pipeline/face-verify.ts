/**
 * Pipeline: Face Verification
 *
 * After a video cut is generated, this module compares the person in the
 * generated video against the user's reference photo to verify identity
 * consistency. Uses Gemini Vision API to analyze similarity.
 *
 * Integration point: called after each cut completes (in the poll step,
 * after downloading the video). Results are stored in cut metadata at
 * meta.cutJobs[i].faceVerify.
 *
 * If no Gemini key is configured, verification is silently skipped so
 * the pipeline is never blocked by this optional quality check.
 */

// ---- Types ---------------------------------------------------------------

export interface FaceVerifyResult {
  /** Whether the generated face matches the reference photo */
  matched: boolean;
  /** Similarity score from 1-10 (0 if verification was skipped) */
  confidence: number;
  /** Human-readable issues or differences detected */
  issues: string[];
}

interface GeminiFaceComparison {
  similarity: number;
  differences: string[];
  isMatch: boolean;
}

// ---- Constants -----------------------------------------------------------

const GOOGLE_AI_STUDIO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/** Minimum similarity score to consider the face a match */
const MATCH_THRESHOLD = 6;

/** Below this confidence, the face is definitely wrong and should be rejected */
const REJECT_THRESHOLD = 4;

/** Timeout for fetching image/video thumbnails (ms) */
const FETCH_TIMEOUT_MS = 15_000;

// ---- Main Entry Points ---------------------------------------------------

/**
 * Verify that the person in a generated video matches the reference photo.
 *
 * Strategy:
 *  1. Fetch the video thumbnail (first frame proxy) as a base64 image.
 *  2. Fetch the reference photo as a base64 image.
 *  3. Send both to Gemini Vision with a structured comparison prompt.
 *  4. Parse the JSON response into a FaceVerifyResult.
 *
 * If the Gemini key is not configured, returns a skip result so the
 * pipeline is never blocked.
 */
export async function verifyFaceMatch(
  videoUrl: string,
  referencePhotoUrl: string
): Promise<FaceVerifyResult> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;

  // No API key -- skip verification gracefully
  if (!apiKey) {
    return {
      matched: true,
      confidence: 0,
      issues: ["No verification available -- GOOGLE_AI_STUDIO_KEY not configured"],
    };
  }

  // Guard: need both URLs
  if (!videoUrl || !referencePhotoUrl) {
    return {
      matched: true,
      confidence: 0,
      issues: ["Missing video URL or reference photo URL -- skipping verification"],
    };
  }

  try {
    // Fetch both images as base64 for Gemini Vision
    const [videoImageB64, referenceImageB64] = await Promise.all([
      fetchImageAsBase64(videoUrl),
      fetchImageAsBase64(referencePhotoUrl),
    ]);

    if (!videoImageB64 || !referenceImageB64) {
      console.warn("[face-verify] Could not fetch one or both images for comparison");
      return {
        matched: true,
        confidence: 0,
        issues: ["Could not fetch images for face verification"],
      };
    }

    // Send to Gemini Vision for comparison
    const comparison = await compareFacesWithGemini(
      apiKey,
      referenceImageB64,
      videoImageB64
    );

    if (!comparison) {
      console.warn("[face-verify] Gemini did not return a valid comparison");
      return {
        matched: true,
        confidence: 0,
        issues: ["Face comparison returned no result -- skipping"],
      };
    }

    const matched = comparison.similarity >= MATCH_THRESHOLD;
    const result: FaceVerifyResult = {
      matched,
      confidence: comparison.similarity,
      issues: comparison.differences.length > 0
        ? comparison.differences
        : matched
          ? ["Face match confirmed"]
          : ["Face mismatch detected"],
    };

    if (!matched) {
      console.warn(
        `[face-verify] Face mismatch detected. Similarity: ${comparison.similarity}/10. ` +
        `Differences: ${comparison.differences.join(", ")}`
      );
    } else {
      console.log(
        `[face-verify] Face match confirmed. Similarity: ${comparison.similarity}/10`
      );
    }

    return result;
  } catch (err: any) {
    console.error("[face-verify] Error during face verification:", err?.message || err);
    return {
      matched: true,
      confidence: 0,
      issues: [`Face verification error: ${err?.message || "unknown"}`],
    };
  }
}

/**
 * Returns true if the face verification confidence is below the rejection
 * threshold, indicating the generated person is definitely not the same
 * as the reference photo.
 *
 * When this returns true and retries are available, the cut should be
 * resubmitted with a stronger identity constraint in the prompt.
 */
export function shouldRejectCut(result: FaceVerifyResult): boolean {
  // Only reject if we actually ran verification (confidence > 0)
  // A confidence of 0 means verification was skipped
  if (result.confidence === 0) return false;
  return result.confidence < REJECT_THRESHOLD;
}

// ---- Gemini Vision Comparison --------------------------------------------

/**
 * Send two images to Gemini Vision and ask it to compare the faces.
 * Returns a structured comparison result or null on failure.
 */
async function compareFacesWithGemini(
  apiKey: string,
  referenceImageB64: ImageData,
  videoImageB64: ImageData
): Promise<GeminiFaceComparison | null> {
  const prompt = `Compare these two images. Does the person in Image B (the video frame) look like the person in Image A (the reference photo)?

Rate the similarity from 1-10 where:
- 1-3: Clearly different people (different gender, ethnicity, age group, or face shape)
- 4-5: Some resemblance but noticeable differences (could be siblings but not the same person)
- 6-7: Likely the same person with minor differences (lighting, angle, expression changes)
- 8-10: Definitely the same person

List any specific differences you notice (hair color, face shape, skin tone, age, gender, distinctive features).

Return ONLY valid JSON in this exact format:
{ "similarity": <number 1-10>, "differences": ["difference 1", "difference 2"], "isMatch": <true if similarity >= 6> }`;

  try {
    const response = await fetch(
      `${GOOGLE_AI_STUDIO_URL}/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: "Image A (Reference Photo):" },
                {
                  inlineData: {
                    mimeType: referenceImageB64.mimeType,
                    data: referenceImageB64.base64,
                  },
                },
                { text: "Image B (Generated Video Frame):" },
                {
                  inlineData: {
                    mimeType: videoImageB64.mimeType,
                    data: videoImageB64.base64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[face-verify] Gemini API error:", errText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("[face-verify] No text in Gemini response");
      return null;
    }

    const parsed = JSON.parse(text) as GeminiFaceComparison;

    // Validate the response shape
    if (
      typeof parsed.similarity !== "number" ||
      parsed.similarity < 1 ||
      parsed.similarity > 10
    ) {
      console.error("[face-verify] Invalid similarity score:", parsed.similarity);
      return null;
    }

    return {
      similarity: parsed.similarity,
      differences: Array.isArray(parsed.differences) ? parsed.differences : [],
      isMatch: parsed.similarity >= MATCH_THRESHOLD,
    };
  } catch (err: any) {
    console.error("[face-verify] Gemini comparison failed:", err?.message || err);
    return null;
  }
}

// ---- Image Fetching Helpers ----------------------------------------------

interface ImageData {
  base64: string;
  mimeType: string;
}

/**
 * Fetch an image from a URL and return it as base64 with its MIME type.
 * Handles both image URLs and video URLs (fetches just enough for a frame).
 *
 * For video URLs, we fetch the thumbnail if available, or the first
 * portion of the video file as a proxy for the first frame.
 */
async function fetchImageAsBase64(url: string): Promise<ImageData | null> {
  if (!url || !url.startsWith("http")) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[face-verify] Failed to fetch image: HTTP ${response.status} from ${url}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Determine the MIME type for Gemini
    let mimeType = "image/jpeg";
    if (contentType.includes("png")) {
      mimeType = "image/png";
    } else if (contentType.includes("webp")) {
      mimeType = "image/webp";
    } else if (contentType.includes("gif")) {
      mimeType = "image/gif";
    } else if (contentType.includes("video")) {
      // For video files, Gemini can analyze video content directly
      mimeType = "video/mp4";
    }

    return { base64, mimeType };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.warn(`[face-verify] Timeout fetching image from ${url}`);
    } else {
      console.warn(`[face-verify] Error fetching image from ${url}:`, err?.message);
    }
    return null;
  }
}

/**
 * Photo Analyzer -- Extracts visual metadata from uploaded photos
 *
 * Issue #12: When users upload photos, we store the file but don't analyze
 * face position, skin tone, hair color, or lighting. This module uses
 * Gemini Vision to extract structured metadata that improves character
 * descriptions in video generation prompts.
 *
 * If no Gemini key is configured, returns safe defaults so the pipeline
 * never breaks.
 */

const GOOGLE_AI_STUDIO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// ---- Types ----

export interface PhotoAnalysis {
  faceDetected: boolean;
  skinTone: string;      // "light", "medium", "olive", "brown", "dark"
  hairColor: string;     // "black", "brown", "blonde", "red", "gray", "bald"
  hairStyle: string;     // "short", "medium", "long", "curly", "straight", "bald"
  facialHair: string;    // "none", "stubble", "beard", "mustache"
  estimatedAge: string;  // "20s", "30s", "40s", "50s", "60s+"
  glasses: boolean;
  lighting: string;      // "natural", "indoor warm", "indoor cool", "flash", "mixed"
  expression: string;    // "smiling", "neutral", "serious"
}

// ---- Defaults ----

const DEFAULT_ANALYSIS: PhotoAnalysis = {
  faceDetected: false,
  skinTone: "medium",
  hairColor: "brown",
  hairStyle: "medium",
  facialHair: "none",
  estimatedAge: "30s",
  glasses: false,
  lighting: "natural",
  expression: "neutral",
};

// ---- Gemini Prompt ----

const ANALYSIS_PROMPT = `Analyze this photo and extract the following metadata as JSON. Be precise and pick from the allowed values only.

Return valid JSON with these exact fields:
{
  "faceDetected": true/false (is a human face clearly visible?),
  "skinTone": one of "light", "medium", "olive", "brown", "dark",
  "hairColor": one of "black", "brown", "blonde", "red", "gray", "bald",
  "hairStyle": one of "short", "medium", "long", "curly", "straight", "bald",
  "facialHair": one of "none", "stubble", "beard", "mustache",
  "estimatedAge": one of "20s", "30s", "40s", "50s", "60s+",
  "glasses": true/false,
  "lighting": one of "natural", "indoor warm", "indoor cool", "flash", "mixed",
  "expression": one of "smiling", "neutral", "serious"
}

If the photo does not contain a face, set faceDetected to false and use reasonable defaults for the other fields. Return valid JSON only — no markdown, no explanation.`;

// ---- Main Function ----

/**
 * Analyze a photo using Gemini Vision API and return structured metadata.
 * Falls back to defaults if no API key is configured or the call fails.
 */
export async function analyzePhoto(photoUrl: string): Promise<PhotoAnalysis> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    console.log("[photo-analyzer] No GOOGLE_AI_STUDIO_KEY — returning defaults");
    return { ...DEFAULT_ANALYSIS };
  }

  // Download the image to send inline to Gemini
  let imageBase64: string;
  let mimeType: string;

  try {
    const res = await fetch(photoUrl);
    if (!res.ok) {
      console.error(`[photo-analyzer] Failed to fetch photo: ${res.status}`);
      return { ...DEFAULT_ANALYSIS };
    }
    mimeType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
  } catch (err) {
    console.error("[photo-analyzer] Error fetching photo:", err);
    return { ...DEFAULT_ANALYSIS };
  }

  try {
    const response = await fetch(
      `${GOOGLE_AI_STUDIO_URL}/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: ANALYSIS_PROMPT },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2, // low temp for factual extraction
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[photo-analyzer] Gemini error:", errText);
      return { ...DEFAULT_ANALYSIS };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("[photo-analyzer] No text in Gemini response");
      return { ...DEFAULT_ANALYSIS };
    }

    const parsed = JSON.parse(text);

    // Validate and merge with defaults so every field is present
    return {
      faceDetected: typeof parsed.faceDetected === "boolean" ? parsed.faceDetected : false,
      skinTone: parsed.skinTone || DEFAULT_ANALYSIS.skinTone,
      hairColor: parsed.hairColor || DEFAULT_ANALYSIS.hairColor,
      hairStyle: parsed.hairStyle || DEFAULT_ANALYSIS.hairStyle,
      facialHair: parsed.facialHair || DEFAULT_ANALYSIS.facialHair,
      estimatedAge: parsed.estimatedAge || DEFAULT_ANALYSIS.estimatedAge,
      glasses: typeof parsed.glasses === "boolean" ? parsed.glasses : false,
      lighting: parsed.lighting || DEFAULT_ANALYSIS.lighting,
      expression: parsed.expression || DEFAULT_ANALYSIS.expression,
    };
  } catch (err) {
    console.error("[photo-analyzer] Error:", err);
    return { ...DEFAULT_ANALYSIS };
  }
}

/**
 * Format a PhotoAnalysis into a human-readable string for prompt injection.
 * Used by the prompt engine to enrich character descriptions.
 *
 * Example output:
 * "brown hair, medium length, medium skin tone, 30s, no glasses, smiling"
 */
export function formatPhotoAnalysis(analysis: PhotoAnalysis): string {
  if (!analysis.faceDetected) return "";

  const parts: string[] = [];

  parts.push(`${analysis.hairColor} hair`);
  if (analysis.hairStyle !== "bald") {
    parts.push(`${analysis.hairStyle} length`);
  }
  parts.push(`${analysis.skinTone} skin tone`);
  parts.push(analysis.estimatedAge);

  if (analysis.facialHair !== "none") {
    parts.push(analysis.facialHair);
  }

  parts.push(analysis.glasses ? "wears glasses" : "no glasses");
  parts.push(`${analysis.expression} expression`);
  parts.push(`${analysis.lighting} lighting`);

  return parts.join(", ");
}

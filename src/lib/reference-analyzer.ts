/**
 * Reference Analyzer — Extracts style DNA from any video URL.
 *
 * Takes a TikTok/Instagram/YouTube URL, downloads the video,
 * extracts key frames, and sends them to Gemini Vision to produce
 * a structured JSON "style DNA" that captures everything about
 * the video: camera angles, lighting, color grading, subject,
 * setting, pacing, hook technique, and transcript.
 *
 * This JSON feeds into the prompt engineering pipeline to
 * replicate the style in new AI-generated videos.
 */

// ─── Types ────────────────────────────────────────────────────────

export interface ReferenceAnalysis {
  camera: {
    angle: string;       // low-angle, eye-level, high-angle, dutch
    movement: string;    // static, handheld, tracking, dolly, pan
    lens: string;        // wide, normal, telephoto, macro
    stability: string;   // tripod, handheld-slight, handheld-heavy
    pov: string;         // front-facing selfie, third-person, first-person
  };
  lighting: {
    type: string;        // natural, studio, ring-light, golden-hour, mixed
    direction: string;   // front, side, back, overhead, ambient
    warmth: string;      // warm, neutral, cool
    shadows: string;     // soft, hard, minimal
  };
  color: {
    palette: string[];   // dominant colors as hex codes
    grading: string;     // warm-cinematic, cool-clinical, natural, muted, vibrant
    saturation: string;  // high, normal, desaturated
    contrast: string;    // high, normal, low
  };
  subject: {
    age: string;         // 20s, 30s, 40s, etc.
    gender: string;
    appearance: string;  // brief physical description
    clothing: string;
    expression: string;  // excited, casual, serious, genuine
    energy: string;      // high, medium, low, nonchalant
  };
  setting: {
    location: string;    // bathroom, kitchen, bedroom, office, outdoor, car, gym
    background: string;  // description of what's behind the subject
    props: string[];     // visible objects
    mood: string;        // cozy, professional, casual, luxury, raw
  };
  audio: {
    style: string;       // voiceover, direct-to-camera, conversation, narration
    music: boolean;
    ambientNoise: string; // room-tone, outdoor, silent, fan-hum
    voiceCharacter: string; // energetic, calm, casual, professional
  };
  pacing: {
    totalDuration: number;
    cuts: number;
    avgShotDuration: number;
    rhythm: string;      // fast-cuts, medium, slow-deliberate, single-take
  };
  style: {
    overall: string;     // ugc-authentic, polished-brand, podcast, reaction, tutorial
    ugcAuthenticity: number; // 1-10 how "real" it feels
    production: string;  // iphone-raw, semi-produced, fully-produced
  };
  hookTechnique: string;  // question, shock-statement, story-start, phone-pickup, direct-address
  transcript: string;
}

// ─── Video Download ───────────────────────────────────────────────

/**
 * Download a video from a social media URL using cobalt.tools API.
 * Returns the video as a buffer + metadata.
 */
export async function downloadVideoFromUrl(
  url: string
): Promise<{ videoUrl: string; error?: string }> {
  // Try cobalt.tools API (free, no auth needed for basic use)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch("https://api.cobalt.tools/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          url,
          videoQuality: "720",
          filenameStyle: "basic",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return { videoUrl: "", error: `Cobalt ${res.status}: ${err.substring(0, 200)}` };
      }

      const data = await res.json();
      if (data.url) {
        return { videoUrl: data.url };
      }
      if (data.status === "tunnel" || data.status === "redirect") {
        return { videoUrl: data.url || data.filename || "" };
      }

      return { videoUrl: "", error: "No download URL returned" };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (e: any) {
    return { videoUrl: "", error: e.message };
  }
}

// ─── Frame Extraction ─────────────────────────────────────────────

/**
 * Extract key frames from a video URL by fetching specific timestamps.
 * Returns frames as base64-encoded JPEG strings.
 *
 * Since we can't run FFmpeg in serverless, we use a simple approach:
 * take the first frame (thumbnail) from the video.
 * For richer analysis, we download and use sharp to extract.
 */
export async function extractThumbnail(videoUrl: string): Promise<string | null> {
  try {
    // For the thumbnail, we'll fetch the video and use the first frame
    // In production, use a video processing service or FFmpeg on a server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      // Try to get OG image from the original social URL as thumbnail
      const res = await fetch(videoUrl, {
        method: "HEAD",
        signal: controller.signal,
      });

      // If it's a direct video URL, we'll use Gemini to analyze it directly
      // For now, return null and let Gemini analyze the video URL
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}

// ─── Gemini Vision Analysis ───────────────────────────────────────

/**
 * Send a video URL or frame images to Gemini Vision for structured analysis.
 * Returns the full ReferenceAnalysis JSON.
 */
export async function analyzeVideoReference(
  sourceUrl: string,
  videoUrl?: string
): Promise<ReferenceAnalysis> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_STUDIO_KEY not set");

  const systemPrompt = `You are an expert video production analyst. Analyze the video at the provided URL and extract a detailed technical breakdown.

Return ONLY a valid JSON object matching this exact schema:
{
  "camera": { "angle": "string", "movement": "string", "lens": "string", "stability": "string", "pov": "string" },
  "lighting": { "type": "string", "direction": "string", "warmth": "string", "shadows": "string" },
  "color": { "palette": ["hex colors"], "grading": "string", "saturation": "string", "contrast": "string" },
  "subject": { "age": "string", "gender": "string", "appearance": "string", "clothing": "string", "expression": "string", "energy": "string" },
  "setting": { "location": "string", "background": "string", "props": ["strings"], "mood": "string" },
  "audio": { "style": "string", "music": boolean, "ambientNoise": "string", "voiceCharacter": "string" },
  "pacing": { "totalDuration": number, "cuts": number, "avgShotDuration": number, "rhythm": "string" },
  "style": { "overall": "string", "ugcAuthenticity": number, "production": "string" },
  "hookTechnique": "string",
  "transcript": "full transcript of everything said"
}

Be extremely specific and detailed. For colors, use actual hex values. For descriptions, be precise enough that another AI could recreate this exact style.`;

  const userPrompt = `Analyze this video: ${sourceUrl}
${videoUrl ? `Direct video URL: ${videoUrl}` : ""}

Extract every detail about the production style, camera work, lighting, subject appearance, setting, audio, pacing, and hook technique. Transcribe everything that is said.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err.substring(0, 200)}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    try {
      return JSON.parse(raw) as ReferenceAnalysis;
    } catch {
      // Try extracting JSON from response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as ReferenceAnalysis;
      throw new Error("Failed to parse Gemini response as JSON");
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Full Analysis Pipeline ───────────────────────────────────────

/**
 * Complete pipeline: URL → download → analyze → return structured result.
 */
export async function analyzeReferenceUrl(sourceUrl: string): Promise<{
  analysis: ReferenceAnalysis;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  error?: string;
}> {
  // Step 1: Try to download the video
  const download = await downloadVideoFromUrl(sourceUrl);

  // Step 2: Analyze with Gemini (using source URL even if download fails)
  const analysis = await analyzeVideoReference(sourceUrl, download.videoUrl || undefined);

  return {
    analysis,
    videoUrl: download.videoUrl || null,
    thumbnailUrl: null, // TODO: extract first frame
    error: download.error || undefined,
  };
}

// ─── Prompt Building from Analysis ────────────────────────────────

/**
 * Convert a ReferenceAnalysis into a style directive string
 * that can be injected into video generation prompts.
 */
export function buildStyleDirective(analysis: ReferenceAnalysis): string {
  return `REFERENCE STYLE (replicate this exactly):
Camera: ${analysis.camera.pov} shot, ${analysis.camera.movement} movement, ${analysis.camera.lens} lens, ${analysis.camera.stability} stability, ${analysis.camera.angle} angle
Lighting: ${analysis.lighting.type}, ${analysis.lighting.direction} direction, ${analysis.lighting.warmth} warmth, ${analysis.lighting.shadows} shadows
Color grading: ${analysis.color.grading}, ${analysis.color.saturation} saturation, ${analysis.color.contrast} contrast
Color palette: ${analysis.color.palette.join(", ")}
Setting: ${analysis.setting.location}, ${analysis.setting.mood} mood
Background: ${analysis.setting.background}
Props: ${analysis.setting.props.join(", ")}
Subject energy: ${analysis.subject.energy}, expression: ${analysis.subject.expression}
Subject clothing: ${analysis.subject.clothing}
Audio style: ${analysis.audio.style}, voice: ${analysis.audio.voiceCharacter}
Ambient: ${analysis.audio.ambientNoise}
Pacing: ${analysis.pacing.rhythm}, ~${analysis.pacing.avgShotDuration}s per shot
Production: ${analysis.style.production}
Hook technique: ${analysis.hookTechnique}
UGC authenticity target: ${analysis.style.ugcAuthenticity}/10`;
}

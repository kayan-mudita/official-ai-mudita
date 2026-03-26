/**
 * Unified Content Planner
 *
 * Merges prompt expansion and cut planning into one cohesive step.
 * Instead of planning cuts (video-compositor) and then separately
 * expanding each prompt (prompt-engine) in N parallel Gemini calls,
 * this module does it all in a single Gemini call.
 *
 * Benefits:
 * - Cuts share context: tone, character, environment, continuity.
 * - One API call instead of N (one per cut).
 * - The TTS script is generated alongside the visual prompts, so
 *   the voiceover and visuals are written together.
 *
 * The existing prompt-engine.ts and video-compositor.ts remain intact
 * and functional. The pipeline's expand step calls this module, but
 * anything that directly imports those files still works.
 */

import prisma from "@/lib/prisma";
import { getCharacterDescription } from "@/lib/character-profile";
import { getConfig } from "@/lib/system-config";
import { planComposition } from "@/lib/video-compositor";
import { generateSceneBible, formatSceneBibleForPrompt } from "./scene-bible";

const GOOGLE_AI_STUDIO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// ---- Output Types ----

export interface ContentPlanCut {
  index: number;
  type: string;
  duration: number;
  generateDuration: number;
  prompt: string;
  /** Audio context — carries the actual script segment spoken during this cut.
   *  Used downstream by generateVideo to hint mouth movements to the video model.
   *  DATA FLOW GAP #8 FIX */
  audio?: string;
}

export interface ContentPlan {
  /** Full creative script (human-speech version for TTS) */
  ttsScript: string;
  /** Per-cut production prompts (camera-ready, for FAL) */
  cuts: ContentPlanCut[];
  /** Total number of cuts */
  totalCuts: number;
  /** Short punchy title */
  title: string;
}

// ---- System Prompt ----

const CONTENT_PLANNER_SYSTEM = `You are an elite AI UGC video production planner. You receive a video format (with its cut pattern) and a user's creative brief, and you produce a COMPLETE creative plan in one pass.

Your output includes:
1. A TTS script -- the spoken dialogue for the entire video. This is what the voiceover reads. Written in natural conversational speech with pauses, "um"s, half-laughs, and texture.
2. Per-cut production prompts -- one for each cut in the format. These are NOT speech; they are visual/camera/action directions for an AI video model.

CRITICAL RULES:
- Each cut's production prompt MUST be 100-150 words. Video models degrade with longer prompts.
- All cuts must share the SAME character, environment, lighting, and wardrobe.
- The TTS script must match the visual action across cuts (e.g. if cut 2 shows the person gesturing, the TTS script for that segment should sound animated).
- Tone and energy should flow naturally across cuts -- hook is high energy, middle sections are conversational, CTA is direct.

BANNED WORDS (never use in production prompts):
"professional" / "modern office" / "well-lit" / "crisp" / "polished" / "corporate" / "engaging" / "approachable" / "LED panel" / "business casual" / "button-down" / "blazer" / "maintaining eye contact" / "conveys sincerity" / "studio" / "high-quality" / "cinematic"

PRODUCTION PROMPT STRUCTURE (for each cut):
1. FORMAT + CAMERA (1 line): "9:16 vertical. iPhone 15 Pro Max, 24mm, f/1.78, natural light."
2. SCENE + CONTINUITY (1 line): Specific lived-in environment. Must match ALL other cuts.
3. CHARACTER (1-2 lines): Exact appearance from provided description. Same clothes in every cut.
4. ACTION (2-3 lines): What happens beat by beat. Specific movements, expressions, gestures.
5. ANTI-GLITCH (1 line): "No morphing, no extra fingers, no face warping, consistent lighting, natural lip sync."

OUTPUT FORMAT -- Return valid JSON:
{
  "title": "short punchy title (max 80 chars)",
  "ttsScript": "the full spoken dialogue for the entire video, written as natural speech",
  "cuts": [
    {
      "index": 0,
      "type": "hook",
      "duration": 3,
      "generateDuration": 8,
      "prompt": "production prompt for this cut (100-150 words)"
    }
  ]
}`;

// ---- Character Context (reused from prompt-engine logic) ----

async function buildCharacterContext(userId: string): Promise<string> {
  const characterDesc = await getCharacterDescription(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, industry: true },
  });
  const brand = await prisma.brandProfile.findFirst({ where: { userId } });

  let context = "";
  if (characterDesc) {
    context += `\nDETAILED CHARACTER DESCRIPTION (use this EXACTLY):\n${characterDesc}`;
  }
  if (user) {
    context += `\nCHARACTER NAME: ${user.firstName} ${user.lastName}`;
    context += `\nINDUSTRY: ${user.industry}`;
  }
  if (brand) {
    if (brand.brandName) context += `\nBRAND: ${brand.brandName}`;
    if (brand.tagline) context += `\nTAGLINE: ${brand.tagline}`;
    if (brand.toneOfVoice) context += `\nTONE: ${brand.toneOfVoice}`;
    if (brand.targetAudience) context += `\nTARGET AUDIENCE: ${brand.targetAudience}`;
  }
  return context || "\nNo character details available -- create a realistic, relatable person.";
}

// ---- Main Entry Point ----

/**
 * Generate a complete content plan from a user prompt and format.
 *
 * Falls back to the existing two-step flow (planComposition + expandCutPrompts)
 * if Gemini is unavailable, so the pipeline never breaks.
 */
export async function planContent(
  userPrompt: string,
  format: string,
  userId: string,
  industry?: string
): Promise<ContentPlan> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;

  // Get the format's cut pattern so Gemini knows the structure
  const composition = planComposition(format, userPrompt);
  const cutTemplate = composition.format.cuts.map((c) => ({
    index: c.index,
    type: c.type,
    duration: c.duration,
    generateDuration: c.generateDuration,
    camera: c.camera,
    audio: c.audio,
    notes: c.notes,
  }));

  // If no Gemini key, fall back gracefully
  if (!apiKey) {
    return buildFallbackPlan(composition, userPrompt);
  }

  const characterContext = await buildCharacterContext(userId);
  const customAdditions = await getConfig("prompt_video_default", "");

  // Generate scene bible for visual continuity across all cuts
  const sceneBible = await generateSceneBible(
    userPrompt,
    userId,
    industry || "other",
    format
  );
  const sceneContext = formatSceneBibleForPrompt(sceneBible);

  const userMessage = `CHARACTER CONTEXT:${characterContext}

MANDATORY SCENE BIBLE (ALL cuts MUST share this exact visual context — do NOT deviate):
${sceneContext}

VIDEO FORMAT: ${composition.format.name} (${composition.format.totalDuration}s total, ${composition.format.cuts.length} cuts)

CUT PATTERN (you MUST produce exactly this many cuts with these exact types/durations):
${JSON.stringify(cutTemplate, null, 2)}

USER'S CREATIVE BRIEF: "${userPrompt}"
INDUSTRY: ${industry || "general"}
${customAdditions ? `\nADDITIONAL INSTRUCTIONS:\n${customAdditions}` : ""}

Generate the complete content plan now. Every cut's production prompt MUST reference the scene bible's environment, wardrobe, and lighting. Return valid JSON only.`;

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
              parts: [{ text: CONTENT_PLANNER_SYSTEM + "\n\n" + userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[content-planner] Gemini error:", err);
      return buildFallbackPlan(composition, userPrompt);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("[content-planner] No text in Gemini response");
      return buildFallbackPlan(composition, userPrompt);
    }

    const parsed = JSON.parse(text);

    // Validate we got the right number of cuts
    if (!Array.isArray(parsed.cuts) || parsed.cuts.length !== cutTemplate.length) {
      console.warn(
        `[content-planner] Gemini returned ${parsed.cuts?.length} cuts, expected ${cutTemplate.length}. Falling back.`
      );
      return buildFallbackPlan(composition, userPrompt);
    }

    // Merge Gemini's output with the format's duration/type data
    // (Gemini may return slightly different values; we trust the format)
    const mergedCuts: ContentPlanCut[] = parsed.cuts.map((geminiCut: any, i: number) => ({
      index: cutTemplate[i].index,
      type: cutTemplate[i].type,
      duration: cutTemplate[i].duration,
      generateDuration: cutTemplate[i].generateDuration,
      prompt: geminiCut.prompt || composition.format.cuts[i].prompt,
      // DATA FLOW GAP #8: Carry the audio context from the format template
      // so it reaches generateVideo and informs the video model about speech.
      audio: composition.format.cuts[i].audio,
    }));

    return {
      title: parsed.title || userPrompt.substring(0, 80),
      ttsScript: parsed.ttsScript || userPrompt,
      cuts: mergedCuts,
      totalCuts: mergedCuts.length,
    };
  } catch (err) {
    console.error("[content-planner] Error:", err);
    return buildFallbackPlan(composition, userPrompt);
  }
}

/**
 * Fallback: use the raw composition plan without Gemini expansion.
 * The pipeline still works -- prompts just won't be as refined.
 */
function buildFallbackPlan(
  composition: ReturnType<typeof planComposition>,
  userPrompt: string
): ContentPlan {
  return {
    title: userPrompt.substring(0, 80),
    ttsScript: userPrompt,
    cuts: composition.format.cuts.map((c) => ({
      index: c.index,
      type: c.type,
      duration: c.duration,
      generateDuration: c.generateDuration,
      prompt: c.prompt,
      audio: c.audio,
    })),
    totalCuts: composition.format.cuts.length,
  };
}

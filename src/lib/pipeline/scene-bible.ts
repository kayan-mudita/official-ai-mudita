/**
 * Scene Bible — Shared Context for Multi-Cut Video Continuity
 *
 * DATA FLOW GAP #3 FIX: Previously, each cut called Gemini SEPARATELY
 * for prompt expansion. Cut 1 might put the person in a kitchen, cut 2
 * in an office, cut 3 would change their outfit. No shared "scene bible."
 *
 * This module makes ONE Gemini call that establishes the shared visual
 * context for ALL cuts: environment, wardrobe, lighting, mood, color
 * palette, character description, and industry-specific background.
 *
 * The scene bible is generated ONCE before individual cut expansion
 * and injected into every cut's prompt so the video model receives
 * identical scene constraints regardless of cut-specific action.
 */

import prisma from "@/lib/prisma";
import { getCharacterDescription } from "@/lib/character-profile";
import { getBackgroundsForIndustry } from "@/lib/character-sheet";

const GOOGLE_AI_STUDIO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// ---- Types ----

export interface SceneBible {
  environment: string;          // "Home office with oak desk, dual monitors, morning light through blinds"
  wardrobe: string;             // "Navy quarter-zip pullover, Apple Watch, no tie"
  lighting: string;             // "Warm natural light from left, soft shadows"
  mood: string;                 // "Confident but approachable, morning energy"
  colorPalette: string;         // "Warm tones — oak, navy, cream, morning gold"
  characterDescription: string; // pulled from character profile
  backgroundForIndustry: string; // pulled from industry backgrounds
}

// ---- System Prompt ----

const SCENE_BIBLE_SYSTEM = `You are a production designer for AI-generated UGC videos. Your job is to establish a SINGLE, consistent visual world that all cuts in a multi-cut video will share.

You will receive:
- A user's creative brief (what the video is about)
- Their industry (for context-appropriate backgrounds)
- Industry background options (pre-built environment descriptions)
- Their character description (physical appearance from photos)
- Their brand profile (if available)

From this, you produce a SCENE BIBLE — a concise set of visual constraints that every cut in the video must obey.

RULES:
- Environment must be SPECIFIC and LIVED-IN — "kitchen counter with yesterday's mail and half-empty coffee mug" not "modern kitchen"
- Wardrobe must be REAL — "that one Patagonia pullover everyone owns" not "business casual"
- Lighting must be NATURAL — windows and lamps only, never studio
- Pick ONE environment from the industry backgrounds provided, then ADD specific imperfect details
- The mood should match the creative brief's energy
- The color palette should emerge naturally from the environment and wardrobe

BANNED WORDS:
"professional" / "modern office" / "well-lit" / "crisp" / "polished" / "corporate" / "engaging" / "approachable" / "LED panel" / "business casual" / "button-down" / "blazer" / "studio" / "high-quality" / "cinematic"

OUTPUT FORMAT — Return valid JSON only:
{
  "environment": "specific lived-in environment with imperfect details (1-2 sentences)",
  "wardrobe": "specific real clothing items, accessories (1 sentence)",
  "lighting": "exact lighting setup from natural sources (1 sentence)",
  "mood": "emotional energy and vibe of the scene (1 sentence)",
  "colorPalette": "dominant colors that emerge from environment + wardrobe (1 sentence)"
}`;

// ---- Context Builder ----

async function buildSceneBibleContext(
  userId: string,
  industry: string
): Promise<{
  characterDesc: string;
  brandContext: string;
  industryBackgrounds: string[];
}> {
  const characterDesc = await getCharacterDescription(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  const brand = await prisma.brandProfile.findFirst({
    where: { userId },
  });

  let brandContext = "";
  if (user) {
    brandContext += `CHARACTER NAME: ${user.firstName} ${user.lastName}\n`;
  }
  if (brand) {
    if (brand.brandName) brandContext += `BRAND: ${brand.brandName}\n`;
    if (brand.tagline) brandContext += `TAGLINE: ${brand.tagline}\n`;
    if (brand.toneOfVoice) brandContext += `TONE: ${brand.toneOfVoice}\n`;
    if (brand.targetAudience) brandContext += `TARGET AUDIENCE: ${brand.targetAudience}\n`;
  }

  const industryBackgrounds = getBackgroundsForIndustry(industry);

  return { characterDesc, brandContext, industryBackgrounds };
}

// ---- Main Entry Point ----

/**
 * Generate a scene bible that establishes shared visual context for ALL cuts
 * in a multi-cut video. This makes ONE Gemini call and returns a SceneBible
 * that gets injected into every cut's prompt expansion.
 *
 * Falls back to a sensible default if Gemini is unavailable, so the pipeline
 * never breaks.
 */
export async function generateSceneBible(
  userRequest: string,
  userId: string,
  industry: string,
  format: string
): Promise<SceneBible> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;

  const { characterDesc, brandContext, industryBackgrounds } =
    await buildSceneBibleContext(userId, industry || "other");

  // If no Gemini key, build a reasonable fallback from available data
  if (!apiKey) {
    return buildFallbackBible(characterDesc, industryBackgrounds, industry);
  }

  const backgroundList = industryBackgrounds
    .map((bg, i) => `  ${i + 1}. ${bg}`)
    .join("\n");

  const userMessage = `CREATIVE BRIEF: "${userRequest}"

INDUSTRY: ${industry || "general"}
VIDEO FORMAT: ${format}

INDUSTRY BACKGROUND OPTIONS (pick one and add imperfect lived-in details):
${backgroundList}

${characterDesc ? `CHARACTER DESCRIPTION:\n${characterDesc}` : "No character description available — imagine a realistic, relatable person."}

${brandContext ? `BRAND CONTEXT:\n${brandContext}` : ""}

Generate the scene bible now. Return valid JSON only.`;

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
              parts: [{ text: SCENE_BIBLE_SYSTEM + "\n\n" + userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.6, // slightly lower than prompt expansion for consistency
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[scene-bible] Gemini error:", err);
      return buildFallbackBible(characterDesc, industryBackgrounds, industry);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("[scene-bible] No text in Gemini response");
      return buildFallbackBible(characterDesc, industryBackgrounds, industry);
    }

    const parsed = JSON.parse(text);

    return {
      environment: parsed.environment || industryBackgrounds[0] || "lived-in home office",
      wardrobe: parsed.wardrobe || "casual everyday clothes",
      lighting: parsed.lighting || "warm natural light from window, soft shadows",
      mood: parsed.mood || "confident and conversational",
      colorPalette: parsed.colorPalette || "warm natural tones",
      characterDescription: characterDesc || "",
      backgroundForIndustry: industryBackgrounds[0] || "",
    };
  } catch (err) {
    console.error("[scene-bible] Error:", err);
    return buildFallbackBible(characterDesc, industryBackgrounds, industry);
  }
}

/**
 * Build a fallback scene bible from available data when Gemini is unavailable.
 * Uses industry backgrounds and character description directly.
 */
function buildFallbackBible(
  characterDesc: string,
  industryBackgrounds: string[],
  industry: string
): SceneBible {
  const selectedBackground = industryBackgrounds[0] || "living room couch, coffee table with a mug, window light";

  return {
    environment: selectedBackground,
    wardrobe: "casual everyday clothes — the kind of thing you'd actually wear at home",
    lighting: "warm natural light from window, soft shadows, no studio setup",
    mood: "confident and conversational, like FaceTiming a friend",
    colorPalette: "warm natural tones from the environment",
    characterDescription: characterDesc || "",
    backgroundForIndustry: selectedBackground,
  };
}

/**
 * Format a SceneBible into a string that can be injected into cut prompts.
 * This is the scene context prefix that goes before every cut's specific
 * action/camera directions.
 */
export function formatSceneBibleForPrompt(bible: SceneBible): string {
  const parts: string[] = [
    `ENVIRONMENT: ${bible.environment}`,
    `WARDROBE: ${bible.wardrobe}`,
    `LIGHTING: ${bible.lighting}`,
    `MOOD: ${bible.mood}`,
    `COLOR PALETTE: ${bible.colorPalette}`,
  ];

  if (bible.characterDescription) {
    parts.push(`CHARACTER: ${bible.characterDescription}`);
  }

  return parts.join(". ");
}

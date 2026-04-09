import { getConfig } from "./system-config";
import prisma from "./prisma";
import { getCharacterDescription } from "./character-profile";
import { getBackgroundsForIndustry } from "./character-sheet";
import { getSocialContext } from "./pipeline/social-context";
import { getVoiceContext } from "./pipeline/voice-context";

const GOOGLE_AI_STUDIO_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * The prompt engine takes a simple user request and expands it into a
 * production-grade video generation prompt using Gemini.
 *
 * Input: "make a market update video for Seattle"
 * Output: 150-200 word prompt with iPhone camera specs, lived-in
 *         environment, character description, script with texture,
 *         and anti-glitch rules — ready to paste into Kling / Minimax / Wan.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface PromptEngineInput {
  userRequest: string;
  model: string;              // target video model (kling_2.6, seedance_2.0, sora_2)
  userId: string;
  industry?: string;
  duration?: number;           // seconds
  format?: "9:16" | "16:9" | "1:1";
  /** Item 41: If true, injects the user's first name into the prompt for personalized onboarding */
  isOnboarding?: boolean;
  /** Scene bible context — shared across all cuts for visual continuity.
   *  When present, injected as a hard constraint so the video model keeps
   *  environment, wardrobe, lighting, and mood consistent across cuts. */
  sceneContext?: string;
}

export interface PromptEngineOutput {
  expandedPrompt: string;      // the full production prompt
  script: string;              // extracted dialogue/script portion
  title: string;               // generated video title
  estimatedDuration: number;   // seconds
  wordCount: number;           // word count of expandedPrompt (track prompt length vs. video quality)
}

// ─── System Prompt ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an elite AI UGC video prompt engineer. Your prompts make AI video models produce content indistinguishable from real iPhone UGC.

CRITICAL RULE: Your expandedPrompt output MUST be 150-200 words. Video models get confused and produce worse output with long prompts. Be SHORT and SPECIFIC. Every word must earn its place.

═══ PROMPT STRUCTURE (follow this exact order) ═══

1. FORMAT + CAMERA (1 line): "9:16 vertical. iPhone 15 Pro Max back camera, 24mm lens, f/1.78 aperture, natural lighting."
2. SCENE (1-2 lines): Specific lived-in environment. "Kitchen counter with yesterday's mail and half-empty coffee mug" not "modern kitchen."
3. CHARACTER (2-3 lines): Physical appearance from the provided description. What they're wearing (real clothes, not "business casual"). Their ENERGY — "talks like she's FaceTiming her sister" not "maintains eye contact."
4. ACTION + SCRIPT (3-5 lines): What happens beat by beat. Dialogue with texture — "um"s, half-laughs, self-corrections. Hook in first 3 seconds.
5. ANTI-GLITCH (1-2 lines): "No morphing, no extra fingers, no face warping, consistent lighting, natural lip sync, real skin texture."

═══ BANNED WORDS — NEVER USE ═══
"professional" / "modern office" / "well-lit" / "crisp" / "polished" / "corporate" / "engaging" / "approachable" / "LED panel" / "business casual" / "button-down" / "blazer" / "maintaining eye contact" / "conveys sincerity" / "studio" / "high-quality" / "cinematic" — anything that sounds like a LinkedIn bio or stock photo description

═══ NON-NEGOTIABLE RULES ═══
- Camera: iPhone front-facing or propped on a surface. NEVER "professional setup."
- Audio: Raw iPhone mic — room noise, slight echo. NEVER studio quality.
- Environment: SPECIFIC and IMPERFECT — "car parked at Trader Joe's", "back patio, kids audible in background", "messy desk with two monitors and old coffee."
- Clothing: REAL — "that one Patagonia pullover everyone owns", "oversized hoodie, messy bun."
- Light: From WINDOWS and LAMPS. Natural. Never supplemented.
- Characters: Described like real humans with QUIRKS — "the kind of guy who always has a podcast recommendation."
- Hook: Conversational — "Okay so this is wild" / "Alright real quick" / "I wasn't gonna post this but"
- Dialogue: Has TEXTURE — pauses, half-laughs, self-corrections. People don't speak in complete sentences.
- The more polished you try to be, the less believable you become.

═══ REFERENCE PROMPTS (this is the quality bar and LENGTH target) ═══

REFERENCE A (text-to-video, ~150 words):
A young American woman with light brown hair in a white tank top drops The Ordinary Hyaluronic Acid serum onto her fingertips. She looks at camera and says "Okay girls, this seven dollar serum literally saved my skin. I used to wake up with the driest flakiest cheeks and nothing worked." She pats it onto her cheeks, skin instantly looks dewy and glowy. She says "Then I tried this Hyaluronic Acid from The Ordinary and after two weeks my skin has never been this hydrated." She holds the bottle up to camera and says "If you have dry skin you need this immediately." She tilts her face showing radiant skin with a satisfied smile. Bright bathroom, warm natural light, iPhone front-facing camera, handheld wobble, UGC aesthetic. 15 seconds. Avoid warped hands, duplicate faces, flickering.

REFERENCE B (with starting frame, ~200 words):
9:16 vertical. iPhone 15 Pro front camera. Inside a parked Ford F-150, suburban parking lot. Late afternoon golden hour through windows. Phone propped on dashboard — stable, zero handheld shake. Guy, 35-42, average build, short brown hair, light stubble, plain gray t-shirt, baseball cap, wedding ring. Tired but genuine eyes. Calm energy, zero hype — talks like he's FaceTiming his brother. Left hand rests on steering wheel, relaxed grip, all 5 fingers visible. Right hand holds product at chest level, steady. He exhales like he just remembered to record this. "Alright so… I'm not gonna sit here and hype you up on something that doesn't work." Glances at product, back to camera. "But this? I've been using it for like six weeks now." Small shrug. "More energy. Sleeping better. Just… feel like myself again." Half-laugh, shakes head. "Try it out. Seriously. What's the worst that happens?" Small nod, reaches to stop recording. Raw iPhone audio, soft cabin ambience, AC fan hum, zero music. No hand distortion, no face warping, no eye drift, natural lip sync, real skin texture.

YOUR OUTPUT must match that LENGTH and SPECIFICITY. Do NOT write 500-word essays. Concise, dense, every word visual.

OUTPUT FORMAT — Return valid JSON:
- "title": short punchy title (max 80 chars) — TikTok caption energy, not corporate memo
- "expandedPrompt": the production prompt (150-200 words MAX — this is critical)
- "script": just the dialogue with stage directions in parentheses
- "estimatedDuration": video length in seconds`;

// ─── Character Context Builder ──────────────────────────────────

async function getCharacterContext(userId: string): Promise<string> {
  // Get user's character sheet details
  const sheets = await prisma.characterSheet.findMany({
    where: { userId, status: "complete" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  // Get user's brand profile
  const brand = await prisma.brandProfile.findFirst({
    where: { userId },
  });

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, industry: true },
  });

  let context = "";

  // Get the detailed character description (extracted from photos)
  const characterDesc = await getCharacterDescription(userId);
  if (characterDesc) {
    context += `\n\nDETAILED CHARACTER DESCRIPTION (use this EXACTLY — every detail matters for consistency):\n${characterDesc}`;
  }

  if (user) {
    context += `\nCHARACTER NAME: ${user.firstName} ${user.lastName}`;
    context += `\nINDUSTRY: ${user.industry}`;
  }

  if (brand) {
    // Build a comprehensive brand context block so the video model aligns
    // messaging, tone, and target audience with the user's brand profile.
    const brandParts: string[] = [];
    if (brand.brandName) brandParts.push(`Brand: ${brand.brandName}`);
    if (brand.tagline) brandParts.push(`Tagline: ${brand.tagline}`);
    if (brand.toneOfVoice) brandParts.push(`Tone of voice: ${brand.toneOfVoice}`);
    if (brand.targetAudience) brandParts.push(`Target audience: ${brand.targetAudience}`);
    if (brand.competitors) brandParts.push(`Competitors: ${brand.competitors}`);
    if (brand.guidelines) brandParts.push(`Brand guidelines: ${brand.guidelines}`);

    if (brandParts.length > 0) {
      const brandProfileText = brandParts.join(". ");
      context += `\n\nBRAND CONTEXT: ${brandProfileText}`;
      context += `\nThe video's messaging, tone, and target audience MUST align with this brand profile.`;
    }
  }

  if (sheets.length > 0) {
    context += `\nCHARACTER SHEET: Available (${sheets[0].type} — ${sheets[0].images.length} reference images)`;
  }

  return context;
}

// ─── Model-Specific Instructions ────────────────────────────────

function getModelInstructions(model: string): string {
  switch (model) {
    case "minimax_video":
    case "minimax_hailuo":
    case "sora_2":
      return `TARGET MODEL: Minimax Video (Hailuo)
Best at: natural motion, lip sync, talking head UGC, smooth camera.
Keep prompts to ONE action per clip (max 6 seconds per generation).
Describe the scene simply — Minimax follows short, direct instructions best.`;

    case "wan_2.1":
      return `TARGET MODEL: Wan 2.1
Best at: character consistency from reference images, creative control.
Keep prompts short and specific — Wan works best at 480p with clear single-action descriptions.
Always include the character's exact appearance details.`;

    case "ltx":
    case "ltx_fast":
      return `TARGET MODEL: LTX 2.3
Best at: fast generation, rapid iteration, b-roll and atmospheric shots.
Use simple scene descriptions. Good for testing ideas before switching to Kling/Minimax for finals.`;

    case "seedance_2.0":
    case "kling_2.6":
    default:
      return `TARGET MODEL: Kling 2.6 Pro
Best at: hyper-realistic UGC, talking heads, testimonials, lip sync.
Handles up to 10 seconds well. Use iPhone camera language, natural lighting, lived-in environments.
Keep prompts under 200 words — Kling degrades with longer prompts.`;
  }
}

// ─── Prompt Length Enforcement ───────────────────────────────────

/**
 * Truncate a prompt to approximately `maxWords` words, cutting at the
 * nearest sentence boundary so the result doesn't end mid-thought.
 */
function truncateToSentenceBoundary(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;

  // Take maxWords words, then find the last sentence-ending punctuation
  const truncated = words.slice(0, maxWords).join(" ");
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?"),
    truncated.lastIndexOf('"')
  );

  if (lastSentenceEnd > truncated.length * 0.5) {
    // Cut at sentence boundary if it's past the halfway point
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  // Otherwise just cut at the word boundary
  return truncated;
}

// ─── Main Engine ────────────────────────────────────────────────

export async function expandPrompt(input: PromptEngineInput): Promise<PromptEngineOutput> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    // Fallback: return a basic expansion without Gemini
    return {
      expandedPrompt: input.userRequest,
      script: input.userRequest,
      title: input.userRequest.length > 80 ? input.userRequest.substring(0, 77) + "..." : input.userRequest,
      estimatedDuration: input.duration || 8,
      wordCount: input.userRequest.split(/\s+/).filter(Boolean).length,
    };
  }

  const characterContext = await getCharacterContext(input.userId);
  const modelInstructions = getModelInstructions(input.model);
  const format = input.format || "9:16";
  const duration = input.duration || 8;

  // Issue #13: Fetch social/audience context for prompt enrichment
  const socialContext = await getSocialContext(input.userId);

  // Issue #14: Fetch voice/speaking style context for prompt enrichment
  const voiceContext = await getVoiceContext(input.userId);

  // Get custom system prompt from admin config (if edited)
  const customSystemAdditions = await getConfig("prompt_video_default", "");

  // Item 41: For onboarding videos, inject the user's first name so the avatar addresses them personally
  let onboardingPersonalization = "";
  if (input.isOnboarding) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { firstName: true },
    });
    const firstName = user?.firstName || "there";
    onboardingPersonalization = `\n\nONBOARDING PERSONALIZATION: This is the user's very first video. The script MUST address the user by name. Open with: "Hey ${firstName}, I'm your AI content partner..." Make the tone warm, excited, and personal. This video sells the subscription — make the user feel like the AI knows them.`;
  }

  // Scene bible constraint: when provided, enforce visual continuity across all cuts
  let sceneBibleConstraint = "";
  if (input.sceneContext) {
    sceneBibleConstraint = `\n\nMANDATORY SCENE CONTINUITY (same across ALL cuts — do NOT deviate from this):\n${input.sceneContext}\nYou MUST use the exact environment, wardrobe, lighting, and mood described above. Do NOT invent a different setting, outfit, or lighting setup. Your prompt must place the character in THIS scene.`;
  }

  // Item 11: Pick a random industry-specific background to ground the video
  // in a realistic, industry-relevant environment. Only used when no scene
  // bible is present (scene bible takes priority for visual continuity).
  let environmentContext = "";
  if (!input.sceneContext) {
    const industry = input.industry || "other";
    const backgrounds = getBackgroundsForIndustry(industry);
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    environmentContext = `\n\nENVIRONMENT: Set this video in: ${randomBackground}\nMake the background feel REAL and LIVED-IN — clutter, personal items, imperfect lighting.`;
  }

  const userMessage = `${modelInstructions}

CHARACTER CONTEXT:${characterContext || "\nNo character details available — create a realistic, relatable person with specific quirks and real clothing. NO generic descriptions."}
${sceneBibleConstraint}${environmentContext}
${socialContext ? `\nAUDIENCE CONTEXT: ${socialContext}` : ""}
${voiceContext ? `\nSPEAKING STYLE: ${voiceContext}. The person's mouth movements and gestures should match this energy.` : ""}
VIDEO REQUEST: "${input.userRequest}"
FORMAT: ${format} vertical
TARGET DURATION: ${duration} seconds
INDUSTRY: ${input.industry || "general"}
${onboardingPersonalization}
${customSystemAdditions ? `ADDITIONAL INSTRUCTIONS FROM ADMIN:\n${customSystemAdditions}` : ""}

Generate the full production prompt now. Return valid JSON only.`;

  try {
    const response = await fetch(
      `${GOOGLE_AI_STUDIO_URL}/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userMessage }] },
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
      console.error("[prompt-engine] Gemini error:", err);
      // Fallback
      return {
        expandedPrompt: input.userRequest,
        script: input.userRequest,
        title: input.userRequest.substring(0, 80),
        estimatedDuration: duration,
        wordCount: input.userRequest.split(/\s+/).filter(Boolean).length,
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        expandedPrompt: input.userRequest,
        script: input.userRequest,
        title: input.userRequest.substring(0, 80),
        estimatedDuration: duration,
        wordCount: input.userRequest.split(/\s+/).filter(Boolean).length,
      };
    }

    // Parse the JSON response
    const parsed = JSON.parse(text);
    let expandedPrompt: string = parsed.expandedPrompt || input.userRequest;

    // ── Word count enforcement (#19) ──────────────────────────────
    // Gemini often returns 300-500 words despite being told 150-200.
    // Longer prompts = worse video quality on Kling and other models.
    const MAX_WORDS = 220;  // 10% buffer above the 200-word target
    const MIN_WORDS = 100;

    let wordCount = expandedPrompt.split(/\s+/).filter(Boolean).length;

    if (wordCount > MAX_WORDS) {
      console.warn(
        `[prompt-engine] Prompt exceeded 200 words (${wordCount}). Truncating.`
      );
      expandedPrompt = truncateToSentenceBoundary(expandedPrompt, 200);
      wordCount = expandedPrompt.split(/\s+/).filter(Boolean).length;
    } else if (wordCount < MIN_WORDS) {
      console.warn(
        `[prompt-engine] Prompt is only ${wordCount} words — may produce generic output.`
      );
    }

    return {
      expandedPrompt,
      script: parsed.script || parsed.expandedPrompt || input.userRequest,
      title: parsed.title || input.userRequest.substring(0, 80),
      estimatedDuration: parsed.estimatedDuration || duration,
      wordCount,
    };
  } catch (err) {
    console.error("[prompt-engine] Error:", err);
    return {
      expandedPrompt: input.userRequest,
      script: input.userRequest,
      title: input.userRequest.substring(0, 80),
      estimatedDuration: duration,
      wordCount: input.userRequest.split(/\s+/).filter(Boolean).length,
    };
  }
}

/**
 * Refine a prompt for a specific video model using Claude (via OpenRouter).
 * Each model has different strengths and prompt format preferences.
 * Claude rewrites the prompt to maximize quality for the target model.
 */
export async function refinePromptForModel(
  prompt: string,
  model: string,
  referenceStyle?: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return prompt; // No OpenRouter key, return as-is

  const modelHints: Record<string, string> = {
    "kling_2.6": "Kling 2.6 works best with detailed character descriptions, specific camera angles, and explicit lighting directions. Keep prompts under 500 chars. Avoid abstract concepts.",
    "kling_v3": "Kling 3.0 supports @Element1 tagging for character consistency. Describe the scene cinematically. Mention camera movement explicitly.",
    "kling_v3_audio": "Kling 3.0+Audio generates voice natively. Include exact dialogue in quotes. Describe speaking style, pace, and emotion.",
    "veo_3": "Veo 3 excels at cinematic quality. Use filmmaking terminology (rack focus, dolly, crane shot). Describe color grading explicitly. Audio is generated natively.",
    "seedance_2.0": "Seedance 2.0 accepts @image1 references. Use director-style camera instructions (dolly zoom, tracking shot). Can handle complex multi-shot scenes in a single generation.",
    "heygen_avatar_v": "HeyGen Avatar V uses video reference for identity. Focus on what the person SAYS and their emotional delivery, not visual appearance.",
  };

  const hint = modelHints[model] || "Standard video generation model. Be specific about camera, lighting, and action.";

  try {
    const { runAgent } = await import("@/lib/openrouter-client");

    const refined = await runAgent(
      `You are a video prompt engineer. Rewrite the given prompt to maximize quality for the target video model. Keep the same intent but optimize the formatting and emphasis for the model's strengths. Return ONLY the refined prompt, no explanation.`,
      `Target model: ${model}\nModel tips: ${hint}\n${referenceStyle ? `Reference style: ${referenceStyle}\n` : ""}Original prompt:\n${prompt}`,
      [], {}, 1
    );

    return refined.trim() || prompt;
  } catch {
    return prompt; // Fallback to original on any error
  }
}

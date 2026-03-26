import prisma from "./prisma";
import { getConfig } from "./system-config";
import { uploadFile, isStorageConfigured } from "./storage";
import {
  buildPosesGridMetadata,
  buildThreeSixtyGridMetadata,
  POSES_GRID,
  THREE_SIXTY_GRID,
} from "./pipeline/character-assets";

const GOOGLE_AI_STUDIO_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey(): string {
  const key = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!key) throw new Error("GOOGLE_AI_STUDIO_KEY is not set");
  return key;
}

// ─── Types ──────────────────────────────────────────────────────

export interface CharacterSheetResult {
  characterSheetId: string;
  compositeUrl: string | null;
  images: { url: string; position: number; angle: string | null }[];
  status: string;
}

interface GeminiImageResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: { mimeType: string; data: string };
        text?: string;
      }>;
    };
  }>;
}

// ─── Industry Background Presets ────────────────────────────────
//
// 6 preset backgrounds per industry, used in character sheet generation.
// "We'll have a preset six backgrounds for each industry."

export const INDUSTRY_BACKGROUNDS: Record<string, string[]> = {
  real_estate: [
    "kitchen of a house being shown — granite counters, afternoon sun through the window, open house flyer on the counter",
    "parked car in a suburban neighborhood, steering wheel visible, houses with for-sale signs through windshield",
    "living room mid-staging — one couch still has plastic wrap, natural light from bay windows, coffee on the side table",
    "home office desk with laptop showing MLS listings, sticky notes on the monitor, half-empty water bottle",
    "standing on a front porch of a listing, door ajar, welcome mat, afternoon golden light",
    "back patio of a house, string lights overhead, wooden fence, neighbor's yard visible",
  ],
  legal: [
    "office with stacked case files on the desk, old coffee mug, framed degree crooked on the wall, window light",
    "courthouse hallway — marble floor, natural light from tall windows, briefcase on the bench",
    "desk with open laptop and legal pad covered in handwritten notes, bookshelf behind with worn spines",
    "conference room — legal binders on the table, whiteboard with notes, city visible through the window",
    "walking outside the courthouse, stone steps, late afternoon sun, jacket slung over arm",
    "home office at night — desk lamp on, laptop open, reading glasses on the desk, bourbon-colored drink nearby",
  ],
  finance: [
    "home office with two monitors showing charts, messy desk, half-eaten lunch pushed to the side",
    "coffee shop — laptop open to a spreadsheet, iced coffee sweating on the table, napkin with numbers scrawled",
    "car parked outside an office building, dashboard phone mount, financial podcast paused on screen",
    "kitchen counter in the morning — laptop open, cereal bowl pushed aside, market news on iPad in background",
    "co-working space — standing desk, headphones around neck, whiteboard with scribbled projections behind",
    "back patio at golden hour — phone in hand, casual clothes, just got off a client call energy",
  ],
  medical: [
    "break room — scrubs still on, cup of coffee, window light, backpack on the chair",
    "office with diplomas on the wall (slightly crooked), anatomy model on the shelf, natural light",
    "sitting in a parked car after a shift — scrubs, tired eyes, steering wheel, parking garage visible",
    "home kitchen still in scrubs — making dinner, phone propped on the counter, warm overhead light",
    "consultation room — simple desk, family photos next to the computer, afternoon sun through blinds",
    "walking outside the hospital — trees, afternoon light, lanyard still around neck, heading to the car",
  ],
  creator: [
    "bedroom desk setup — ring light off to the side, messy cord situation, sticky notes on the monitor",
    "coffee shop corner — phone propped on a stack of books, iced latte, exposed brick wall behind",
    "couch in a lived-in apartment — throw blanket, plants on the windowsill, golden hour light",
    "kitchen counter — phone propped against a cereal box, morning light, still in pajamas energy",
    "outdoor bench — park visible behind, earbuds in one ear, casual outfit, late afternoon sun",
    "car front seat — phone on dashboard mount, just-parked energy, street visible through windshield",
  ],
  business: [
    "home office — bookshelf with actual read books (spines cracked), desk lamp, sticky notes on monitor",
    "coffee shop — laptop open, notebook with handwritten notes beside it, half-finished flat white",
    "co-working table — other people blurred in background, laptop and phone side by side, natural light from big windows",
    "kitchen island at home — standing with laptop, morning light, kid's drawing on the fridge behind",
    "parked car — just finished a meeting energy, loosened collar, phone in hand, suburban parking lot",
    "back porch — laptop on outdoor table, iced tea, trees and fence in background, afternoon light",
  ],
  other: [
    "living room couch — throw pillows, coffee table with a mug, window light, TV off in background",
    "kitchen counter — phone propped up, casual clothes, morning light, fruit bowl and mail pile visible",
    "parked car — phone on dashboard, natural light, relaxed energy, suburban street visible",
    "coffee shop — small table, iced drink, natural light, other patrons blurred in background",
    "bedroom desk — simple setup, lamp on, personal items around, evening light from window",
    "outdoor — park bench or backyard, natural light, trees, relaxed casual setting",
  ],
};

/**
 * Get the 6 background descriptions for a given industry.
 */
export function getBackgroundsForIndustry(industry: string): string[] {
  return INDUSTRY_BACKGROUNDS[industry] || INDUSTRY_BACKGROUNDS.other;
}

// ─── Core Generation ────────────────────────────────────────────

/**
 * Generate a character sheet by calling Google AI Studio (Gemini/Nano Banana).
 * Takes user photo URLs as reference and generates a 3x3 grid of the person in different poses.
 *
 * If Supabase Storage is configured, the generated image is uploaded there
 * and the returned URL is a permanent Supabase public URL (not a data URI).
 */
async function callGeminiImageGen(
  prompt: string,
  referenceImageUrls: string[],
  storageKey?: string,
  options?: { maxRetries?: number; label?: string }
): Promise<string | null> {
  const apiKey = getApiKey();
  const model = await getConfig("character_sheet_model", "nano_banana");
  const maxRetries = options?.maxRetries ?? 1;
  const label = options?.label ?? "unknown";

  // Map model config to actual Gemini model name
  const MODEL_MAP: Record<string, string> = {
    nano_banana: "nano-banana-pro-preview",
    gemini_image: "gemini-2.5-flash-image",
    gemini_3_image: "gemini-3-pro-image-preview",
    gemini_3_1_image: "gemini-3.1-flash-image-preview",
  };
  const modelName = MODEL_MAP[model] || "nano-banana-pro-preview";

  // Build parts: text prompt + reference images
  const parts: any[] = [{ text: prompt }];

  for (const url of referenceImageUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = res.headers.get("content-type") || "image/jpeg";
        parts.push({
          inlineData: { mimeType, data: base64 },
        });
      }
    } catch {
      // Skip images that fail to download
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`[character-sheet] Retry ${attempt}/${maxRetries} for ${label}`);
    }

    try {
      const response = await fetch(
        `${GOOGLE_AI_STUDIO_URL}/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ["image", "text"],
              temperature: 0.8,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        lastError = new Error(`Gemini API error (${response.status}): ${err}`);
        console.error(`[character-sheet] ${label} attempt ${attempt} API error:`, lastError.message);
        continue;
      }

      const data: GeminiImageResponse = await response.json();

      // Extract generated image from response
      const candidate = data.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find((p) => p.inlineData);

      if (imagePart?.inlineData) {
        const { mimeType, data: base64Data } = imagePart.inlineData;

        // Upload to Supabase Storage if configured (permanent URL)
        if (isStorageConfigured() && storageKey) {
          try {
            const buffer = Buffer.from(base64Data, "base64");
            const publicUrl = await uploadFile(buffer, storageKey, mimeType);
            return publicUrl;
          } catch (err) {
            console.error("[character-sheet] Storage upload failed, falling back to data URL:", err);
          }
        }

        // Fallback: return as data URL
        return `data:${mimeType};base64,${base64Data}`;
      }

      // No image returned — log what the model DID return for debugging
      const textPart = candidate?.content?.parts?.find((p) => p.text);
      const refusalText = textPart?.text || "(no text in response)";
      console.error(
        `[character-sheet] ${label} attempt ${attempt}: No image generated. ` +
        `Model response text: ${refusalText.substring(0, 500)}`
      );
      console.error(
        `[character-sheet] ${label} attempt ${attempt}: Full response structure: ` +
        `candidates=${data.candidates?.length ?? 0}, ` +
        `parts=${candidate?.content?.parts?.length ?? 0}`
      );
      lastError = new Error(`No image in response: ${refusalText.substring(0, 200)}`);
    } catch (err: any) {
      lastError = err;
      console.error(`[character-sheet] ${label} attempt ${attempt} threw:`, err.message);
    }
  }

  // All attempts exhausted
  console.error(`[character-sheet] ${label}: All ${maxRetries + 1} attempts failed. Last error:`, lastError?.message);
  return null;
}

// ─── Poses Character Sheet ──────────────────────────────────────

/**
 * Generate a 3x3 character sheet with the person in 9 different poses.
 * This is shown to the user during onboarding.
 *
 * The prompt includes industry-specific backgrounds so the generated
 * poses show the person in contextually relevant settings.
 */
export async function generatePosesSheet(
  userId: string,
  photoUrls: string[],
  industry?: string
): Promise<CharacterSheetResult> {
  // Resolve industry for background selection
  const resolvedIndustry = industry || (await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  }))?.industry || "other";

  const backgrounds = getBackgroundsForIndustry(resolvedIndustry);
  const backgroundList = backgrounds.map((bg, i) => `  ${i + 1}. ${bg}`).join("\n");

  const defaultPrompt = `Generate a 3x3 character sheet grid showing this EXACT person in 9 different poses. Match their face, skin tone, hair, body type, and every distinguishing feature PRECISELY from the reference photos. Same person in every single cell — consistency is everything.

SAME EXACT FACE. SAME EXACT OUTFIT. SAME EXACT BUILD across all 9 cells.

GRID (one pose per cell, shot on iPhone 15 Pro Max, 24mm, f/1.78, natural light):
1. Standing relaxed, slight smile, hands at sides — ${backgrounds[0]}
2. Sitting casually, leaning back a bit — ${backgrounds[1]}
3. Mid-sentence, one hand gesturing naturally — ${backgrounds[2]}
4. Arms loosely crossed, warm half-smile — ${backgrounds[3]}
5. Candid side glance, natural moment — ${backgrounds[4]}
6. Walking toward camera, casual stride — ${backgrounds[5]}
7. Leaning on a counter or doorframe — ${backgrounds[0]}
8. Holding phone at chest level, about to record — ${backgrounds[1]}
9. Close-up headshot, direct eye contact, subtle smile — ${backgrounds[2]}

Clothing: the same casual real outfit in EVERY cell (no blazers, no business casual — real clothes people actually wear).
Lighting: natural window light and lamps only, no studio setups.
Skin: real texture, visible pores, no airbrushing or glossy AI sheen.
No warped hands, no extra fingers, no morphing between cells.`;

  const prompt = await getConfig("prompt_character_sheet_poses", defaultPrompt);

  // Create DB record
  const sheet = await prisma.characterSheet.create({
    data: {
      userId,
      type: "poses",
      status: "generating",
    },
  });

  const storageKey = `character-sheets/${userId}/${sheet.id}-poses.png`;

  try {
    const imageUrl = await callGeminiImageGen(prompt, photoUrls, storageKey, {
      maxRetries: 1,
      label: "poses",
    });

    if (!imageUrl) {
      console.error(`[character-sheet] poses for user ${userId}: All attempts returned no image`);
      await prisma.characterSheet.update({
        where: { id: sheet.id },
        data: { status: "failed" },
      });
      return { characterSheetId: sheet.id, compositeUrl: null, images: [], status: "failed" };
    }

    // Save composite
    await prisma.characterSheet.update({
      where: { id: sheet.id },
      data: { compositeUrl: imageUrl, status: "complete" },
    });

    // Save composite image reference with grid position metadata.
    // Each position in the 3x3 grid corresponds to a specific pose
    // that maps to video cut types (see pipeline/character-assets.ts).
    const gridMetadata = buildPosesGridMetadata();
    await prisma.characterSheetImage.create({
      data: {
        characterSheetId: sheet.id,
        url: imageUrl,
        position: 0,
        angle: JSON.stringify({
          type: "composite_poses",
          gridLayout: "3x3",
          positions: gridMetadata,
        }),
      },
    });

    // Also store individual position records so future cropping
    // can reference them directly.
    for (const pose of POSES_GRID) {
      await prisma.characterSheetImage.create({
        data: {
          characterSheetId: sheet.id,
          url: imageUrl, // same composite URL for now -- future: cropped individual images
          position: pose.row * 3 + pose.col, // linear index into the 3x3 grid
          angle: JSON.stringify({
            row: pose.row,
            col: pose.col,
            label: pose.label,
            suitableFor: pose.suitableFor,
            isCropped: false, // flag for future: true when individual image is stored
          }),
        },
      });
    }

    return {
      characterSheetId: sheet.id,
      compositeUrl: imageUrl,
      images: [{ url: imageUrl, position: 0, angle: "composite_poses" }],
      status: "complete",
    };
  } catch (err: any) {
    await prisma.characterSheet.update({
      where: { id: sheet.id },
      data: { status: "failed" },
    });
    throw err;
  }
}

// ─── 360° Character Sheet ───────────────────────────────────────

/**
 * Generate a 360-degree character sheet showing the person from every angle.
 * This is NOT shown to the user — stored in Supabase Storage as a backend
 * reference for the video generation model to maintain character consistency
 * from any viewing angle.
 *
 * From the transcript: "I need a character sheet of this same person but
 * 360 degrees — front, 45 degrees right, back of head, back right,
 * back left, top of head, feet."
 */
export async function generate3DSheet(
  userId: string,
  photoUrls: string[]
): Promise<CharacterSheetResult> {
  // Simplified to 6 angles in a 2x3 grid — the original 9-angle 3x3 grid
  // (including top-of-head bird's-eye and near-duplicate back-left/back-right)
  // was too complex for a single image generation call and consistently failed.
  const defaultPrompt = `Generate a 2x3 character reference sheet of this EXACT person from 6 angles. Match every detail from the reference photos — face, skin, hair, build, distinguishing features. This sheet is used by AI video models to maintain consistency, so accuracy is critical.

SAME EXACT FACE. SAME EXACT OUTFIT. SAME EXACT BUILD in every cell.

GRID (2 rows, 3 columns — neutral standing pose in each):
Row 1: FRONT view (direct eye contact) | 3/4 RIGHT view | RIGHT PROFILE (side)
Row 2: BACK view (rear of head and body) | 3/4 LEFT view | LEFT PROFILE (side)

Clothing: same casual outfit in every cell — whatever they're wearing in the reference photos.
Background: plain light gray, flat, no distractions.
Lighting: even and soft, no harsh shadows — this is a reference sheet, not a portrait.
Skin: real texture, natural, no smoothing or glossy AI sheen.
No morphing between angles, no extra fingers, no face warping. Each view must clearly look like the same real person rotated in space.`;

  const prompt = await getConfig("prompt_character_sheet_3d", defaultPrompt);

  const sheet = await prisma.characterSheet.create({
    data: {
      userId,
      type: "3d_360",
      status: "generating",
    },
  });

  // Store in Supabase — this is backend-only, never shown to user
  const storageKey = `character-sheets/${userId}/${sheet.id}-360.png`;

  try {
    const imageUrl = await callGeminiImageGen(prompt, photoUrls, storageKey, {
      maxRetries: 2,
      label: "3d_360",
    });

    if (!imageUrl) {
      console.error(`[character-sheet] 3d_360 for user ${userId}: All attempts returned no image`);
      await prisma.characterSheet.update({
        where: { id: sheet.id },
        data: { status: "failed" },
      });
      return { characterSheetId: sheet.id, compositeUrl: null, images: [], status: "failed" };
    }

    await prisma.characterSheet.update({
      where: { id: sheet.id },
      data: { compositeUrl: imageUrl, status: "complete" },
    });

    // Store composite with 360 grid metadata.
    // Each position in the 2x3 grid corresponds to a specific viewing angle
    // (see pipeline/character-assets.ts).
    const gridMetadata360 = buildThreeSixtyGridMetadata();
    await prisma.characterSheetImage.create({
      data: {
        characterSheetId: sheet.id,
        url: imageUrl,
        position: 0,
        angle: JSON.stringify({
          type: "composite_360",
          gridLayout: "2x3",
          positions: gridMetadata360,
        }),
      },
    });

    // Store individual angle position records for future cropping.
    for (const angle of THREE_SIXTY_GRID) {
      await prisma.characterSheetImage.create({
        data: {
          characterSheetId: sheet.id,
          url: imageUrl, // same composite URL for now
          position: angle.row * 3 + angle.col, // linear index into the 2x3 grid
          angle: JSON.stringify({
            row: angle.row,
            col: angle.col,
            label: angle.label,
            suitableFor: angle.suitableFor,
            isCropped: false,
          }),
        },
      });
    }

    return {
      characterSheetId: sheet.id,
      compositeUrl: imageUrl,
      images: [{ url: imageUrl, position: 0, angle: "composite_360" }],
      status: "complete",
    };
  } catch (err: any) {
    console.error(`[character-sheet] 3d_360 for user ${userId} threw:`, err.message);
    await prisma.characterSheet.update({
      where: { id: sheet.id },
      data: { status: "failed" },
    });
    throw err;
  }
}

// ─── Demo Mode ──────────────────────────────────────────────────

/**
 * Generate a demo character sheet when no API key is configured.
 * Returns placeholder data so the UI flow still works in development.
 */
export async function generateDemoSheet(
  userId: string,
  type: "poses" | "3d_360"
): Promise<CharacterSheetResult> {
  const sheet = await prisma.characterSheet.create({
    data: {
      userId,
      type,
      status: "complete",
      compositeUrl: null,
    },
  });

  return {
    characterSheetId: sheet.id,
    compositeUrl: null,
    images: [],
    status: "demo",
  };
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Main entry point: generates both the poses sheet (user-facing)
 * and the 3D sheet (backend-only) in parallel.
 * Falls back to demo mode if no API key is set.
 *
 * @param userId   - The user's ID
 * @param photoUrls - Supabase URLs of the user's uploaded photos
 * @param industry - Optional industry for background presets (resolved from DB if not passed)
 */
export async function generateCharacterSheets(
  userId: string,
  photoUrls: string[],
  industry?: string
): Promise<{ poses: CharacterSheetResult; threeD: CharacterSheetResult }> {
  const hasApiKey = !!process.env.GOOGLE_AI_STUDIO_KEY;

  if (!hasApiKey) {
    const [poses, threeD] = await Promise.all([
      generateDemoSheet(userId, "poses"),
      generateDemoSheet(userId, "3d_360"),
    ]);
    return { poses, threeD };
  }

  // Generate both in parallel — poses sheet gets industry backgrounds,
  // 360 sheet is industry-agnostic (neutral studio background)
  const [poses, threeD] = await Promise.all([
    generatePosesSheet(userId, photoUrls, industry),
    generate3DSheet(userId, photoUrls),
  ]);

  return { poses, threeD };
}

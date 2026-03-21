import prisma from "./prisma";
import { getConfig } from "./system-config";

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

// ─── Core Generation ────────────────────────────────────────────

/**
 * Generate a character sheet by calling Google AI Studio (Gemini/Nano Banana).
 * Takes user photo URLs as reference and generates a 3x3 grid of the person in different poses.
 */
async function callGeminiImageGen(
  prompt: string,
  referenceImageUrls: string[]
): Promise<string | null> {
  const apiKey = getApiKey();
  const model = await getConfig("character_sheet_model", "nano_banana");

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
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data: GeminiImageResponse = await response.json();

  // Extract generated image from response
  const candidate = data.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find((p) => p.inlineData);

  if (imagePart?.inlineData) {
    // Return as data URL for now — in production, upload to S3
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }

  return null;
}

// ─── Poses Character Sheet ──────────────────────────────────────

/**
 * Generate a 3x3 character sheet with the person in 9 different poses.
 * This is shown to the user during onboarding.
 */
export async function generatePosesSheet(
  userId: string,
  photoUrls: string[]
): Promise<CharacterSheetResult> {
  const prompt = await getConfig(
    "prompt_character_sheet_poses",
    "Generate a 3x3 character sheet of this person in 9 different professional poses."
  );

  // Create DB record
  const sheet = await prisma.characterSheet.create({
    data: {
      userId,
      type: "poses",
      status: "generating",
    },
  });

  try {
    const imageUrl = await callGeminiImageGen(prompt, photoUrls);

    if (!imageUrl) {
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

    // Save individual image reference (the composite for now)
    await prisma.characterSheetImage.create({
      data: {
        characterSheetId: sheet.id,
        url: imageUrl,
        position: 0,
        angle: "composite",
      },
    });

    return {
      characterSheetId: sheet.id,
      compositeUrl: imageUrl,
      images: [{ url: imageUrl, position: 0, angle: "composite" }],
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

// ─── 3D 360° Character Sheet ────────────────────────────────────

/**
 * Generate a 360° character sheet with 9 angles.
 * This is NOT shown to the user — stored for video generation quality.
 */
export async function generate3DSheet(
  userId: string,
  photoUrls: string[]
): Promise<CharacterSheetResult> {
  const prompt = await getConfig(
    "prompt_character_sheet_3d",
    "Generate a 360-degree character reference of this person showing 9 angles."
  );

  const sheet = await prisma.characterSheet.create({
    data: {
      userId,
      type: "3d_360",
      status: "generating",
    },
  });

  try {
    const imageUrl = await callGeminiImageGen(prompt, photoUrls);

    if (!imageUrl) {
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

    const angles = [
      "front", "45_right", "right_profile", "135_right",
      "back", "135_left", "left_profile", "45_left", "top_down",
    ];

    // For a single composite image, store once with angle metadata
    await prisma.characterSheetImage.create({
      data: {
        characterSheetId: sheet.id,
        url: imageUrl,
        position: 0,
        angle: "composite_360",
      },
    });

    return {
      characterSheetId: sheet.id,
      compositeUrl: imageUrl,
      images: [{ url: imageUrl, position: 0, angle: "composite_360" }],
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
 */
export async function generateCharacterSheets(
  userId: string,
  photoUrls: string[]
): Promise<{ poses: CharacterSheetResult; threeD: CharacterSheetResult }> {
  const hasApiKey = !!process.env.GOOGLE_AI_STUDIO_KEY;

  if (!hasApiKey) {
    const [poses, threeD] = await Promise.all([
      generateDemoSheet(userId, "poses"),
      generateDemoSheet(userId, "3d_360"),
    ]);
    return { poses, threeD };
  }

  // Generate both in parallel
  const [poses, threeD] = await Promise.all([
    generatePosesSheet(userId, photoUrls),
    generate3DSheet(userId, photoUrls),
  ]);

  return { poses, threeD };
}

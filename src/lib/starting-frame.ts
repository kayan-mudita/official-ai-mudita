import prisma from "./prisma";
import { getConfig } from "./system-config";

const GOOGLE_AI_STUDIO_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Starting Frame Generator
 *
 * The starting frame is the anchor image used for EVERY video generation.
 * It ensures character consistency across all clips. From the course:
 * "You'll use this same starting frame for every segment."
 *
 * This generates a high-quality starting frame using Nano Banana Pro,
 * with the character in their specific pose/setting/lighting ready
 * for video generation.
 */

export interface StartingFrameResult {
  imageUrl: string | null;
  photoId: string | null;
  status: "complete" | "failed" | "demo";
}

/**
 * Generate a starting frame for video generation.
 * Takes the user's character sheet + a scene description and creates
 * an anchor image that will be attached to every video generation call.
 */
export async function generateStartingFrame(
  userId: string,
  sceneDescription?: string
): Promise<StartingFrameResult> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    return { imageUrl: null, photoId: null, status: "demo" };
  }

  // Get user's photos for reference
  const photos = await prisma.photo.findMany({
    where: { userId },
    orderBy: { isPrimary: "desc" },
    take: 3,
  });

  if (photos.length === 0) {
    return { imageUrl: null, photoId: null, status: "failed" };
  }

  // Get character sheet for additional reference
  const characterSheet = await prisma.characterSheet.findFirst({
    where: { userId, type: "poses", status: "complete" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  // Get brand context for appropriate setting
  const brand = await prisma.brandProfile.findFirst({ where: { userId } });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true, firstName: true },
  });

  // Build the starting frame prompt
  const industrySettings: Record<string, string> = {
    real_estate: "modern, bright office with city views, professional real estate agent attire, warm natural lighting",
    legal: "clean law office with bookshelves, professional suit, authoritative but approachable lighting",
    medical: "clean clinical setting with soft lighting, medical professional attire, trustworthy and warm",
    creator: "aesthetic home studio setup, casual but put-together outfit, ring light creating soft even illumination",
    business: "modern co-working space or office, smart casual attire, natural window lighting",
    other: "clean, minimal professional setting, smart casual attire, natural soft lighting",
  };

  const setting = industrySettings[user?.industry || "other"] || industrySettings.other;
  const scene = sceneDescription || `Professional ${user?.industry || "business"} setting`;

  const prompt = `Generate a single high-quality portrait photograph of this person for use as a video generation starting frame.

REQUIREMENTS:
- The person must look EXACTLY like the reference photos provided
- ${setting}
- Scene: ${scene}
- Person is facing the camera with a natural, confident expression
- Slight smile, direct eye contact
- Natural pose — standing or sitting, hands visible and relaxed
- Shot from chest up (medium close-up)
- Sharp focus on face, slight depth of field on background
- Professional but authentic — looks like a real photo, not AI-generated
- Resolution: high quality, sharp details
- Lighting: soft, natural, flattering

${brand?.toneOfVoice ? `The person's energy should feel ${brand.toneOfVoice}.` : ""}

This image will be used as the consistent anchor frame for all video generation. Character consistency is critical.`;

  // Build parts with reference images
  const parts: any[] = [{ text: prompt }];

  // Add user photos as reference
  for (const photo of photos) {
    if (photo.url && !photo.url.startsWith("/uploads/")) {
      try {
        const res = await fetch(photo.url);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          parts.push({
            inlineData: {
              mimeType: res.headers.get("content-type") || "image/jpeg",
              data: Buffer.from(buffer).toString("base64"),
            },
          });
        }
      } catch {}
    }
  }

  // Add character sheet as additional reference
  if (characterSheet?.compositeUrl && characterSheet.compositeUrl.startsWith("data:")) {
    const match = characterSheet.compositeUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }

  try {
    const response = await fetch(
      `${GOOGLE_AI_STUDIO_URL}/nano-banana-pro-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["image", "text"],
            temperature: 0.6,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("[starting-frame] Nano Banana error:", await response.text());
      return { imageUrl: null, photoId: null, status: "failed" };
    }

    const data = await response.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData) {
      return { imageUrl: null, photoId: null, status: "failed" };
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    // Save as a photo record marked as the starting frame
    const savedPhoto = await prisma.photo.create({
      data: {
        userId,
        filename: `starting-frame-${Date.now()}.jpg`,
        url: imageUrl,
        isPrimary: false,
      },
    });

    return {
      imageUrl,
      photoId: savedPhoto.id,
      status: "complete",
    };
  } catch (err) {
    console.error("[starting-frame] Error:", err);
    return { imageUrl: null, photoId: null, status: "failed" };
  }
}

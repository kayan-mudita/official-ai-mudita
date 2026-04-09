import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { generateVideo } from "@/lib/generate";

const WELCOME_SCRIPT =
  "Hey, welcome to Official AI. I'm your AI twin — same face, same voice, and I'm about to take over your content. You focus on closing deals, I'll handle the posting. Let's go.";

// Short, focused prompt. Video models perform better with clear direction, not essays.
const VIDEO_PROMPT =
  `@image1 UGC-style selfie video. The person from the reference photo holds their phone at arm's length, looking directly into the camera with confident, genuine energy. Natural room lighting, slight handheld wobble. They speak directly to camera: "${WELCOME_SCRIPT}" iPhone front-camera aesthetic. Casual but professional clothing. Warm, inviting background (home office or living room). The person smiles naturally while speaking. Conversational, authentic tone — like FaceTiming a friend. 9:16 vertical.`;

/**
 * POST /api/onboarding/preview-video
 *
 * Single 5-second welcome video using Kling v3 with multi-image elements.
 * Non-blocking — returns immediately with videoId. Frontend polls
 * /api/onboarding/preview-video/status?videoId=xxx for completion.
 */
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    console.log("[welcome-video] Starting generation for user:", user.id);

    // Gather all reference images: primary photo + both character sheets
    const [primaryPhoto, posesSheet, threeSixtySheet] = await Promise.all([
      prisma.photo.findFirst({
        where: { userId: user.id, isPrimary: true },
        select: { url: true },
      }),
      prisma.characterSheet.findFirst({
        where: { userId: user.id, type: "poses", status: "complete" },
        orderBy: { createdAt: "desc" },
        select: { compositeUrl: true },
      }),
      prisma.characterSheet.findFirst({
        where: { userId: user.id, type: "3d_360", status: "complete" },
        orderBy: { createdAt: "desc" },
        select: { compositeUrl: true },
      }),
    ]);

    const startImageUrl = primaryPhoto?.url;
    if (!startImageUrl) {
      return NextResponse.json(
        { error: "No primary photo available" },
        { status: 400 }
      );
    }

    // Collect character sheet URLs as additional references
    const referenceImageUrls: string[] = [];
    if (posesSheet?.compositeUrl) referenceImageUrls.push(posesSheet.compositeUrl);
    if (threeSixtySheet?.compositeUrl) referenceImageUrls.push(threeSixtySheet.compositeUrl);

    console.log(
      `[welcome-video] Reference images: primary photo + ${referenceImageUrls.length} character sheet(s)`
    );

    // Try to get user's cloned voice for TTS fallback
    const voiceSample = await prisma.voiceSample.findFirst({
      where: { userId: user.id, isDefault: true },
      select: { providerVoiceId: true, url: true },
    });

    // Use Kling v3 with native audio (generates voice + lip sync in one call)
    // Falls back to seedance_2.0 which also has native audio
    const selectedModel = "kling_v3_audio";

    console.log(`[welcome-video] Submitting to FAL (${selectedModel}), 10s...`);
    const result = await generateVideo({
      model: selectedModel,
      photoUrl: startImageUrl,
      voiceUrl: voiceSample?.providerVoiceId || "",
      script: VIDEO_PROMPT,
      userId: user.id,
      duration: 10,
      usePromptEngine: false,
      referenceImageUrls,
      audioUrl: voiceSample?.url || undefined,
    });

    console.log("[welcome-video] FAL job submitted:", result.jobId, result.status);

    // Create a video record to track this
    const video = await prisma.video.create({
      data: {
        userId: user.id,
        title: "Welcome Video",
        description: "Your AI-generated welcome video",
        script: WELCOME_SCRIPT,
        model: selectedModel,
        contentType: "welcome",
        status: result.status === "completed" ? "complete" : "generating",
        duration: 10,
        videoUrl: result.videoUrl || null,
        thumbnailUrl: result.thumbnailUrl || null,
        sourceReview: JSON.stringify({ falJobId: result.jobId }),
      },
    });

    return NextResponse.json({
      success: true,
      videoId: video.id,
      falJobId: result.jobId,
      status: result.status,
      videoUrl: result.videoUrl || null,
    });
  } catch (err: any) {
    console.error("[welcome-video] Generation failed:", err);
    return NextResponse.json(
      { error: "Failed to start welcome video generation" },
      { status: 500 }
    );
  }
}

/**
 * Pipeline Step: MOTION_ENHANCE
 *
 * Optional enhancement step that takes a generated video and re-renders it
 * through Kling 2.6 Motion Control with a high-quality starting frame.
 * The motion from the original video is preserved but the visual quality
 * is dramatically improved.
 *
 * Best used when the source model is lower quality (LTX, Wan) and you
 * want Kling-level realism. Skipped for HeyGen, Kling 3, Veo 3.
 */

import prisma from "@/lib/prisma";
import { enhanceWithMotionControl, isKlingConfigured } from "@/lib/kling-native";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

export async function handleMotionEnhance(
  videoId: string,
  userId: string
): Promise<StepResult> {
  if (!isKlingConfigured()) {
    console.log("[motion-enhance] Kling not configured, skipping enhancement");
    return { status: "motion_enhance_skipped", nextStep: "post_process" };
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { videoUrl: true, sourceReview: true },
  });

  if (!video?.videoUrl) {
    return { status: "error", error: "No video URL to enhance" };
  }

  const meta = parseMeta(video.sourceReview);

  // Get the high-quality starting frame
  const imageUrl = meta.startingFrameUrl;
  if (!imageUrl) {
    console.log("[motion-enhance] No starting frame, skipping");
    return { status: "motion_enhance_skipped", nextStep: "post_process" };
  }

  meta.pipelineStep = "motion_enhance";
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  console.log("[motion-enhance] Submitting to Kling Motion Control...");

  const result = await enhanceWithMotionControl({
    imageUrl,
    videoUrl: video.videoUrl,
    prompt: meta.originalScript?.substring(0, 200) || undefined,
    duration: "10",
  });

  if (result.videoUrl) {
    console.log("[motion-enhance] Enhancement complete, replacing video URL");
    await prisma.video.update({
      where: { id: videoId },
      data: { videoUrl: result.videoUrl },
    });
  } else {
    console.warn("[motion-enhance] Enhancement failed, keeping original:", result.error);
  }

  return {
    status: "motion_enhance_done",
    nextStep: "post_process",
  };
}

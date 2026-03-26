/**
 * Pipeline Step: CUT (submit)
 *
 * Submits a single video cut to FAL for generation.
 * Resolves the reference image using the character asset pipeline
 * (character sheets > starting frame > user photo), submits to
 * the correct FAL model, and stores the job ID in pipeline
 * metadata for polling.
 *
 * KEY FIX: Previously this step ignored character sheets entirely
 * and sent the user's raw selfie to FAL. Now it uses
 * getBestReferenceImage() which prioritizes character sheet
 * composites -- giving the video model MULTIPLE angles/poses
 * to reference for much better character consistency.
 *
 * FAL returns immediately with a job ID -- the frontend polls
 * via the cut-poll step.
 */

import prisma from "@/lib/prisma";
import { generateVideo } from "@/lib/generate";
import { getBestReferenceImage } from "./character-assets";
import {
  downloadAndStore,
  videoKey,
  thumbnailKey,
  isStorageConfigured,
} from "@/lib/storage";
import { getVideoDurationFromAudio } from "./audio-planner";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

export async function handleCutSubmit(
  videoId: string,
  userId: string,
  cutIndex: number
): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { model: true, photoId: true, sourceReview: true },
  });

  if (!video) {
    return { status: "error", error: "Video not found" };
  }

  const selectedModel = video.model || "kling_2.6";
  const meta = parseMeta(video.sourceReview);
  const cut = meta.cuts[cutIndex];

  if (!cut) {
    return { status: "error", error: `Cut ${cutIndex} not found` };
  }

  // Update progress
  meta.pipelineStep = "cut";
  meta.pipelineCut = cutIndex;
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  // ---- Resolve reference image via character asset pipeline ----
  //
  // getBestReferenceImage resolves in priority order:
  //   a. 360 character sheet composite (multi-angle, richest reference)
  //   b. Poses character sheet composite (multi-pose reference)
  //   c. Starting frame (single high-quality generated image)
  //   d. User's primary uploaded photo (raw selfie fallback)
  //
  // This replaces the old logic that only checked startingFrameUrl
  // and fell back to the raw selfie -- completely ignoring the
  // character sheets we spent API credits generating.

  const referenceImageUrl = await getBestReferenceImage(userId, cut.type);
  let photoUrl = referenceImageUrl || "";

  if (!photoUrl) {
    // Absolute last resort: check for a photo linked directly to this video
    if (video.photoId) {
      const linkedPhoto = await prisma.photo.findFirst({ where: { id: video.photoId } });
      if (linkedPhoto?.url) {
        photoUrl = linkedPhoto.url;
        console.warn(
          `[pipeline/cut-submit] getBestReferenceImage returned null for cut ${cutIndex}. ` +
          `Using video-linked photo as emergency fallback.`
        );
      }
    }
  }

  if (!photoUrl) {
    console.error(
      `[pipeline/cut-submit] No reference image available for cut ${cutIndex}. ` +
      `Video generation will proceed without a character reference.`
    );
  }

  // ---- Determine video duration from audio (audio-driven planning) ----
  //
  // If per-cut audio was generated in the TTS step, use the actual audio
  // duration to determine how long the video should be. This closes the
  // #2 data flow gap: the person "talks" for X seconds in audio, so the
  // video is generated at the nearest valid Kling duration that covers X.
  //
  // Falls back to the composition plan's generateDuration if no per-cut
  // audio is available (e.g., TTS failed or script was too short).
  const cutAudioEntry = meta.cutAudio?.[cutIndex];
  let videoDuration = cut.generateDuration;

  if (cutAudioEntry && cutAudioEntry.durationMs > 0) {
    videoDuration = getVideoDurationFromAudio(cutAudioEntry.durationMs);
    console.log(
      `[pipeline/cut-submit] Cut ${cutIndex}: audio=${cutAudioEntry.durationMs}ms → video=${videoDuration}s (was ${cut.generateDuration}s)`
    );
  } else {
    console.log(
      `[pipeline/cut-submit] Cut ${cutIndex}: no per-cut audio, using default duration=${cut.generateDuration}s`
    );
  }

  // ---- Submit to FAL ----
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  const result = await generateVideo({
    model: selectedModel,
    photoUrl,
    voiceUrl: "",
    script: cut.prompt,
    userId,
    industry: user?.industry,
    usePromptEngine: false,
    duration: videoDuration,
    // DATA FLOW GAP #8 FIX: Pass the cut's audio context so generateVideo
    // can tell the video model the person is speaking, producing natural
    // mouth movements instead of a blank stare.
    audioContext: cut.audio,
  });

  // Handle immediate failure
  if (result.status === "failed") {
    const failMsg = `Cut ${cutIndex} generation failed: ${result.error || "FAL submission rejected"}`;
    meta.error = failMsg;
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "failed", sourceReview: stringifyMeta(meta) },
    });
    return { status: "failed", error: failMsg };
  }

  // Handle synchronous completion (some models return immediately)
  let persistedVideoUrl = result.videoUrl || null;
  let persistedThumbnailUrl = result.thumbnailUrl || null;

  if (result.status === "completed" && result.videoUrl && isStorageConfigured()) {
    try {
      persistedVideoUrl = await downloadAndStore(
        result.videoUrl,
        videoKey(userId, `${videoId}-cut-${cutIndex}`, "mp4"),
        "video/mp4"
      );
    } catch (err) {
      console.error(`[pipeline/cut-submit] Failed to persist cut ${cutIndex} video to storage:`, err);
    }
    if (result.thumbnailUrl) {
      try {
        persistedThumbnailUrl = await downloadAndStore(
          result.thumbnailUrl,
          thumbnailKey(userId, `${videoId}-cut-${cutIndex}`, "jpg"),
          "image/jpeg"
        );
      } catch (err) {
        console.error(`[pipeline/cut-submit] Failed to persist cut ${cutIndex} thumbnail to storage:`, err);
      }
    }
  }

  // Store job in metadata
  meta.cutJobs[cutIndex] = {
    jobId: result.jobId,
    status: result.status,
    videoUrl: persistedVideoUrl,
    thumbnailUrl: persistedThumbnailUrl,
    trimTo: cut.duration,
  };
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  const isLastCut = cutIndex >= meta.cuts.length - 1;

  return {
    status: result.status === "completed" ? "cut_done" : "cut_submitted",
    nextStep: result.status === "completed"
      ? isLastCut
        ? "stitch"
        : "cut"
      : "poll",
    nextCutIndex: result.status === "completed"
      ? isLastCut
        ? undefined
        : cutIndex + 1
      : cutIndex,
    data: {
      cutIndex,
      jobId: result.jobId,
      videoUrl: persistedVideoUrl,
    },
  };
}

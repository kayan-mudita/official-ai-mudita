/**
 * Pipeline Step: SUBMIT_ALL_CUTS (parallel submission)
 *
 * Submits ALL video cuts to FAL simultaneously instead of one at a time.
 * This reduces total generation time from 3-6 minutes (sequential) to
 * 60-120 seconds (parallel), since all cuts generate concurrently.
 *
 * Reuses the same reference image resolution, audio-driven duration
 * planning, and FAL submission logic as the single cut-submit step.
 *
 * After submission, all job IDs are stored in meta.cutJobs and the
 * frontend polls via the poll_all_cuts step.
 */

import prisma from "@/lib/prisma";
import { generateVideo } from "@/lib/generate";
import { getBestReferenceImage } from "./character-assets";
import { getVideoDurationFromAudio } from "./audio-planner";
import {
  downloadAndStore,
  videoKey,
  thumbnailKey,
  isStorageConfigured,
} from "@/lib/storage";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

export async function handleSubmitAllCuts(
  videoId: string,
  userId: string
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

  if (!meta.cuts || meta.cuts.length === 0) {
    return { status: "error", error: "No cuts found in metadata" };
  }

  // Update progress to show we're submitting all cuts
  meta.pipelineStep = "submit_all_cuts";
  meta.pipelineCut = 0;
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  // ---- Resolve reference image once (shared across all cuts) ----
  const referenceImageUrl = await getBestReferenceImage(userId, meta.cuts[0].type);
  let photoUrl = referenceImageUrl || "";

  if (!photoUrl && video.photoId) {
    const linkedPhoto = await prisma.photo.findFirst({ where: { id: video.photoId } });
    if (linkedPhoto?.url) {
      photoUrl = linkedPhoto.url;
      console.warn(
        `[pipeline/cut-submit-all] getBestReferenceImage returned null. Using video-linked photo as fallback.`
      );
    }
  }

  if (!photoUrl) {
    console.error(
      `[pipeline/cut-submit-all] No reference image available. Video generation will proceed without a character reference.`
    );
  }

  // ---- Fetch user industry once ----
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  // ---- Submit ALL cuts to FAL in parallel ----
  const submissions = await Promise.allSettled(
    meta.cuts.map(async (cut, cutIndex) => {
      // Determine video duration from audio (audio-driven planning)
      const cutAudioEntry = meta.cutAudio?.[cutIndex];
      let videoDuration = cut.generateDuration;

      if (cutAudioEntry && cutAudioEntry.durationMs > 0) {
        videoDuration = getVideoDurationFromAudio(cutAudioEntry.durationMs);
        console.log(
          `[pipeline/cut-submit-all] Cut ${cutIndex}: audio=${cutAudioEntry.durationMs}ms -> video=${videoDuration}s (was ${cut.generateDuration}s)`
        );
      } else {
        console.log(
          `[pipeline/cut-submit-all] Cut ${cutIndex}: no per-cut audio, using default duration=${cut.generateDuration}s`
        );
      }

      const result = await generateVideo({
        model: selectedModel,
        photoUrl,
        voiceUrl: "",
        script: cut.prompt,
        userId,
        industry: user?.industry,
        usePromptEngine: false,
        duration: videoDuration,
      });

      return { cutIndex, result, cut };
    })
  );

  // ---- Process results and store all job IDs ----
  // Re-read meta to avoid overwriting concurrent updates
  const freshVideo = await prisma.video.findUnique({
    where: { id: videoId },
    select: { sourceReview: true },
  });
  const freshMeta = parseMeta(freshVideo?.sourceReview);

  let allSubmitted = true;
  let anyFailed = false;
  const failedCuts: number[] = [];
  let completedCount = 0;

  for (const settlement of submissions) {
    if (settlement.status === "rejected") {
      // Promise itself rejected (network error, etc.)
      console.error(`[pipeline/cut-submit-all] Cut submission promise rejected:`, settlement.reason);
      anyFailed = true;
      continue;
    }

    const { cutIndex, result, cut } = settlement.value;

    if (result.status === "failed") {
      console.error(`[pipeline/cut-submit-all] Cut ${cutIndex} failed: ${result.error}`);
      failedCuts.push(cutIndex);
      anyFailed = true;
      freshMeta.cutJobs[cutIndex] = {
        jobId: result.jobId || "",
        status: "failed",
        videoUrl: null,
        thumbnailUrl: null,
        trimTo: cut.duration,
      };
      continue;
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
        console.error(`[pipeline/cut-submit-all] Failed to persist cut ${cutIndex} video:`, err);
      }
      if (result.thumbnailUrl) {
        try {
          persistedThumbnailUrl = await downloadAndStore(
            result.thumbnailUrl,
            thumbnailKey(userId, `${videoId}-cut-${cutIndex}`, "jpg"),
            "image/jpeg"
          );
        } catch (err) {
          console.error(`[pipeline/cut-submit-all] Failed to persist cut ${cutIndex} thumbnail:`, err);
        }
      }
      completedCount++;
    }

    freshMeta.cutJobs[cutIndex] = {
      jobId: result.jobId,
      status: result.status,
      videoUrl: persistedVideoUrl,
      thumbnailUrl: persistedThumbnailUrl,
      trimTo: cut.duration,
    };
  }

  // If ALL cuts failed, mark the video as failed
  if (failedCuts.length === meta.cuts.length) {
    const failMsg = `All ${meta.cuts.length} cuts failed to submit`;
    freshMeta.error = failMsg;
    freshMeta.pipelineStep = "submit_all_cuts";
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "failed", sourceReview: stringifyMeta(freshMeta) },
    });
    return { status: "failed", error: failMsg };
  }

  // If ALL cuts completed synchronously, jump straight to stitch
  if (completedCount === meta.cuts.length) {
    freshMeta.pipelineStep = "submit_all_cuts";
    await prisma.video.update({
      where: { id: videoId },
      data: { sourceReview: stringifyMeta(freshMeta) },
    });
    return {
      status: "all_cuts_submitted",
      nextStep: "stitch",
      data: {
        totalCuts: meta.cuts.length,
        completedCuts: completedCount,
        progress: `${completedCount} of ${meta.cuts.length} complete`,
      },
    };
  }

  // Normal case: cuts are submitted and need polling
  freshMeta.pipelineStep = "submit_all_cuts";
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(freshMeta) },
  });

  return {
    status: "all_cuts_submitted",
    nextStep: "poll_all_cuts",
    data: {
      totalCuts: meta.cuts.length,
      completedCuts: completedCount,
      failedCuts: failedCuts.length > 0 ? failedCuts : undefined,
      progress: `${completedCount} of ${meta.cuts.length} complete, ${meta.cuts.length - completedCount - failedCuts.length} generating...`,
    },
  };
}

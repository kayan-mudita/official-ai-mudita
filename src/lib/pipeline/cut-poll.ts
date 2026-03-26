/**
 * Pipeline Step: POLL (check if a cut is done)
 *
 * Polls FAL for the status of a video cut generation job.
 * On completion, persists the video/thumbnail to Supabase Storage.
 * On failure, marks the video as failed.
 * While in progress, tells the frontend to keep polling.
 */

import prisma from "@/lib/prisma";
import { falPollOnce } from "@/lib/generate";
import {
  downloadAndStore,
  videoKey,
  thumbnailKey,
  isStorageConfigured,
} from "@/lib/storage";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

export async function handleCutPoll(
  videoId: string,
  userId: string,
  cutIndex: number
): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { sourceReview: true },
  });

  if (!video) {
    return { status: "error", error: "Video not found" };
  }

  const meta = parseMeta(video.sourceReview);
  const cutJob = meta.cutJobs[cutIndex];

  if (!cutJob?.jobId) {
    return { status: "error", error: `No job for cut ${cutIndex}` };
  }

  // Already completed on a previous call
  if (cutJob.status === "completed" && cutJob.videoUrl) {
    const isLastCut = cutIndex >= meta.cuts.length - 1;
    return {
      status: "cut_done",
      nextStep: isLastCut ? "stitch" : "cut",
      nextCutIndex: isLastCut ? undefined : cutIndex + 1,
      data: { cutIndex, videoUrl: cutJob.videoUrl },
    };
  }

  // Poll FAL
  const pollResult = await falPollOnce(cutJob.jobId);
  cutJob.status = pollResult.status;

  // ---- Handle failure ----
  if (pollResult.status === "failed") {
    const failMsg = `Cut ${cutIndex} generation failed: ${pollResult.error || "FAL reported failure"}`;
    console.error(`[pipeline/cut-poll] ${failMsg}`);
    meta.cutJobs[cutIndex] = cutJob;
    meta.error = failMsg;
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "failed", sourceReview: stringifyMeta(meta) },
    });
    return { status: "cut_failed", error: failMsg, data: { cutIndex } };
  }

  // ---- Handle completion ----
  if (pollResult.status === "completed" && pollResult.videoUrl) {
    let storedVideoUrl = pollResult.videoUrl;
    let storedThumbnailUrl = pollResult.thumbnailUrl || null;

    if (isStorageConfigured()) {
      try {
        storedVideoUrl = await downloadAndStore(
          pollResult.videoUrl,
          videoKey(userId, `${videoId}-cut-${cutIndex}`, "mp4"),
          "video/mp4"
        );
      } catch (err) {
        console.error(`[pipeline/cut-poll] Failed to persist cut ${cutIndex} video to storage:`, err);
      }
      if (pollResult.thumbnailUrl) {
        try {
          storedThumbnailUrl = await downloadAndStore(
            pollResult.thumbnailUrl,
            thumbnailKey(userId, `${videoId}-cut-${cutIndex}`, "jpg"),
            "image/jpeg"
          );
        } catch (err) {
          console.error(`[pipeline/cut-poll] Failed to persist cut ${cutIndex} thumbnail to storage:`, err);
        }
      }
    }

    cutJob.videoUrl = storedVideoUrl;
    cutJob.thumbnailUrl = storedThumbnailUrl;
  } else if (pollResult.videoUrl) {
    cutJob.videoUrl = pollResult.videoUrl;
  }

  meta.cutJobs[cutIndex] = cutJob;
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  // Completed but no video URL -- treat as failure
  if (pollResult.status === "completed") {
    if (!cutJob.videoUrl) {
      const failMsg = `Cut ${cutIndex} completed but no video URL was returned from FAL`;
      console.error(`[pipeline/cut-poll] ${failMsg}`);
      meta.cutJobs[cutIndex] = { ...cutJob, status: "failed" };
      meta.error = failMsg;
      await prisma.video.update({
        where: { id: videoId },
        data: { status: "failed", sourceReview: stringifyMeta(meta) },
      });
      return { status: "cut_failed", error: failMsg, data: { cutIndex } };
    }

    const isLastCut = cutIndex >= meta.cuts.length - 1;
    return {
      status: "cut_done",
      nextStep: isLastCut ? "stitch" : "cut",
      nextCutIndex: isLastCut ? undefined : cutIndex + 1,
      data: { cutIndex, videoUrl: cutJob.videoUrl },
    };
  }

  // Still processing
  return {
    status: "polling",
    nextStep: "poll",
    nextCutIndex: cutIndex,
    data: { cutIndex, retryAfter: 5 },
  };
}

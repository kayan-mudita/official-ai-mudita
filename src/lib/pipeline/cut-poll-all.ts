/**
 * Pipeline Step: POLL_ALL_CUTS (parallel polling)
 *
 * Checks the status of ALL cut jobs at once instead of polling
 * one cut at a time. Returns aggregated progress so the frontend
 * can show "2 of 3 complete, 1 generating..." and keep polling
 * until all are done.
 *
 * When all cuts are complete -> nextStep: "stitch"
 * When some are still pending -> nextStep: "poll_all_cuts" (keep polling)
 * When any failed -> reports which ones failed
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

export async function handlePollAllCuts(
  videoId: string,
  userId: string
): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { sourceReview: true },
  });

  if (!video) {
    return { status: "error", error: "Video not found" };
  }

  const meta = parseMeta(video.sourceReview);
  const totalCuts = meta.cuts.length;

  if (totalCuts === 0) {
    return { status: "error", error: "No cuts found in metadata" };
  }

  // Update pipeline step for status endpoint
  meta.pipelineStep = "poll_all_cuts";

  // ---- Poll ALL cut jobs in parallel ----
  const pollResults = await Promise.allSettled(
    meta.cuts.map(async (_, cutIndex) => {
      const cutJob = meta.cutJobs[cutIndex];

      if (!cutJob?.jobId) {
        return { cutIndex, status: "missing" as const, error: `No job for cut ${cutIndex}` };
      }

      // Already completed on a previous poll
      if (cutJob.status === "completed" && cutJob.videoUrl) {
        return { cutIndex, status: "completed" as const, videoUrl: cutJob.videoUrl };
      }

      // Already failed on a previous poll
      if (cutJob.status === "failed") {
        return { cutIndex, status: "failed" as const, error: `Cut ${cutIndex} previously failed` };
      }

      // Poll FAL for this cut
      const pollResult = await falPollOnce(cutJob.jobId);

      // Handle completion -- persist to storage
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
            console.error(`[pipeline/cut-poll-all] Failed to persist cut ${cutIndex} video:`, err);
          }
          if (pollResult.thumbnailUrl) {
            try {
              storedThumbnailUrl = await downloadAndStore(
                pollResult.thumbnailUrl,
                thumbnailKey(userId, `${videoId}-cut-${cutIndex}`, "jpg"),
                "image/jpeg"
              );
            } catch (err) {
              console.error(`[pipeline/cut-poll-all] Failed to persist cut ${cutIndex} thumbnail:`, err);
            }
          }
        }

        // Update the job record
        cutJob.status = "completed";
        cutJob.videoUrl = storedVideoUrl;
        cutJob.thumbnailUrl = storedThumbnailUrl;

        return { cutIndex, status: "completed" as const, videoUrl: storedVideoUrl };
      }

      // Handle failure
      if (pollResult.status === "failed") {
        cutJob.status = "failed";
        return {
          cutIndex,
          status: "failed" as const,
          error: `Cut ${cutIndex} generation failed: ${pollResult.error || "FAL reported failure"}`,
        };
      }

      // Handle completion without URL (edge case)
      if (pollResult.status === "completed" && !pollResult.videoUrl) {
        cutJob.status = "failed";
        return {
          cutIndex,
          status: "failed" as const,
          error: `Cut ${cutIndex} completed but no video URL was returned`,
        };
      }

      // Still in progress
      cutJob.status = pollResult.status;
      if (pollResult.videoUrl) {
        cutJob.videoUrl = pollResult.videoUrl;
      }

      return { cutIndex, status: "pending" as const };
    })
  );

  // ---- Aggregate results ----
  let completedCount = 0;
  let failedCount = 0;
  let pendingCount = 0;
  const failedCuts: number[] = [];
  const failedErrors: string[] = [];

  for (const settlement of pollResults) {
    if (settlement.status === "rejected") {
      // Promise itself rejected (network error polling FAL)
      console.error(`[pipeline/cut-poll-all] Poll promise rejected:`, settlement.reason);
      pendingCount++; // Treat as pending so we retry next poll
      continue;
    }

    const result = settlement.value;
    switch (result.status) {
      case "completed":
        completedCount++;
        break;
      case "failed":
        failedCount++;
        failedCuts.push(result.cutIndex);
        if (result.error) failedErrors.push(result.error);
        break;
      case "pending":
      case "missing":
        pendingCount++;
        break;
    }
  }

  // Track how many are done for the progress indicator
  meta.pipelineCut = completedCount;

  // ---- Persist updated job statuses ----
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  // ---- All cuts failed ----
  if (failedCount === totalCuts) {
    const failMsg = `All ${totalCuts} cuts failed: ${failedErrors.join("; ")}`;
    meta.error = failMsg;
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "failed", sourceReview: stringifyMeta(meta) },
    });
    return {
      status: "failed",
      error: failMsg,
      data: { failedCuts, completedCuts: 0, totalCuts },
    };
  }

  // ---- All non-failed cuts are complete -> stitch ----
  if (pendingCount === 0) {
    // Some may have failed but we have at least one completed cut
    const progress = failedCount > 0
      ? `${completedCount} of ${totalCuts} complete (${failedCount} failed)`
      : `${completedCount} of ${totalCuts} complete`;

    return {
      status: "all_cuts_done",
      nextStep: "stitch",
      data: {
        completedCuts: completedCount,
        failedCuts: failedCuts.length > 0 ? failedCuts : undefined,
        totalCuts,
        progress,
      },
    };
  }

  // ---- Some still pending -> keep polling ----
  const progressParts: string[] = [];
  if (completedCount > 0) progressParts.push(`${completedCount} complete`);
  if (pendingCount > 0) progressParts.push(`${pendingCount} generating`);
  if (failedCount > 0) progressParts.push(`${failedCount} failed`);

  return {
    status: "polling",
    nextStep: "poll_all_cuts",
    data: {
      completedCuts: completedCount,
      pendingCuts: pendingCount,
      failedCuts: failedCuts.length > 0 ? failedCuts : undefined,
      totalCuts,
      progress: `${progressParts.join(", ")} (${totalCuts} total)`,
      retryAfter: 5,
    },
  };
}

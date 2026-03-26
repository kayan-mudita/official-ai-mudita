/**
 * Pipeline Step: POLL_STITCH (check Shotstack render status)
 *
 * Polls Shotstack for the status of the stitch render job.
 * On completion, persists the final video to Supabase Storage
 * and marks the video as "review" (ready for user approval).
 *
 * On failure, falls back to using the first cut as the final video.
 */

import prisma from "@/lib/prisma";
import { getStitchStatus } from "@/lib/video-stitcher";
import {
  downloadAndStore,
  videoKey,
  thumbnailKey,
  isStorageConfigured,
} from "@/lib/storage";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

/**
 * Persist a URL to Supabase Storage if it is still a temporary external URL.
 */
async function ensurePermanentUrl(
  url: string,
  storageKeyPath: string,
  mime: string
): Promise<string> {
  if (!isStorageConfigured()) return url;
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (supabaseHost && url.startsWith(supabaseHost)) return url;
  try {
    return await downloadAndStore(url, storageKeyPath, mime);
  } catch (err) {
    console.error(`[pipeline/stitch-poll] Failed to persist ${storageKeyPath}:`, err);
    return url;
  }
}

export async function handleStitchPoll(
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
  const stitchJobId = meta.stitchJobId;

  if (!stitchJobId) {
    return { status: "error", error: "No stitch job ID found" };
  }

  try {
    const job = await getStitchStatus(stitchJobId);
    meta.stitchStatus = job.status;

    // ---- Completed ----
    if (job.status === "completed" && job.url) {
      const storedUrl = await ensurePermanentUrl(
        job.url,
        videoKey(userId, videoId, "mp4"),
        "video/mp4"
      );

      let finalThumb = meta.cutThumbnailUrl || null;
      if (finalThumb) {
        finalThumb = await ensurePermanentUrl(
          finalThumb,
          thumbnailKey(userId, videoId, "jpg"),
          "image/jpeg"
        );
      }

      await prisma.video.update({
        where: { id: videoId },
        data: {
          videoUrl: storedUrl,
          thumbnailUrl: finalThumb,
          status: "review",
          sourceReview: stringifyMeta(meta),
        },
      });

      return { status: "done", data: { videoUrl: storedUrl } };
    }

    // ---- Failed ----
    if (job.status === "failed") {
      console.error(`[pipeline/stitch-poll] Shotstack render failed: ${job.error}`);
      return await fallbackToFirstCut(videoId, userId, meta, `Stitch render failed: ${job.error || "unknown error"}`);
    }

    // ---- Still rendering ----
    await prisma.video.update({
      where: { id: videoId },
      data: { sourceReview: stringifyMeta(meta) },
    });

    return {
      status: "polling",
      nextStep: "poll_stitch",
      data: { stitchStatus: job.status, retryAfter: 5 },
    };
  } catch (err: any) {
    console.error("[pipeline/stitch-poll] Error checking stitch status:", err);
    return await fallbackToFirstCut(videoId, userId, meta, err?.message || "Failed to check stitch status");
  }
}

/**
 * When stitch fails or errors out, fall back to the first completed cut
 * as the final video. If no cuts are available, return a hard failure.
 */
async function fallbackToFirstCut(
  videoId: string,
  userId: string,
  meta: ReturnType<typeof parseMeta>,
  errorReason: string
): Promise<StepResult> {
  const firstCutJob = Object.values(meta.cutJobs).find((j) => j.videoUrl);
  if (firstCutJob?.videoUrl) {
    const fallback = await ensurePermanentUrl(
      firstCutJob.videoUrl,
      videoKey(userId, videoId, "mp4"),
      "video/mp4"
    );
    await prisma.video.update({
      where: { id: videoId },
      data: {
        videoUrl: fallback,
        thumbnailUrl: meta.cutThumbnailUrl,
        status: "review",
        sourceReview: stringifyMeta(meta),
      },
    });
    return {
      status: "done",
      data: { videoUrl: fallback, warning: `${errorReason}, using first cut` },
    };
  }

  // No cuts available at all
  meta.error = errorReason;
  await prisma.video.update({
    where: { id: videoId },
    data: { status: "failed", sourceReview: stringifyMeta(meta) },
  });
  return { status: "failed", error: errorReason };
}

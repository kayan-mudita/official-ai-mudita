/**
 * Pipeline Step: STITCH (submit)
 *
 * Collects all completed cuts and stitches them into one final video.
 *
 * - Single cut: uses it directly as the final video (no Shotstack needed).
 * - Multiple cuts: submits a stitch job to Shotstack with optional TTS audio.
 * - Shotstack not configured: falls back to the first cut.
 *
 * Persistent URL handling: if a cut's video URL is still a temporary
 * FAL URL, it gets re-uploaded to Supabase Storage before finalizing.
 */

import prisma from "@/lib/prisma";
import {
  submitStitch,
  isShotstackConfigured,
} from "@/lib/video-stitcher";
import type { StitchCut, PerCutAudioEntry } from "@/lib/video-stitcher";
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
 * Returns the permanent URL (or the original if storage is not configured).
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
    console.error(`[pipeline/stitch-submit] Failed to persist ${storageKeyPath}:`, err);
    return url;
  }
}

export async function handleStitchSubmit(
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
  const cutJobs = meta.cutJobs;

  // Build StitchCut array from completed cut jobs.
  // Each cut's `trimTo` is the target duration from the format (e.g. 2s for a
  // hook), NOT the generateDuration (e.g. 5s).  The fallback uses the matching
  // cut's `duration` from the composition plan, ensuring we never accidentally
  // use the full untrimmed generation length.
  const completedCuts: StitchCut[] = Object.entries(cutJobs)
    .filter(([, j]) => j.videoUrl)
    .map(([idx, j]) => {
      const cutMeta = meta.cuts[Number(idx)];
      const trimTo = j.trimTo ?? cutMeta?.duration ?? 3;
      const startFrom = j.trimStart ?? 0; // Skip warm-up artifact (improvement #18)
      return { videoUrl: j.videoUrl!, trimTo, startFrom };
    });

  if (completedCuts.length === 0) {
    const failMsg = "No completed cuts to stitch. All video cuts may have failed.";
    meta.error = failMsg;
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "failed", sourceReview: stringifyMeta(meta) },
    });
    return { status: "failed", error: failMsg };
  }

  // Get first cut's thumbnail for the final video record
  const firstCutJob = Object.values(cutJobs).find((j) => j.videoUrl);
  const cutThumbnailUrl = firstCutJob?.thumbnailUrl || null;

  // ---- Single cut: use it directly ----
  if (completedCuts.length === 1) {
    const finalUrl = await ensurePermanentUrl(
      completedCuts[0].videoUrl,
      videoKey(userId, videoId, "mp4"),
      "video/mp4"
    );
    let finalThumb = cutThumbnailUrl;
    if (finalThumb) {
      finalThumb = await ensurePermanentUrl(
        finalThumb,
        thumbnailKey(userId, videoId, "jpg"),
        "image/jpeg"
      );
    }
    await prisma.video.update({
      where: { id: videoId },
      data: { videoUrl: finalUrl, thumbnailUrl: finalThumb, status: "review" },
    });
    return { status: "done", data: { videoUrl: finalUrl } };
  }

  // ---- Shotstack not configured: fall back to first cut ----
  if (!isShotstackConfigured()) {
    console.warn("[pipeline/stitch-submit] Shotstack not configured, using first cut as final video");
    const fallback = await ensurePermanentUrl(
      completedCuts[0].videoUrl,
      videoKey(userId, videoId, "mp4"),
      "video/mp4"
    );
    await prisma.video.update({
      where: { id: videoId },
      data: { videoUrl: fallback, thumbnailUrl: cutThumbnailUrl, status: "review" },
    });
    return {
      status: "done",
      data: { videoUrl: fallback, warning: "Shotstack not configured" },
    };
  }

  // ---- Multiple cuts: submit stitch job ----
  meta.pipelineStep = "stitch";
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  try {
    // Build per-cut audio entries for the Shotstack timeline.
    // Each cut gets its own audio track aligned to its position,
    // instead of one long audio blob overlaid on the whole video.
    // Falls back to the legacy single audioUrl if no per-cut audio exists.
    const hasPerCutAudio = meta.cutAudio && meta.cutAudio.length > 0 &&
      meta.cutAudio.some((a) => a.url);

    let perCutAudio: PerCutAudioEntry[] | undefined;
    if (hasPerCutAudio) {
      perCutAudio = meta.cutAudio.map((entry) => ({
        url: entry.url || "",
        durationMs: entry.durationMs || 0,
      }));
      console.log(
        `[pipeline/stitch-submit] Using per-cut audio: ${perCutAudio.filter((a) => a.url).length} segments`
      );
    } else {
      console.log(
        `[pipeline/stitch-submit] No per-cut audio, falling back to single audio track`
      );
    }

    const job = await submitStitch({
      cuts: completedCuts,
      perCutAudio: hasPerCutAudio ? perCutAudio : undefined,
      audioUrl: hasPerCutAudio ? undefined : (meta.ttsAudioUrl || undefined),
      aspectRatio: "9:16",
    });

    meta.stitchJobId = job.id;
    meta.stitchStatus = job.status;
    meta.cutThumbnailUrl = cutThumbnailUrl;
    await prisma.video.update({
      where: { id: videoId },
      data: { sourceReview: stringifyMeta(meta) },
    });

    return {
      status: "stitch_submitted",
      nextStep: "poll_stitch",
      data: { jobId: job.id, retryAfter: 5 },
    };
  } catch (err: any) {
    console.error("[pipeline/stitch-submit] Shotstack submit failed:", err);
    // Fall back to first cut
    const fallback = await ensurePermanentUrl(
      completedCuts[0].videoUrl,
      videoKey(userId, videoId, "mp4"),
      "video/mp4"
    );
    await prisma.video.update({
      where: { id: videoId },
      data: { videoUrl: fallback, thumbnailUrl: cutThumbnailUrl, status: "review" },
    });
    return {
      status: "done",
      data: { videoUrl: fallback, warning: "Stitch submit failed, using first cut" },
    };
  }
}

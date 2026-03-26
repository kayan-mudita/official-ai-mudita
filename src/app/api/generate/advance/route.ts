import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVideo } from "@/lib/generate";
import { submitStitch, getStitchStatus, isShotstackConfigured, StitchCut } from "@/lib/video-stitcher";
import { downloadAndStore, videoKey, thumbnailKey, isStorageConfigured } from "@/lib/storage";

/**
 * POST /api/generate/advance -- Server-Side Pipeline Advancement
 *
 * This endpoint examines the current state of a video's pipeline and
 * executes the next step if it is ready. It is called by:
 *
 *   1. The webhook handler (primary driver) -- after FAL completes a job
 *   2. The client-side poller (fallback) -- if the webhook hasn't fired
 *
 * The endpoint is idempotent: calling it multiple times for the same
 * state is safe. It checks what has been completed and only acts on
 * what is pending.
 *
 * Pipeline states handled:
 *   - All cuts complete, no stitch started -> submit stitch
 *   - Stitch in progress -> poll stitch status
 *   - Stitch complete -> finalize video
 *   - Any cut failed -> mark video as failed
 *
 * No authentication: This is called by the webhook (which is unauthenticated)
 * and by internal server calls. The endpoint only advances the pipeline --
 * it cannot read private data or modify anything beyond pipeline state.
 */

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { videoId } = body as { videoId: string };

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, userId: true, status: true, model: true, sourceReview: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.status !== "generating") {
    return NextResponse.json({
      status: "no_action",
      reason: `Video is ${video.status}, not generating`,
    });
  }

  // Parse pipeline metadata
  let meta: any;
  try {
    meta = video.sourceReview ? JSON.parse(video.sourceReview) : {};
  } catch {
    meta = {};
  }

  const cuts = meta.cuts || [];
  const cutJobs = meta.cutJobs || {};
  const totalCuts = cuts.length;

  // ---- Determine pipeline state ----

  // Check if all cuts are complete
  let completedCuts = 0;
  let failedCuts = 0;
  let pendingCuts = 0;

  for (let i = 0; i < totalCuts; i++) {
    const job = cutJobs[i];
    if (job?.status === "completed" && job.videoUrl) {
      completedCuts++;
    } else if (job?.status === "failed") {
      failedCuts++;
    } else {
      pendingCuts++;
    }
  }

  console.log(
    `[advance] Video ${videoId}: ${completedCuts}/${totalCuts} cuts complete, ` +
    `${failedCuts} failed, ${pendingCuts} pending. ` +
    `Stitch: ${meta.stitchJobId ? meta.stitchStatus : "not started"}`
  );

  // ---- Handle: stitch already submitted, poll it ----

  if (meta.stitchJobId && meta.stitchStatus !== "completed" && meta.stitchStatus !== "failed") {
    try {
      const job = await getStitchStatus(meta.stitchJobId);
      meta.stitchStatus = job.status;

      if (job.status === "completed" && job.url) {
        return await finalizeVideo(videoId, video.userId, job.url, meta);
      }

      if (job.status === "failed") {
        console.error(`[advance] Stitch failed for ${videoId}: ${job.error}`);
        return await fallbackToFirstCut(videoId, video.userId, meta);
      }

      // Still rendering -- save status
      await prisma.video.update({
        where: { id: videoId },
        data: { sourceReview: JSON.stringify(meta) },
      });

      return NextResponse.json({
        status: "stitch_in_progress",
        stitchStatus: job.status,
      });
    } catch (err: any) {
      console.error(`[advance] Stitch poll error for ${videoId}:`, err);
      return await fallbackToFirstCut(videoId, video.userId, meta);
    }
  }

  // ---- Handle: all cuts complete, start stitch ----

  if (completedCuts === totalCuts && totalCuts > 0 && !meta.stitchJobId) {
    const stitchCuts: StitchCut[] = [];

    for (let i = 0; i < totalCuts; i++) {
      const job = cutJobs[i];
      if (job?.videoUrl) {
        stitchCuts.push({
          videoUrl: job.videoUrl,
          trimTo: job.trimTo || cuts[i]?.duration || 5,
        });
      }
    }

    // Single cut -- use directly
    if (stitchCuts.length === 1) {
      return await finalizeVideo(videoId, video.userId, stitchCuts[0].videoUrl, meta);
    }

    // Multiple cuts -- stitch them
    if (!isShotstackConfigured()) {
      console.warn("[advance] Shotstack not configured, using first cut");
      return await fallbackToFirstCut(videoId, video.userId, meta);
    }

    try {
      meta.pipelineStep = "stitch";
      const job = await submitStitch({
        cuts: stitchCuts,
        audioUrl: meta.ttsAudioUrl || undefined,
        aspectRatio: "9:16",
      });

      meta.stitchJobId = job.id;
      meta.stitchStatus = job.status;

      await prisma.video.update({
        where: { id: videoId },
        data: { sourceReview: JSON.stringify(meta) },
      });

      console.log(`[advance] Stitch submitted for ${videoId}: ${job.id}`);

      return NextResponse.json({
        status: "stitch_submitted",
        stitchJobId: job.id,
      });
    } catch (err: any) {
      console.error(`[advance] Stitch submit failed for ${videoId}:`, err);
      return await fallbackToFirstCut(videoId, video.userId, meta);
    }
  }

  // ---- Handle: some cuts failed ----

  if (failedCuts > 0 && pendingCuts === 0) {
    // Some cuts failed but no more pending -- if we have enough, stitch what we have
    if (completedCuts > 0) {
      console.warn(
        `[advance] ${failedCuts} cuts failed for ${videoId}, but ${completedCuts} succeeded. Using completed cuts.`
      );
      // Mark the stitch as ready by advancing to the stitch step
      // (The next advance call will pick it up)
      meta.pipelineStep = "stitch";
      await prisma.video.update({
        where: { id: videoId },
        data: { sourceReview: JSON.stringify(meta) },
      });

      // Recursive call to handle the stitch
      return await handleStitchReady(videoId, video.userId, meta, cuts, cutJobs);
    }

    // All cuts failed
    meta.error = "All video cuts failed to generate";
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "failed", sourceReview: JSON.stringify(meta) },
    });

    return NextResponse.json({ status: "failed", error: "All cuts failed" });
  }

  // ---- Handle: still waiting on cuts ----

  return NextResponse.json({
    status: "waiting",
    completedCuts,
    pendingCuts,
    failedCuts,
    totalCuts,
  });
}

// ---- Helpers ----

async function finalizeVideo(
  videoId: string,
  userId: string,
  videoUrl: string,
  meta: any
): Promise<NextResponse> {
  let finalUrl = videoUrl;
  let finalThumb = meta.cutThumbnailUrl || null;

  if (isStorageConfigured()) {
    // Persist to permanent storage
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseHost && !videoUrl.startsWith(supabaseHost)) {
      try {
        finalUrl = await downloadAndStore(
          videoUrl,
          videoKey(userId, videoId, "mp4"),
          "video/mp4"
        );
      } catch (err) {
        console.error(`[advance] Failed to persist final video for ${videoId}:`, err);
      }
    }

    if (finalThumb && supabaseHost && !finalThumb.startsWith(supabaseHost)) {
      try {
        finalThumb = await downloadAndStore(
          finalThumb,
          thumbnailKey(userId, videoId, "jpg"),
          "image/jpeg"
        );
      } catch (err) {
        console.error(`[advance] Failed to persist thumbnail for ${videoId}:`, err);
      }
    }
  }

  await prisma.video.update({
    where: { id: videoId },
    data: {
      videoUrl: finalUrl,
      thumbnailUrl: finalThumb,
      status: "review",
      sourceReview: JSON.stringify(meta),
    },
  });

  console.log(`[advance] Video ${videoId} finalized successfully`);

  return NextResponse.json({
    status: "done",
    videoUrl: finalUrl,
  });
}

async function fallbackToFirstCut(
  videoId: string,
  userId: string,
  meta: any
): Promise<NextResponse> {
  const cutJobs = meta.cutJobs || {};
  const firstCutJob: any = Object.values(cutJobs).find((j: any) => j.videoUrl);

  if (firstCutJob?.videoUrl) {
    return await finalizeVideo(videoId, userId, firstCutJob.videoUrl, meta);
  }

  meta.error = "No completed cuts available";
  await prisma.video.update({
    where: { id: videoId },
    data: { status: "failed", sourceReview: JSON.stringify(meta) },
  });

  return NextResponse.json({ status: "failed", error: "No completed cuts" });
}

async function handleStitchReady(
  videoId: string,
  userId: string,
  meta: any,
  cuts: any[],
  cutJobs: Record<string, any>
): Promise<NextResponse> {
  const stitchCuts: StitchCut[] = [];

  for (let i = 0; i < cuts.length; i++) {
    const job = cutJobs[i];
    if (job?.videoUrl && job.status === "completed") {
      stitchCuts.push({
        videoUrl: job.videoUrl,
        trimTo: job.trimTo || cuts[i]?.duration || 5,
      });
    }
  }

  if (stitchCuts.length === 0) {
    return await fallbackToFirstCut(videoId, userId, meta);
  }

  if (stitchCuts.length === 1) {
    return await finalizeVideo(videoId, userId, stitchCuts[0].videoUrl, meta);
  }

  if (!isShotstackConfigured()) {
    return await fallbackToFirstCut(videoId, userId, meta);
  }

  try {
    const job = await submitStitch({
      cuts: stitchCuts,
      audioUrl: meta.ttsAudioUrl || undefined,
      aspectRatio: "9:16",
    });

    meta.stitchJobId = job.id;
    meta.stitchStatus = job.status;

    await prisma.video.update({
      where: { id: videoId },
      data: { sourceReview: JSON.stringify(meta) },
    });

    return NextResponse.json({
      status: "stitch_submitted",
      stitchJobId: job.id,
    });
  } catch (err: any) {
    console.error(`[advance] Stitch failed for ${videoId}:`, err);
    return await fallbackToFirstCut(videoId, userId, meta);
  }
}

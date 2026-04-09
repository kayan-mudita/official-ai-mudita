import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { downloadAndStore, videoKey, thumbnailKey, isStorageConfigured } from "@/lib/storage";

/**
 * POST /api/generate/webhook -- FAL Webhook Endpoint
 *
 * Problem: The pipeline currently depends on client-side polling. If the user
 * closes the tab, the video stops progressing.
 *
 * Solution: When we submit a job to FAL, we include a webhook_url parameter.
 * FAL POSTs the completed job result directly to this endpoint. We then:
 *   1. Process the result (download video, store in Supabase)
 *   2. Update the cut job metadata in the DB
 *   3. Trigger the next pipeline step via /api/generate/advance
 *
 * The client-side polling becomes a FALLBACK. If the webhook fires first,
 * the next poll sees the cut is already done and skips ahead.
 *
 * Query params:
 *   - videoId: The video being generated
 *   - cutIndex: Which cut this webhook is for
 *   - secret: Webhook secret for verification
 *
 * Security: Validated via FAL_WEBHOOK_SECRET query param. If the env var
 * is set, the request must include a matching secret.
 */

export async function POST(req: NextRequest) {
  // Verify webhook secret if configured
  const webhookSecret = process.env.FAL_WEBHOOK_SECRET;
  if (webhookSecret) {
    const reqSecret = req.nextUrl.searchParams.get("secret");
    if (reqSecret !== webhookSecret) {
      console.error("[webhook] Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const videoId = req.nextUrl.searchParams.get("videoId");
  const cutIndexStr = req.nextUrl.searchParams.get("cutIndex");
  const cutIndex = cutIndexStr ? parseInt(cutIndexStr, 10) : undefined;

  console.log(`[webhook] Received FAL webhook for videoId=${videoId}, cutIndex=${cutIndex}`);

  if (!videoId) {
    console.error("[webhook] Missing videoId query parameter");
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

  // Parse the FAL webhook payload
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    console.error("[webhook] Invalid JSON payload");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate video exists and is in a generating state
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, userId: true, status: true, sourceReview: true },
  });

  if (!video) {
    console.error(`[webhook] Video ${videoId} not found`);
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.status !== "generating") {
    console.log(`[webhook] Video ${videoId} is not generating (status: ${video.status}), ignoring webhook`);
    return NextResponse.json({ status: "ignored", reason: "not_generating" });
  }

  // Extract video URL from FAL's webhook payload
  // FAL sends the full result in the same format as the poll response
  const videoUrl = payload?.video?.url || payload?.output?.url || payload?.data?.video_url;
  const thumbnailUrl = payload?.images?.[0]?.url || payload?.thumbnail?.url || null;
  const falStatus = payload?.status || (videoUrl ? "COMPLETED" : "FAILED");
  const falError = payload?.error || null;

  console.log(`[webhook] FAL status: ${falStatus}, hasVideo: ${!!videoUrl}, hasThumbnail: ${!!thumbnailUrl}`);

  // Parse pipeline metadata
  let meta: any;
  try {
    meta = video.sourceReview ? JSON.parse(video.sourceReview) : {};
  } catch {
    meta = {};
  }

  if (cutIndex !== undefined) {
    // Update the specific cut job
    if (!meta.cutJobs) meta.cutJobs = {};
    const cutJob = meta.cutJobs[cutIndex] || {};

    if (falStatus === "COMPLETED" && videoUrl) {
      // Persist to Supabase Storage if configured
      let storedVideoUrl = videoUrl;
      let storedThumbnailUrl = thumbnailUrl;

      if (isStorageConfigured()) {
        try {
          storedVideoUrl = await downloadAndStore(
            videoUrl,
            videoKey(video.userId, `${videoId}-cut-${cutIndex}`, "mp4"),
            "video/mp4"
          );
        } catch (err) {
          console.error(`[webhook] Failed to persist cut ${cutIndex} video:`, err);
        }

        if (thumbnailUrl) {
          try {
            storedThumbnailUrl = await downloadAndStore(
              thumbnailUrl,
              thumbnailKey(video.userId, `${videoId}-cut-${cutIndex}`, "jpg"),
              "image/jpeg"
            );
          } catch (err) {
            console.error(`[webhook] Failed to persist cut ${cutIndex} thumbnail:`, err);
          }
        }
      }

      cutJob.status = "completed";
      cutJob.videoUrl = storedVideoUrl;
      cutJob.thumbnailUrl = storedThumbnailUrl;
      meta.cutJobs[cutIndex] = cutJob;

      console.log(`[webhook] Cut ${cutIndex} completed and stored for video ${videoId}`);
    } else if (falStatus === "FAILED") {
      cutJob.status = "failed";
      meta.cutJobs[cutIndex] = cutJob;
      console.error(`[webhook] Cut ${cutIndex} failed for video ${videoId}: ${falError}`);
    }

    // Save updated metadata
    await prisma.video.update({
      where: { id: videoId },
      data: { sourceReview: JSON.stringify(meta) },
    });

    // Trigger the advance endpoint to progress the pipeline.
    // Fire-and-forget -- don't block the webhook response.
    triggerAdvance(videoId).catch((err) => {
      console.error(`[webhook] Failed to trigger advance for ${videoId}:`, err);
    });
  }

  return NextResponse.json({ status: "ok", processed: true });
}

/**
 * Trigger the /api/generate/advance endpoint to progress the pipeline.
 * This is fire-and-forget -- the webhook returns immediately.
 */
async function triggerAdvance(videoId: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (!appUrl) {
    console.warn("[webhook] No APP_URL configured, cannot trigger advance");
    return;
  }

  const base = appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
  const advanceUrl = `${base}/api/generate/advance`;

  try {
    const res = await fetch(advanceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[webhook] Advance endpoint returned ${res.status}: ${text}`);
    } else {
      console.log(`[webhook] Successfully triggered advance for ${videoId}`);
    }
  } catch (err) {
    console.error(`[webhook] Failed to call advance endpoint:`, err);
  }
}

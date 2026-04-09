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
import { getCharacterAssetForCut, get360ReferenceImages } from "./character-assets";
import { getVideoDurationFromAudio } from "./audio-planner";
import {
  downloadAndStore,
  videoKey,
  thumbnailKey,
  isStorageConfigured,
} from "@/lib/storage";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

// ─── Per-Cut Model Routing ────────────────────────────────────────
// Different cut types benefit from different models.
// Hook/CTA need face quality. B-roll needs cinematic quality.
// Transitions are cheap — use the fastest model.

const CUT_TYPE_MODEL_OVERRIDE: Record<string, string> = {
  broll: "veo_3.1",           // Best cinematic, no face needed, cheapest
  product_shot: "veo_3.1",    // Best detail rendering
  transition: "ltx_fast",     // Cheapest, fastest, no face needed
};

function resolveModelForCut(
  cutType: string,
  selectedModel: string,
  enablePerCutRouting: boolean
): string {
  if (!enablePerCutRouting) return selectedModel;
  return CUT_TYPE_MODEL_OVERRIDE[cutType] || selectedModel;
}

// ─── Concurrency Control ──────────────────────────────────────────
// Process cuts in batches. 4 concurrent for ≤ 5 cuts, 2 for > 5.
const MAX_CONCURRENCY_SMALL = 4;
const MAX_CONCURRENCY_LARGE = 2;

async function processInBatches<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<any>
): Promise<PromiseSettledResult<any>[]> {
  const results: PromiseSettledResult<any>[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

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

  // ---- Fetch user info once ----
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  // ---- Resolve 360 reference images for Kling 3.0 elements ----
  // These give the video model 6 distinct angles of the person's face
  const isKling3 = selectedModel.startsWith("kling_v3");
  const referenceImageUrls = isKling3
    ? await get360ReferenceImages(userId)
    : null;

  if (referenceImageUrls) {
    console.log(
      `[pipeline/cut-submit-all] Resolved ${referenceImageUrls.length} 360 reference images for Kling 3 elements`
    );
  }

  // ---- Fallback photo if character assets fail ----
  let fallbackPhotoUrl = "";
  if (video.photoId) {
    const linkedPhoto = await prisma.photo.findFirst({ where: { id: video.photoId } });
    if (linkedPhoto?.url) fallbackPhotoUrl = linkedPhoto.url;
  }
  if (!fallbackPhotoUrl) {
    const anyPhoto = await prisma.photo.findFirst({
      where: { userId, isPrimary: true },
      select: { url: true },
    });
    fallbackPhotoUrl = anyPhoto?.url || "";
  }

  // ---- Submit cuts with per-cut model routing + increased concurrency ----
  // Each cut gets: its OWN cropped pose, its OWN optimal model, and
  // we process 4 concurrent (≤5 cuts) or 2 concurrent (>5 cuts).

  const enablePerCutRouting = !selectedModel.startsWith("heygen"); // Don't override HeyGen
  const concurrency = meta.cuts.length <= 5 ? MAX_CONCURRENCY_SMALL : MAX_CONCURRENCY_LARGE;

  console.log(
    `[pipeline/cut-submit-all] Submitting ${meta.cuts.length} cuts, concurrency=${concurrency}, ` +
    `perCutRouting=${enablePerCutRouting}`
  );

  const indexedCuts = meta.cuts.map((cut, cutIndex) => ({ cut, cutIndex }));

  const submissions = await processInBatches(indexedCuts, concurrency, async ({ cut, cutIndex }) => {
    // Check for user-provided video URL (e.g. product B-roll for discovery format)
    const userUrl = meta.userProvidedCuts?.[cutIndex];
    if (userUrl) {
      console.log(`[pipeline/cut-submit-all] Cut ${cutIndex} (${cut.type}): using USER-PROVIDED video URL`);
      return {
        cutIndex,
        result: { jobId: `user-provided-${cutIndex}`, status: "completed" as const, videoUrl: userUrl },
        cut,
        modelUsed: "user_provided",
      };
    }

    // Per-cut model routing: B-roll → Veo 3.1, transitions → LTX Fast, etc.
    const cutModel = resolveModelForCut(cut.type || "talking_head", selectedModel, enablePerCutRouting);

    if (cutModel !== selectedModel) {
      console.log(
        `[pipeline/cut-submit-all] Cut ${cutIndex} (${cut.type}): routed to ${cutModel} (override from ${selectedModel})`
      );
    }

    // Resolve the BEST reference image for THIS SPECIFIC CUT TYPE
    const asset = await getCharacterAssetForCut(userId, cut.type || "talking_head");
    const photoUrl = asset.url || fallbackPhotoUrl;

    if (asset.source.includes("cropped")) {
      console.log(
        `[pipeline/cut-submit-all] Cut ${cutIndex} (${cut.type}): using cropped ${asset.source} ` +
        `[${asset.gridPosition?.row},${asset.gridPosition?.col}] = ${asset.gridPosition?.label}`
      );
    } else {
      console.log(
        `[pipeline/cut-submit-all] Cut ${cutIndex} (${cut.type}): using ${asset.source} (not cropped)`
      );
    }

    // Determine video duration from per-cut audio (audio-driven planning)
    const cutAudioEntry = meta.cutAudio?.[cutIndex];
    let videoDuration = cut.generateDuration;

    if (cutAudioEntry && cutAudioEntry.durationMs > 0) {
      videoDuration = getVideoDurationFromAudio(cutAudioEntry.durationMs);
    }

    // Resolve 360 refs only for Kling 3 models (per-cut model may differ)
    const cutIsKling3 = cutModel.startsWith("kling_v3");
    const cutRefs = cutIsKling3 ? referenceImageUrls : null;

    const result = await generateVideo({
      model: cutModel,
      photoUrl,
      voiceUrl: "",
      script: cut.prompt,
      userId,
      industry: user?.industry,
      usePromptEngine: false,
      duration: videoDuration,
      referenceImageUrls: cutRefs || undefined,
    });

    return { cutIndex, result, cut, modelUsed: cutModel };
  });

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

    // Trim from 0.5s into the clip (skip warm-up artifact) instead of from 0s.
    // AI video models often have a static/glitchy first ~0.5s as they "warm up."
    // Skipping this produces much cleaner cuts.
    const trimStart = cut.generateDuration > cut.duration + 1 ? 0.5 : 0;

    const usedModel = (settlement as any).value?.modelUsed || selectedModel;
    freshMeta.cutJobs[cutIndex] = {
      jobId: result.jobId,
      status: result.status,
      videoUrl: persistedVideoUrl,
      thumbnailUrl: persistedThumbnailUrl,
      trimTo: cut.duration,
      trimStart,
      modelUsed: usedModel,
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

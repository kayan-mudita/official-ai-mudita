/**
 * Pipeline Step: HOOK_GENERATE
 *
 * Simplified pipeline path for hook-only mode (15s single-shot video).
 * Combines TTS + video generation into one step — no multi-cut,
 * no stitch. Produces a single continuous 15-second clip.
 *
 * Flow: expand → hook_generate → post_process (optional) → done
 *
 * This is the "fast path" that skips:
 * - Multi-cut decomposition
 * - Per-cut submission/polling
 * - Shotstack stitching
 */

import prisma from "@/lib/prisma";
import { generateVideo, modelSupportsNativeAudio } from "@/lib/generate";
import { generateVoiceover } from "@/lib/voice-engine";
import { getBestReferenceImage, get360ReferenceImages } from "./character-assets";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";
import {
  isStorageConfigured,
  downloadAndStore,
  videoKey,
} from "@/lib/storage";

export async function handleHookGenerate(
  videoId: string,
  userId: string
): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      model: true,
      script: true,
      sourceReview: true,
      photoId: true,
      voiceId: true,
    },
  });

  if (!video) return { status: "error", error: "Video not found" };

  const meta = parseMeta(video.sourceReview);
  meta.pipelineStep = "hook_generate";
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  const selectedModel = video.model || "kling_v3_audio";
  const script = meta.originalScript || video.script || "";

  // ── Step 1: TTS (skip if model has native audio) ────────────
  let audioUrl: string | undefined;
  if (!modelSupportsNativeAudio(selectedModel)) {
    const voice = video.voiceId
      ? await prisma.voiceSample.findFirst({ where: { id: video.voiceId } })
      : await prisma.voiceSample.findFirst({ where: { userId, isDefault: true } });

    const ttsResult = await generateVoiceover(script, voice?.providerVoiceId || undefined);
    if (ttsResult.audioUrl) {
      audioUrl = ttsResult.audioUrl;
      meta.ttsAudioUrl = ttsResult.audioUrl;
    }
  }

  // ── Step 2: Resolve reference image ──────────────────────────
  const referenceImage = await getBestReferenceImage(userId, "hook");
  let photoUrl = referenceImage || "";

  if (!photoUrl && video.photoId) {
    const photo = await prisma.photo.findFirst({ where: { id: video.photoId } });
    if (photo?.url) photoUrl = photo.url;
  }

  // Get 360 references for Kling 3 elements
  const isKling3 = selectedModel.startsWith("kling_v3");
  const referenceImageUrls = isKling3 ? await get360ReferenceImages(userId) : null;

  // Get user industry
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  // ── Step 3: Generate single 15s video ────────────────────────
  const hookPrompt = meta.cuts?.[0]?.prompt || script;

  const result = await generateVideo({
    model: selectedModel,
    photoUrl,
    voiceUrl: "",
    script: hookPrompt,
    userId,
    industry: user?.industry,
    usePromptEngine: false, // Already expanded
    duration: 15,
    videoId,
    cutIndex: 0,
    referenceImageUrls: referenceImageUrls || undefined,
    referenceVideoUrl: meta.referenceVideoUrl || undefined,
    audioUrl,
  });

  // ── Step 4: Handle result ────────────────────────────────────
  if (result.status === "completed" && result.videoUrl) {
    // Sync completion — persist and finish
    let finalUrl = result.videoUrl;

    if (isStorageConfigured()) {
      try {
        finalUrl = await downloadAndStore(
          result.videoUrl,
          videoKey(userId, videoId, "mp4"),
          "video/mp4"
        );
      } catch (e) {
        console.error("[hook-generate] Failed to persist video:", e);
      }
    }

    await prisma.video.update({
      where: { id: videoId },
      data: {
        videoUrl: finalUrl,
        thumbnailUrl: result.thumbnailUrl || null,
        status: meta.postProcess ? "generating" : "review",
        sourceReview: stringifyMeta({
          ...meta,
          pipelineStep: meta.postProcess ? "post_process" : "done",
        }),
      },
    });

    return {
      status: "hook_done",
      nextStep: meta.postProcess ? "post_process" : "done",
    };
  }

  if (result.status === "processing" && result.jobId) {
    // Async — store job ID for polling
    meta.cutJobs[0] = {
      jobId: result.jobId,
      status: "submitted",
      videoUrl: null,
      thumbnailUrl: null,
      trimTo: 15,
    };
    meta.pipelineStep = "poll_all_cuts"; // Reuse existing polling
    meta.totalCuts = 1;

    await prisma.video.update({
      where: { id: videoId },
      data: { sourceReview: stringifyMeta(meta) },
    });

    return {
      status: "hook_submitted",
      nextStep: "poll_all_cuts",
    };
  }

  // Failed
  return {
    status: "error",
    error: result.error || "Hook generation failed",
  };
}

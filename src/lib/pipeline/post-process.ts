/**
 * Pipeline Step: POST-PROCESS
 *
 * Runs after video generation to enhance the output.
 * ALL processing goes through FAL — one API key, one billing.
 *
 * Steps (all optional, configured via PipelineMeta.postProcess):
 * 1. Speed correction — FAL video speed adjustment (Kling outputs are slow)
 * 2. Upscale — FAL Real-ESRGAN for 2x resolution
 * 3. Caption generation — FAL Whisper for transcription
 */

import prisma from "@/lib/prisma";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";
import { withFalRetry } from "./retry";

export interface PostProcessOptions {
  upscale: boolean;
  captions: boolean;
  speedCorrect: boolean;
  speedMultiplier?: number; // default 1.25
}

// ─── Shared FAL Helper ────────────────────────────────────────────

function getFalKey(): string | null {
  return process.env.FAL_API_KEY || null;
}

async function falPost(endpoint: string, body: Record<string, unknown>): Promise<any> {
  const apiKey = getFalKey();
  if (!apiKey) throw new Error("FAL_API_KEY not set");

  const { result } = await withFalRetry(async () => {
    const res = await fetch(`https://fal.run/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`FAL ${endpoint} ${res.status}: ${err.substring(0, 200)}`);
    }

    return res.json();
  }, `post-process:${endpoint}`);

  return result;
}

// ─── Speed Correction via FAL ─────────────────────────────────────

async function applySpeedCorrection(
  videoUrl: string,
  multiplier: number
): Promise<string | null> {
  try {
    const data = await falPost("fal-ai/video-utils/speed", {
      video_url: videoUrl,
      speed: multiplier,
    });
    return data?.video?.url || null;
  } catch (e: any) {
    console.error("[post-process] Speed correction failed:", e.message);
    return null;
  }
}

// ─── Upscale via FAL Real-ESRGAN ──────────────────────────────────

async function applyUpscale(videoUrl: string): Promise<string | null> {
  try {
    const data = await falPost("fal-ai/real-esrgan/video", {
      video_url: videoUrl,
      scale: 2,
    });
    return data?.video?.url || null;
  } catch (e: any) {
    console.error("[post-process] Upscale failed:", e.message);
    return null;
  }
}

// ─── Caption Generation via FAL Whisper ───────────────────────────

interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

async function generateCaptions(videoUrl: string): Promise<CaptionSegment[] | null> {
  try {
    const data = await falPost("fal-ai/whisper", {
      audio_url: videoUrl,
      task: "transcribe",
      language: "en",
      chunk_level: "segment",
    });

    const chunks = data?.chunks || data?.segments || [];
    if (!chunks.length) return null;

    return chunks.map((c: any) => ({
      start: c.timestamp?.[0] ?? c.start ?? 0,
      end: c.timestamp?.[1] ?? c.end ?? 0,
      text: (c.text || "").trim(),
    }));
  } catch (e: any) {
    console.error("[post-process] Caption generation failed:", e.message);
    return null;
  }
}

// ─── Main Post-Process Handler ────────────────────────────────────

export async function handlePostProcess(
  videoId: string,
  _userId: string
): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { videoUrl: true, sourceReview: true, model: true },
  });

  if (!video?.videoUrl) {
    return { status: "error", error: "No video URL to post-process" };
  }

  if (!getFalKey()) {
    console.warn("[post-process] FAL_API_KEY not set, skipping post-processing");
    return { status: "done" };
  }

  const meta = parseMeta(video.sourceReview);
  const options: PostProcessOptions = meta.postProcess || {
    upscale: false,
    captions: false,
    speedCorrect: false,
  };

  let currentUrl = video.videoUrl;

  // Step 1: Speed correction (only for Kling models which generate slightly slow)
  if (options.speedCorrect) {
    const isKling = video.model?.includes("kling");
    const multiplier = options.speedMultiplier || (isKling ? 1.25 : 1.0);

    if (multiplier !== 1.0) {
      console.log(`[post-process] Speed correction: ${multiplier}x`);
      const sped = await applySpeedCorrection(currentUrl, multiplier);
      if (sped) currentUrl = sped;
    }
  }

  // Step 2: Upscale via Real-ESRGAN
  if (options.upscale) {
    console.log("[post-process] Upscaling 2x via FAL Real-ESRGAN");
    const upscaled = await applyUpscale(currentUrl);
    if (upscaled) currentUrl = upscaled;
  }

  // Step 3: Generate captions via FAL Whisper
  if (options.captions) {
    console.log("[post-process] Generating captions via FAL Whisper");
    const segments = await generateCaptions(currentUrl);
    if (segments && segments.length > 0) {
      meta.captions = segments;
      console.log(`[post-process] Generated ${segments.length} caption segments`);
    }
  }

  // Update video with post-processed URL
  if (currentUrl !== video.videoUrl) {
    await prisma.video.update({
      where: { id: videoId },
      data: { videoUrl: currentUrl },
    });
  }

  meta.pipelineStep = "done";
  meta.postProcessComplete = true;
  await prisma.video.update({
    where: { id: videoId },
    data: {
      status: "review",
      sourceReview: stringifyMeta(meta),
    },
  });

  return { status: "done" };
}

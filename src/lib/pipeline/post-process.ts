/**
 * Pipeline Step: POST-PROCESS
 *
 * Runs after video generation (stitch or single-cut) to enhance the output:
 * 1. Speed correction — Kling outputs are slightly slow (1.2-1.35x fix)
 * 2. Upscale — FAL Real-ESRGAN for 2x resolution
 * 3. Caption generation — Whisper transcription → burned-in subtitles
 *
 * Each step is optional and configured via PipelineMeta.postProcess.
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

// ─── Speed Correction via FAL ─────────────────────────────────────

async function applySpeedCorrection(
  videoUrl: string,
  multiplier: number
): Promise<string | null> {
  // Kling models generate slightly slow-mo. Speed up to natural pace.
  // Using FAL's video processing endpoint
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) return null;

  try {
    const { result } = await withFalRetry(async () => {
      const res = await fetch("https://fal.run/fal-ai/video-utils/speed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify({
          video_url: videoUrl,
          speed: multiplier,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`FAL speed ${res.status}: ${err.substring(0, 200)}`);
      }

      return res.json();
    }, "post-process:speed");

    return result?.video?.url || null;
  } catch (e: any) {
    console.error("[post-process] Speed correction failed:", e.message);
    return null;
  }
}

// ─── Upscale via FAL Real-ESRGAN ──────────────────────────────────

async function applyUpscale(videoUrl: string): Promise<string | null> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) return null;

  try {
    const { result } = await withFalRetry(async () => {
      const res = await fetch("https://fal.run/fal-ai/real-esrgan/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify({
          video_url: videoUrl,
          scale: 2,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`FAL upscale ${res.status}: ${err.substring(0, 200)}`);
      }

      return res.json();
    }, "post-process:upscale");

    return result?.video?.url || null;
  } catch (e: any) {
    console.error("[post-process] Upscale failed:", e.message);
    return null;
  }
}

// ─── Caption Generation via OpenAI Whisper ────────────────────────

interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

async function generateCaptions(videoUrl: string): Promise<CaptionSegment[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[post-process] OPENAI_API_KEY not set, skipping captions");
    return null;
  }

  try {
    // Download the video audio
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) return null;
    const videoBuffer = await videoRes.arrayBuffer();

    // Send to Whisper
    const formData = new FormData();
    formData.append("file", new Blob([videoBuffer], { type: "video/mp4" }), "video.mp4");
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities[]", "segment");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[post-process] Whisper failed:", err.substring(0, 200));
        return null;
      }

      const data = await res.json();
      return (data.segments || []).map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      }));
    } finally {
      clearTimeout(timeoutId);
    }
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

  const meta = parseMeta(video.sourceReview);
  const options: PostProcessOptions = meta.postProcess || {
    upscale: false,
    captions: false,
    speedCorrect: false,
  };

  let currentUrl = video.videoUrl;

  // Step 1: Speed correction (only for Kling models)
  if (options.speedCorrect) {
    const isKling = video.model?.includes("kling");
    const multiplier = options.speedMultiplier || (isKling ? 1.25 : 1.0);

    if (multiplier !== 1.0) {
      console.log(`[post-process] Applying speed correction: ${multiplier}x`);
      const sped = await applySpeedCorrection(currentUrl, multiplier);
      if (sped) {
        currentUrl = sped;
        console.log("[post-process] Speed correction done");
      }
    }
  }

  // Step 2: Upscale
  if (options.upscale) {
    console.log("[post-process] Upscaling 2x via Real-ESRGAN");
    const upscaled = await applyUpscale(currentUrl);
    if (upscaled) {
      currentUrl = upscaled;
      console.log("[post-process] Upscale done");
    }
  }

  // Step 3: Generate captions (stored in meta, burned in via Shotstack later)
  if (options.captions) {
    console.log("[post-process] Generating captions via Whisper");
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

  // Save caption data to meta
  meta.pipelineStep = "done";
  meta.postProcessComplete = true;
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  return { status: "done" };
}

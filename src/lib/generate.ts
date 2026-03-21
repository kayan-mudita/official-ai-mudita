// AI Video Generation — Model-Agnostic Pipeline
//
// Supports: Kling 2.6, Seedance 2.0, Sora 2, LTX (via FAL/OpenRouter)
// New models can be added by:
//   1. Adding a provider function below
//   2. Adding it to MODEL_REGISTRY
//   3. Setting the API key in .env
//   4. Selecting it in the admin panel

import prisma from "@/lib/prisma";
import { getConfig } from "@/lib/system-config";
import { expandPrompt } from "@/lib/prompt-engine";
import { generateVoiceover } from "@/lib/voice-engine";
import {
  isStorageConfigured,
  downloadAndStore,
  videoKey,
} from "@/lib/storage";

// ─── Types ──────────────────────────────────────────────────────

export interface GenerateVideoParams {
  model: string;
  photoUrl: string;
  voiceUrl: string;
  script: string;
  userId: string;
  style?: string;
  duration?: number;
  usePromptEngine?: boolean;  // expand the script via Gemini first
  industry?: string;
}

export interface GenerateResult {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  expandedPrompt?: string;
  estimatedTime?: number;
  error?: string;
}

export interface PollResult {
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  { maxRetries = 3, initialDelayMs = 1000, maxDelayMs = 10000 } = {}
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        await sleep(Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await sleep(Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs));
      }
    }
  }
  throw lastError ?? new Error("fetchWithRetry: all attempts failed");
}

// ─── Provider: Kling 2.6 ────────────────────────────────────────

async function generateKling(params: GenerateVideoParams): Promise<GenerateResult> {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) return simulateGeneration("kling_2.6");

  const response = await fetchWithRetry("https://api.klingai.com/v1/videos/image2video", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model_name: "kling-v2.6",
      image: params.photoUrl,
      prompt: params.script,
      duration: params.duration || 8,
      mode: "professional",
      audio_url: params.voiceUrl,
    }),
  });

  if (!response.ok) {
    return { jobId: `kling-err-${Date.now()}`, status: "failed", error: `Kling ${response.status}: ${await response.text()}` };
  }
  const data = await response.json();
  const taskId = data.data?.task_id;
  if (!taskId) return { jobId: `kling-err-${Date.now()}`, status: "failed", error: "No task_id returned" };
  return { jobId: taskId, status: "processing", estimatedTime: 120 };
}

async function pollKling(jobId: string): Promise<PollResult> {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) return { status: "completed", videoUrl: `/api/demo-video?model=kling_2.6` };

  const response = await fetchWithRetry(`https://api.klingai.com/v1/videos/image2video/${jobId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return { status: "failed", error: `Poll failed: ${response.status}` };

  const data = await response.json();
  const s = data.data?.task_status;
  if (s === "succeed" || s === "completed") {
    const v = data.data?.task_result?.videos?.[0];
    return { status: "completed", videoUrl: v?.url, thumbnailUrl: v?.cover_url };
  }
  if (s === "failed") return { status: "failed", error: data.data?.task_status_msg || "Failed" };
  return { status: "processing" };
}

// ─── Provider: Seedance 2.0 ─────────────────────────────────────

async function generateSeedance(params: GenerateVideoParams): Promise<GenerateResult> {
  const apiKey = process.env.SEEDANCE_API_KEY;
  if (!apiKey) return simulateGeneration("seedance_2.0");

  const response = await fetchWithRetry("https://api.seedance.ai/v2/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "seedance-2.0",
      source_image: params.photoUrl,
      voice_audio: params.voiceUrl,
      script: params.script,
      style: params.style || "professional",
      duration: params.duration || 8,
    }),
  });

  if (!response.ok) {
    return { jobId: `seedance-err-${Date.now()}`, status: "failed", error: `Seedance ${response.status}: ${await response.text()}` };
  }
  const data = await response.json();
  if (!data.job_id) return { jobId: `seedance-err-${Date.now()}`, status: "failed", error: "No job_id returned" };
  return { jobId: data.job_id, status: "processing", estimatedTime: 90 };
}

async function pollSeedance(jobId: string): Promise<PollResult> {
  const apiKey = process.env.SEEDANCE_API_KEY;
  if (!apiKey) return { status: "completed", videoUrl: `/api/demo-video?model=seedance_2.0` };

  const response = await fetchWithRetry(`https://api.seedance.ai/v2/jobs/${jobId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return { status: "failed", error: `Poll failed: ${response.status}` };

  const data = await response.json();
  if (data.status === "completed" || data.status === "succeed") {
    return { status: "completed", videoUrl: data.result?.video_url, thumbnailUrl: data.result?.thumbnail_url };
  }
  if (data.status === "failed" || data.status === "error") {
    return { status: "failed", error: data.error || "Failed" };
  }
  return { status: "processing" };
}

// ─── Provider: Sora 2 (via OpenAI API) ──────────────────────────

async function generateSora(params: GenerateVideoParams): Promise<GenerateResult> {
  const apiKey = process.env.SORA_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return simulateGeneration("sora_2");

  const response = await fetchWithRetry("https://api.openai.com/v1/video/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "sora-2",
      prompt: params.script,
      duration: params.duration || 5,
      aspect_ratio: "9:16",
      reference_image: params.photoUrl,
    }),
  });

  if (!response.ok) {
    return { jobId: `sora-err-${Date.now()}`, status: "failed", error: `Sora ${response.status}: ${await response.text()}` };
  }
  const data = await response.json();
  return { jobId: data.id || `sora-${Date.now()}`, status: "processing", estimatedTime: 60 };
}

async function pollSora(jobId: string): Promise<PollResult> {
  const apiKey = process.env.SORA_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return { status: "completed", videoUrl: `/api/demo-video?model=sora_2` };

  const response = await fetchWithRetry(`https://api.openai.com/v1/video/generations/${jobId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return { status: "failed", error: `Poll failed: ${response.status}` };

  const data = await response.json();
  if (data.status === "completed") {
    return { status: "completed", videoUrl: data.output?.url, thumbnailUrl: data.output?.thumbnail_url };
  }
  if (data.status === "failed") return { status: "failed", error: data.error?.message || "Failed" };
  return { status: "processing" };
}

// ─── Provider: FAL (Kling via FAL, LTX, etc.) ───────────────────

async function generateFal(params: GenerateVideoParams, falModel: string): Promise<GenerateResult> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) return simulateGeneration(falModel);

  const response = await fetchWithRetry(`https://queue.fal.run/${falModel}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Key ${apiKey}` },
    body: JSON.stringify({
      prompt: params.script,
      image_url: params.photoUrl,
      duration: params.duration || 5,
    }),
  });

  if (!response.ok) {
    return { jobId: `fal-err-${Date.now()}`, status: "failed", error: `FAL ${response.status}: ${await response.text()}` };
  }
  const data = await response.json();
  return { jobId: data.request_id || `fal-${Date.now()}`, status: "processing", estimatedTime: 120 };
}

async function pollFal(jobId: string, falModel: string): Promise<PollResult> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) return { status: "completed", videoUrl: `/api/demo-video?model=fal` };

  const response = await fetchWithRetry(`https://queue.fal.run/${falModel}/requests/${jobId}/status`, {
    method: "GET",
    headers: { Authorization: `Key ${apiKey}` },
  });
  if (!response.ok) return { status: "failed", error: `Poll failed: ${response.status}` };

  const data = await response.json();
  if (data.status === "COMPLETED") {
    // Fetch the result
    const resultRes = await fetch(`https://queue.fal.run/${falModel}/requests/${jobId}`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    if (resultRes.ok) {
      const result = await resultRes.json();
      return { status: "completed", videoUrl: result.video?.url || result.output?.url };
    }
    return { status: "completed" };
  }
  if (data.status === "FAILED") return { status: "failed", error: data.error || "Failed" };
  return { status: "processing" };
}

// ─── Model Registry ─────────────────────────────────────────────

interface ModelProvider {
  generate: (params: GenerateVideoParams) => Promise<GenerateResult>;
  poll: (jobId: string) => Promise<PollResult>;
  envKey: string;       // environment variable name for API key
  name: string;
  description: string;
}

const MODEL_REGISTRY: Record<string, ModelProvider> = {
  "kling_2.6": {
    generate: generateKling,
    poll: pollKling,
    envKey: "KLING_API_KEY",
    name: "Kling 2.6",
    description: "Hyper-realistic, best for talking heads and testimonials",
  },
  "seedance_2.0": {
    generate: generateSeedance,
    poll: pollSeedance,
    envKey: "SEEDANCE_API_KEY",
    name: "Seedance 2.0",
    description: "Creative & dynamic, best for UGC-style social content",
  },
  sora_2: {
    generate: generateSora,
    poll: pollSora,
    envKey: "SORA_API_KEY",
    name: "Sora 2",
    description: "Natural motion, best quality talking heads, storyboard mode",
  },
  "kling_2.6_fal": {
    generate: (p) => generateFal(p, "fal-ai/kling-video/v2.6/image-to-video"),
    poll: (j) => pollFal(j, "fal-ai/kling-video/v2.6/image-to-video"),
    envKey: "FAL_API_KEY",
    name: "Kling 2.6 (via FAL)",
    description: "Kling routed through FAL for reliability",
  },
  ltx: {
    generate: (p) => generateFal(p, "fal-ai/ltx-video/v0.9.1/image-to-video"),
    poll: (j) => pollFal(j, "fal-ai/ltx-video/v0.9.1/image-to-video"),
    envKey: "FAL_API_KEY",
    name: "LTX",
    description: "Open source, fast generation, good for iteration",
  },
};

// ─── Public API ─────────────────────────────────────────────────

/**
 * Main entry point for video generation.
 * 1. Optionally expands the user's simple request into a production prompt via Gemini
 * 2. Routes to the correct model provider
 * 3. Returns the generation result
 */
export async function generateVideo(params: GenerateVideoParams): Promise<GenerateResult> {
  // Step 1: Prompt engineering (if enabled)
  let finalScript = params.script;
  let expandedPrompt: string | undefined;

  if (params.usePromptEngine !== false) {
    try {
      const expanded = await expandPrompt({
        userRequest: params.script,
        model: params.model,
        userId: params.userId,
        industry: params.industry,
        duration: params.duration,
      });
      finalScript = expanded.expandedPrompt;
      expandedPrompt = expanded.expandedPrompt;
    } catch (err) {
      console.error("[generate] Prompt engine failed, using raw script:", err);
    }
  }

  // Step 2: Generate audio FIRST, then feed to video model
  // From the course: "MiniMax has the most realistic voices. Generate audio
  // separately, then sync." The voice should sound "in the room", not studio.
  let voiceUrl = params.voiceUrl;

  if (finalScript && (process.env.MINIMAX_API_KEY || process.env.ELEVENLABS_API_KEY)) {
    try {
      // Extract just the dialogue from the expanded prompt for TTS
      const dialogueMatch = finalScript.match(/SCRIPT[^:]*:([\s\S]*?)(?=AUDIO|ANTI-GLITCH|$)/i);
      const dialogue = dialogueMatch
        ? dialogueMatch[1].replace(/\([^)]*\)/g, "").replace(/\n/g, " ").trim()
        : finalScript.substring(0, 500);

      if (dialogue.length > 10) {
        const ttsResult = await generateVoiceover(dialogue);
        if (ttsResult.audioUrl) {
          voiceUrl = ttsResult.audioUrl;
          console.log(`[generate] TTS generated via ${ttsResult.provider} (${ttsResult.duration}s)`);
        }
      }
    } catch (err) {
      console.error("[generate] TTS failed, using original voice:", err);
    }
  }

  // Step 3: Route to the correct video model
  const provider = MODEL_REGISTRY[params.model];
  if (!provider) {
    const defaultModel = await getConfig("generate_default_model", "kling_2.6");
    const fallback = MODEL_REGISTRY[defaultModel] || MODEL_REGISTRY["kling_2.6"];
    const result = await fallback.generate({ ...params, script: finalScript, voiceUrl });
    return { ...result, expandedPrompt };
  }

  const result = await provider.generate({ ...params, script: finalScript, voiceUrl });
  return { ...result, expandedPrompt };
}

/**
 * Poll a video generation job, updating the DB on completion.
 * Exponential backoff: 10s → 20s → 30s, timeout at 10 minutes.
 */
export async function pollJobUntilDone(
  videoId: string,
  jobId: string,
  model: string
): Promise<void> {
  const TIMEOUT_MS = 10 * 60 * 1000;
  const startTime = Date.now();

  if (jobId.startsWith("demo-") || jobId.includes("-err-")) return;

  const provider = MODEL_REGISTRY[model];
  if (!provider) return;

  let pollCount = 0;

  while (Date.now() - startTime < TIMEOUT_MS) {
    const elapsed = Date.now() - startTime;
    const intervalMs = elapsed < 120_000 ? 10_000 : elapsed < 300_000 ? 20_000 : 30_000;
    await sleep(intervalMs);
    pollCount++;

    try {
      const result = await provider.poll(jobId);

      if (result.status === "completed") {
        let finalVideoUrl = result.videoUrl || null;
        let finalThumbnailUrl = result.thumbnailUrl || null;

        if (isStorageConfigured()) {
          try {
            const video = await prisma.video.findUnique({ where: { id: videoId }, select: { userId: true } });
            const userId = video?.userId || "unknown";
            if (result.videoUrl) {
              finalVideoUrl = await downloadAndStore(result.videoUrl, videoKey(userId, videoId, "mp4"), "video/mp4");
            }
            if (result.thumbnailUrl) {
              finalThumbnailUrl = await downloadAndStore(result.thumbnailUrl, videoKey(userId, `${videoId}-thumb`, "jpg"), "image/jpeg");
            }
          } catch (s3Err) {
            console.error(`[Poll] S3 upload failed for ${videoId}:`, s3Err);
          }
        }

        await prisma.video.update({
          where: { id: videoId },
          data: { status: "review", videoUrl: finalVideoUrl, thumbnailUrl: finalThumbnailUrl },
        });
        console.log(`[Poll] Video ${videoId} completed after ${pollCount} polls`);
        return;
      }

      if (result.status === "failed") {
        await prisma.video.update({ where: { id: videoId }, data: { status: "failed" } });
        console.error(`[Poll] Video ${videoId} failed: ${result.error}`);
        return;
      }
    } catch (err) {
      console.error(`[Poll] Error polling ${videoId}:`, err);
    }
  }

  await prisma.video.update({ where: { id: videoId }, data: { status: "failed" } });
  console.error(`[Poll] Video ${videoId} timed out`);
}

// ─── Utilities ──────────────────────────────────────────────────

function simulateGeneration(model: string): GenerateResult {
  return {
    jobId: `demo-${model}-${Date.now()}`,
    status: "completed",
    videoUrl: `/api/demo-video?model=${model}`,
    thumbnailUrl: `/api/demo-thumbnail?model=${model}`,
    estimatedTime: 0,
  };
}

export function getAvailableModels(): { id: string; name: string; description: string; available: boolean }[] {
  return Object.entries(MODEL_REGISTRY).map(([id, provider]) => ({
    id,
    name: provider.name,
    description: provider.description,
    available: !!process.env[provider.envKey],
  }));
}

export function getModelInfo(model: string) {
  const provider = MODEL_REGISTRY[model];
  if (!provider) return { name: model, description: "Unknown model", features: [], bestFor: "", avgTime: "" };
  return {
    name: provider.name,
    description: provider.description,
    features: [],
    bestFor: provider.description,
    avgTime: "~2 minutes",
  };
}

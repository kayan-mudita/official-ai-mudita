/**
 * Video Stitcher -- Shotstack Cloud Video Editing API
 *
 * Takes an array of generated video cut URLs, trims each to its
 * target duration, stitches them into one final video, and optionally
 * adds an audio track (voiceover/music).
 *
 * Replaces FFmpeg -- runs in the cloud, works on serverless.
 *
 * Retry policy: Shotstack API calls get 2 retries with 2s exponential backoff.
 * If the stitch submission fails after retries, callers should fall back to
 * using the first cut as the final video.
 *
 * API Reference: https://shotstack.io/docs/api/
 * Base URL: https://api.shotstack.io/edit/{env}/render
 * Auth: x-api-key header
 */

import { withShotstackRetry } from "@/lib/pipeline/retry";

// ─── Types ──────────────────────────────────────────────────────

export interface StitchCut {
  videoUrl: string;     // URL of the generated cut video
  trimTo: number;       // seconds to use from this cut
  startFrom?: number;   // seconds to skip from the beginning (default: 0)
}

/** Per-cut audio entry for aligned audio tracks */
export interface PerCutAudioEntry {
  /** Audio URL for this cut's voiceover segment */
  url: string;
  /** Duration of the audio in milliseconds */
  durationMs: number;
}

export interface StitchOptions {
  cuts: StitchCut[];
  audioUrl?: string;              // optional single voiceover/music URL (legacy)
  perCutAudio?: PerCutAudioEntry[];  // per-cut audio tracks (preferred over audioUrl)
  audioVolume?: number;           // 0-1 (default: 1)
  resolution?: "sd" | "hd" | "1080";  // default: hd (720p)
  aspectRatio?: string;           // default: "9:16" (vertical)
  outputFormat?: "mp4" | "webm";  // default: mp4
}

/** Status values returned by the Shotstack render API */
type ShotstackStatus =
  | "queued"
  | "processing"
  | "rendering"
  | "finalizing"
  | "completed"
  | "failed";

export interface StitchJob {
  id: string;
  status: ShotstackStatus;
  url?: string;         // final video URL when completed
  error?: string;
}

// ─── Configuration ──────────────────────────────────────────────

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY || "";
// Use sandbox for testing, switch to v1 for production
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || "stage"; // "stage" = sandbox, "v1" = production

// IMPORTANT: The Edit API requires the /edit/ path segment.
// Stage:      https://api.shotstack.io/edit/stage/render
// Production: https://api.shotstack.io/edit/v1/render
const BASE_URL = `https://api.shotstack.io/edit/${SHOTSTACK_ENV}`;

export function isShotstackConfigured(): boolean {
  return !!SHOTSTACK_API_KEY;
}

// ─── Logging ────────────────────────────────────────────────────

const LOG_PREFIX = "[shotstack]";

function log(message: string, data?: unknown) {
  console.log(`${LOG_PREFIX} ${message}`, data !== undefined ? data : "");
}

function logError(message: string, error?: unknown) {
  console.error(`${LOG_PREFIX} ${message}`, error !== undefined ? error : "");
}

// ─── API Helpers ────────────────────────────────────────────────

async function shotstackFetch(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  log(`${options.method || "GET"} ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-api-key": SHOTSTACK_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    logError(`API error (${res.status}): ${body}`);
    throw new Error(`Shotstack API error (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json;
}

// ─── Build Timeline ─────────────────────────────────────────────

function buildTimeline(options: StitchOptions) {
  const { cuts, audioUrl, audioVolume = 1, aspectRatio = "9:16" } = options;

  // Calculate start times for each clip on the timeline.
  // Each clip uses Shotstack's `length` to control how many seconds of the
  // source video actually appear in the final timeline, and `trim` (a
  // clip-level property, NOT asset-level) to set the starting offset within
  // the source.  This is how a 5-second Kling generation gets trimmed down
  // to its target 2 seconds.
  let currentTime = 0;
  const clips = cuts.map((cut, index) => {
    // Build video asset -- src only (trim lives on the clip, not the asset)
    const asset: Record<string, unknown> = {
      type: "video",
      src: cut.videoUrl,
    };

    // Shotstack clip-level `trim`: seconds to skip from the start of the
    // source video.  E.g. trim=0 means "start from the very beginning."
    const trimOffset = cut.startFrom && cut.startFrom > 0 ? cut.startFrom : 0;

    // Build the clip object with explicit trim + length for proper cutting.
    // `length` = how many seconds this clip plays in the final video
    // `trim`   = where in the source video to begin playback (seconds)
    const clip: Record<string, unknown> = {
      asset,
      start: currentTime,
      length: cut.trimTo,   // target duration (e.g. 2s for a hook)
      trim: trimOffset,      // source offset (usually 0 = start from beginning)
      fit: "cover",
    };

    // Add cross-dissolve transition between cuts (not on the first)
    if (index > 0) {
      clip.transition = {
        in: "fade",
      };
    }

    currentTime += cut.trimTo;
    log(`Cut ${index}: start=${clip.start}s, length=${cut.trimTo}s, trim=${trimOffset}s, src=${cut.videoUrl.substring(0, 80)}...`);
    return clip;
  });

  const totalDuration = currentTime;

  // Build tracks -- video clips on track 0
  const tracks: Record<string, unknown>[] = [{ clips }];

  // Per-cut audio tracks: each cut gets its OWN audio clip aligned to its
  // timeline position. This replaces the old single-blob overlay and produces
  // much tighter audio-video sync because each segment starts exactly when
  // its corresponding video cut starts.
  const hasPerCutAudio = options.perCutAudio && options.perCutAudio.some((a) => a.url);

  if (hasPerCutAudio && options.perCutAudio) {
    const audioClips: Record<string, unknown>[] = [];
    let audioStart = 0;

    for (let i = 0; i < cuts.length; i++) {
      const audioEntry = options.perCutAudio[i];
      const cut = cuts[i];

      if (audioEntry && audioEntry.url) {
        // Audio length = the lesser of audio duration and the cut's visual duration.
        // This prevents audio bleeding into the next cut.
        const audioDurationSec = audioEntry.durationMs / 1000;
        const clipLength = Math.min(audioDurationSec, cut.trimTo);

        audioClips.push({
          asset: {
            type: "audio",
            src: audioEntry.url,
            volume: audioVolume,
          },
          start: audioStart,
          length: clipLength,
        });

        log(
          `Per-cut audio ${i}: start=${audioStart}s, length=${clipLength.toFixed(1)}s, ` +
          `audioMs=${audioEntry.durationMs}, src=${audioEntry.url.substring(0, 60)}...`
        );
      }

      audioStart += cut.trimTo;
    }

    if (audioClips.length > 0) {
      tracks.push({ clips: audioClips });
      log(`Per-cut audio track: ${audioClips.length} clips across ${totalDuration}s timeline`);
    }
  } else if (audioUrl) {
    // Legacy fallback: single audio blob overlaid on the full timeline
    tracks.push({
      clips: [{
        asset: {
          type: "audio",
          src: audioUrl,
          volume: audioVolume,
        },
        start: 0,
        length: totalDuration,
      }],
    });
    log(`Audio track (single): ${audioUrl.substring(0, 80)}..., volume=${audioVolume}, duration=${totalDuration}s`);
  }

  // Resolution mapping — Shotstack expects named resolutions, not pixel counts
  // Valid values: "preview" (512px), "mobile" (640px), "sd" (1024px), "hd" (1280px), "1080" (1920px), "4k" (3840px)
  const resolutionMap: Record<string, string> = {
    sd: "sd",
    hd: "hd",
    "1080": "1080",
  };

  const body = {
    timeline: {
      tracks,
      background: "#000000",
    },
    output: {
      format: options.outputFormat || "mp4",
      resolution: resolutionMap[options.resolution || "hd"] || "hd",
      aspectRatio: aspectRatio,
      fps: 30,
      quality: "high",
    },
  };

  log("Built timeline:", JSON.stringify({
    cutCount: cuts.length,
    totalDuration,
    hasPerCutAudio: !!hasPerCutAudio,
    hasLegacyAudio: !hasPerCutAudio && !!audioUrl,
    resolution: body.output.resolution,
    aspectRatio: body.output.aspectRatio,
    format: body.output.format,
  }));

  return body;
}

// ─── Validation ─────────────────────────────────────────────────

function validateCuts(cuts: StitchCut[]): void {
  for (let i = 0; i < cuts.length; i++) {
    const cut = cuts[i];
    if (!cut.videoUrl) {
      throw new Error(`Cut ${i}: videoUrl is required`);
    }
    if (!cut.videoUrl.startsWith("http://") && !cut.videoUrl.startsWith("https://")) {
      throw new Error(`Cut ${i}: videoUrl must be an HTTP(S) URL, got: ${cut.videoUrl.substring(0, 50)}`);
    }
    if (cut.trimTo <= 0) {
      throw new Error(`Cut ${i}: trimTo must be positive, got: ${cut.trimTo}`);
    }
    if (cut.startFrom !== undefined && cut.startFrom < 0) {
      throw new Error(`Cut ${i}: startFrom cannot be negative, got: ${cut.startFrom}`);
    }
  }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Submit a stitch job to Shotstack.
 * Returns immediately with a job ID — poll with getStitchStatus().
 */
export async function submitStitch(options: StitchOptions): Promise<StitchJob> {
  if (!isShotstackConfigured()) {
    throw new Error("SHOTSTACK_API_KEY is not set");
  }

  if (options.cuts.length === 0) {
    throw new Error("No cuts provided");
  }

  validateCuts(options.cuts);

  const body = buildTimeline(options);

  log("Submitting render job (with retry)...");

  // Wrap in retry: 2 retries with 2s exponential backoff
  const { result } = await withShotstackRetry(async () => {
    const res = await shotstackFetch("/render", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const jobId = res.response?.id;
    if (!jobId) {
      logError("Unexpected response -- no job ID:", res);
      throw new Error("Shotstack returned no job ID in response");
    }

    return res;
  }, "submit-render");

  const jobId = result.response?.id;
  log(`Render job submitted: ${jobId}`);

  return {
    id: jobId,
    status: "queued",
  };
}

/**
 * Check the status of a stitch job.
 */
export async function getStitchStatus(jobId: string): Promise<StitchJob> {
  if (!jobId) {
    throw new Error("jobId is required");
  }

  // Wrap in retry: 2 retries with 2s exponential backoff
  const { result } = await withShotstackRetry(async () => {
    const res = await shotstackFetch(`/render/${jobId}`);
    const render = res.response;

    if (!render) {
      logError("Unexpected response -- no render data:", res);
      throw new Error("Shotstack returned no render data");
    }

    return render;
  }, `status-${jobId}`);

  const job: StitchJob = {
    id: result.id,
    status: result.status,
    url: result.url || undefined,
    error: result.error || undefined,
  };

  log(`Job ${jobId}: status=${job.status}${job.url ? `, url=${job.url.substring(0, 80)}` : ""}`);

  return job;
}

/**
 * Poll a stitch job until it completes or fails.
 * Uses progressive backoff: 3s -> 5s -> 8s -> 10s (then stays at 10s).
 */
export async function waitForStitch(
  jobId: string,
  maxWaitMs = 300_000 // 5 minutes
): Promise<StitchJob> {
  const intervals = [3000, 5000, 8000, 10000];
  const start = Date.now();
  let attempt = 0;

  log(`Polling job ${jobId} (timeout: ${maxWaitMs / 1000}s)...`);

  while (Date.now() - start < maxWaitMs) {
    const status = await getStitchStatus(jobId);

    // Shotstack returns "completed" (not "done") when the render is finished
    if (status.status === "completed") {
      log(`Job ${jobId} completed in ${((Date.now() - start) / 1000).toFixed(1)}s`);
      return status;
    }

    if (status.status === "failed") {
      logError(`Job ${jobId} failed after ${((Date.now() - start) / 1000).toFixed(1)}s:`, status.error);
      throw new Error(`Stitch failed: ${status.error || "unknown error"}`);
    }

    const delay = intervals[Math.min(attempt, intervals.length - 1)];
    log(`Job ${jobId}: ${status.status} — retry in ${delay / 1000}s (attempt ${attempt + 1})`);
    await new Promise((r) => setTimeout(r, delay));
    attempt++;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  logError(`Job ${jobId} timed out after ${elapsed}s (${attempt} attempts)`);
  throw new Error(`Stitch timed out after ${maxWaitMs / 1000}s`);
}

/**
 * One-shot: submit + wait + return final URL.
 */
export async function stitchCuts(options: StitchOptions): Promise<string> {
  log(`Starting stitch: ${options.cuts.length} cuts, audio=${!!options.audioUrl}`);

  const job = await submitStitch(options);
  const completed = await waitForStitch(job.id);

  if (!completed.url) {
    throw new Error("Stitch completed but no URL returned");
  }

  log(`Stitch complete: ${completed.url}`);
  return completed.url;
}

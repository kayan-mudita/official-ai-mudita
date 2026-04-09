/**
 * Pipeline Types -- Typed state for the video generation pipeline.
 *
 * Replaces the untyped JSON stored in `video.sourceReview` with
 * structured interfaces that are validated at parse boundaries.
 *
 * Every read of sourceReview goes through `parseMeta()`.
 * Every write goes through `stringifyMeta()`.
 * No raw JSON.parse/stringify elsewhere in the pipeline.
 */

// ---- Step Result (returned by every pipeline handler) ----

export interface StepResult {
  status: string;
  nextStep?: string;
  nextCutIndex?: number;
  data?: Record<string, unknown>;
  error?: string;
}

// ---- Per-Cut Data (from composition planning) ----

export interface CutData {
  index: number;
  type: string;
  duration: number;
  generateDuration: number;
  prompt: string;
  /** Audio context for the cut — carries the actual script segment spoken
   *  during this cut (e.g. "Person says: [dialogue]"). Used by generateVideo
   *  to tell the video model the person is speaking, so it generates mouth
   *  movements instead of a blank stare. DATA FLOW GAP #8 FIX */
  audio?: string;
}

// ---- Per-Cut Job (FAL submission tracking) ----

export interface CutJob {
  jobId: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  trimTo: number | null;
}

// ---- Per-Cut Audio Data (from audio planner) ----

export interface CutAudioEntry {
  /** Audio URL for this cut segment */
  url: string;
  /** Actual audio duration in milliseconds */
  durationMs: number;
  /** The text segment spoken in this cut */
  segment: string;
}

// ---- Pipeline Metadata (the full sourceReview shape) ----

export interface PipelineMeta {
  // Composition
  cuts: CutData[];
  format: string;
  originalScript: string;
  totalCuts: number;

  // Assets
  startingFrameUrl: string | null;
  ttsAudioUrl: string | null;

  // Per-cut audio (audio-driven video duration planning)
  cutAudio: CutAudioEntry[];

  // Cut jobs
  cutJobs: Record<string, CutJob>;

  // Stitch
  stitchJobId: string | null;
  stitchStatus: string | null;
  cutThumbnailUrl: string | null;

  // Progress
  pipelineStep: string;
  pipelineCut: number;

  // Error
  error: string | null;

  // Generation mode
  mode?: "hook" | "full";

  // Post-processing
  postProcess?: {
    upscale: boolean;
    captions: boolean;
    speedCorrect: boolean;
    speedMultiplier?: number;
  };
  postProcessComplete?: boolean;
  captions?: { start: number; end: number; text: string }[];

  // Reference template
  templateId?: string;
  referenceVideoUrl?: string;
}

// ---- Helpers ----

const EMPTY_META: PipelineMeta = {
  cuts: [],
  format: "",
  originalScript: "",
  totalCuts: 0,
  startingFrameUrl: null,
  ttsAudioUrl: null,
  cutAudio: [],
  cutJobs: {},
  stitchJobId: null,
  stitchStatus: null,
  cutThumbnailUrl: null,
  pipelineStep: "",
  pipelineCut: 0,
  error: null,
};

/**
 * Safely parse sourceReview JSON into a typed PipelineMeta.
 * Missing fields are filled with defaults so every consumer
 * can rely on the full shape without null-checking everything.
 */
export function parseMeta(sourceReview: string | null | undefined): PipelineMeta {
  if (!sourceReview) return { ...EMPTY_META };
  try {
    const raw = JSON.parse(sourceReview);
    return {
      cuts: Array.isArray(raw.cuts) ? raw.cuts : [],
      format: raw.format ?? "",
      originalScript: raw.originalScript ?? "",
      totalCuts: raw.totalCuts ?? (Array.isArray(raw.cuts) ? raw.cuts.length : 0),
      startingFrameUrl: raw.startingFrameUrl ?? null,
      ttsAudioUrl: raw.ttsAudioUrl ?? null,
      cutAudio: Array.isArray(raw.cutAudio) ? raw.cutAudio : [],
      cutJobs: raw.cutJobs && typeof raw.cutJobs === "object" ? raw.cutJobs : {},
      stitchJobId: raw.stitchJobId ?? null,
      stitchStatus: raw.stitchStatus ?? null,
      cutThumbnailUrl: raw.cutThumbnailUrl ?? null,
      pipelineStep: raw.pipelineStep ?? "",
      pipelineCut: raw.pipelineCut ?? 0,
      error: raw.error ?? null,
    };
  } catch {
    return { ...EMPTY_META };
  }
}

/**
 * Serialize PipelineMeta back to JSON for DB storage.
 */
export function stringifyMeta(meta: PipelineMeta): string {
  return JSON.stringify(meta);
}

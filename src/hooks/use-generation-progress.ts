"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────

export interface GenerationProgress {
  step: string;
  currentCut: number;
  totalCuts: number;
  percent: number;
}

export interface GenerationStatus {
  video: {
    id: string;
    status: string;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    model: string;
    title: string;
    duration: number | null;
    updatedAt: string;
  };
  progress: GenerationProgress | null;
  error?: string;
}

// ─── Step labels for the UI ─────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  queued: "Preparing your video...",
  expand: "Expanding your script...",
  tts: "Generating voiceover...",
  anchor: "Creating anchor image...",
  cut: "Generating scene",
  submit_all_cuts: "Submitting all scenes...",
  poll_all_cuts: "Generating scenes...",
  stitch: "Stitching final video...",
  poll_stitch: "Stitching final video...",
  store: "Almost done...",
  done: "Complete!",
  failed: "Generation failed",
};

export function getStepLabel(progress: GenerationProgress | null): string {
  if (!progress) return "Preparing your video...";

  const { step, currentCut, totalCuts } = progress;

  if (step === "cut" && totalCuts > 0) {
    return `Generating scene ${currentCut + 1} of ${totalCuts}...`;
  }

  if (step === "poll_all_cuts" && totalCuts > 0) {
    return `Generating scenes... ${currentCut} of ${totalCuts} complete`;
  }

  if (step === "submit_all_cuts" && totalCuts > 0) {
    return `Submitting ${totalCuts} scenes...`;
  }

  return STEP_LABELS[step] || "Processing...";
}

// All possible pipeline steps in order (for the step indicator)
export const PIPELINE_STEPS = [
  { key: "expand", label: "Script" },
  { key: "tts", label: "Voiceover" },
  { key: "anchor", label: "Anchor" },
  { key: "cut", label: "Scenes" },
  { key: "stitch", label: "Stitch" },
  { key: "store", label: "Finalize" },
] as const;

export type PipelineStepKey = (typeof PIPELINE_STEPS)[number]["key"];

/**
 * Returns the index of the current step in the PIPELINE_STEPS array.
 * Returns -1 for queued/unknown, and PIPELINE_STEPS.length for done.
 * Maps parallel cut steps (submit_all_cuts, poll_all_cuts) to the "cut" visual step.
 */
export function getStepIndex(step: string): number {
  if (step === "done") return PIPELINE_STEPS.length;
  if (step === "failed") return -1;
  // Map parallel cut steps to the same visual position as "cut"
  if (step === "submit_all_cuts" || step === "poll_all_cuts") {
    return PIPELINE_STEPS.findIndex((s) => s.key === "cut");
  }
  return PIPELINE_STEPS.findIndex((s) => s.key === step);
}

// ─── Hook ───────────────────────────────────────────────────────

interface UseGenerationProgressOptions {
  videoId: string | null;
  /** Whether to actively poll. Defaults to true. */
  enabled?: boolean;
  /** Poll interval in ms. Defaults to 3000. */
  interval?: number;
  /** Max poll count before stopping. Defaults to 120 (6 minutes at 3s). */
  maxPolls?: number;
  /** Called when the video is done (status is review/approved/published). */
  onComplete?: (video: GenerationStatus["video"]) => void;
  /** Called when the video fails. */
  onError?: (error: string) => void;
}

export function useGenerationProgress({
  videoId,
  enabled = true,
  interval = 3000,
  maxPolls = 120,
  onComplete,
  onError,
}: UseGenerationProgressOptions) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Keep callback refs up to date
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
    pollCountRef.current = 0;
  }, []);

  const startPolling = useCallback(() => {
    if (!videoId || !enabled) return;

    // Clean up any existing poll
    if (pollRef.current) clearInterval(pollRef.current);

    setIsPolling(true);
    pollCountRef.current = 0;

    // Initial fetch immediately
    const fetchStatus = async () => {
      pollCountRef.current++;

      if (pollCountRef.current > maxPolls) {
        stopPolling();
        onErrorRef.current?.("Video is taking longer than expected. Check your dashboard later.");
        return;
      }

      try {
        const res = await fetch(`/api/generate/status?videoId=${videoId}`);
        if (!res.ok) return;

        const data: GenerationStatus = await res.json();
        setStatus(data);

        if (data.progress) {
          setProgress(data.progress);
        }

        const videoStatus = data.video.status;

        if (videoStatus === "review" || videoStatus === "approved" || videoStatus === "published") {
          stopPolling();
          setProgress({ step: "done", currentCut: 0, totalCuts: 0, percent: 100 });
          onCompleteRef.current?.(data.video);
        } else if (videoStatus === "failed") {
          stopPolling();
          setProgress({ step: "failed", currentCut: 0, totalCuts: 0, percent: 0 });
          onErrorRef.current?.(data.error || "Video generation failed");
        }
      } catch {
        // Network error -- keep trying
      }
    };

    // Fetch immediately, then at interval
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, interval);
  }, [videoId, enabled, interval, maxPolls, stopPolling]);

  // Start/stop polling when videoId or enabled changes
  useEffect(() => {
    if (videoId && enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [videoId, enabled, startPolling, stopPolling]);

  return {
    progress,
    status,
    isPolling,
    stepLabel: getStepLabel(progress),
    stopPolling,
    startPolling,
  };
}

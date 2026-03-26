"use client";

import { Check, Loader2 } from "lucide-react";
import {
  type GenerationProgress as ProgressType,
  PIPELINE_STEPS,
  getStepIndex,
  getStepLabel,
} from "@/hooks/use-generation-progress";

// ─── Progress Bar ───────────────────────────────────────────────

interface ProgressBarProps {
  progress: ProgressType | null;
  /** Compact mode hides step labels. Used in chat/inline contexts. */
  compact?: boolean;
}

export function GenerationProgressBar({ progress, compact = false }: ProgressBarProps) {
  const percent = progress?.percent ?? 0;
  const label = getStepLabel(progress);
  const isFailed = progress?.step === "failed";
  const isDone = progress?.step === "done";

  return (
    <div className="w-full">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[13px] font-medium ${isFailed ? "text-red-400/80" : "text-white/60"}`}>
          {label}
        </span>
        {!compact && !isFailed && (
          <span className="text-[11px] text-white/25 tabular-nums">
            {percent}%
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isFailed
              ? "bg-red-500/60"
              : isDone
                ? "bg-green-500/60"
                : "bg-white/30"
          }`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step Indicator ─────────────────────────────────────────────

interface StepIndicatorProps {
  progress: ProgressType | null;
}

export function GenerationStepIndicator({ progress }: StepIndicatorProps) {
  const currentStepIndex = progress ? getStepIndex(progress.step) : -1;
  const isFailed = progress?.step === "failed";

  return (
    <div className="w-full">
      {/* Step dots */}
      <div className="flex items-center justify-between mb-3">
        {PIPELINE_STEPS.map((pipelineStep, i) => {
          const isCompleted = currentStepIndex > i;
          const isCurrent = currentStepIndex === i;
          const isPending = currentStepIndex < i;

          return (
            <div key={pipelineStep.key} className="flex flex-col items-center flex-1">
              {/* Dot / icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? "bg-white/20"
                    : isCurrent
                      ? isFailed
                        ? "bg-red-500/20 ring-1 ring-red-500/30"
                        : "bg-white/10 ring-1 ring-white/20"
                      : "bg-white/[0.04]"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-white/60" />
                ) : isCurrent ? (
                  isFailed ? (
                    <span className="w-2 h-2 rounded-full bg-red-400/60" />
                  ) : (
                    <Loader2 className="w-3 h-3 text-white/50 animate-spin" />
                  )
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isPending ? "bg-white/10" : "bg-white/20"}`} />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-1.5 transition-colors duration-300 ${
                  isCompleted
                    ? "text-white/40"
                    : isCurrent
                      ? isFailed
                        ? "text-red-400/60"
                        : "text-white/60 font-medium"
                      : "text-white/15"
                }`}
              >
                {pipelineStep.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Connecting line */}
      <div className="relative mx-6 -mt-[30px] mb-6">
        <div className="absolute top-[12px] left-0 right-0 h-px bg-white/[0.06]" />
        <div
          className={`absolute top-[12px] left-0 h-px transition-all duration-700 ease-out ${
            isFailed ? "bg-red-500/30" : "bg-white/20"
          }`}
          style={{
            width:
              currentStepIndex <= 0
                ? "0%"
                : `${Math.min((currentStepIndex / (PIPELINE_STEPS.length - 1)) * 100, 100)}%`,
          }}
        />
      </div>

      {/* Current step detail */}
      <div className="text-center">
        <p className={`text-[13px] ${isFailed ? "text-red-400/70" : "text-white/50"}`}>
          {getStepLabel(progress)}
        </p>
        {progress?.step === "cut" && progress.totalCuts > 0 && (
          <p className="text-[11px] text-white/20 mt-1">
            Scene {progress.currentCut + 1} of {progress.totalCuts}
          </p>
        )}
        {progress?.step === "poll_all_cuts" && progress.totalCuts > 0 && (
          <p className="text-[11px] text-white/20 mt-1">
            {progress.currentCut} of {progress.totalCuts} scenes complete
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Full Progress Display ──────────────────────────────────────
// Combines step indicator + progress bar for use in full-page contexts

interface GenerationProgressDisplayProps {
  progress: ProgressType | null;
  title?: string;
  subtitle?: string;
}

export function GenerationProgressDisplay({
  progress,
  title = "Generating your video",
  subtitle = "This usually takes 1-3 minutes.",
}: GenerationProgressDisplayProps) {
  const isFailed = progress?.step === "failed";

  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.04] mb-6">
        {isFailed ? (
          <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-red-400" />
          </span>
        ) : progress?.step === "done" ? (
          <Check className="w-5 h-5 text-white/40" />
        ) : (
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
        )}
      </div>

      <h1 className="text-[22px] font-semibold text-white/90 mb-2">
        {isFailed ? "Generation issue" : progress?.step === "done" ? "Video ready" : title}
      </h1>

      <p className="text-[14px] text-white/30 max-w-xs mx-auto mb-8">
        {isFailed
          ? "Something went wrong during generation."
          : progress?.step === "done"
            ? "Your video has been generated successfully."
            : subtitle}
      </p>

      {/* Step indicator */}
      <div className="max-w-sm mx-auto mb-6">
        <GenerationStepIndicator progress={progress} />
      </div>

      {/* Progress bar */}
      <div className="max-w-xs mx-auto">
        <GenerationProgressBar progress={progress} />
      </div>
    </div>
  );
}

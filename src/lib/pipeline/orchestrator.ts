/**
 * Pipeline Orchestrator
 *
 * Single entry point for the video generation pipeline.
 * Routes each step to the correct handler and returns
 * a standardized StepResult.
 *
 * The process route.ts calls `runStep()` and translates
 * the StepResult into an HTTP response. All heavy logic
 * lives in the individual handler modules.
 */

import { handleExpand } from "./expand";
import { handleTTS } from "./tts";
import { handleAnchor } from "./anchor";
import { handleCutSubmit } from "./cut-submit";
import { handleCutPoll } from "./cut-poll";
import { handleSubmitAllCuts } from "./cut-submit-all";
import { handlePollAllCuts } from "./cut-poll-all";
import { handleStitchSubmit } from "./stitch-submit";
import { handleStitchPoll } from "./stitch-poll";
import type { StepResult } from "./types";

/**
 * Run a single step of the video generation pipeline.
 *
 * @param videoId - The video record ID
 * @param step    - Which pipeline step to execute
 * @param cutIndex - (optional) Which cut index, for cut/poll steps
 * @param userId  - The authenticated user's ID
 */
export async function runStep(
  videoId: string,
  step: string,
  cutIndex?: number,
  userId?: string
): Promise<StepResult> {
  if (!userId) {
    return { status: "error", error: "userId is required" };
  }

  switch (step) {
    case "expand":
      return handleExpand(videoId, userId);

    case "tts":
      return handleTTS(videoId, userId);

    case "anchor":
      return handleAnchor(videoId, userId);

    case "cut":
      return handleCutSubmit(videoId, userId, cutIndex ?? 0);

    case "poll":
      return handleCutPoll(videoId, userId, cutIndex ?? 0);

    case "submit_all_cuts":
      return handleSubmitAllCuts(videoId, userId);

    case "poll_all_cuts":
      return handlePollAllCuts(videoId, userId);

    case "stitch":
      return handleStitchSubmit(videoId, userId);

    case "poll_stitch":
      return handleStitchPoll(videoId, userId);

    default:
      return { status: "error", error: `Unknown step: ${step}` };
  }
}

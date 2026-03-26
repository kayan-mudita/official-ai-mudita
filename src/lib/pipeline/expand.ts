/**
 * Pipeline Step: EXPAND
 *
 * Takes the user's raw script and format, runs it through the unified
 * content planner to produce a complete creative plan in a single
 * Gemini call (per-cut prompts + TTS script).
 *
 * Falls back to the legacy two-step flow (planComposition + expandCutPrompts)
 * if the content planner fails, so the pipeline is never broken.
 *
 * After this step, sourceReview contains the full cut plan with
 * production-grade prompts ready for FAL submission.
 */

import prisma from "@/lib/prisma";
import { planContent } from "./content-planner";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

export async function handleExpand(videoId: string, userId: string): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { model: true, contentType: true, script: true, sourceReview: true },
  });

  if (!video) {
    return { status: "error", error: "Video not found" };
  }

  const selectedFormat = video.contentType || "talking_head_15";
  const rawScript = video.script || "";

  // Update progress
  const meta = parseMeta(video.sourceReview);
  meta.pipelineStep = "expand";
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  // Fetch user industry for context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  // Use the unified content planner (single Gemini call)
  const contentPlan = await planContent(rawScript, selectedFormat, userId, user?.industry);

  // Store expanded prompts in the video's script field
  const allPrompts = contentPlan.cuts
    .map(
      (c, i) =>
        `=== CUT ${i + 1}: ${c.type.toUpperCase()} (${c.duration}s) ===\n${c.prompt}`
    )
    .join("\n\n");

  // Persist
  const expandedMeta = parseMeta(null);
  expandedMeta.cuts = contentPlan.cuts;
  expandedMeta.totalCuts = contentPlan.totalCuts;
  expandedMeta.format = selectedFormat;
  expandedMeta.originalScript = contentPlan.ttsScript;
  expandedMeta.startingFrameUrl = null;
  expandedMeta.pipelineStep = "expand";
  expandedMeta.pipelineCut = 0;

  await prisma.video.update({
    where: { id: videoId },
    data: {
      script: allPrompts.substring(0, 5000),
      sourceReview: stringifyMeta(expandedMeta),
    },
  });

  return {
    status: "expanded",
    nextStep: "tts",
    data: { totalCuts: contentPlan.totalCuts },
  };
}

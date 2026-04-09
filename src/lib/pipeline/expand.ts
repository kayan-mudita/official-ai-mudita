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
import { buildStyleDirective } from "@/lib/reference-analyzer";

// Formats that use the simplified hook-only pipeline path
const HOOK_FORMATS = ["discovery_hook", "censored_hook", "hook_only_15"];

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

  // Load reference template style if templateId is set
  let referenceStyle: string | undefined;
  if (meta.templateId) {
    try {
      const template = await prisma.videoTemplate.findFirst({
        where: { id: meta.templateId, userId },
        select: { analysisJson: true, sourceUrl: true },
      });
      if (template?.analysisJson) {
        const analysis = JSON.parse(template.analysisJson);
        referenceStyle = buildStyleDirective(analysis);
        console.log(`[expand] Loaded reference style from template ${meta.templateId}`);
      }
    } catch (e) {
      console.warn("[expand] Failed to load template reference:", e);
    }
  }

  // Inject reference style into the script for the content planner
  const scriptWithReference = referenceStyle
    ? `${rawScript}\n\n${referenceStyle}`
    : rawScript;

  // Use the unified content planner (single Gemini call)
  const contentPlan = await planContent(scriptWithReference, selectedFormat, userId, user?.industry);

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

  // Route to hook_generate for single-shot formats (skip multi-cut pipeline)
  const isHookFormat = HOOK_FORMATS.includes(selectedFormat) || meta.mode === "hook";
  const nextStep = isHookFormat ? "hook_generate" : "tts";

  return {
    status: "expanded",
    nextStep,
    data: { totalCuts: contentPlan.totalCuts, isHookFormat },
  };
}

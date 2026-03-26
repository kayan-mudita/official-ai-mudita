/**
 * Pipeline Step: ANCHOR
 *
 * Resolves or generates the starting frame (anchor image) that ensures
 * character consistency across all video cuts. This step runs between
 * TTS and the first CUT.
 *
 * Resolution strategy (fast path first):
 *   1. Check if a starting frame already exists (from onboarding or
 *      a previous generation) -- ~1s database lookup
 *   2. If not, attempt to generate one via Gemini (~15-30s) -- fits
 *      within the 26s route timeout as its own dedicated step
 *   3. If generation fails, fall back to getBestReferenceImage() which
 *      tries character sheets, then the user's primary photo
 *
 * The resolved URL is stored in meta.startingFrameUrl so that every
 * subsequent CUT step uses the same anchor image.
 */

import prisma from "@/lib/prisma";
import {
  getStartingFrameUrl,
  getOrGenerateStartingFrame,
} from "@/lib/starting-frame";
import { getBestReferenceImage } from "./character-assets";
import { parseMeta, stringifyMeta } from "./types";
import type { StepResult } from "./types";

export async function handleAnchor(
  videoId: string,
  userId: string
): Promise<StepResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { sourceReview: true },
  });

  if (!video) {
    return { status: "error", error: "Video not found" };
  }

  const meta = parseMeta(video.sourceReview);
  meta.pipelineStep = "anchor";
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(meta) },
  });

  let startingFrameUrl: string | null = null;

  // ── Fast path: check for an existing starting frame (~1s) ──
  try {
    startingFrameUrl = await getStartingFrameUrl(userId);
    if (startingFrameUrl) {
      console.log(
        `[pipeline/anchor] Found existing starting frame for user ${userId} -- skipping generation`
      );
    }
  } catch (err) {
    console.warn("[pipeline/anchor] Error checking existing starting frame:", err);
  }

  // ── Generate if needed (~15-30s) ──
  if (!startingFrameUrl) {
    try {
      console.log(
        `[pipeline/anchor] No existing starting frame for user ${userId} -- attempting generation`
      );
      startingFrameUrl = await getOrGenerateStartingFrame(userId);
      if (startingFrameUrl) {
        console.log(
          `[pipeline/anchor] Generated starting frame for user ${userId}`
        );
      }
    } catch (err) {
      console.error("[pipeline/anchor] Starting frame generation failed:", err);
    }
  }

  // ── Fallback: best available reference image ──
  if (!startingFrameUrl) {
    try {
      console.log(
        `[pipeline/anchor] Generation failed/unavailable -- falling back to best reference image`
      );
      startingFrameUrl = await getBestReferenceImage(userId, "anchor");
    } catch (err) {
      console.error("[pipeline/anchor] getBestReferenceImage failed:", err);
    }
  }

  // ── Last resort: user's primary photo ──
  if (!startingFrameUrl) {
    const primaryPhoto = await prisma.photo.findFirst({
      where: { userId, isPrimary: true },
      select: { url: true },
    });
    startingFrameUrl = primaryPhoto?.url || null;

    if (startingFrameUrl) {
      console.warn(
        `[pipeline/anchor] Using primary photo as last-resort anchor for user ${userId}`
      );
    } else {
      console.error(
        `[pipeline/anchor] No anchor image available for user ${userId} -- cuts will use whatever photo is linked to the video`
      );
    }
  }

  // ── Persist the resolved URL into pipeline metadata ──
  const freshVideo = await prisma.video.findUnique({
    where: { id: videoId },
    select: { sourceReview: true },
  });
  const freshMeta = parseMeta(freshVideo?.sourceReview);
  freshMeta.startingFrameUrl = startingFrameUrl;
  await prisma.video.update({
    where: { id: videoId },
    data: { sourceReview: stringifyMeta(freshMeta) },
  });

  return {
    status: "anchor_done",
    nextStep: "submit_all_cuts",
    data: {
      startingFrameUrl,
    },
  };
}

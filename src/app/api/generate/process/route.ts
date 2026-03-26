import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { runStep } from "@/lib/pipeline/orchestrator";
import { parseMeta, stringifyMeta } from "@/lib/pipeline/types";

/**
 * POST /api/generate/process
 *
 * Thin HTTP layer for the video generation pipeline.
 * Parses the request, delegates to the pipeline orchestrator,
 * and translates the StepResult into an HTTP response.
 *
 * All heavy logic lives in src/lib/pipeline/*.
 */
export async function POST(req: NextRequest) {
  let videoId: string | undefined;

  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { videoId: vid, step, cutIndex } = body as {
      videoId: string;
      step: string;
      cutIndex?: number;
    };
    videoId = vid;

    if (!videoId || !step) {
      return NextResponse.json({ error: "videoId and step are required" }, { status: 400 });
    }

    // Verify ownership
    const video = await prisma.video.findFirst({ where: { id: videoId, userId: user.id } });
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    // Run the pipeline step
    const result = await runStep(videoId, step, cutIndex, user.id);

    // Map StepResult to HTTP response
    const statusCode = result.status === "error" ? 400 : 200;
    return NextResponse.json(
      { status: result.status, nextStep: result.nextStep, nextCutIndex: result.nextCutIndex, error: result.error, ...result.data },
      { status: statusCode }
    );
  } catch (error: any) {
    console.error("[POST /api/generate/process] Unexpected error:", error);

    // Mark the video as failed so it doesn't stay stuck in "generating"
    if (videoId) {
      try {
        const video = await prisma.video.findUnique({
          where: { id: videoId },
          select: { sourceReview: true },
        });
        const meta = parseMeta(video?.sourceReview);
        meta.error = error?.message || "An unexpected error occurred during video generation.";
        await prisma.video.update({
          where: { id: videoId },
          data: { status: "failed", sourceReview: stringifyMeta(meta) },
        });
      } catch (dbErr) {
        console.error("[POST /api/generate/process] Failed to mark video as failed:", dbErr);
      }
    }

    return NextResponse.json(
      { status: "failed", error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

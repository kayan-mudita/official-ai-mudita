import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { getPipelineTimeline } from "@/lib/pipeline/event-log";

/**
 * GET /api/admin/pipeline-log?videoId=X
 *
 * Returns the ordered pipeline event timeline for a specific video.
 * Used by the admin panel's video detail view to debug generation issues.
 */
export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const videoId = req.nextUrl.searchParams.get("videoId");
    if (!videoId) {
      return NextResponse.json(
        { error: "videoId query parameter is required" },
        { status: 400 }
      );
    }

    const timeline = await getPipelineTimeline(videoId);

    return NextResponse.json({
      videoId,
      events: timeline,
      count: timeline.length,
    });
  } catch (err) {
    console.error("[GET /api/admin/pipeline-log]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

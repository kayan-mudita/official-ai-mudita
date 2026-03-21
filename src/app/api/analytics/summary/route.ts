import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const [totalVideos, publishedVideos, events] = await Promise.all([
      prisma.video.count({ where: { userId: user.id } }),
      prisma.video.count({ where: { userId: user.id, status: "published" } }),
      prisma.analyticsEvent.findMany({ where: { userId: user.id } }),
    ]);

    // Aggregate events by type
    const totals: Record<string, number> = {};
    for (const e of events) {
      totals[e.eventType] = (totals[e.eventType] || 0) + e.count;
    }

    return NextResponse.json({
      totalVideos,
      publishedVideos,
      totalViews: totals.view || 0,
      totalLikes: totals.like || 0,
      totalShares: totals.share || 0,
      totalComments: totals.comment || 0,
      events,
    });
  } catch (err) {
    console.error("[GET /api/analytics/summary]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

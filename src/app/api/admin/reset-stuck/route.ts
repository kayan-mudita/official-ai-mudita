import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";

/**
 * POST /api/admin/reset-stuck
 *
 * Resets videos stuck in "generating" status to "failed".
 * Targets videos that have been generating for more than 15 minutes.
 */
export async function POST() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago

    const result = await prisma.video.updateMany({
      where: {
        status: "generating",
        updatedAt: { lt: cutoff },
      },
      data: { status: "failed" },
    });

    return NextResponse.json({
      reset: result.count,
      message: `Reset ${result.count} stuck video${result.count !== 1 ? "s" : ""} to failed`,
    });
  } catch (err) {
    console.error("[POST /api/admin/reset-stuck]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/reset-stuck
 *
 * Returns count of currently stuck videos (generating > 15 min).
 */
export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const cutoff = new Date(Date.now() - 15 * 60 * 1000);

    const count = await prisma.video.count({
      where: {
        status: "generating",
        updatedAt: { lt: cutoff },
      },
    });

    return NextResponse.json({ stuck: count });
  } catch (err) {
    console.error("[GET /api/admin/reset-stuck]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

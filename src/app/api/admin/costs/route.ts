import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";

function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS ?? "";
  if (!adminEmails) return false;
  const list = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  return list.includes(email.toLowerCase());
}

const COST_PER_MINUTE = 5; // $5 per minute of video
const MRR_PER_USER = 79; // placeholder MRR per paying user

export async function GET() {
  try {
    const { error, user } = await requireAdmin();
    if (error) return error;

    if (!isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 }
      );
    }

    // Get current month boundaries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get all users with their video counts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            photos: true,
            voiceSamples: true,
          },
        },
      },
    });

    // Get all videos this month with duration info
    const videosThisMonth = await prisma.video.findMany({
      where: {
        createdAt: { gte: monthStart, lt: monthEnd },
        status: { not: "draft" },
      },
      select: {
        id: true,
        userId: true,
        duration: true,
        contentType: true,
        createdAt: true,
      },
    });

    // Get all videos ever (for total count)
    const allVideos = await prisma.video.findMany({
      where: { status: { not: "draft" } },
      select: {
        id: true,
        userId: true,
        duration: true,
        contentType: true,
      },
    });

    // Calculate per-user cost data
    const perUserCosts = users.map((u) => {
      const userVideosThisMonth = videosThisMonth.filter(
        (v) => v.userId === u.id
      );
      const userAllVideos = allVideos.filter((v) => v.userId === u.id);

      // Estimate cost: $5 * (duration/60) per video
      // For multi-cut videos, count each cut
      const monthCost = userVideosThisMonth.reduce((sum, v) => {
        const minutes = Math.max(v.duration, 5) / 60; // minimum 5s = ~0.083 min
        return sum + COST_PER_MINUTE * minutes;
      }, 0);

      const totalCost = userAllVideos.reduce((sum, v) => {
        const minutes = Math.max(v.duration, 5) / 60;
        return sum + COST_PER_MINUTE * minutes;
      }, 0);

      return {
        userId: u.id,
        email: u.email,
        name: `${u.firstName} ${u.lastName}`,
        plan: u.plan,
        totalVideos: u._count.videos,
        totalPhotos: u._count.photos,
        totalVoiceSamples: u._count.voiceSamples,
        videosThisMonth: userVideosThisMonth.length,
        estimatedCostThisMonth: Math.round(monthCost * 100) / 100,
        estimatedCostAllTime: Math.round(totalCost * 100) / 100,
      };
    });

    // Aggregate totals
    const totalUsers = users.length;
    const payingUsers = users.filter((u) => u.plan !== "free").length;
    const totalVideosThisMonth = videosThisMonth.length;
    const totalVideosAllTime = allVideos.length;

    const totalApiCostThisMonth = perUserCosts.reduce(
      (sum, u) => sum + u.estimatedCostThisMonth,
      0
    );
    const totalApiCostAllTime = perUserCosts.reduce(
      (sum, u) => sum + u.estimatedCostAllTime,
      0
    );

    const revenueThisMonth = payingUsers * MRR_PER_USER;
    const grossMargin =
      revenueThisMonth > 0
        ? ((revenueThisMonth - totalApiCostThisMonth) / revenueThisMonth) * 100
        : 0;

    return NextResponse.json({
      summary: {
        totalUsers,
        payingUsers,
        totalVideosThisMonth,
        totalVideosAllTime,
        totalApiCostThisMonth: Math.round(totalApiCostThisMonth * 100) / 100,
        totalApiCostAllTime: Math.round(totalApiCostAllTime * 100) / 100,
        revenueThisMonth,
        grossMargin: Math.round(grossMargin * 10) / 10,
        costPerMinute: COST_PER_MINUTE,
        mrrPerUser: MRR_PER_USER,
        month: monthStart.toISOString(),
      },
      perUser: perUserCosts
        .sort((a, b) => b.estimatedCostThisMonth - a.estimatedCostThisMonth),
    });
  } catch (err) {
    console.error("[GET /api/admin/costs]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

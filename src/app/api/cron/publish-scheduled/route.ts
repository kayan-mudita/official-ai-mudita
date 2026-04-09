import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadMedia, createPost, getAccounts } from "@/lib/post-bridge";

/**
 * GET /api/cron/publish-scheduled
 *
 * Cron endpoint that publishes all scheduled posts whose scheduledAt
 * time has passed. Designed to be called every 5 minutes by:
 * - Vercel Cron (vercel.json)
 * - External cron service (e.g., cron-job.org)
 * - Or manually via curl
 *
 * Protected by CRON_SECRET env var to prevent unauthorized triggers.
 */

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let published = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // Find all scheduled posts that are due
    const dueSchedules = await prisma.schedule.findMany({
      where: {
        status: "scheduled",
        scheduledAt: { lte: now },
      },
      include: {
        video: true,
        user: true,
      },
      take: 20, // Process max 20 per run to avoid timeout
      orderBy: { scheduledAt: "asc" },
    });

    if (dueSchedules.length === 0) {
      return NextResponse.json({ published: 0, message: "No scheduled posts due" });
    }

    for (const schedule of dueSchedules) {
      try {
        // Skip if video has no URL
        if (!schedule.video.videoUrl) {
          await prisma.schedule.update({
            where: { id: schedule.id },
            data: { status: "failed" },
          });
          errors.push(`${schedule.id}: video has no URL`);
          failed++;
          continue;
        }

        // Get PostBridge accounts for the platform
        let pbAccounts;
        try {
          pbAccounts = await getAccounts([schedule.platform]);
        } catch {
          errors.push(`${schedule.id}: failed to fetch PostBridge accounts`);
          failed++;
          continue;
        }

        const matched = pbAccounts.filter((a) => a.platform === schedule.platform);
        if (matched.length === 0) {
          errors.push(`${schedule.id}: no PostBridge account for ${schedule.platform}`);
          failed++;
          continue;
        }

        // Upload video to PostBridge
        const mediaId = await uploadMedia(
          schedule.video.videoUrl,
          `${schedule.video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`
        );

        // Create the post
        const caption = [schedule.video.title, schedule.video.description]
          .filter(Boolean)
          .join("\n\n");

        await createPost({
          caption,
          socialAccountIds: matched.map((a) => a.id),
          mediaIds: [mediaId],
          scheduledAt: null, // Publish immediately
        });

        // Update records
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: { status: "published", publishedAt: now },
        });

        await prisma.video.update({
          where: { id: schedule.videoId },
          data: { status: "published" },
        });

        // Fire first_publish milestone if applicable
        const publishCount = await prisma.schedule.count({
          where: { userId: schedule.userId, status: "published" },
        });
        if (publishCount <= 1) {
          await prisma.lifecycleEvent.create({
            data: {
              userId: schedule.userId,
              event: "first_publish",
              metadata: JSON.stringify({
                videoId: schedule.videoId,
                platform: schedule.platform,
                source: "cron",
              }),
            },
          }).catch(() => {});
        }

        published++;
      } catch (e: any) {
        errors.push(`${schedule.id}: ${e.message || "unknown error"}`);
        failed++;

        // Mark as failed so we don't retry indefinitely
        await prisma.schedule.update({
          where: { id: schedule.id },
          data: { status: "failed" },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      published,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      processedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("[cron/publish-scheduled] Fatal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

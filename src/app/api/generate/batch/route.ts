import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

/**
 * POST /api/generate/batch
 *
 * Accepts either:
 * A) { sessionId, approvedDays } — generates videos from calendar research session
 * B) { count: 3|5|7 } — generates from industry templates (legacy)
 *
 * Creates video records with full scripts from the calendar, then
 * kicks off the pipeline for each in the background.
 *
 * Returns batch info so the frontend can poll progress.
 */

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const body = await req.json();

    // ── Mode A: Generate from research calendar ──────────────
    if (body.sessionId) {
      const { sessionId, approvedDays } = body;

      const session = await prisma.researchSession.findFirst({
        where: { id: sessionId, userId: user.id },
      });

      if (!session || !session.calendarResult) {
        return NextResponse.json({ error: "No calendar found" }, { status: 404 });
      }

      const calendar = JSON.parse(session.calendarResult);
      const approved: number[] = Array.isArray(approvedDays)
        ? approvedDays
        : session.approvedDays
        ? JSON.parse(session.approvedDays)
        : calendar.map((_: unknown, i: number) => i);

      // Get user's default photo and voice for pipeline
      const [photo, voice] = await Promise.all([
        prisma.photo.findFirst({ where: { userId: user.id, isPrimary: true } }),
        prisma.voiceSample.findFirst({ where: { userId: user.id, isDefault: true } }),
      ]);

      // Create video records for each approved day
      const videos = [];
      for (const dayIndex of approved) {
        const day = calendar[dayIndex];
        if (!day) continue;

        // Use full script if available, fall back to scriptOutline
        const script = day.script || day.scriptOutline || day.hook || "";

        const video = await prisma.video.create({
          data: {
            userId: user.id,
            title: day.topic || `Day ${day.day} Content`,
            description: day.whyThisWorks || "",
            script,
            model: "kling_2.6",
            contentType: day.contentType || "talking_head_15",
            status: "queued",
            photoId: photo?.id || null,
            voiceId: voice?.id || null,
          },
        });

        // Create schedule record if platform specified
        if (day.platform && day.date) {
          const scheduledAt = day.bestPostingTime
            ? new Date(`${day.date}T${parseTime(day.bestPostingTime)}`)
            : new Date(`${day.date}T09:00:00`);

          await prisma.schedule.create({
            data: {
              videoId: video.id,
              userId: user.id,
              platform: day.platform,
              scheduledAt,
              status: "pending_generation",
            },
          }).catch(() => {
            // Schedule has unique videoId constraint — skip if duplicate
          });
        }

        videos.push({
          id: video.id,
          title: video.title,
          day: day.day,
          platform: day.platform,
          contentType: video.contentType,
          status: video.status,
        });
      }

      // Kick off pipeline for each video in the background
      // Process 2 at a time to respect API rate limits
      queuePipelineJobs(videos.map((v) => v.id), user.id).catch((e) => {
        console.error("[generate/batch] Pipeline queue failed:", e);
      });

      return NextResponse.json({
        batchId: `batch_${sessionId}_${Date.now()}`,
        count: videos.length,
        videos,
        message: `${videos.length} videos queued for generation. Check /dashboard/content for progress.`,
      });
    }

    // ── Mode B: Legacy template-based generation ─────────────
    const count = body.count;
    if (!count || ![3, 5, 7, 14].includes(count)) {
      return NextResponse.json(
        { error: "Provide sessionId for calendar generation, or count (3, 5, 7, 14) for templates" },
        { status: 400 }
      );
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { industry: true },
    });

    const templates = getTemplates(userRecord?.industry || "other");
    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(templates[i % templates.length]);
    }

    const videos = [];
    for (const template of selected) {
      const video = await prisma.video.create({
        data: {
          userId: user.id,
          title: template.label,
          description: template.prompt,
          script: template.prompt,
          model: template.model,
          contentType: template.contentType,
          status: "draft",
        },
      });
      videos.push({
        id: video.id,
        title: video.title,
        model: video.model,
        contentType: video.contentType,
        status: video.status,
      });
    }

    return NextResponse.json({
      batchId: `batch_${Date.now()}`,
      count: videos.length,
      videos,
    });
  } catch (err) {
    console.error("[POST /api/generate/batch]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Pipeline Queue ───────────────────────────────────────────

async function queuePipelineJobs(videoIds: string[], userId: string) {
  // Process 2 videos at a time
  const CONCURRENCY = 2;

  for (let i = 0; i < videoIds.length; i += CONCURRENCY) {
    const batch = videoIds.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (videoId) => {
        try {
          // Update status to generating
          await prisma.video.update({
            where: { id: videoId },
            data: { status: "generating" },
          });

          // Trigger the pipeline via the internal generate/process endpoint
          await fetch(
            `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/generate/process`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ videoId, userId }),
            }
          ).catch(() => {
            // If internal fetch fails, mark as failed
            prisma.video.update({
              where: { id: videoId },
              data: { status: "failed" },
            }).catch(() => {});
          });
        } catch (e) {
          console.error(`[queuePipelineJobs] Failed for ${videoId}:`, e);
          await prisma.video.update({
            where: { id: videoId },
            data: { status: "failed" },
          }).catch(() => {});
        }
      })
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function parseTime(timeStr: string): string {
  // Parse "9:00 AM", "Tuesday 9:00 AM", etc. into "HH:MM:00"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return "09:00:00";

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const ampm = match[3]?.toUpperCase();

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
}

function getTemplates(industry: string) {
  const map: Record<string, { label: string; prompt: string; model: string; contentType: string }[]> = {
    real_estate: [
      { label: "Market Update", prompt: "Share this week's local market stats and pricing trends", model: "kling_2.6", contentType: "talking_head_15" },
      { label: "Quick Tip", prompt: "Share a quick tip for buyers or sellers", model: "seedance_2.0", contentType: "quick_tip_8" },
      { label: "Neighborhood Guide", prompt: "Highlight a local neighborhood", model: "kling_2.6", contentType: "educational_30" },
    ],
    legal: [
      { label: "Know Your Rights", prompt: "Explain a common legal right", model: "kling_2.6", contentType: "talking_head_15" },
      { label: "Legal Tip", prompt: "Share a practical legal tip", model: "seedance_2.0", contentType: "quick_tip_8" },
      { label: "Case Study", prompt: "Share an anonymized case result", model: "kling_2.6", contentType: "educational_30" },
    ],
    default: [
      { label: "Brand Introduction", prompt: "Create a personal brand introduction", model: "kling_2.6", contentType: "talking_head_15" },
      { label: "Quick Tip", prompt: "Share your expertise", model: "seedance_2.0", contentType: "quick_tip_8" },
      { label: "Industry Update", prompt: "Share the latest trends", model: "kling_2.6", contentType: "educational_30" },
    ],
  };
  return map[industry] || map.default;
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { analyzeReferenceUrl } from "@/lib/reference-analyzer";

/**
 * POST /api/templates — Analyze a social media video URL and save as a reusable template.
 * GET /api/templates — List all templates for the current user.
 */

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { url, name, category } = body;

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    // Analyze the video
    const result = await analyzeReferenceUrl(url);

    // Auto-detect category from analysis
    const detectedCategory = category ||
      (result.analysis.style.overall.includes("podcast") ? "podcast" :
       result.analysis.style.overall.includes("ugc") ? "ugc_hook" :
       result.analysis.hookTechnique ? "ugc_hook" : "broll");

    // Auto-generate name from analysis if not provided
    const templateName = name ||
      `${result.analysis.subject.gender || "Person"} ${result.analysis.setting.location || "video"} — ${result.analysis.style.overall}`;

    // Save to database
    const template = await prisma.videoTemplate.create({
      data: {
        userId: user.id,
        name: templateName,
        sourceUrl: url,
        thumbnailUrl: result.thumbnailUrl,
        analysisJson: JSON.stringify(result.analysis),
        transcript: result.analysis.transcript || null,
        duration: result.analysis.pacing.totalDuration || null,
        category: detectedCategory,
      },
    });

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        sourceUrl: template.sourceUrl,
        thumbnailUrl: template.thumbnailUrl,
        category: template.category,
        duration: template.duration,
        analysis: result.analysis,
        createdAt: template.createdAt,
      },
    }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/templates] Failed:", e);
    return NextResponse.json(
      { error: e.message || "Failed to analyze video" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  const templates = await prisma.videoTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    templates.map((t) => ({
      id: t.id,
      name: t.name,
      sourceUrl: t.sourceUrl,
      thumbnailUrl: t.thumbnailUrl,
      category: t.category,
      duration: t.duration,
      createdAt: t.createdAt,
    }))
  );
}

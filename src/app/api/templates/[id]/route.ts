import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

/**
 * GET /api/templates/[id] — Get a single template with full analysis.
 * DELETE /api/templates/[id] — Remove a template.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const template = await prisma.videoTemplate.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  let analysis = null;
  try {
    analysis = JSON.parse(template.analysisJson);
  } catch {}

  return NextResponse.json({
    id: template.id,
    name: template.name,
    sourceUrl: template.sourceUrl,
    thumbnailUrl: template.thumbnailUrl,
    category: template.category,
    duration: template.duration,
    transcript: template.transcript,
    analysis,
    createdAt: template.createdAt,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const template = await prisma.videoTemplate.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  await prisma.videoTemplate.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}

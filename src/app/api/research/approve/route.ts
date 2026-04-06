import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

/**
 * POST /api/research/approve
 *
 * Persists approved day indices for a research session.
 * Called when user toggles approve/reject on calendar items,
 * and on "Launch my content team" to save final state.
 *
 * Body: { sessionId: string, approvedDays: number[] }
 */
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { sessionId, approvedDays } = await req.json();

  if (!sessionId || !Array.isArray(approvedDays)) {
    return NextResponse.json(
      { error: "sessionId and approvedDays[] are required" },
      { status: 400 }
    );
  }

  // Verify ownership
  const session = await prisma.researchSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { approvedDays: JSON.stringify(approvedDays) },
  });

  return NextResponse.json({ ok: true, count: approvedDays.length });
}

/**
 * GET /api/research/approve?sessionId=xxx
 *
 * Returns the currently approved day indices.
 */
export async function GET(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const session = await prisma.researchSession.findFirst({
    where: { id: sessionId, userId: user.id },
    select: { approvedDays: true, calendarResult: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const approvedDays: number[] = session.approvedDays
    ? JSON.parse(session.approvedDays)
    : [];

  return NextResponse.json({ approvedDays });
}

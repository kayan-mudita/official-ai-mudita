import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

/**
 * POST /api/onboarding/save-progress
 * Saves partial onboarding progress so the user can resume later (e.g. after skipping paywall).
 */
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { photoUrl, characterSheetId, voiceId, step } = body;

    if (!step || !["photo", "character", "voice", "paywall"].includes(step)) {
      return NextResponse.json(
        { error: "Invalid or missing step" },
        { status: 400 }
      );
    }

    const progress = JSON.stringify({
      photoUrl: photoUrl || null,
      characterSheetId: characterSheetId || null,
      voiceId: voiceId || null,
      step,
      savedAt: new Date().toISOString(),
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingProgress: progress },
    });

    return NextResponse.json({ success: true, progress: JSON.parse(progress) });
  } catch (err: any) {
    console.error("Failed to save onboarding progress:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding progress" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/save-progress
 * Returns the saved onboarding progress so the onboarding page can resume.
 */
export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingProgress: true, onboarded: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.onboarded) {
      return NextResponse.json({
        progress: null,
        onboarded: true,
        message: "User has already completed onboarding",
      });
    }

    const progress = dbUser.onboardingProgress
      ? JSON.parse(dbUser.onboardingProgress)
      : null;

    return NextResponse.json({ progress, onboarded: false });
  } catch (err: any) {
    console.error("Failed to fetch onboarding progress:", err);
    return NextResponse.json(
      { error: "Failed to fetch onboarding progress" },
      { status: 500 }
    );
  }
}

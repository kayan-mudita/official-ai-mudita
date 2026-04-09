import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

interface ActivationBreakdown {
  photos: boolean;
  voice: boolean;
  brand: boolean;
  firstVideo: boolean;
  threeVideos: boolean;
  socialAccounts: boolean;
  published: boolean;
}

const POINTS: Record<keyof ActivationBreakdown, number> = {
  photos: 20,
  voice: 20,
  brand: 15,
  firstVideo: 15,
  threeVideos: 10,
  socialAccounts: 10,
  published: 10,
};

const MAX_SCORE = Object.values(POINTS).reduce((a, b) => a + b, 0); // 100

function getLevel(score: number): "activated" | "partial" | "dormant" {
  if (score >= 70) return "activated";
  if (score >= 31) return "partial";
  return "dormant";
}

function getNextStep(breakdown: ActivationBreakdown): string {
  // Suggest the highest-value incomplete step first
  if (!breakdown.photos) return "Upload your photos";
  if (!breakdown.voice) return "Clone your voice";
  if (!breakdown.brand) return "Complete your brand profile";
  if (!breakdown.firstVideo) return "Generate your first video";
  if (!breakdown.socialAccounts) return "Connect a social account";
  if (!breakdown.threeVideos) return "Generate 3 videos to unlock bonus points";
  if (!breakdown.published) return "Publish your first video";
  return "You're fully activated!";
}

/**
 * GET /api/activation
 * Computes the user's activation score based on platform usage.
 */
export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    // Run all queries in parallel for performance
    const [
      photoCount,
      voiceCount,
      brandProfile,
      videoCount,
      socialAccountCount,
      publishedCount,
    ] = await Promise.all([
      prisma.photo.count({ where: { userId: user.id } }),
      prisma.voiceSample.count({ where: { userId: user.id } }),
      prisma.brandProfile.findUnique({ where: { userId: user.id }, select: { id: true } }),
      prisma.video.count({ where: { userId: user.id } }),
      prisma.socialAccount.count({ where: { userId: user.id } }),
      prisma.schedule.count({ where: { userId: user.id, status: "published" } }),
    ]);

    const breakdown: ActivationBreakdown = {
      photos: photoCount > 0,
      voice: voiceCount > 0,
      brand: brandProfile !== null,
      firstVideo: videoCount >= 1,
      threeVideos: videoCount >= 3,
      socialAccounts: socialAccountCount > 0,
      published: publishedCount > 0,
    };

    let score = 0;
    for (const [key, achieved] of Object.entries(breakdown)) {
      if (achieved) {
        score += POINTS[key as keyof ActivationBreakdown];
      }
    }

    return NextResponse.json({
      score,
      maxScore: MAX_SCORE,
      level: getLevel(score),
      breakdown,
      nextStep: getNextStep(breakdown),
    });
  } catch (err: any) {
    console.error("Failed to compute activation score:", err);
    return NextResponse.json(
      { error: "Failed to compute activation score" },
      { status: 500 }
    );
  }
}

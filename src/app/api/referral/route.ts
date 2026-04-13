import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-helpers";
import { siteUrl } from "@/lib/site-config";

/**
 * GET /api/referral
 *
 * Returns the user's referral code (derived from their user ID) and referral stats.
 * The referral code is a short hash of the user ID for easy sharing.
 */
function generateReferralCode(userId: string): string {
  // Create a short, URL-safe code from the user ID
  // Use the first 8 chars of the UUID (without dashes) for brevity
  return userId.replace(/-/g, "").substring(0, 8).toUpperCase();
}

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!dbUser) {
      return errorResponse("User not found", 404);
    }

    const referralCode = generateReferralCode(dbUser.id);

    // In a full implementation, these would query a Referral model.
    // For now, return placeholder stats that the UI can display.
    const stats = {
      invited: 0,
      signedUp: 0,
      active: 0,
      rewardMonths: 0,
    };

    return NextResponse.json({
      referralCode,
      referralLink: `${siteUrl}/ref/${referralCode}`,
      stats,
      reward: {
        give: "1 month free",
        get: "1 month free",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch referral data";
    console.error("Referral fetch error:", err);
    return errorResponse(message, 500);
  }
}

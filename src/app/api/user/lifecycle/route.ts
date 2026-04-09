import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

type LifecycleState =
  | "new"
  | "activated"
  | "loyal"
  | "dormant"
  | "inactive"
  | "churned";

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const now = new Date();

    // Fetch the full user record (requireAuth returns a slim session object)
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        plan: true,
        createdAt: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Last video created by the user
    const lastVideo = await prisma.video.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    // Last lifecycle event for the user
    const lastEvent = await prisma.lifecycleEvent.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    // Compute days since signup
    const daysSinceSignup = daysBetween(fullUser.createdAt, now);

    // Compute days since last activity (last video or last lifecycle event)
    const lastActivityDate = mostRecent(
      lastVideo?.createdAt,
      lastEvent?.createdAt
    );
    const daysSinceLastLogin = lastActivityDate
      ? daysBetween(lastActivityDate, now)
      : daysSinceSignup;

    // Subscription months: how long they've been subscribed
    const subscriptionMonths = getSubscriptionMonths(fullUser.createdAt, now);

    // Compute flags
    const isLoyal =
      fullUser.stripeCurrentPeriodEnd !== null &&
      fullUser.plan !== "free" &&
      subscriptionMonths >= 3;

    const isDormant = daysSinceLastLogin >= 14;
    const isInactive = daysSinceLastLogin >= 90;

    const isChurned =
      fullUser.plan === "free" &&
      fullUser.stripeSubscriptionId !== null;

    // State priority: churned > inactive > dormant > loyal > activated > new
    let state: LifecycleState;
    if (isChurned) {
      state = "churned";
    } else if (isInactive) {
      state = "inactive";
    } else if (isDormant) {
      state = "dormant";
    } else if (isLoyal) {
      state = "loyal";
    } else if (daysSinceSignup > 0 || lastVideo || lastEvent) {
      state = "activated";
    } else {
      state = "new";
    }

    return NextResponse.json({
      state,
      daysSinceLastLogin,
      daysSinceSignup,
      subscriptionMonths,
      lastVideoDate: lastVideo?.createdAt?.toISOString().split("T")[0] ?? null,
      flags: {
        isLoyal,
        isDormant,
        isInactive,
        isChurned,
      },
    });
  } catch (err) {
    console.error("[GET /api/user/lifecycle]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Returns the number of full days between two dates. */
function daysBetween(earlier: Date, later: Date): number {
  const ms = later.getTime() - earlier.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Returns the more recent of two optional dates, or undefined if both are null. */
function mostRecent(
  a: Date | null | undefined,
  b: Date | null | undefined
): Date | undefined {
  if (!a && !b) return undefined;
  if (!a) return b!;
  if (!b) return a;
  return a > b ? a : b;
}

/** Returns the number of whole months between signup and now. */
function getSubscriptionMonths(createdAt: Date, now: Date): number {
  const months =
    (now.getFullYear() - createdAt.getFullYear()) * 12 +
    (now.getMonth() - createdAt.getMonth());
  // If we haven't reached the same day-of-month yet, subtract 1
  if (now.getDate() < createdAt.getDate()) {
    return Math.max(0, months - 1);
  }
  return Math.max(0, months);
}

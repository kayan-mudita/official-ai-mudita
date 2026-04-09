import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const VALID_EVENTS = [
  "signup",
  "first_photo",
  "first_video",
  "first_publish",
  "day_7",
  "day_30",
  // Onboarding funnel — step transitions
  "onboarding_step_photo",
  "onboarding_step_character",
  "onboarding_step_voice",
  "onboarding_step_paywall",
  // Onboarding funnel — actions
  "onboarding_photo_captured",
  "onboarding_character_selected",
  "onboarding_voice_cloned",
  "onboarding_voice_skipped",
  "onboarding_paywall_viewed",
  "onboarding_trial_started",
  "onboarding_skipped",
  // Onboarding failure paths
  "onboarding_camera_denied",
  "onboarding_photo_upload_failed",
  "onboarding_character_rejected",    // user clicked "Not feeling it" / regenerate
  "onboarding_checkout_abandoned",    // started checkout but didn't complete
  // Strategy
  "onboarding_research_launched",
  "onboarding_strategy_approved",
  "onboarding_strategy_reviewed",
  // Post-checkout
  "onboarding_industry_selected",
  "onboarding_industry_skipped",
] as const;

type EventName = (typeof VALID_EVENTS)[number];

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    let body: { event: string; metadata?: Record<string, unknown> };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.event || !VALID_EVENTS.includes(body.event as EventName)) {
      return NextResponse.json(
        {
          error: `Invalid event. Must be one of: ${VALID_EVENTS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check for duplicate events (some events should only fire once)
    const uniqueEvents: EventName[] = [
      "signup",
      "first_photo",
      "first_video",
      "first_publish",
      "onboarding_photo_captured",
      "onboarding_character_selected",
      "onboarding_paywall_viewed",
      "onboarding_trial_started",
      "onboarding_skipped",
      "onboarding_camera_denied",
      "onboarding_character_rejected",
    ];
    if (uniqueEvents.includes(body.event as EventName)) {
      const existing = await prisma.lifecycleEvent.findFirst({
        where: {
          userId: user.id,
          event: body.event,
        },
      });
      if (existing) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          message: `Event "${body.event}" already recorded`,
        });
      }
    }

    const lifecycleEvent = await prisma.lifecycleEvent.create({
      data: {
        userId: user.id,
        event: body.event,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    });

    return NextResponse.json({
      success: true,
      event: lifecycleEvent,
    });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const events = await prisma.lifecycleEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/health
 *
 * Production health check endpoint. Verifies all critical services
 * are configured and reachable. Returns detailed status for each.
 *
 * No auth required — designed for uptime monitors (Vercel, UptimeRobot, etc).
 */

interface ServiceCheck {
  status: "ok" | "error" | "not_configured";
  message?: string;
}

export async function GET() {
  const checks: Record<string, ServiceCheck> = {};
  let healthy = true;

  // 1. Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (e: any) {
    checks.database = { status: "error", message: e.message?.slice(0, 100) };
    healthy = false;
  }

  // 2. Auth
  checks.auth = process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET !== "your-nextauth-secret-here"
    ? { status: "ok" }
    : { status: "not_configured", message: "NEXTAUTH_SECRET is missing or placeholder" };
  if (checks.auth.status !== "ok") healthy = false;

  // 3. Stripe
  checks.stripe = process.env.STRIPE_SECRET_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "STRIPE_SECRET_KEY missing" };

  // 4. FAL (video generation)
  checks.fal = process.env.FAL_API_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "FAL_API_KEY missing — video generation won't work" };
  if (checks.fal.status !== "ok") healthy = false;

  // 5. Supabase Storage
  checks.storage = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "SUPABASE_URL or SUPABASE_ANON_KEY missing" };

  // 6. Email (SMTP)
  checks.email = process.env.SMTP_HOST && process.env.SMTP_PASS
    ? { status: "ok" }
    : { status: "not_configured", message: "SMTP not configured" };

  // 7. PostBridge (publishing)
  checks.postbridge = process.env.POST_BRIDGE_API_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "POST_BRIDGE_API_KEY missing — publishing won't work" };

  // 8. AI Agents
  checks.gemini = process.env.GOOGLE_AI_STUDIO_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "GOOGLE_AI_STUDIO_KEY missing" };

  checks.openrouter = process.env.OPENROUTER_API_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "OPENROUTER_API_KEY missing — research agents won't work" };

  // 9. Voice
  checks.elevenlabs = process.env.ELEVENLABS_API_KEY
    ? { status: "ok" }
    : { status: "not_configured", message: "ELEVENLABS_API_KEY missing — voice cloning won't work" };

  // 10. Admin
  checks.admin = process.env.ADMIN_EMAILS
    ? { status: "ok" }
    : { status: "not_configured", message: "ADMIN_EMAILS not set — admin routes will 403 for everyone" };

  // 11. Cron
  checks.cron = process.env.CRON_SECRET
    ? { status: "ok" }
    : { status: "not_configured", message: "CRON_SECRET missing — scheduled posts won't auto-publish" };

  // Summary
  const configuredCount = Object.values(checks).filter((c) => c.status === "ok").length;
  const totalCount = Object.keys(checks).length;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      configured: `${configuredCount}/${totalCount}`,
      services: checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}

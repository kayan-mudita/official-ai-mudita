import { NextRequest, NextResponse } from "next/server";
import { requireAuth, errorResponse } from "@/lib/api-helpers";
import { siteUrl } from "@/lib/site-config";

/**
 * POST /api/team/invite
 *
 * Generates an invite link for a new team member.
 * For the initial release this is UI-scaffolding only --
 * full invite-accept flow will be wired up in a later phase.
 */
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    let body: { email?: string; role?: string };
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON", 400);
    }

    const { email, role } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return errorResponse("Valid email is required", 400);
    }

    const validRoles = ["admin", "editor", "viewer"];
    const memberRole = validRoles.includes(role || "") ? role : "editor";

    // Generate a placeholder invite token
    const inviteToken = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const inviteLink = `${siteUrl}/invite/${inviteToken}`;

    return NextResponse.json({
      success: true,
      invite: {
        email,
        role: memberRole,
        inviteLink,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create invite";
    console.error("Team invite error:", err);
    return errorResponse(message, 500);
  }
}

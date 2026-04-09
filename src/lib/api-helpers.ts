import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import prisma from "./prisma";

/**
 * Dev bypass is ONLY active when explicitly enabled via env var,
 * not just by being in non-production mode. This prevents accidental
 * auth bypass in staging/preview environments.
 */
const DEV_BYPASS_AUTH = process.env.DEV_AUTH_BYPASS === "true";

export async function getSession() {
  if (DEV_BYPASS_AUTH) {
    const devUser = await getOrCreateDevUser();
    return { user: devUser };
  }
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }
  return { error: null, user: session.user as any };
}

/**
 * Require admin role. Checks ADMIN_EMAILS env var (comma-separated).
 * Returns 403 if the authenticated user's email is not in the admin list.
 */
export async function requireAdmin() {
  const { error, user } = await requireAuth();
  if (error) return { error, user: null };

  const adminEmails = process.env.ADMIN_EMAILS ?? "";
  if (!adminEmails) {
    return {
      error: NextResponse.json({ error: "No admin emails configured" }, { status: 403 }),
      user: null,
    };
  }

  const list = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  if (!list.includes(user.email?.toLowerCase())) {
    return {
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}

async function getOrCreateDevUser() {
  const email = "dev@officialai.local";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: "dev-bypass",
        firstName: "Dev",
        lastName: "User",
        industry: "technology",
        plan: "authority",
        onboarded: true,
        emailVerified: true,
      },
    });
  }
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    industry: user.industry,
    plan: user.plan,
    onboarded: user.onboarded,
  };
}

export function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

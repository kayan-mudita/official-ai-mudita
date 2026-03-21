import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import prisma from "./prisma";

const DEV_BYPASS_AUTH = process.env.NODE_ENV !== "production";

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

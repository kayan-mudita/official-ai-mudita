import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { validateBody } from "@/lib/validate";
import { authLimiter, RateLimitError } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    try {
      await authLimiter.check(5, ip);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return NextResponse.json(
          { error: "Too many signup attempts. Please try again later." },
          { status: 429, headers: { "Retry-After": String(err.retryAfter) } }
        );
      }
    }

    let body: unknown;
    try {
      const buf = await req.arrayBuffer();
      const text = new TextDecoder().decode(buf);
      body = JSON.parse(text);
    } catch (parseErr) {
      console.error("[signup] Body parse error:", parseErr, "content-type:", req.headers.get("content-type"));
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const validation = validateBody(signupSchema, body);
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error, fieldErrors: validation.fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, industry, company } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        industry: industry || "other",
        company,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("[POST /api/auth/signup] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

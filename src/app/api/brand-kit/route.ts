import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

/**
 * GET /api/brand-kit
 *
 * Returns the user's brand kit settings.
 */
export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const kit = await prisma.brandKit.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(kit || null);
  } catch (err) {
    console.error("[GET /api/brand-kit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/brand-kit
 *
 * Creates or updates the user's brand kit settings.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { logoUrl, primaryColor, secondaryColor, introStyle, outroTemplate } = body as {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      introStyle?: string;
      outroTemplate?: string;
    };

    // Validate color format (basic hex check)
    if (primaryColor && !/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      return NextResponse.json({ error: "Invalid primary color format. Use hex (e.g. #00749e)" }, { status: 400 });
    }
    if (secondaryColor && !/^#[0-9a-fA-F]{6}$/.test(secondaryColor)) {
      return NextResponse.json({ error: "Invalid secondary color format. Use hex (e.g. #81009e)" }, { status: 400 });
    }

    // Validate introStyle
    const validIntroStyles = ["professional", "casual", "bold"];
    if (introStyle && !validIntroStyles.includes(introStyle)) {
      return NextResponse.json({ error: "introStyle must be one of: professional, casual, bold" }, { status: 400 });
    }

    // Validate outroTemplate
    const validOutroTemplates = ["standard", "minimal", "animated"];
    if (outroTemplate && !validOutroTemplates.includes(outroTemplate)) {
      return NextResponse.json({ error: "outroTemplate must be one of: standard, minimal, animated" }, { status: 400 });
    }

    const kit = await prisma.brandKit.upsert({
      where: { userId: user.id },
      update: {
        logoUrl: logoUrl !== undefined ? (logoUrl || null) : undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        introStyle: introStyle || undefined,
        outroTemplate: outroTemplate || undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || "#00749e",
        secondaryColor: secondaryColor || "#81009e",
        introStyle: introStyle || "professional",
        outroTemplate: outroTemplate || "standard",
      },
    });

    return NextResponse.json(kit);
  } catch (err) {
    console.error("[PATCH /api/brand-kit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { generateCharacterSheets } from "@/lib/character-sheet";

export async function POST(req: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    let body: { photoUrls?: string[] };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // If no photo URLs provided, look up the user's uploaded photos
    let photoUrls = body.photoUrls || [];

    if (!photoUrls.length) {
      const photos = await prisma.photo.findMany({
        where: { userId: user.id },
        orderBy: { isPrimary: "desc" },
      });
      photoUrls = photos.map((p) => p.url).filter((url) => url && !url.startsWith("/uploads/"));
    }

    if (!photoUrls.length) {
      return NextResponse.json(
        { error: "No photos found. Upload at least one photo first." },
        { status: 400 }
      );
    }

    const result = await generateCharacterSheets(user.id, photoUrls);

    return NextResponse.json({
      poses: {
        id: result.poses.characterSheetId,
        compositeUrl: result.poses.compositeUrl,
        status: result.poses.status,
        imageCount: result.poses.images.length,
      },
      threeD: {
        id: result.threeD.characterSheetId,
        status: result.threeD.status,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/character-sheet]", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate character sheet" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const sheets = await prisma.characterSheet.findMany({
      where: { userId: user.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sheets);
  } catch (err) {
    console.error("[GET /api/character-sheet]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

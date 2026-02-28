import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

export async function POST() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboarded: true },
    });

    return NextResponse.json({ success: true, onboarded: true });
  } catch (err: any) {
    console.error("Failed to complete onboarding:", err);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

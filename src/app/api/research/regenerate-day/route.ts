import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import type { CalendarDay } from "@/lib/research-agents";

const GOOGLE_AI_STUDIO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.5-flash";

/**
 * POST /api/research/regenerate-day
 *
 * Regenerates a single day in the content calendar.
 * Uses the existing research context (business + trends + competitors)
 * to produce a fresh topic/hook/script for the specified day index.
 *
 * Body: { sessionId: string, dayIndex: number }
 */
export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { sessionId, dayIndex } = await req.json();

  if (!sessionId || typeof dayIndex !== "number") {
    return NextResponse.json(
      { error: "sessionId and dayIndex are required" },
      { status: 400 }
    );
  }

  const session = await prisma.researchSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (!session.calendarResult) {
    return NextResponse.json({ error: "No calendar to regenerate from" }, { status: 400 });
  }

  const calendar: CalendarDay[] = JSON.parse(session.calendarResult);
  if (dayIndex < 0 || dayIndex >= calendar.length) {
    return NextResponse.json({ error: "dayIndex out of range" }, { status: 400 });
  }

  const targetDay = calendar[dayIndex];

  // Build context from research results
  const business = session.businessResult ? JSON.parse(session.businessResult) : null;
  const trends = session.trendsResult ? JSON.parse(session.trendsResult) : null;
  const competitors = session.competitorResult ? JSON.parse(session.competitorResult) : null;

  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const systemPrompt = `You are a content strategist. Generate a DIFFERENT video content idea for a specific day. The previous idea was rejected, so produce something fresh and distinct.

Return JSON matching this exact schema:
{
  "day": ${targetDay.day},
  "date": "${targetDay.date}",
  "topic": "new topic title",
  "hook": "new opening hook line",
  "scriptOutline": "3-4 sentence script outline",
  "platform": "instagram | linkedin | tiktok | youtube",
  "contentType": "quick_tip_8 | talking_head_15 | educational_30 | testimonial_15",
  "category": "Education | Tips | Personal Brand | Social Proof | Trending",
  "whyThisWorks": "1 sentence strategic reasoning"
}

Requirements:
- Must be DIFFERENT from the rejected topic: "${targetDay.topic}"
- Must be a different category or angle
- Hook must be specific and attention-grabbing`;

  const userPrompt = `Generate a new content idea for Day ${targetDay.day} (${targetDay.date}).

The REJECTED idea was: "${targetDay.topic}" (${targetDay.category}) — "${targetDay.hook}"

Business context: ${business?.summary || session.industry}
${trends ? `Trending topics: ${trends.trending?.map((t: { topic: string }) => t.topic).join(", ")}` : ""}
${competitors ? `Competitor gaps: ${competitors.gaps?.join("; ")}` : ""}

Generate something fresh and different.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(
      `${GOOGLE_AI_STUDIO_URL}/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.9, // Higher temp for more variety
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let newDay: CalendarDay;
    try {
      newDay = JSON.parse(raw);
      // Ensure required fields
      if (!newDay.topic || !newDay.hook) throw new Error("Missing fields");
      // Preserve day/date from original
      newDay.day = targetDay.day;
      newDay.date = targetDay.date;
    } catch {
      return NextResponse.json({ error: "Failed to generate valid content" }, { status: 500 });
    }

    // Update the calendar in the session
    calendar[dayIndex] = newDay;
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { calendarResult: JSON.stringify(calendar) },
    });

    return NextResponse.json({ day: newDay });
  } catch (e: any) {
    if (e.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    console.error("[regenerate-day] Failed:", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}

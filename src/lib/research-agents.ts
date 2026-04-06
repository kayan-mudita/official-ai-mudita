/**
 * Research Agents — Post-Payment Strategy Generation
 *
 * Four parallel AI agents that run after a user provides their
 * industry + company name (+ optional website URL).
 *
 * Agent 1: Business Intelligence — scrapes/researches the company
 * Agent 2: Industry Trends — finds trending content topics
 * Agent 3: Competitor Scan — identifies gaps in competitor content
 * Agent 4: Calendar Generation — builds 30-day plan from agents 1-3
 *
 * All agents use Gemini 2.5 Flash via the Google AI Studio REST API,
 * matching the pattern used throughout the codebase.
 */

import prisma from "@/lib/prisma";

const GOOGLE_AI_STUDIO_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.5-flash";

// ─── Types ────────────────────────────────────────────────────────

export interface BusinessResult {
  companyName: string;
  industry: string;
  services: string[];
  targetAudience: string;
  geography: string;
  toneOfVoice: string;
  differentiators: string[];
  summary: string;
}

export interface TrendsResult {
  trending: { topic: string; whyNow: string }[];
  evergreen: { topic: string; angle: string }[];
  seasonal: { topic: string; timing: string }[];
  platformAngles: { platform: string; format: string; tip: string }[];
}

export interface CompetitorResult {
  competitors: {
    name: string;
    platforms: string[];
    frequency: string;
    topTopics: string[];
  }[];
  gaps: string[];
  opportunities: string[];
}

export interface CalendarDay {
  day: number;
  date: string;
  topic: string;
  hook: string;
  scriptOutline: string;
  platform: string;
  contentType: string;
  category: string;
  whyThisWorks: string;
}

// ─── Gemini Helpers ───────────────────────────────────────────────

interface GeminiOptions {
  /** Enable Google Search grounding for real-time web research */
  useSearchGrounding?: boolean;
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_STUDIO_KEY not set");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  // When search grounding is enabled, responseMimeType: "application/json"
  // may conflict with grounding. We drop JSON mode and parse manually.
  const useGrounding = options.useSearchGrounding === true;

  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      ...(useGrounding ? {} : { responseMimeType: "application/json" }),
    },
  };

  if (useGrounding) {
    body.tools = [{ google_search: {} }];
  }

  try {
    const res = await fetch(
      `${GOOGLE_AI_STUDIO_URL}/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini ${res.status}: ${err}`);
    }

    const data = await res.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // When grounding is used, response is plain text — extract JSON block
    if (useGrounding && raw.includes("{")) {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) raw = jsonMatch[0];
    }

    // Validate JSON is parseable before returning
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      console.error("[callGemini] Gemini returned unparseable JSON, using empty fallback");
      return "{}";
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Agent 1: Business Intelligence ───────────────────────────────

async function runBusinessAgent(
  sessionId: string,
  input: { companyName: string; industry: string; websiteUrl?: string }
): Promise<BusinessResult> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { businessStatus: "processing" },
  });

  try {
    const systemPrompt = `You are a business research analyst. Given a company name and industry, research and describe the business. Return JSON matching this exact schema:
{
  "companyName": "string",
  "industry": "string",
  "services": ["string array of 3-5 core services"],
  "targetAudience": "who they serve",
  "geography": "market/city they serve or 'National'",
  "toneOfVoice": "professional | conversational | authoritative | warm",
  "differentiators": ["string array of 2-3 key differentiators"],
  "summary": "2-3 sentence positioning summary"
}
Be specific and practical. If you don't have enough info, make educated inferences based on the industry.`;

    const userPrompt = input.websiteUrl
      ? `Research this business:\n- Company: ${input.companyName}\n- Industry: ${input.industry}\n- Website: ${input.websiteUrl}\n\nUse the website URL to infer services, positioning, audience, and tone.`
      : `Research this business:\n- Company: ${input.companyName}\n- Industry: ${input.industry}\n\nMake educated inferences about their services, audience, and positioning based on the company name and industry.`;

    // Use search grounding for real web research when possible
    const raw = await callGemini(systemPrompt, userPrompt, {
      useSearchGrounding: true,
    });
    const result: BusinessResult = JSON.parse(raw);

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { businessStatus: "complete", businessResult: JSON.stringify(result) },
    });

    return result;
  } catch (e) {
    console.error("[BusinessAgent] Failed:", e);
    // Return sensible defaults on failure
    const fallback: BusinessResult = {
      companyName: input.companyName,
      industry: input.industry,
      services: [`${input.industry} services`],
      targetAudience: "Local clients and prospects",
      geography: "Local market",
      toneOfVoice: "professional",
      differentiators: ["Personalized service", "Industry expertise"],
      summary: `${input.companyName} is a ${input.industry} professional serving local clients.`,
    };
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { businessStatus: "complete", businessResult: JSON.stringify(fallback) },
    });
    return fallback;
  }
}

// ─── Agent 2: Industry Trends ─────────────────────────────────────

async function runTrendsAgent(
  sessionId: string,
  input: { industry: string }
): Promise<TrendsResult> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { trendsStatus: "processing" },
  });

  try {
    const systemPrompt = `You are a social media content strategist specializing in professional services. Return JSON matching this exact schema:
{
  "trending": [{ "topic": "string", "whyNow": "string" }],
  "evergreen": [{ "topic": "string", "angle": "string" }],
  "seasonal": [{ "topic": "string", "timing": "string" }],
  "platformAngles": [{ "platform": "string", "format": "string", "tip": "string" }]
}
Provide 5-7 items for trending, 5-7 for evergreen, 3-4 seasonal, and one entry each for instagram, tiktok, linkedin, youtube.`;

    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();

    const userPrompt = `What are the top content topics for ${input.industry} professionals on social media right now (${monthName} ${year})?

Include:
- Trending topics this month (what's hot right now)
- Evergreen topics that always perform well
- Seasonal angles for ${monthName} ${year}
- Platform-specific format tips (Reels vs LinkedIn vs TikTok vs YouTube Shorts)`;

    const raw = await callGemini(systemPrompt, userPrompt, {
      useSearchGrounding: true,
    });
    const result: TrendsResult = JSON.parse(raw);

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { trendsStatus: "complete", trendsResult: JSON.stringify(result) },
    });

    return result;
  } catch (e) {
    console.error("[TrendsAgent] Failed:", e);
    const fallback: TrendsResult = {
      trending: [{ topic: "AI in your industry", whyNow: "AI adoption is accelerating" }],
      evergreen: [{ topic: "Client success stories", angle: "Build trust through results" }],
      seasonal: [{ topic: "Q2 planning", timing: "Spring" }],
      platformAngles: [
        { platform: "instagram", format: "Reels 15-30s", tip: "Hook in first 2 seconds" },
        { platform: "linkedin", format: "Talking head", tip: "Professional tone, no hashtags" },
        { platform: "tiktok", format: "Quick tips 8-15s", tip: "Casual, trending audio" },
        { platform: "youtube", format: "Shorts 30-60s", tip: "Educational, searchable titles" },
      ],
    };
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { trendsStatus: "complete", trendsResult: JSON.stringify(fallback) },
    });
    return fallback;
  }
}

// ─── Agent 3: Competitor Content Scan ─────────────────────────────

async function runCompetitorAgent(
  sessionId: string,
  input: { industry: string; companyName: string }
): Promise<CompetitorResult> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { competitorStatus: "processing" },
  });

  try {
    const systemPrompt = `You are a competitive intelligence analyst for professional services content strategy. Return JSON matching this exact schema:
{
  "competitors": [{ "name": "string", "platforms": ["string"], "frequency": "string", "topTopics": ["string"] }],
  "gaps": ["string array of 3-5 content gaps competitors are NOT covering"],
  "opportunities": ["string array of 3-5 content opportunities for differentiation"]
}
Provide 3-5 realistic competitor examples. Focus on content strategy gaps and opportunities.`;

    const userPrompt = `Analyze the competitive content landscape for a ${input.industry} professional (${input.companyName}).

Identify:
- 3-5 types of ${input.industry} professionals/firms that are active on social media
- What platforms they use and how often they post
- What topics they typically cover
- What content gaps exist that they're NOT covering
- What opportunities exist to stand out through video content`;

    const raw = await callGemini(systemPrompt, userPrompt, {
      useSearchGrounding: true,
    });
    const result: CompetitorResult = JSON.parse(raw);

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { competitorStatus: "complete", competitorResult: JSON.stringify(result) },
    });

    return result;
  } catch (e) {
    console.error("[CompetitorAgent] Failed:", e);
    const fallback: CompetitorResult = {
      competitors: [],
      gaps: ["Most competitors don't use AI video", "Few share behind-the-scenes content"],
      opportunities: ["Be the first in your market with consistent video", "Use authentic voice cloning for scale"],
    };
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { competitorStatus: "complete", competitorResult: JSON.stringify(fallback) },
    });
    return fallback;
  }
}

// ─── Agent 4: Calendar Generation (depends on 1-3) ───────────────

async function runCalendarAgent(
  sessionId: string,
  input: {
    business: BusinessResult;
    trends: TrendsResult;
    competitors: CompetitorResult;
    industry: string;
  }
): Promise<CalendarDay[]> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { calendarStatus: "processing" },
  });

  try {
    const systemPrompt = `You are a content calendar strategist for professional services. Build a 30-day video content calendar.

Return a JSON array of exactly 30 objects matching this schema:
[{
  "day": 1,
  "date": "YYYY-MM-DD",
  "topic": "short topic title",
  "hook": "the opening line / hook for the video",
  "scriptOutline": "3-4 sentence script outline",
  "platform": "instagram | linkedin | tiktok | youtube",
  "contentType": "quick_tip_8 | talking_head_15 | educational_30 | testimonial_15",
  "category": "Education | Tips | Personal Brand | Social Proof | Trending",
  "whyThisWorks": "1 sentence explaining the strategic reasoning"
}]

Rules:
- Vary platforms across days (not all Instagram)
- Mix content types (not all talking heads)
- Alternate categories for variety
- Front-load high-impact, easy-to-produce content in week 1
- Build toward more complex content in weeks 3-4
- Each hook should be specific and attention-grabbing, not generic`;

    const today = new Date();
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split("T")[0];
    });

    const userPrompt = `Build a 30-day video content calendar for:

BUSINESS: ${input.business.summary}
Services: ${input.business.services.join(", ")}
Audience: ${input.business.targetAudience}
Tone: ${input.business.toneOfVoice}
Geography: ${input.business.geography}

TRENDING NOW: ${input.trends.trending.map((t) => t.topic).join(", ")}
EVERGREEN: ${input.trends.evergreen.map((t) => t.topic).join(", ")}
SEASONAL: ${input.trends.seasonal.map((t) => `${t.topic} (${t.timing})`).join(", ")}

COMPETITOR GAPS: ${input.competitors.gaps.join("; ")}
OPPORTUNITIES: ${input.competitors.opportunities.join("; ")}

Dates to use (day 1 = ${dates[0]}, day 30 = ${dates[29]}):
${dates.map((d, i) => `Day ${i + 1}: ${d}`).join("\n")}`;

    const raw = await callGemini(systemPrompt, userPrompt);
    const result: CalendarDay[] = JSON.parse(raw);

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: {
        calendarStatus: "complete",
        calendarResult: JSON.stringify(result),
        status: "complete",
        completedAt: new Date(),
      },
    });

    return result;
  } catch (e) {
    console.error("[CalendarAgent] Failed:", e);
    // Generate basic fallback calendar
    const today = new Date();
    const fallback: CalendarDay[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const platforms = ["instagram", "linkedin", "tiktok", "youtube"];
      const types = ["quick_tip_8", "talking_head_15", "educational_30", "testimonial_15"];
      const categories = ["Education", "Tips", "Personal Brand", "Social Proof", "Trending"];
      return {
        day: i + 1,
        date: d.toISOString().split("T")[0],
        topic: `${input.industry} content idea ${i + 1}`,
        hook: "Did you know...",
        scriptOutline: `Share a valuable insight about ${input.industry} that your audience needs to hear.`,
        platform: platforms[i % platforms.length],
        contentType: types[i % types.length],
        category: categories[i % categories.length],
        whyThisWorks: "Consistent posting builds authority.",
      };
    });

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: {
        calendarStatus: "complete",
        calendarResult: JSON.stringify(fallback),
        status: "complete",
        completedAt: new Date(),
      },
    });

    return fallback;
  }
}

// ─── Orchestrator: Fire All Agents ────────────────────────────────

export async function launchResearch(
  sessionId: string,
  input: { industry: string; companyName: string; websiteUrl?: string }
) {
  let business: BusinessResult;
  let trends: TrendsResult;
  let competitors: CompetitorResult;

  try {
    [business, trends, competitors] = await Promise.all([
      runBusinessAgent(sessionId, input),
      runTrendsAgent(sessionId, { industry: input.industry }),
      runCompetitorAgent(sessionId, { industry: input.industry, companyName: input.companyName }),
    ]);
  } catch (e) {
    console.error("[launchResearch] Agents 1-3 failed:", e);
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { status: "failed", completedAt: new Date() },
    }).catch(() => {});
    throw e;
  }

  // Agent 4 depends on 1-3
  await runCalendarAgent(sessionId, {
    business,
    trends,
    competitors,
    industry: input.industry,
  });
}

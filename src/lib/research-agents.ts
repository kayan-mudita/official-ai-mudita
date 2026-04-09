/**
 * Research Agents — Post-Payment Strategy Generation
 *
 * Four parallel AI agents powered by Claude (via OpenRouter)
 * with MCP tools (Exa for search, Firecrawl for scraping).
 *
 * Agent 1: Business Intelligence — Firecrawl scrapes website + Exa finds context
 * Agent 2: Industry Trends — Exa semantic search for trending content
 * Agent 3: Competitor Scan — Exa finds competitors, Firecrawl analyzes them
 * Agent 4: Calendar Generation — Claude synthesizes agents 1-3 into 14-day plan
 *
 * Each agent is an agentic loop: Claude gets tools, decides what to call,
 * we execute the calls, Claude synthesizes the results.
 */

import prisma from "@/lib/prisma";
import { runAgent, type ToolDefinition } from "./openrouter-client";
import { exaTools, exaHandlers } from "./mcp/exa";
import { firecrawlTools, firecrawlHandlers } from "./mcp/firecrawl";

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

export interface BrandVoice {
  positioning: string;
  tone: string;
  vocabulary: { use: string[]; avoid: string[] };
  hookStyle: string;
  ctaStyle: string;
  differentiation: string;
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
  script: string;
  caption: string;
  hashtags: string[];
  platform: string;
  contentType: string;
  category: string;
  whyThisWorks: string;
  bestPostingTime: string;
}

// For backwards compat with existing code that uses scriptOutline
export type { CalendarDay as CalendarDayV2 };

// ─── Extended Intake Types ────────────────────────────────────────

export interface IntakeData {
  industry: string;
  companyName: string;
  websiteUrl?: string;
  geography?: string;
  idealClient?: string;
  keyServices?: string[];
  differentiator?: string;
  postingFrequency?: string;
  platforms?: string[];
  tone?: string;
  socialHandles?: { platform: string; handle: string }[];
}

// ─── All MCP Tools Combined ───────────────────────────────────────

const allTools: ToolDefinition[] = [...exaTools, ...firecrawlTools];
const allHandlers = { ...exaHandlers, ...firecrawlHandlers };

// ─── Agent 1: Business Intelligence ───────────────────────────────

async function runBusinessAgent(
  sessionId: string,
  input: IntakeData
): Promise<BusinessResult> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { businessStatus: "processing" },
  });

  try {
    const systemPrompt = `You are a business research analyst with access to web scraping and search tools.

Your job: Research a business and produce a detailed business profile.

You MUST return ONLY a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "companyName": "string",
  "industry": "string",
  "services": ["array of 3-5 core services"],
  "targetAudience": "who they serve",
  "geography": "market they serve",
  "toneOfVoice": "professional | conversational | authoritative | warm",
  "differentiators": ["2-3 key differentiators"],
  "summary": "2-3 sentence positioning summary"
}

Strategy:
1. If a website URL is provided, use firecrawl_scrape to extract real data from it
2. If social handles are provided, use exa_search to find their social profiles
3. Use exa_search to find additional context about the business
4. Synthesize everything into the JSON profile

Be specific. Use real data from the tools, not generic guesses.`;

    const userPrompt = `Research this business and return a JSON profile:

Company: ${input.companyName}
Industry: ${input.industry}
${input.websiteUrl ? `Website: ${input.websiteUrl}` : "No website provided"}
${input.geography ? `Geography: ${input.geography}` : ""}
${input.idealClient ? `Ideal client: ${input.idealClient}` : ""}
${input.keyServices?.length ? `Key services: ${input.keyServices.join(", ")}` : ""}
${input.differentiator ? `Differentiator: ${input.differentiator}` : ""}
${input.socialHandles?.length ? `Social handles: ${input.socialHandles.map((s) => `${s.platform}: ${s.handle}`).join(", ")}` : ""}

Use the tools to research this business. Then return ONLY the JSON object.`;

    const raw = await runAgent(systemPrompt, userPrompt, allTools, allHandlers, 6);

    // Extract JSON from response
    const result = parseJsonFromResponse<BusinessResult>(raw, {
      companyName: input.companyName,
      industry: input.industry,
      services: input.keyServices || [`${input.industry} services`],
      targetAudience: input.idealClient || "Local clients",
      geography: input.geography || "Local market",
      toneOfVoice: input.tone || "professional",
      differentiators: input.differentiator ? [input.differentiator] : ["Personalized service"],
      summary: `${input.companyName} is a ${input.industry} professional.`,
    });

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { businessStatus: "complete", businessResult: JSON.stringify(result) },
    });

    return result;
  } catch (e) {
    console.error("[BusinessAgent] Failed:", e);
    const fallback: BusinessResult = {
      companyName: input.companyName,
      industry: input.industry,
      services: input.keyServices || [`${input.industry} services`],
      targetAudience: input.idealClient || "Local clients and prospects",
      geography: input.geography || "Local market",
      toneOfVoice: input.tone || "professional",
      differentiators: input.differentiator ? [input.differentiator] : ["Personalized service", "Industry expertise"],
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
  input: { industry: string; platforms?: string[] }
): Promise<TrendsResult> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { trendsStatus: "processing" },
  });

  try {
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();

    const systemPrompt = `You are a social media content strategist with access to web search tools.

Your job: Find what's trending RIGHT NOW for a specific industry on social media.

You MUST return ONLY a valid JSON object matching this schema:
{
  "trending": [{ "topic": "string", "whyNow": "string" }],
  "evergreen": [{ "topic": "string", "angle": "string" }],
  "seasonal": [{ "topic": "string", "timing": "string" }],
  "platformAngles": [{ "platform": "string", "format": "string", "tip": "string" }]
}

Strategy:
1. Use exa_search to find current trending topics for this industry on social media
2. Use exa_search to find viral content examples in this industry
3. Use exa_search to find seasonal content opportunities for the current month
4. Provide 5-7 trending, 5-7 evergreen, 3-4 seasonal, and platform angles for each platform

Use REAL search results to inform your answer. Don't guess.`;

    const platformList = input.platforms?.length
      ? input.platforms.join(", ")
      : "Instagram, TikTok, LinkedIn, YouTube";

    const userPrompt = `Find trending content topics for ${input.industry} professionals on social media (${monthName} ${year}).

Platforms to cover: ${platformList}

Search for:
- What ${input.industry} content is going viral right now
- Trending topics this month for ${input.industry} professionals
- Seasonal angles for ${monthName} ${year}

Use exa_search to find real data. Then return ONLY the JSON object.`;

    const raw = await runAgent(systemPrompt, userPrompt, allTools, allHandlers, 6);

    const result = parseJsonFromResponse<TrendsResult>(raw, {
      trending: [{ topic: "AI in your industry", whyNow: "AI adoption accelerating" }],
      evergreen: [{ topic: "Client success stories", angle: "Build trust" }],
      seasonal: [{ topic: "Q2 planning", timing: "Spring" }],
      platformAngles: [
        { platform: "instagram", format: "Reels 15-30s", tip: "Hook in first 2 seconds" },
        { platform: "linkedin", format: "Talking head", tip: "Professional tone" },
        { platform: "tiktok", format: "Quick tips", tip: "Casual, trending audio" },
        { platform: "youtube", format: "Shorts 30-60s", tip: "Educational, searchable" },
      ],
    });

    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { trendsStatus: "complete", trendsResult: JSON.stringify(result) },
    });

    return result;
  } catch (e) {
    console.error("[TrendsAgent] Failed:", e);
    const fallback: TrendsResult = {
      trending: [{ topic: "AI in your industry", whyNow: "AI adoption accelerating" }],
      evergreen: [{ topic: "Client success stories", angle: "Build trust through results" }],
      seasonal: [{ topic: "Q2 planning", timing: "Spring" }],
      platformAngles: [
        { platform: "instagram", format: "Reels 15-30s", tip: "Hook in first 2 seconds" },
        { platform: "linkedin", format: "Talking head", tip: "Professional tone" },
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
  input: { industry: string; companyName: string; geography?: string; websiteUrl?: string }
): Promise<CompetitorResult> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { competitorStatus: "processing" },
  });

  try {
    const systemPrompt = `You are a competitive intelligence analyst with access to search and scraping tools.

Your job: Analyze the competitive content landscape for a professional in a specific industry.

You MUST return ONLY a valid JSON object matching this schema:
{
  "competitors": [{ "name": "string", "platforms": ["string"], "frequency": "string", "topTopics": ["string"] }],
  "gaps": ["3-5 content gaps competitors are NOT covering"],
  "opportunities": ["3-5 content opportunities for differentiation"]
}

Strategy:
1. Use exa_search to find similar businesses and their social media presence
2. If website URL provided, use exa_find_similar to find direct competitors
3. Use exa_search to analyze what content topics competitors cover
4. Identify what they're NOT doing — those are the gaps and opportunities

Provide 3-5 realistic competitors with real data.`;

    const userPrompt = `Analyze the competitive content landscape for:

Business: ${input.companyName} (${input.industry})
${input.geography ? `Geography: ${input.geography}` : ""}
${input.websiteUrl ? `Website: ${input.websiteUrl}` : ""}

Find competitors in ${input.industry} who are active on social media. Identify content gaps and opportunities. Return ONLY the JSON object.`;

    const raw = await runAgent(systemPrompt, userPrompt, allTools, allHandlers, 6);

    const result = parseJsonFromResponse<CompetitorResult>(raw, {
      competitors: [],
      gaps: ["Most competitors don't use AI video", "Few share behind-the-scenes content"],
      opportunities: ["Be first in market with consistent video", "Authentic voice cloning for scale"],
    });

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
      opportunities: ["Be first in market with consistent video", "Use authentic voice cloning for scale"],
    };
    await prisma.researchSession.update({
      where: { id: sessionId },
      data: { competitorStatus: "complete", competitorResult: JSON.stringify(fallback) },
    });
    return fallback;
  }
}

// ─── Agent 4: Calendar + Full Script Generation ───────────────────

async function runCalendarAgent(
  sessionId: string,
  input: {
    business: BusinessResult;
    trends: TrendsResult;
    competitors: CompetitorResult;
    intake: IntakeData;
  }
): Promise<CalendarDay[]> {
  await prisma.researchSession.update({
    where: { id: sessionId },
    data: { calendarStatus: "processing" },
  });

  try {
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split("T")[0];
    });

    const platforms = input.intake.platforms?.length
      ? input.intake.platforms
      : ["instagram", "linkedin", "tiktok", "youtube"];

    const systemPrompt = `You are an expert content strategist and scriptwriter. No tools needed for this step — you are synthesizing research that was already gathered.

Your job: Build a 14-day video content calendar with FULL SCRIPTS (not outlines).

You MUST return ONLY a valid JSON array of exactly 14 objects matching this schema:
[{
  "day": 1,
  "date": "YYYY-MM-DD",
  "topic": "specific topic title",
  "hook": "the exact opening line that grabs attention",
  "script": "The COMPLETE video script, 3-8 sentences. Written in the brand voice. Ready to be spoken aloud as a video narration.",
  "caption": "Social media caption for the post (platform-appropriate)",
  "hashtags": ["relevant", "hashtags", "3-5"],
  "platform": "instagram | linkedin | tiktok | youtube",
  "contentType": "quick_tip_8 | talking_head_15 | educational_30 | testimonial_15",
  "category": "Education | Tips | Personal Brand | Social Proof | Trending",
  "whyThisWorks": "1 sentence strategic reasoning",
  "bestPostingTime": "e.g. Tuesday 9:00 AM"
}]

Content mix rules:
- 40% Education, 25% Personal Brand, 20% Tips, 10% Social Proof, 5% Trending
- Vary platforms across the ${platforms.length} platforms: ${platforms.join(", ")}
- Front-load week 1 with easy quick_tip_8 and talking_head_15
- Week 2 can include educational_30 and testimonial_15
- Every hook must be specific and attention-grabbing, never generic
- Every script must sound like the person speaking, in their brand voice
- Hashtags: 3-5 per post, platform-appropriate (LinkedIn: fewer, Instagram: more)`;

    const userPrompt = `Build a 14-day content calendar with full scripts.

BUSINESS PROFILE:
${input.business.summary}
Services: ${input.business.services.join(", ")}
Audience: ${input.business.targetAudience}
Tone: ${input.business.toneOfVoice}
Geography: ${input.business.geography}
Differentiators: ${input.business.differentiators.join("; ")}

TRENDING NOW: ${input.trends.trending.map((t) => `${t.topic} (${t.whyNow})`).join("; ")}
EVERGREEN: ${input.trends.evergreen.map((t) => `${t.topic}: ${t.angle}`).join("; ")}
SEASONAL: ${input.trends.seasonal.map((t) => `${t.topic} (${t.timing})`).join("; ")}

COMPETITOR GAPS: ${input.competitors.gaps.join("; ")}
OPPORTUNITIES: ${input.competitors.opportunities.join("; ")}

POSTING PREFERENCES:
Frequency: ${input.intake.postingFrequency || "daily"}
Platforms: ${platforms.join(", ")}
Tone: ${input.intake.tone || input.business.toneOfVoice}

Dates (Day 1 = ${dates[0]}, Day 14 = ${dates[13]}):
${dates.map((d, i) => `Day ${i + 1}: ${d}`).join(", ")}

Return ONLY the JSON array of 14 calendar day objects.`;

    // No tools needed for calendar — it synthesizes existing research
    const raw = await runAgent(systemPrompt, userPrompt, [], {}, 1);

    const result = parseJsonFromResponse<CalendarDay[]>(raw, generateFallbackCalendar(input.intake.industry, dates));

    // Ensure each day has correct day/date
    result.forEach((item, i) => {
      item.day = i + 1;
      item.date = dates[i] || item.date;
      // Backwards compat: ensure scriptOutline alias
      if (!item.script && (item as any).scriptOutline) {
        item.script = (item as any).scriptOutline;
      }
    });

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
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split("T")[0];
    });
    const fallback = generateFallbackCalendar(input.intake.industry, dates);

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

// ─── Orchestrator ─────────────────────────────────────────────────

export async function launchResearch(
  sessionId: string,
  input: IntakeData
) {
  let business: BusinessResult;
  let trends: TrendsResult;
  let competitors: CompetitorResult;

  try {
    // Fire agents 1-3 in parallel
    [business, trends, competitors] = await Promise.all([
      runBusinessAgent(sessionId, input),
      runTrendsAgent(sessionId, { industry: input.industry, platforms: input.platforms }),
      runCompetitorAgent(sessionId, {
        industry: input.industry,
        companyName: input.companyName,
        geography: input.geography,
        websiteUrl: input.websiteUrl,
      }),
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
    intake: input,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Extract JSON from Claude's response text. Claude may wrap JSON in
 * markdown code blocks or add surrounding text.
 */
function parseJsonFromResponse<T>(text: string, fallback: T): T {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // noop
  }

  // Try extracting from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // noop
    }
  }

  // Try finding JSON array or object in the text
  const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // noop
    }
  }

  console.error("[parseJsonFromResponse] Could not extract JSON, using fallback");
  return fallback;
}

function generateFallbackCalendar(industry: string, dates: string[]): CalendarDay[] {
  const platforms = ["instagram", "linkedin", "tiktok", "youtube"];
  const types = ["quick_tip_8", "talking_head_15", "educational_30", "testimonial_15"];
  const categories = ["Education", "Tips", "Personal Brand", "Social Proof", "Trending"];

  return dates.map((date, i) => ({
    day: i + 1,
    date,
    topic: `${industry} content idea ${i + 1}`,
    hook: "Did you know...",
    script: `Share a valuable insight about ${industry} that your audience needs to hear. Keep it specific, actionable, and authentic to your experience.`,
    caption: `New video! #${industry} #tips`,
    hashtags: [`#${industry}`, "#tips", "#video"],
    platform: platforms[i % platforms.length],
    contentType: types[i % types.length],
    category: categories[i % categories.length],
    whyThisWorks: "Consistent posting builds authority.",
    bestPostingTime: "9:00 AM",
  }));
}

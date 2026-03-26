/**
 * Social Context -- Builds audience context from connected social accounts
 *
 * Issue #13: We can't actually scrape Instagram, but we CAN prepare the
 * data model. This module checks if the user has connected social accounts
 * and returns a context string for prompt injection.
 *
 * When we eventually add social API integration (follower counts, audience
 * demographics), this function will use real data. For now, it uses
 * industry defaults to provide audience-aware prompt context.
 */

import prisma from "@/lib/prisma";

// ---- Industry Defaults ----

const INDUSTRY_AUDIENCE_DEFAULTS: Record<string, string> = {
  real_estate:
    "Their audience consists of homebuyers, sellers, and real estate investors who expect market insights, property tours, and local expertise.",
  legal:
    "Their audience consists of individuals and businesses seeking legal guidance who expect authoritative, trustworthy, and accessible legal insights.",
  medical:
    "Their audience consists of patients and health-conscious individuals who expect clear medical information, wellness tips, and reassuring expertise.",
  finance:
    "Their audience consists of investors, professionals, and individuals seeking financial guidance who expect data-driven analysis and actionable advice.",
  coaching:
    "Their audience consists of aspiring professionals and personal development seekers who expect motivational, actionable, and relatable content.",
  fitness:
    "Their audience consists of fitness enthusiasts and health-conscious individuals who expect workout tips, transformation stories, and motivation.",
  other:
    "Their audience expects authentic, relatable content that builds trust and demonstrates expertise.",
};

// ---- Main Function ----

/**
 * Build a social/audience context string for the given user.
 *
 * Checks connected social accounts and returns a context string that
 * the prompt engine can inject to make video content audience-aware.
 *
 * Returns empty string if no social accounts are connected.
 */
export async function getSocialContext(userId: string): Promise<string> {
  // Fetch connected social accounts
  const accounts = await prisma.socialAccount.findMany({
    where: { userId, connected: true },
    select: { platform: true, handle: true },
  });

  if (accounts.length === 0) {
    return "";
  }

  // Fetch user industry for audience defaults
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { industry: true },
  });

  const industry = user?.industry || "other";

  // Build the platform list
  const platformList = accounts
    .map((a) => `${a.platform}${a.handle ? ` (@${a.handle})` : ""}`)
    .join(", ");

  // Get industry-specific audience description
  const audienceDesc =
    INDUSTRY_AUDIENCE_DEFAULTS[industry] ||
    INDUSTRY_AUDIENCE_DEFAULTS.other;

  // When we have social API integration, we'll replace this with real
  // follower counts, engagement rates, and audience demographics.
  return `User is active on ${platformList}. ${audienceDesc}`;
}

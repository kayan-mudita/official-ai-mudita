/**
 * Maps a pillar slug to the most relevant feature slugs for the
 * "Powered by these features" cross-link section on pillar and
 * sub-topic pages.
 *
 * Each pillar gets 2-3 features. Falls back to the full feature
 * list if the slug isn't mapped.
 */
import { features, type Feature } from "@/data/features";

const PILLAR_FEATURE_SLUGS: Record<string, string[]> = {
  "ai-video-creation": ["ai-video-studio", "ai-twin-voice", "script-engine"],
  "video-marketing-professionals": ["analytics", "script-engine", "auto-posting"],
  "social-media-video-strategy": ["auto-posting", "script-engine", "analytics"],
  "ai-video-real-estate": ["ai-video-studio", "auto-posting", "ai-twin-voice"],
  "ai-video-professional-services": ["script-engine", "ai-twin-voice", "ai-video-studio"],
  "ai-content-at-scale": ["ai-video-studio", "auto-posting", "script-engine"],
};

export function getFeaturesForPillar(pillarSlug: string): Feature[] {
  const slugs = PILLAR_FEATURE_SLUGS[pillarSlug];
  if (!slugs) return features.slice(0, 3);
  return slugs
    .map((s) => features.find((f) => f.slug === s))
    .filter((f): f is Feature => Boolean(f));
}

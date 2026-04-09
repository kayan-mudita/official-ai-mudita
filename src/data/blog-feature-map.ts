/**
 * Maps blog category to the most relevant feature slugs for the
 * "Powered by these features" cross-link section on blog post pages.
 */
import { features, type Feature } from "@/data/features";
import type { BlogCategory } from "@/data/blog-posts";

const CATEGORY_FEATURE_SLUGS: Record<BlogCategory, string[]> = {
  "AI Video": ["ai-video-studio", "ai-twin-voice", "script-engine"],
  "Content Strategy": ["script-engine", "analytics", "ai-video-studio"],
  "Social Media": ["auto-posting", "script-engine", "analytics"],
  "Industry Tips": ["ai-video-studio", "ai-twin-voice", "auto-posting"],
  "Product Updates": ["ai-video-studio", "ai-twin-voice", "auto-posting"],
};

export function getFeaturesForCategory(category: BlogCategory): Feature[] {
  const slugs = CATEGORY_FEATURE_SLUGS[category];
  if (!slugs) return features.slice(0, 3);
  return slugs
    .map((s) => features.find((f) => f.slug === s))
    .filter((f): f is Feature => Boolean(f));
}

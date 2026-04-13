import type { MetadataRoute } from "next";
import { getAllPillars } from "@/data/topic-libraries";
import { competitors } from "@/data/competitors";
import { features } from "@/data/features";
import { pillarContent, subTopicContentRegistry } from "@/content";
import { siteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    // Homepage
    { url: `${siteUrl}/` },

    // Core marketing pages
    { url: `${siteUrl}/pricing` },
    { url: `${siteUrl}/features` },
    { url: `${siteUrl}/how-it-works` },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/compare` },
    { url: `${siteUrl}/use-cases` },
    { url: `${siteUrl}/demo` },

    // Industry pages
    { url: `${siteUrl}/for/realtors` },
    { url: `${siteUrl}/for/attorneys` },
    { url: `${siteUrl}/for/doctors` },
    { url: `${siteUrl}/for/advisors` },

    // Blog
    { url: `${siteUrl}/blog` },
    { url: `${siteUrl}/blog/multi-cut-method` },
    { url: `${siteUrl}/blog/ai-ugc-future` },
    { url: `${siteUrl}/blog/real-estate-agents-ai` },
    { url: `${siteUrl}/blog/five-content-formats` },
    { url: `${siteUrl}/blog/voice-cloning-guide` },
    { url: `${siteUrl}/blog/video-marketing-roi-guide` },
    { url: `${siteUrl}/blog/linkedin-video-tips` },
    { url: `${siteUrl}/blog/tiktok-professional-guide` },
    { url: `${siteUrl}/blog/neighborhood-video-seo` },
    { url: `${siteUrl}/blog/lawyer-video-marketing` },
    { url: `${siteUrl}/blog/financial-advisor-video` },
    { url: `${siteUrl}/blog/batch-video-workflow` },
    { url: `${siteUrl}/blog/scaling-personal-brand-ai` },

    // Guides index
    { url: `${siteUrl}/learn` },

    // Landing pages
    { url: `${siteUrl}/go` },

    // Auth (public-facing)
    { url: `${siteUrl}/auth/login` },
    { url: `${siteUrl}/auth/signup` },

    // Free tools
    { url: `${siteUrl}/tools` },
    { url: `${siteUrl}/tools/speaking-time-calculator` },
    { url: `${siteUrl}/tools/video-roi-calculator` },
    { url: `${siteUrl}/tools/hook-generator` },
  ];

  // Feature detail pages
  for (const f of features) {
    routes.push({ url: `${siteUrl}/features/${f.slug}` });
  }

  // Competitor comparison pages
  for (const c of competitors) {
    routes.push({ url: `${siteUrl}/compare/${c.slug}` });
  }

  // Pillar + subtopic pages — only emit slugs that have real content modules.
  // Any pillar or subtopic without a module 404s via dynamicParams = false,
  // so the sitemap must match that filter to avoid submitting dead URLs.
  for (const pillar of getAllPillars()) {
    if (!pillarContent[pillar.slug]) continue;
    routes.push({ url: `${siteUrl}/${pillar.slug}` });

    const subModules = subTopicContentRegistry[pillar.slug] ?? {};
    for (const subTopic of pillar.subTopics) {
      if (!subModules[subTopic.slug]) continue;
      routes.push({ url: `${siteUrl}/${pillar.slug}/${subTopic.slug}` });
    }
  }

  return routes;
}

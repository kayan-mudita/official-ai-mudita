import type { MetadataRoute } from "next";

const siteUrl = "https://officialai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const routes: MetadataRoute.Sitemap = [
    // Homepage
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },

    // Core marketing pages
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/features`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Industry pages
    { url: `${siteUrl}/for/realtors`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/for/attorneys`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/for/doctors`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/for/advisors`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },

    // Blog
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/blog/multi-cut-method`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Landing pages
    { url: `${siteUrl}/go`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },

    // Auth (public-facing)
    { url: `${siteUrl}/auth/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/auth/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  return routes;
}

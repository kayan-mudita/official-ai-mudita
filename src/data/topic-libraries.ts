import type { LucideIcon } from "lucide-react";
import {
  Video,
  BarChart3,
  Share2,
  Home,
  Briefcase,
  Layers,
} from "lucide-react";

/* ── Types ── */

export interface Reference {
  title: string;
  publisher: string;
  url: string;
  accessDate?: string;
}

export interface SubTopic {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  searchVolume: number;
  blogSlugs: string[];
  industryPageSlugs: string[];
  crossLinkSubTopicSlugs: string[];
  references?: Reference[];
}

export interface Pillar {
  slug: string;
  title: string;
  headline: string;
  heroSubtitle: string;
  description: string;
  primaryKeyword: string;
  searchVolume: number;
  icon: LucideIcon;
  accentColor: "blue" | "violet" | "emerald" | "amber" | "cyan" | "rose";
  navDescription: string;
  subTopics: SubTopic[];
  crossLinkPillarSlugs: string[];
  relatedIndustryPageSlugs: string[];
  leadMagnet: { title: string; description: string; ctaText: string };
  references?: Reference[];
}

/* ── Pillar Data ── */

export const pillars: Pillar[] = [
  /* ────────────────────────────────────────────────────────
   * PILLAR 1: AI Video Creation
   * ──────────────────────────────────────────────────────── */
  {
    slug: "ai-video-creation",
    title: "AI Video Creation",
    headline: "AI Video Creation: The Complete Guide for Professionals",
    heroSubtitle:
      "Everything you need to know about generating professional video content with AI — from how the technology works to advanced techniques like multi-cut editing and voice cloning.",
    description:
      "A comprehensive guide to AI video generation for professionals. Learn how AI avatars, voice cloning, and multi-cut editing work together to create studio-quality content without filming.",
    primaryKeyword: "ai video generator",
    searchVolume: 100000,
    icon: Video,
    accentColor: "blue",
    navDescription: "How AI video generation works",
    subTopics: [
      {
        slug: "how-ai-video-works",
        title: "How AI Video Generation Works",
        description:
          "A technical overview of AI video generation — from text prompts to finished clips. Understand the models, pipelines, and quality factors behind modern AI video.",
        primaryKeyword: "how ai video generation works",
        searchVolume: 1200,
        blogSlugs: ["multi-cut-method", "ai-ugc-future"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["ai-avatar-video-guide", "ai-vs-traditional-video"],
        references: [
          {
            title: "The State of AI Video Creation 2026",
            publisher: "Vivideo",
            url: "https://vivideo.ai/blog/state-of-ai-video-creation-2026",
            accessDate: "March 2026",
          },
        ],
      },
      {
        slug: "ai-avatar-video-guide",
        title: "AI Avatar Video: The Complete Guide",
        description:
          "How AI avatars work, what makes a good digital twin, and how professionals use avatar video to scale their personal brand without ever stepping in front of a camera.",
        primaryKeyword: "ai avatar video",
        searchVolume: 5000,
        blogSlugs: ["ai-ugc-future", "voice-cloning-guide"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["voice-cloning-for-video", "professional-video-branding"],
        references: [
          {
            title: "AI Video Generator Market Size, Share | Industry Report 2033",
            publisher: "Grand View Research",
            url: "https://www.grandviewresearch.com/industry-analysis/ai-video-generator-market-report",
            accessDate: "March 2026",
          },
        ],
      },
      {
        slug: "voice-cloning-for-video",
        title: "Voice Cloning for Video Content",
        description:
          "How voice cloning technology works, what it takes to create a natural-sounding AI voice, and how to use cloned voice consistently across all your video content.",
        primaryKeyword: "voice cloning for video",
        searchVolume: 1000,
        blogSlugs: ["voice-cloning-guide"],
        industryPageSlugs: ["attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["ai-avatar-video-guide", "building-authority-with-video"],
      },
      {
        slug: "create-videos-without-filming",
        title: "How to Create Videos Without Filming",
        description:
          "Practical methods for creating professional video content without a camera, crew, or studio. From AI generation to repurposing existing assets.",
        primaryKeyword: "create videos without filming",
        searchVolume: 700,
        blogSlugs: ["multi-cut-method", "ai-ugc-future"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["batch-video-creation", "ai-content-repurposing"],
      },
      {
        slug: "multi-cut-video-editing",
        title: "The Multi-Cut Method for AI Video",
        description:
          "Why single-shot AI video looks fake and how multi-cut composition — using 3-8 separate clips stitched together — creates videos that feel professionally produced.",
        primaryKeyword: "multi cut video editing",
        searchVolume: 150,
        blogSlugs: ["multi-cut-method"],
        industryPageSlugs: [],
        crossLinkSubTopicSlugs: ["how-ai-video-works", "video-content-strategy"],
      },
    ],
    crossLinkPillarSlugs: ["social-media-video-strategy", "ai-content-at-scale"],
    relatedIndustryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
    leadMagnet: {
      title: "AI Video Starter Kit",
      description: "Scripts, shot lists, and a 30-day posting calendar to launch your AI video strategy.",
      ctaText: "Download the Starter Kit",
    },
    references: [
      {
        title: "75 AI Video Statistics Every Marketer Needs to Know in 2026",
        publisher: "Vivideo",
        url: "https://vivideo.ai/blog/ai-video-statistics-2026",
        accessDate: "March 2026",
      },
      {
        title: "AI Video Generator Market Size Report 2033",
        publisher: "Grand View Research",
        url: "https://www.grandviewresearch.com/industry-analysis/ai-video-generator-market-report",
        accessDate: "March 2026",
      },
    ],
  },

  /* ────────────────────────────────────────────────────────
   * PILLAR 2: Video Marketing for Professionals
   * ──────────────────────────────────────────────────────── */
  {
    slug: "video-marketing-professionals",
    title: "Video Marketing for Professionals",
    headline: "Video Marketing for Professionals: Strategy, Metrics & ROI",
    heroSubtitle:
      "How to build a video marketing strategy that drives real business results — from measuring ROI to building a content funnel that converts viewers into clients.",
    description:
      "The definitive guide to video marketing for service professionals. Learn how to measure ROI, build a content strategy, and create a marketing funnel powered by video.",
    primaryKeyword: "video marketing for business",
    searchVolume: 3000,
    icon: BarChart3,
    accentColor: "violet",
    navDescription: "Strategy, metrics & ROI",
    subTopics: [
      {
        slug: "video-marketing-roi",
        title: "How to Measure Video Marketing ROI",
        description:
          "Frameworks for calculating the real return on your video marketing investment — from views and engagement to leads, consultations, and revenue attribution.",
        primaryKeyword: "video marketing roi",
        searchVolume: 1000,
        blogSlugs: ["video-marketing-roi-guide"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["video-marketing-metrics", "real-estate-video-roi"],
      },
      {
        slug: "video-content-strategy",
        title: "Video Content Strategy for Professionals",
        description:
          "How to plan a video content strategy that builds authority, attracts clients, and compounds over time. Includes content pillars, posting cadence, and platform selection.",
        primaryKeyword: "video content strategy",
        searchVolume: 800,
        blogSlugs: ["five-content-formats"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["content-calendar-strategy", "video-marketing-funnel"],
      },
      {
        slug: "professional-video-branding",
        title: "Building Your Brand Through Video",
        description:
          "How to use video to establish professional authority, create brand consistency, and become the go-to expert in your market.",
        primaryKeyword: "professional video branding",
        searchVolume: 400,
        blogSlugs: ["scaling-personal-brand-ai"],
        industryPageSlugs: ["attorneys", "advisors"],
        crossLinkSubTopicSlugs: ["building-authority-with-video", "content-consistency"],
      },
      {
        slug: "video-marketing-metrics",
        title: "Video Marketing Metrics That Matter",
        description:
          "The metrics that actually predict business outcomes from video marketing. Cut through vanity metrics and focus on what drives revenue.",
        primaryKeyword: "video marketing metrics",
        searchVolume: 500,
        blogSlugs: ["video-marketing-roi-guide"],
        industryPageSlugs: [],
        crossLinkSubTopicSlugs: ["video-marketing-roi", "video-marketing-funnel"],
      },
      {
        slug: "video-marketing-funnel",
        title: "The Video Marketing Funnel",
        description:
          "How to structure your video content across awareness, consideration, and decision stages. Map content types to buyer journey stages.",
        primaryKeyword: "video marketing funnel",
        searchVolume: 400,
        blogSlugs: ["five-content-formats"],
        industryPageSlugs: [],
        crossLinkSubTopicSlugs: ["video-content-strategy", "video-marketing-metrics"],
      },
    ],
    crossLinkPillarSlugs: ["ai-video-creation", "social-media-video-strategy"],
    relatedIndustryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
    leadMagnet: {
      title: "Video Marketing ROI Calculator",
      description: "Calculate your expected return from video marketing based on your industry, audience size, and posting frequency.",
      ctaText: "Calculate Your ROI",
    },
  },

  /* ────────────────────────────────────────────────────────
   * PILLAR 3: Social Media Video Strategy
   * ──────────────────────────────────────────────────────── */
  {
    slug: "social-media-video-strategy",
    title: "Social Media Video Strategy",
    headline: "Social Media Video Strategy: Platform-by-Platform Guide",
    heroSubtitle:
      "Master video content on every major platform — LinkedIn, TikTok, Instagram, YouTube, and Facebook. Platform-specific strategies, optimal formats, and automation techniques.",
    description:
      "The complete guide to social media video for professionals. Platform-specific strategies for LinkedIn, TikTok, Instagram Reels, YouTube Shorts, and Facebook.",
    primaryKeyword: "social media content creation",
    searchVolume: 8000,
    icon: Share2,
    accentColor: "emerald",
    navDescription: "Platform-by-platform video guide",
    subTopics: [
      {
        slug: "linkedin-video-strategy",
        title: "LinkedIn Video Strategy for Professionals",
        description:
          "How to use video on LinkedIn to build professional authority, generate leads, and grow your network. Optimal formats, posting times, and content that resonates.",
        primaryKeyword: "linkedin video strategy",
        searchVolume: 1000,
        blogSlugs: ["linkedin-video-tips"],
        industryPageSlugs: ["attorneys", "advisors"],
        crossLinkSubTopicSlugs: ["professional-video-branding", "building-authority-with-video"],
      },
      {
        slug: "tiktok-for-professionals",
        title: "TikTok for Professionals: The Complete Guide",
        description:
          "Why professionals are winning on TikTok, how the algorithm works, and tactical advice for creating content that builds authority without feeling unprofessional.",
        primaryKeyword: "tiktok for professionals",
        searchVolume: 800,
        blogSlugs: ["tiktok-professional-guide"],
        industryPageSlugs: ["realtors", "doctors"],
        crossLinkSubTopicSlugs: ["instagram-reels-for-business", "social-media-video-automation"],
      },
      {
        slug: "instagram-reels-for-business",
        title: "Instagram Reels for Business Growth",
        description:
          "How to use Instagram Reels to reach new audiences, showcase expertise, and convert followers into clients. Content formats, hooks, and growth tactics.",
        primaryKeyword: "instagram reels for business",
        searchVolume: 900,
        blogSlugs: ["tiktok-professional-guide"],
        industryPageSlugs: ["realtors", "doctors"],
        crossLinkSubTopicSlugs: ["tiktok-for-professionals", "content-calendar-strategy"],
      },
      {
        slug: "social-media-video-automation",
        title: "How to Automate Your Social Media Video",
        description:
          "Tools, workflows, and strategies for automating video content creation, scheduling, and cross-platform posting without sacrificing quality or authenticity.",
        primaryKeyword: "social media video automation",
        searchVolume: 800,
        blogSlugs: ["tiktok-professional-guide"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["batch-video-creation", "content-calendar-strategy"],
      },
      {
        slug: "content-calendar-strategy",
        title: "Content Calendar Strategy That Works",
        description:
          "How to plan, build, and maintain a content calendar that keeps you posting consistently. Templates, tools, and workflows for busy professionals.",
        primaryKeyword: "content calendar strategy",
        searchVolume: 1200,
        blogSlugs: ["linkedin-video-tips"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["video-content-strategy", "social-media-video-automation"],
      },
    ],
    crossLinkPillarSlugs: ["video-marketing-professionals", "ai-content-at-scale"],
    relatedIndustryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
    leadMagnet: {
      title: "30-Day Social Video Calendar",
      description: "A ready-to-use posting calendar with daily prompts, platform assignments, and content themes.",
      ctaText: "Get the Calendar",
    },
  },

  /* ────────────────────────────────────────────────────────
   * PILLAR 4: AI Video for Real Estate
   * ──────────────────────────────────────────────────────── */
  {
    slug: "ai-video-real-estate",
    title: "AI Video for Real Estate",
    headline: "AI Video for Real Estate: The Agent's Complete Guide",
    heroSubtitle:
      "How top-producing agents use AI video to generate listings, build neighborhood authority, and post daily content without ever touching a camera.",
    description:
      "The complete guide to AI video marketing for real estate professionals. Listing tours, market updates, neighborhood spotlights, and social media strategy.",
    primaryKeyword: "ai video for real estate",
    searchVolume: 1200,
    icon: Home,
    accentColor: "amber",
    navDescription: "AI video for real estate agents",
    subTopics: [
      {
        slug: "listing-tour-videos",
        title: "Listing Tour Videos That Sell",
        description:
          "How to create compelling listing tour videos using AI — from scripting and shot planning to posting strategies that generate buyer inquiries.",
        primaryKeyword: "listing tour video ideas",
        searchVolume: 300,
        blogSlugs: ["real-estate-agents-ai"],
        industryPageSlugs: ["realtors"],
        crossLinkSubTopicSlugs: ["real-estate-social-media", "create-videos-without-filming"],
      },
      {
        slug: "real-estate-market-updates",
        title: "Real Estate Market Update Videos",
        description:
          "How to create weekly market update videos that position you as the local market expert. Scripts, data sources, and posting cadence.",
        primaryKeyword: "real estate market update video",
        searchVolume: 400,
        blogSlugs: ["real-estate-agents-ai"],
        industryPageSlugs: ["realtors"],
        crossLinkSubTopicSlugs: ["content-calendar-strategy", "linkedin-video-strategy"],
      },
      {
        slug: "neighborhood-spotlight-videos",
        title: "Neighborhood Spotlight Videos",
        description:
          "How to create neighborhood spotlight videos that attract buyers and establish area expertise. Content frameworks, SEO strategies, and distribution tactics.",
        primaryKeyword: "neighborhood video marketing",
        searchVolume: 250,
        blogSlugs: ["neighborhood-video-seo"],
        industryPageSlugs: ["realtors"],
        crossLinkSubTopicSlugs: ["listing-tour-videos", "real-estate-social-media"],
      },
      {
        slug: "real-estate-social-media",
        title: "Real Estate Social Media Strategy",
        description:
          "A platform-by-platform social media strategy for real estate agents. What to post, where, and how often to maximize reach and generate leads.",
        primaryKeyword: "real estate social media strategy",
        searchVolume: 900,
        blogSlugs: ["real-estate-agents-ai"],
        industryPageSlugs: ["realtors"],
        crossLinkSubTopicSlugs: ["instagram-reels-for-business", "tiktok-for-professionals"],
      },
      {
        slug: "real-estate-video-roi",
        title: "Real Estate Video Marketing ROI",
        description:
          "How to measure the real business impact of video marketing in real estate — from listing inquiries to closed deals. Benchmarks, attribution, and tracking.",
        primaryKeyword: "real estate video marketing roi",
        searchVolume: 300,
        blogSlugs: ["neighborhood-video-seo"],
        industryPageSlugs: ["realtors"],
        crossLinkSubTopicSlugs: ["video-marketing-roi", "video-marketing-metrics"],
      },
    ],
    crossLinkPillarSlugs: ["ai-video-creation", "social-media-video-strategy"],
    relatedIndustryPageSlugs: ["realtors"],
    leadMagnet: {
      title: "Real Estate Video Content Playbook",
      description: "52 weeks of video content ideas, scripts, and posting strategies built specifically for real estate agents.",
      ctaText: "Get the Playbook",
    },
  },

  /* ────────────────────────────────────────────────────────
   * PILLAR 5: AI Video for Professional Services
   * ──────────────────────────────────────────────────────── */
  {
    slug: "ai-video-professional-services",
    title: "AI Video for Professional Services",
    headline: "AI Video for Professional Services: Legal, Medical & Financial",
    heroSubtitle:
      "How attorneys, doctors, and financial advisors use AI video to build authority, attract clients, and stay compliant — without hours of production time.",
    description:
      "The complete guide to AI video for professional services. Industry-specific strategies for legal, medical, and financial professionals.",
    primaryKeyword: "video marketing for professional services",
    searchVolume: 600,
    icon: Briefcase,
    accentColor: "cyan",
    navDescription: "Video for legal, medical & financial",
    subTopics: [
      {
        slug: "video-marketing-for-lawyers",
        title: "Video Marketing for Lawyers",
        description:
          "How law firms use video to generate consultations, build trust, and establish thought leadership — while staying within ethical advertising guidelines.",
        primaryKeyword: "video marketing for lawyers",
        searchVolume: 700,
        blogSlugs: ["lawyer-video-marketing"],
        industryPageSlugs: ["attorneys"],
        crossLinkSubTopicSlugs: ["legal-video-content-ideas", "building-authority-with-video"],
      },
      {
        slug: "video-marketing-for-doctors",
        title: "Video Marketing for Doctors",
        description:
          "How medical professionals use video for patient education, practice marketing, and community trust-building — while maintaining clinical accuracy.",
        primaryKeyword: "patient education video",
        searchVolume: 200,
        blogSlugs: [],
        industryPageSlugs: ["doctors"],
        crossLinkSubTopicSlugs: ["building-authority-with-video", "content-calendar-strategy"],
      },
      {
        slug: "video-marketing-for-advisors",
        title: "Video Marketing for Financial Advisors",
        description:
          "How financial advisors use video to build AUM, establish market expertise, and connect with prospects — with compliance-friendly content strategies.",
        primaryKeyword: "financial advisor video marketing",
        searchVolume: 400,
        blogSlugs: ["financial-advisor-video"],
        industryPageSlugs: ["advisors"],
        crossLinkSubTopicSlugs: ["linkedin-video-strategy", "building-authority-with-video"],
      },
      {
        slug: "legal-video-content-ideas",
        title: "Legal Video Content Ideas",
        description:
          "50+ video content ideas for law firms — organized by practice area, content type, and funnel stage. Know-your-rights tips, case results, FAQ videos, and more.",
        primaryKeyword: "legal content video ideas",
        searchVolume: 200,
        blogSlugs: ["lawyer-video-marketing"],
        industryPageSlugs: ["attorneys"],
        crossLinkSubTopicSlugs: ["video-marketing-for-lawyers", "video-content-strategy"],
      },
      {
        slug: "building-authority-with-video",
        title: "Building Professional Authority With Video",
        description:
          "How video accelerates trust and authority for service professionals. The psychology of video trust, content frameworks, and long-term positioning strategies.",
        primaryKeyword: "authority building video content",
        searchVolume: 300,
        blogSlugs: ["lawyer-video-marketing", "financial-advisor-video"],
        industryPageSlugs: ["attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["professional-video-branding", "voice-cloning-for-video"],
      },
    ],
    crossLinkPillarSlugs: ["video-marketing-professionals", "ai-video-real-estate"],
    relatedIndustryPageSlugs: ["attorneys", "doctors", "advisors"],
    leadMagnet: {
      title: "Professional Services Video Script Templates",
      description: "Done-for-you video scripts for legal, medical, and financial professionals. Compliant, engaging, and ready to customize.",
      ctaText: "Get the Templates",
    },
  },

  /* ────────────────────────────────────────────────────────
   * PILLAR 6: AI Content at Scale
   * ──────────────────────────────────────────────────────── */
  {
    slug: "ai-content-at-scale",
    title: "AI Content at Scale",
    headline: "AI Content at Scale: From 1 Video to 30 Per Month",
    heroSubtitle:
      "How to scale your content production from occasional posts to daily publishing — using AI to handle creation, repurposing, and distribution without burning out.",
    description:
      "The complete guide to scaling content production with AI. Batch workflows, repurposing strategies, and automation techniques for consistent, high-quality output.",
    primaryKeyword: "ai content creation at scale",
    searchVolume: 800,
    icon: Layers,
    accentColor: "rose",
    navDescription: "Scale from 1 to 30 videos/month",
    subTopics: [
      {
        slug: "ai-content-repurposing",
        title: "AI Content Repurposing Guide",
        description:
          "How to turn one piece of content into 10+ assets across platforms. Repurposing frameworks, AI tools, and distribution strategies.",
        primaryKeyword: "ai content repurposing",
        searchVolume: 600,
        blogSlugs: ["batch-video-workflow"],
        industryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
        crossLinkSubTopicSlugs: ["batch-video-creation", "social-media-video-automation"],
      },
      {
        slug: "batch-video-creation",
        title: "Batch Video Creation Workflow",
        description:
          "How to batch-produce a week or month of video content in a single session. Workflows, templates, and tools for efficient production at scale.",
        primaryKeyword: "batch video creation",
        searchVolume: 300,
        blogSlugs: ["batch-video-workflow"],
        industryPageSlugs: [],
        crossLinkSubTopicSlugs: ["ai-content-repurposing", "content-calendar-strategy"],
      },
      {
        slug: "ai-vs-traditional-video",
        title: "AI vs Traditional Video Production",
        description:
          "A detailed comparison of AI-generated video vs traditional production — cost, quality, speed, scalability, and when to use each approach.",
        primaryKeyword: "ai vs traditional video production",
        searchVolume: 400,
        blogSlugs: ["multi-cut-method"],
        industryPageSlugs: [],
        crossLinkSubTopicSlugs: ["how-ai-video-works", "create-videos-without-filming"],
      },
      {
        slug: "content-consistency",
        title: "Content Consistency for Brand Building",
        description:
          "Why consistency matters more than virality, how to maintain quality at volume, and systems for never missing a posting day.",
        primaryKeyword: "content consistency brand",
        searchVolume: 350,
        blogSlugs: ["batch-video-workflow", "scaling-personal-brand-ai"],
        industryPageSlugs: [],
        crossLinkSubTopicSlugs: ["professional-video-branding", "content-calendar-strategy"],
      },
      {
        slug: "scaling-personal-brand",
        title: "Scaling Your Personal Brand With AI",
        description:
          "How AI enables solopreneurs and small teams to build personal brands that compete with firms 10x their size. Strategies, tools, and real examples.",
        primaryKeyword: "scaling personal brand content",
        searchVolume: 400,
        blogSlugs: ["scaling-personal-brand-ai"],
        industryPageSlugs: ["realtors", "attorneys", "advisors"],
        crossLinkSubTopicSlugs: ["ai-avatar-video-guide", "building-authority-with-video"],
      },
    ],
    crossLinkPillarSlugs: ["ai-video-creation", "social-media-video-strategy"],
    relatedIndustryPageSlugs: ["realtors", "attorneys", "doctors", "advisors"],
    leadMagnet: {
      title: "Content Scaling Checklist",
      description: "A step-by-step checklist to go from posting occasionally to 30 videos per month — without burning out.",
      ctaText: "Download the Checklist",
    },
  },
];

/* ── Helper Functions ── */

export function getAllPillars(): Pillar[] {
  return pillars;
}

export function getPillarBySlug(slug: string): Pillar | undefined {
  return pillars.find((p) => p.slug === slug);
}

export function getSubTopic(
  pillarSlug: string,
  subTopicSlug: string
):
  | {
      pillar: Pillar;
      subTopic: SubTopic;
      prevSubTopic: SubTopic | null;
      nextSubTopic: SubTopic | null;
    }
  | undefined {
  const pillar = getPillarBySlug(pillarSlug);
  if (!pillar) return undefined;
  const index = pillar.subTopics.findIndex((st) => st.slug === subTopicSlug);
  if (index === -1) return undefined;
  return {
    pillar,
    subTopic: pillar.subTopics[index],
    prevSubTopic: index > 0 ? pillar.subTopics[index - 1] : null,
    nextSubTopic:
      index < pillar.subTopics.length - 1
        ? pillar.subTopics[index + 1]
        : null,
  };
}

export function getRelatedPillarsForBlog(
  blogSlug: string
): { pillar: Pillar; subTopic: SubTopic }[] {
  const results: { pillar: Pillar; subTopic: SubTopic }[] = [];
  for (const pillar of pillars) {
    for (const subTopic of pillar.subTopics) {
      if (subTopic.blogSlugs.includes(blogSlug)) {
        results.push({ pillar, subTopic });
      }
    }
  }
  return results;
}

/** Convert a kebab-case slug to a display label */
export function formatSlugLabel(slug: string): string {
  const lowerWords = ["and", "vs", "for", "the", "a", "an", "of", "in", "to"];
  return slug
    .split("-")
    .map((w) =>
      lowerWords.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

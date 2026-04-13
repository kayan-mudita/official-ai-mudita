import {
  Home,
  Scale,
  HeartPulse,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type IndustryAccent = "utility" | "special" | "mix";

export interface IndustryStat {
  value: string;
  label: string;
}

export interface IndustryTestimonial {
  name: string;
  title: string;
  quote: string;
}

export interface IndustryStep {
  num: string;
  title: string;
  text: string;
}

export interface Industry {
  slug: string;
  /** Short label used in navbar + portal cards. */
  shortLabel: string;
  /** "Real estate professionals" — used in the hero eyebrow. */
  heroEyebrow: string;
  /** Industry-side icon. */
  icon: LucideIcon;
  /** Accent token. */
  accent: IndustryAccent;
  /** "Built for realtors." — last word becomes the gradient highlight. */
  headlineSuffix: string;
  /** Hero subhead. */
  description: string;
  /** Eyebrow on the secondary CTA button (e.g., "See real estate examples"). */
  secondaryCtaLabel: string;
  /** Anchor on /use-cases for the secondary CTA (e.g., "real-estate"). */
  useCaseAnchor: string;
  /** 4 hero stat cards. */
  results: IndustryStat[];
  /** Content library section. */
  contentLibrary: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    types: string[];
  };
  /** "How it works for [industry]" 3-step bento. */
  workflow: IndustryStep[];
  /** Testimonial. */
  testimonial: IndustryTestimonial;
  /** CTA outro. */
  cta: {
    heading: string;
    headingAccent: string;
    description: string;
    badge: string;
  };
  /** Related feature slugs to link to (from src/data/features.ts). */
  relatedFeatures: string[];
  /**
   * YMYL compliance disclaimer block. Present for regulated professions
   * (attorneys, doctors, financial advisors) where professional rules require
   * explicit statements about the tool's role and the user's responsibility.
   */
  compliance?: {
    eyebrow: string;
    heading: string;
    body: string;
    bullets: string[];
  };
}

export const industries: Industry[] = [
  {
    slug: "realtors",
    shortLabel: "Real Estate",
    heroEyebrow: "Built for real estate professionals",
    icon: Home,
    accent: "utility",
    headlineSuffix: "Built for realtors.",
    description:
      "Generate listing tours, market updates, and neighborhood guides — using your face and voice. Post daily without ever touching a camera.",
    secondaryCtaLabel: "See real estate examples",
    useCaseAnchor: "real-estate",
    results: [
      { value: "5/wk", label: "Videos per week" },
      { value: "12/mo", label: "New leads from content" },
      { value: "0 min", label: "Time filming" },
      { value: "$79", label: "Per month" },
    ],
    contentLibrary: {
      eyebrow: "Real estate content library",
      titleLead: "6 template categories.",
      titleAccent: "Ready to customize.",
      types: [
        "Listing video tours",
        "Market updates",
        "Just-sold celebrations",
        "Open house invites",
        "Neighborhood spotlights",
        "Buyer & seller tips",
      ],
    },
    workflow: [
      {
        num: "01",
        title: "Upload listing photos",
        text: "Pull MLS photos or upload your own. The AI uses them as B-roll behind your digital twin.",
      },
      {
        num: "02",
        title: "Pick a format",
        text: "Listing tour, market update, or neighborhood guide. Each format has its own pacing and structure.",
      },
      {
        num: "03",
        title: "Approve and post",
        text: "Review the script and final video. Auto-posts to Instagram, TikTok, LinkedIn, YouTube, and Facebook.",
      },
    ],
    testimonial: {
      name: "Sarah Mitchell",
      title: "Broker / Owner",
      quote:
        "I went from posting once a month to five times a week. My DMs are full of people saying they see me everywhere. Three new listings came from social this quarter alone.",
    },
    cta: {
      heading: "Post daily.",
      headingAccent: "Never film again.",
      description:
        "AI-generated listing tours, market updates, and more — using your face, your voice, and your branding.",
      badge: "Built specifically for realtors",
    },
    relatedFeatures: ["ai-video-studio", "auto-posting"],
  },
  {
    slug: "attorneys",
    shortLabel: "Legal",
    heroEyebrow: "Built for legal professionals",
    icon: Scale,
    accent: "special",
    headlineSuffix: "Built for attorneys.",
    description:
      "Generate know-your-rights content, case result videos, and legal tips that drive consultations — using your face and voice. You review every script before it goes live.",
    secondaryCtaLabel: "See legal examples",
    useCaseAnchor: "legal",
    results: [
      { value: "240K+", label: "Views per month" },
      { value: "8/mo", label: "Consultation calls" },
      { value: "20 min", label: "Weekly time investment" },
      { value: "$79", label: "Per month" },
    ],
    contentLibrary: {
      eyebrow: "Legal content library",
      titleLead: "8 template categories.",
      titleAccent: "Endless variations.",
      types: [
        "Know-your-rights tips",
        "Case result highlights",
        "Legal myth-busting",
        "Process explainers",
        "Client FAQ answers",
        "Legal news reactions",
        "Client success stories",
        "Weekly legal tips",
      ],
    },
    workflow: [
      {
        num: "01",
        title: "Pick a topic",
        text: "Choose from proven legal content frameworks — educational, not advisory. Or write your own.",
      },
      {
        num: "02",
        title: "Review the script",
        text: "Every script lands in your queue first. Edit any line. Approve only what you stand behind.",
      },
      {
        num: "03",
        title: "Auto-publish",
        text: "Once approved, your video posts to every platform on your schedule — your face, your voice, your firm.",
      },
    ],
    testimonial: {
      name: "Marcus Rivera",
      title: "Managing Partner, Personal Injury",
      quote:
        "We were spending $4,000 a month on a videographer who delivered four videos. Official AI gives us 30 for a fraction of the cost — and they actually look like me on camera.",
    },
    cta: {
      heading: "Your expertise.",
      headingAccent: "AI-powered content.",
      description:
        "Generate legal content videos using your face and voice. Review every script. Approve before it goes live.",
      badge: "Built specifically for attorneys",
    },
    relatedFeatures: ["script-engine", "ai-twin-voice"],
    compliance: {
      eyebrow: "Compliance & disclaimers",
      heading: "Built to keep you in control of what you publish.",
      body: "Official AI is a content creation tool, not legal advice. Every script is fully editable before a single frame is generated, and nothing publishes without your review and approval — so you always stay compliant with your state bar's advertising rules, solicitation restrictions, and advertising-review requirements.",
      bullets: [
        "You are the publisher. Review, edit, and approve every script before generation; nothing auto-publishes without your explicit sign-off.",
        "State bar compliance is your responsibility. Advertising and solicitation rules vary by jurisdiction (Model Rules 7.1–7.3, plus state-specific amendments) — run videos past your firm's advertising review where required.",
        "No confidential client information should ever be used as input. Use hypotheticals and general educational content only.",
        "Add the disclaimers your jurisdiction requires (e.g., \"attorney advertising,\" \"prior results do not guarantee a similar outcome\") directly in your scripts or video captions before publishing.",
      ],
    },
  },
  {
    slug: "doctors",
    shortLabel: "Medical",
    heroEyebrow: "Built for medical professionals",
    icon: HeartPulse,
    accent: "special",
    headlineSuffix: "Built for doctors.",
    description:
      "Generate patient education videos, health tips, and procedure explainers — using your face and voice. Review every script for medical accuracy before it goes live.",
    secondaryCtaLabel: "See medical examples",
    useCaseAnchor: "medical",
    results: [
      { value: "20/mo", label: "Videos per month" },
      { value: "15/mo", label: "New patient inquiries" },
      { value: "30 min", label: "Weekly time investment" },
      { value: "$79", label: "Per month" },
    ],
    contentLibrary: {
      eyebrow: "Medical content library",
      titleLead: "7 template categories.",
      titleAccent: "Medically reviewable.",
      types: [
        "Health tips",
        "Procedure explainers",
        "Myth-busting videos",
        "Wellness advice",
        "Seasonal health content",
        "Patient FAQ answers",
        "Prevention & screening",
      ],
    },
    workflow: [
      {
        num: "01",
        title: "Pick an education topic",
        text: "Common patient questions, procedure explainers, prevention tips — pick from medical-vetted templates.",
      },
      {
        num: "02",
        title: "Review for accuracy",
        text: "Every script goes through your queue. Verify medical accuracy before anything reaches a patient.",
      },
      {
        num: "03",
        title: "Educate at scale",
        text: "Approved videos auto-post to every platform — building patient trust before they even book.",
      },
    ],
    testimonial: {
      name: "Dr. Priya Patel",
      title: "Board-Certified Dermatologist",
      quote:
        "My patients constantly tell me they watched my videos before booking. I review the scripts for accuracy, approve them, and they post automatically. It takes me 20 minutes a week.",
    },
    cta: {
      heading: "Patient education.",
      headingAccent: "Automated.",
      description:
        "Generate medical content videos using your face and voice. Review every script for accuracy. Approve before it goes live.",
      badge: "Built specifically for doctors",
    },
    relatedFeatures: ["script-engine", "ai-twin-voice"],
    compliance: {
      eyebrow: "Compliance & disclaimers",
      heading: "General education only. You control every script.",
      body: "Official AI is a content creation tool, not medical advice. Content produced here is intended as general patient education — it does not diagnose, treat, or replace a clinical consultation. Every script is fully editable before generation and nothing publishes without your explicit review and approval, so you stay inside HIPAA and your professional board's standards.",
      bullets: [
        "No PHI as input. Never use identifiable patient information, case details, or images of real patients when generating a script.",
        "General education only. Content should be framed as educational, not as personal medical advice for any individual patient.",
        "Add a standard disclaimer to every video (e.g., \"for educational purposes only — consult your physician\") directly in the script or on-screen caption before approving.",
        "You remain the clinical reviewer. Every script passes through your queue for medical-accuracy review before a single frame is generated.",
      ],
    },
  },
  {
    slug: "advisors",
    shortLabel: "Financial",
    heroEyebrow: "Built for financial advisors",
    icon: TrendingUp,
    accent: "utility",
    headlineSuffix: "Built for advisors.",
    description:
      "Generate daily market commentary, financial tips, and thought leadership content — using your face and voice. Review over morning coffee, auto-post by 8am.",
    secondaryCtaLabel: "See advisor examples",
    useCaseAnchor: "financial-services",
    results: [
      { value: "7/wk", label: "Posts per week" },
      { value: "45K", label: "LinkedIn impressions / mo" },
      { value: "3/mo", label: "New AUM inquiries" },
      { value: "$79", label: "Per month" },
    ],
    contentLibrary: {
      eyebrow: "Financial content library",
      titleLead: "6 template categories.",
      titleAccent: "Market-ready daily.",
      types: [
        "Market commentary",
        "Financial tips",
        "Retirement planning",
        "Economic news reactions",
        "Investment explainers",
        "Tax planning tips",
      ],
    },
    workflow: [
      {
        num: "01",
        title: "AI watches the market",
        text: "Market news, rate moves, and economic events get pulled into a daily content brief.",
      },
      {
        num: "02",
        title: "Review with coffee",
        text: "Every morning, your queue is ready. Approve what resonates, skip what doesn't.",
      },
      {
        num: "03",
        title: "Live by 8am",
        text: "Approved videos auto-post to LinkedIn, Instagram, and YouTube before the market opens.",
      },
    ],
    testimonial: {
      name: "Rachel Chen",
      title: "Financial Advisor, $50M AUM",
      quote:
        "My competitors are posting daily market commentary on LinkedIn. Now I do too — in 20 minutes a week. Three new AUM inquiries came from content last month alone.",
    },
    cta: {
      heading: "Become the go-to advisor",
      headingAccent: "in your market.",
      description:
        "AI-generated market commentary, financial tips, and thought leadership — using your face and voice.",
      badge: "Built specifically for financial advisors",
    },
    relatedFeatures: ["script-engine", "analytics"],
    compliance: {
      eyebrow: "Compliance & disclaimers",
      heading: "Built for the compliance review your firm already runs.",
      body: "Official AI is a content creation tool, not financial advice. Every script is fully editable before generation and nothing publishes without your explicit approval — so you can run each video through the same SEC, FINRA, and firm-level advertising review process you already use for any other public-facing communication.",
      bullets: [
        "Review before generation. SEC Marketing Rule (206(4)-1) and FINRA Rule 2210 both treat social content as advertising — every script passes through your queue for compliance review before a frame is rendered.",
        "No individualized advice. Content should be framed as general financial education, not as a recommendation for any specific client or account.",
        "Performance claims. If you include historical returns, add the required disclaimers (net of fees, past performance, hypothetical vs. actual) directly in the script and on-screen captions.",
        "Archive every approved piece. Retain the final scripts and videos per your firm's books-and-records requirements (SEC Rule 204-2 / FINRA 17a-4).",
      ],
    },
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

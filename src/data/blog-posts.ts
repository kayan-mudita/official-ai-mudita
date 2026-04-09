export type BlogCategory =
  | "AI Video"
  | "Content Strategy"
  | "Social Media"
  | "Industry Tips"
  | "Product Updates";

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  /** ISO date — `YYYY-MM-DD`. */
  isoDate: string;
  /** Display date — e.g. "March 18, 2026". */
  date: string;
  readTime: string;
  featured?: boolean;
  featuredImage: { src: string; alt: string };
}

export const blogPosts: BlogPostMeta[] = [
  {
    slug: "multi-cut-method",
    title: "The Multi-Cut Method: Why One-Shot AI Video Looks Like Garbage",
    excerpt:
      "Every AI video tool generates a single continuous shot from a prompt. That is why they all look fake. Here is how multi-cut composition changes everything.",
    category: "AI Video",
    isoDate: "2026-03-18",
    date: "March 18, 2026",
    readTime: "6 min read",
    featured: true,
    featuredImage: {
      src: "/images/featured/blog/multi-cut-method.png",
      alt: "Fragmented light shards floating across the frame and joining seamlessly into a single continuous beam",
    },
  },
  {
    slug: "ai-ugc-future",
    title: "Why AI-Generated UGC Is the Future of Professional Content",
    excerpt:
      "The content that performs best is not polished corporate video. It is raw, face-to-camera UGC. AI is about to make that accessible to every professional.",
    category: "AI Video",
    isoDate: "2026-03-12",
    date: "March 12, 2026",
    readTime: "5 min read",
    featuredImage: {
      src: "/images/featured/blog/ai-ugc-future.png",
      alt: "Suspended particles forming the silhouette of a portrait, lit by magenta and cyan ambient glow",
    },
  },
  {
    slug: "real-estate-agents-ai",
    title: "How Real Estate Agents Are Using AI to Post Daily Without Filming",
    excerpt:
      "The top-producing agents post content daily. Most agents post once a month. AI is closing that gap for agents who know their stuff but hate being on camera.",
    category: "Industry Tips",
    isoDate: "2026-03-06",
    date: "March 6, 2026",
    readTime: "7 min read",
    featuredImage: {
      src: "/images/featured/blog/real-estate-agents-ai.png",
      alt: "Abstract architectural forms — luminous planes and edges assembled from cyan and magenta light",
    },
  },
  {
    slug: "five-content-formats",
    title: "5 Content Formats That Work for Every Industry",
    excerpt:
      "Not all content formats work for all professionals. But these five formats consistently drive engagement regardless of industry, audience, or platform.",
    category: "Content Strategy",
    isoDate: "2026-02-28",
    date: "February 28, 2026",
    readTime: "4 min read",
    featuredImage: {
      src: "/images/featured/blog/five-content-formats.png",
      alt: "Five glowing geometric shards arranged on a dark canvas, each tinted differently",
    },
  },
  {
    slug: "scaling-personal-brand-ai",
    title: "How Solo Professionals Scale a Personal Brand With AI",
    excerpt:
      "Solo professionals cannot hire a content team. AI makes it possible to build a personal brand at scale without sacrificing quality or authenticity.",
    category: "Content Strategy",
    isoDate: "2026-04-02",
    date: "April 2, 2026",
    readTime: "6 min read",
    featuredImage: {
      src: "/images/featured/blog/scaling-personal-brand-ai.png",
      alt: "A single luminous monolith multiplying into a row of identical luminous columns receding into the distance",
    },
  },
  {
    slug: "tiktok-professional-guide",
    title: "TikTok for Professionals: How to Build Authority Without Dancing",
    excerpt:
      "TikTok is not just for teenagers. Professionals are using it to build authority and attract clients.",
    category: "Social Media",
    isoDate: "2026-04-01",
    date: "April 1, 2026",
    readTime: "6 min read",
    featuredImage: {
      src: "/images/featured/blog/tiktok-professional-guide.png",
      alt: "A single luminous vertical bar of light rising through dark space, surrounded by motion blur and particle dust",
    },
  },
  {
    slug: "batch-video-workflow",
    title: "How to Create 30 Videos in One Sitting",
    excerpt:
      "Batch video creation is how top creators maintain a daily posting schedule without burning out. Here is the exact workflow for producing 30 videos in a single session.",
    category: "AI Video",
    isoDate: "2026-03-30",
    date: "March 30, 2026",
    readTime: "5 min read",
    featuredImage: {
      src: "/images/featured/blog/batch-video-workflow.png",
      alt: "Thirty parallel rectangular planes of light arrayed in a grid, each glowing with subtle variation",
    },
  },
  {
    slug: "linkedin-video-tips",
    title: "7 LinkedIn Video Strategies That Actually Generate Leads",
    excerpt:
      "Most LinkedIn videos get views but zero leads. These seven strategies turn LinkedIn video content into a consistent source of inbound business.",
    category: "Social Media",
    isoDate: "2026-03-28",
    date: "March 28, 2026",
    readTime: "7 min read",
    featuredImage: {
      src: "/images/featured/blog/linkedin-video-tips.png",
      alt: "Seven ascending light spires of varying heights, organized like a bar chart bathed in cyan and magenta",
    },
  },
  {
    slug: "voice-cloning-guide",
    title: "How Voice Cloning Works (And Why It Matters for Video)",
    excerpt:
      "Voice cloning lets AI video speak in your actual voice. Here is how the technology works and why it matters for professional content.",
    category: "AI Video",
    isoDate: "2026-03-25",
    date: "March 25, 2026",
    readTime: "6 min read",
    featuredImage: {
      src: "/images/featured/blog/voice-cloning-guide.png",
      alt: "Abstract sound waves dissolving into a holographic particle field, lit by magenta and cyan",
    },
  },
  {
    slug: "lawyer-video-marketing",
    title: "Video Marketing for Lawyers: A Compliance-Friendly Guide",
    excerpt:
      "Video marketing works for law firms, but bar rules add complexity. Here is how to create legal content that stays within ethical guidelines.",
    category: "Industry Tips",
    isoDate: "2026-03-22",
    date: "March 22, 2026",
    readTime: "7 min read",
    featuredImage: {
      src: "/images/featured/blog/lawyer-video-marketing.png",
      alt: "A perfectly balanced glowing scale rendered as abstract geometric shapes in cyan and magenta",
    },
  },
  {
    slug: "video-marketing-roi-guide",
    title: "How to Measure Video Marketing ROI Without Expensive Tools",
    excerpt:
      "Most professionals know video works but cannot prove it. Here is a simple framework for measuring video marketing ROI.",
    category: "Content Strategy",
    isoDate: "2026-03-20",
    date: "March 20, 2026",
    readTime: "6 min read",
    featuredImage: {
      src: "/images/featured/blog/video-marketing-roi-guide.png",
      alt: "A single ascending light curve traced through dark space, surrounded by floating particles",
    },
  },
  {
    slug: "neighborhood-video-seo",
    title: "How Neighborhood Spotlight Videos Win Listings Before the Pitch",
    excerpt:
      "Neighborhood spotlight videos position you as the local expert before a seller even calls. Here is how to create them with AI and win more listings.",
    category: "Industry Tips",
    isoDate: "2026-03-15",
    date: "March 15, 2026",
    readTime: "5 min read",
    featuredImage: {
      src: "/images/featured/blog/neighborhood-video-seo.png",
      alt: "A grid of luminous building silhouettes connected by faint lines of light, like a glowing neighborhood map",
    },
  },
  {
    slug: "financial-advisor-video",
    title: "How Financial Advisors Use Video to Build AUM",
    excerpt:
      "Financial advisors who use video consistently grow AUM faster. Here is how to create compliant, trust-building video content that attracts high-net-worth clients.",
    category: "Industry Tips",
    isoDate: "2026-03-10",
    date: "March 10, 2026",
    readTime: "6 min read",
    featuredImage: {
      src: "/images/featured/blog/financial-advisor-video.png",
      alt: "A rising luminous arc traced through dark space, anchored by a glowing cyan disc",
    },
  },
];

export function getBlogPostBySlug(slug: string): BlogPostMeta | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const current = getBlogPostBySlug(slug);
  if (!current) return [];
  // Same category first, then fall back to most recent across all
  const sameCat = blogPosts.filter(
    (p) => p.category === current.category && p.slug !== slug,
  );
  if (sameCat.length >= limit) return sameCat.slice(0, limit);
  const others = blogPosts.filter(
    (p) => p.slug !== slug && p.category !== current.category,
  );
  return [...sameCat, ...others].slice(0, limit);
}

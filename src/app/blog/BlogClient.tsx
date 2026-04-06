"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";

const posts = [
  {
    slug: "multi-cut-method",
    title: "The Multi-Cut Method: Why One-Shot AI Video Looks Like Garbage",
    excerpt:
      "Every AI video tool generates a single continuous shot from a prompt. That is why they all look fake. Here is how multi-cut composition changes everything.",
    category: "AI Video",
    readTime: "6 min read",
    date: "March 18, 2026",
    featured: true,
  },
  {
    slug: "ai-ugc-future",
    title: "Why AI-Generated UGC Is the Future of Professional Content",
    excerpt:
      "The content that performs best is not polished corporate video. It is raw, face-to-camera UGC. AI is about to make that accessible to every professional.",
    category: "AI Video",
    readTime: "5 min read",
    date: "March 12, 2026",
    featured: false,
  },
  {
    slug: "real-estate-agents-ai",
    title: "How Real Estate Agents Are Using AI to Post Daily Without Filming",
    excerpt:
      "The top-producing agents post content daily. Most agents post once a month. AI is closing that gap for agents who know their stuff but hate being on camera.",
    category: "Industry Tips",
    readTime: "7 min read",
    date: "March 6, 2026",
    featured: false,
  },
  {
    slug: "five-content-formats",
    title: "5 Content Formats That Work for Every Industry",
    excerpt:
      "Not all content formats work for all professionals. But these five formats consistently drive engagement regardless of industry, audience, or platform.",
    category: "Content Strategy",
    readTime: "4 min read",
    date: "February 28, 2026",
    featured: false,
  },
  {
    slug: "scaling-personal-brand-ai",
    title: "How Solo Professionals Scale a Personal Brand With AI",
    excerpt:
      "Solo professionals cannot hire a content team. AI makes it possible to build a personal brand at scale without sacrificing quality or authenticity.",
    category: "Content Strategy",
    readTime: "6 min read",
    date: "April 2, 2026",
    featured: false,
  },
  {
    slug: "tiktok-professional-guide",
    title: "TikTok for Professionals: How to Build Authority Without Dancing",
    excerpt:
      "TikTok is not just for teenagers. Professionals are using it to build authority, attract clients, and grow their practice without compromising credibility.",
    category: "Social Media",
    readTime: "6 min read",
    date: "April 1, 2026",
    featured: false,
  },
  {
    slug: "batch-video-workflow",
    title: "How to Create 30 Videos in One Sitting",
    excerpt:
      "Batch video creation is how top creators maintain a daily posting schedule without burning out. Here is the exact workflow for producing 30 videos in a single session.",
    category: "AI Video",
    readTime: "5 min read",
    date: "March 30, 2026",
    featured: false,
  },
  {
    slug: "linkedin-video-tips",
    title: "7 LinkedIn Video Strategies That Actually Generate Leads",
    excerpt:
      "Most LinkedIn videos get views but zero leads. These seven strategies turn LinkedIn video content into a consistent source of inbound business.",
    category: "Social Media",
    readTime: "7 min read",
    date: "March 28, 2026",
    featured: false,
  },
  {
    slug: "voice-cloning-guide",
    title: "How Voice Cloning Works (And Why It Matters for Video)",
    excerpt:
      "Voice cloning lets AI video speak in your actual voice. Here is how the technology works, what it sounds like, and why it matters for professional content.",
    category: "AI Video",
    readTime: "6 min read",
    date: "March 25, 2026",
    featured: false,
  },
  {
    slug: "lawyer-video-marketing",
    title: "Video Marketing for Lawyers: A Compliance-Friendly Guide",
    excerpt:
      "Video marketing works for law firms, but bar rules add complexity. Here is how to create compelling legal content that stays within ethical guidelines.",
    category: "Industry Tips",
    readTime: "7 min read",
    date: "March 22, 2026",
    featured: false,
  },
  {
    slug: "video-marketing-roi-guide",
    title: "How to Measure Video Marketing ROI Without Expensive Tools",
    excerpt:
      "Most professionals know video works but cannot prove it. Here is a simple framework for measuring video marketing ROI with tools you already have.",
    category: "Content Strategy",
    readTime: "6 min read",
    date: "March 20, 2026",
    featured: false,
  },
  {
    slug: "neighborhood-video-seo",
    title: "How Neighborhood Spotlight Videos Win Listings Before the Pitch",
    excerpt:
      "Neighborhood spotlight videos position you as the local expert before a seller even calls. Here is how to create them with AI and win more listings.",
    category: "Industry Tips",
    readTime: "5 min read",
    date: "March 15, 2026",
    featured: false,
  },
  {
    slug: "financial-advisor-video",
    title: "How Financial Advisors Use Video to Build AUM",
    excerpt:
      "Financial advisors who use video consistently grow AUM faster. Here is how to create compliant, trust-building video content that attracts high-net-worth clients.",
    category: "Industry Tips",
    readTime: "6 min read",
    date: "March 10, 2026",
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  "AI Video": "text-blue-400/70 bg-blue-500/10 border-blue-500/20",
  "Content Strategy": "text-violet-400/70 bg-violet-500/10 border-violet-500/20",
  "Social Media": "text-emerald-400/70 bg-emerald-500/10 border-emerald-500/20",
  "Industry Tips": "text-amber-400/70 bg-amber-500/10 border-amber-500/20",
};

export default function BlogClient() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-[13px] font-medium text-blue-400/70 uppercase tracking-widest mb-4">
            Blog
          </p>
          <h1 className="text-[42px] sm:text-[56px] font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
            Insights on AI content
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              and professional growth.
            </span>
          </h1>
          <p className="text-[17px] text-white/35 max-w-xl mx-auto leading-relaxed font-light">
            How AI is changing content creation for professionals. Strategy,
            technology, and real results.
          </p>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block p-8 sm:p-10 rounded-2xl border border-white/[0.04] bg-white/[0.015] hover:border-white/[0.08] hover:bg-white/[0.025] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                    categoryColors[featured.category] || "text-white/40 bg-white/[0.04] border-white/[0.06]"
                  }`}
                >
                  {featured.category}
                </span>
                <span className="text-[12px] text-white/20">{featured.date}</span>
              </div>

              <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-white/90 mb-3 group-hover:text-white transition-colors">
                {featured.title}
              </h2>
              <p className="text-[15px] text-white/30 leading-relaxed mb-6 max-w-2xl">
                {featured.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-white/20">
                  <Clock className="w-3 h-3" />
                  {featured.readTime}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-blue-400/70 group-hover:text-blue-400 transition-colors">
                  Read article
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Post grid */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015] hover:border-white/[0.08] hover:bg-white/[0.025] transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      categoryColors[post.category] || "text-white/40 bg-white/[0.04] border-white/[0.06]"
                    }`}
                  >
                    {post.category}
                  </span>
                </div>

                <h3 className="text-[15px] font-semibold text-white/80 mb-2 leading-snug group-hover:text-white transition-colors">
                  {post.title}
                </h3>
                <p className="text-[12px] text-white/25 leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/15">{post.date}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/15">
                    <Clock className="w-2.5 h-2.5" />
                    {post.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        heading="See it for yourself."
        description="Stop reading about AI content. Start creating it. Your first video is free."
        badge="Free to try, no credit card required"
      />
    </MarketingLayout>
  );
}

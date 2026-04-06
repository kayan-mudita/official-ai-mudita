"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";

interface SidebarSubTopic {
  slug: string;
  title: string;
}

interface SubTopicSidebarProps {
  pillarSlug: string;
  pillarTitle: string;
  accentColor: string;
  subTopics: SidebarSubTopic[];
  currentSubTopicSlug: string;
  relatedBlogSlugs: string[];
  relatedIndustryPageSlugs: string[];
}

const industryLabels: Record<string, string> = {
  realtors: "For Realtors",
  attorneys: "For Attorneys",
  doctors: "For Doctors",
  advisors: "For Advisors",
};

const blogTitleMap: Record<string, string> = {
  "multi-cut-method": "The Multi-Cut Method",
  "ai-ugc-future": "AI-Generated UGC Is the Future",
  "real-estate-agents-ai": "Real Estate Agents Using AI",
  "five-content-formats": "5 Content Formats That Work",
  "voice-cloning-guide": "How Voice Cloning Works",
  "video-marketing-roi-guide": "Measure Video Marketing ROI",
  "linkedin-video-tips": "LinkedIn Video Strategies",
  "tiktok-professional-guide": "TikTok for Professionals",
  "neighborhood-video-seo": "Neighborhood Spotlight Videos",
  "lawyer-video-marketing": "Video Marketing for Lawyers",
  "financial-advisor-video": "Video for Financial Advisors",
  "batch-video-workflow": "Create 30 Videos in One Sitting",
  "scaling-personal-brand-ai": "Scale Your Personal Brand With AI",
};

function formatBlogSlug(slug: string): string {
  if (blogTitleMap[slug]) return blogTitleMap[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function SubTopicSidebar({
  pillarSlug,
  pillarTitle,
  accentColor,
  subTopics,
  currentSubTopicSlug,
  relatedBlogSlugs,
  relatedIndustryPageSlugs,
}: SubTopicSidebarProps) {
  const [topicsOpen, setTopicsOpen] = useState(true);

  const accentBorder = {
    blue: "border-l-blue-400",
    violet: "border-l-violet-400",
    emerald: "border-l-emerald-400",
    amber: "border-l-amber-400",
    cyan: "border-l-cyan-400",
    rose: "border-l-rose-400",
  }[accentColor] || "border-l-blue-400";

  const activeBg = {
    blue: "bg-blue-500/[0.06]",
    violet: "bg-violet-500/[0.06]",
    emerald: "bg-emerald-500/[0.06]",
    amber: "bg-amber-500/[0.06]",
    cyan: "bg-cyan-500/[0.06]",
    rose: "bg-rose-500/[0.06]",
  }[accentColor] || "bg-blue-500/[0.06]";

  return (
    <aside className="hidden lg:block w-[260px] flex-shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Back to pillar */}
        <Link
          href={`/learn/${pillarSlug}`}
          className="flex items-center gap-2 text-[13px] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {pillarTitle}
        </Link>

        {/* Subtopics in this guide */}
        <div>
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="w-full flex items-center justify-between text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2"
          >
            Topics in this guide
            <ChevronDown className={`w-3 h-3 transition-transform ${topicsOpen ? "rotate-180" : ""}`} />
          </button>
          {topicsOpen && (
            <ul className="space-y-0.5">
              {subTopics.map((st) => {
                const isActive = st.slug === currentSubTopicSlug;
                return (
                  <li key={st.slug}>
                    <Link
                      href={`/learn/${pillarSlug}/${st.slug}`}
                      className={`block text-[13px] py-2 px-3 rounded-lg transition-colors ${
                        isActive
                          ? `text-white/80 font-medium border-l-2 ${accentBorder} ${activeBg}`
                          : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                      }`}
                    >
                      {st.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Related blog posts */}
        {relatedBlogSlugs.length > 0 && (
          <div>
            <div className="text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2">
              Related Articles
            </div>
            <ul className="space-y-1">
              {relatedBlogSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/blog/${slug}`}
                    className="block text-[13px] text-white/30 hover:text-white/60 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    {formatBlogSlug(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Industry pages */}
        {relatedIndustryPageSlugs.length > 0 && (
          <div>
            <div className="text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2">
              For Your Industry
            </div>
            <ul className="space-y-1">
              {relatedIndustryPageSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/for/${slug}`}
                    className="block text-[13px] text-white/30 hover:text-white/60 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    {industryLabels[slug] || slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="p-4 rounded-xl card-hairline">
          <p className="text-[13px] font-medium text-white/60 mb-2">Try Official AI</p>
          <p className="text-[12px] text-white/25 mb-3">See your AI twin in 30 seconds.</p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-400/80 hover:text-blue-400 transition-colors"
          >
            Free demo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

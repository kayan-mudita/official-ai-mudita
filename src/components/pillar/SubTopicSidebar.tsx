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

  const isUtility = ["blue", "cyan", "emerald"].includes(accentColor);
  const accentBorder = isUtility
    ? "border-l-utility-400"
    : "border-l-special-500";
  const activeBg = isUtility
    ? "bg-utility-400/[0.06]"
    : "bg-special-500/[0.06]";
  const accentText = isUtility ? "text-utility-300" : "text-special-300";
  const accentTextHover = isUtility
    ? "hover:text-utility-200"
    : "hover:text-special-200";

  return (
    <aside className="hidden lg:block w-[260px] flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Back to pillar */}
        <Link
          href={`/${pillarSlug}`}
          className="flex items-center gap-2 text-p3 text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {pillarTitle}
        </Link>

        {/* Subtopics in this guide */}
        <div>
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="w-full flex items-center justify-between text-p3 font-medium text-white/40 uppercase tracking-wider mb-2"
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
                      href={`/${pillarSlug}/${st.slug}`}
                      className={`block text-p3 py-2 px-3 rounded-lg transition-colors ${
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
            <div className="text-p3 font-medium text-white/40 uppercase tracking-wider mb-2">
              Related Articles
            </div>
            <ul className="space-y-1">
              {relatedBlogSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/blog/${slug}`}
                    className="block text-p3 text-white/30 hover:text-white/60 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
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
            <div className="text-p3 font-medium text-white/40 uppercase tracking-wider mb-2">
              For Your Industry
            </div>
            <ul className="space-y-1">
              {relatedIndustryPageSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/for/${slug}`}
                    className="block text-p3 text-white/30 hover:text-white/60 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    {industryLabels[slug] || slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="relative overflow-hidden p-4 rounded-xl card-hairline">
          <div
            className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
              isUtility
                ? "from-utility-400/40 via-utility-400/15 to-transparent"
                : "from-special-500/40 via-special-500/15 to-transparent"
            }`}
          />
          <p className="text-p3 font-semibold text-white/70 mb-1">
            Try Official AI
          </p>
          <p className="text-p3 text-white/30 mb-3 leading-relaxed">
            See your AI twin in 30 seconds.
          </p>
          <Link
            href="/demo"
            className={`inline-flex items-center gap-1.5 text-p3 font-semibold ${accentText} ${accentTextHover} transition-colors`}
          >
            Free demo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

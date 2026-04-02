"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

interface SidebarSubTopic {
  slug: string;
  title: string;
}

interface SidebarProps {
  pillarSlug: string;
  pillarTitle: string;
  accentColor: string;
  subTopics: SidebarSubTopic[];
  relatedBlogSlugs: string[];
  relatedIndustryPageSlugs: string[];
  crossLinkPillarSlugs: string[];
}

const industryLabels: Record<string, string> = {
  realtors: "For Realtors",
  attorneys: "For Attorneys",
  doctors: "For Doctors",
  advisors: "For Advisors",
};

const pillarLabels: Record<string, string> = {
  "ai-video-creation": "AI Video Creation",
  "video-marketing-professionals": "Video Marketing",
  "social-media-video-strategy": "Social Media Video",
  "ai-video-real-estate": "AI Video for Real Estate",
  "ai-video-professional-services": "Professional Services",
  "ai-content-at-scale": "AI Content at Scale",
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

export default function PillarSidebar({
  pillarSlug,
  pillarTitle,
  accentColor,
  subTopics,
  relatedBlogSlugs,
  relatedIndustryPageSlugs,
  crossLinkPillarSlugs,
}: SidebarProps) {
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [blogsOpen, setBlogsOpen] = useState(true);
  const [industryOpen, setIndustryOpen] = useState(true);

  const accentBorder = {
    blue: "border-l-blue-400",
    violet: "border-l-violet-400",
    emerald: "border-l-emerald-400",
    amber: "border-l-amber-400",
    cyan: "border-l-cyan-400",
    rose: "border-l-rose-400",
  }[accentColor] || "border-l-blue-400";

  return (
    <aside className="hidden lg:block w-[220px] flex-shrink-0">
      <div className="sticky top-20 space-y-6">
        {/* Pillar title */}
        <div className={`border-l-2 ${accentBorder} pl-3`}>
          <div className="text-[11px] text-white/20 uppercase tracking-wider mb-1">Guide</div>
          <div className="text-[14px] font-semibold text-white/70">{pillarTitle}</div>
        </div>

        {/* Subtopics */}
        <div>
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="w-full flex items-center justify-between text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2"
          >
            Topics
            <ChevronDown className={`w-3 h-3 transition-transform ${topicsOpen ? "rotate-180" : ""}`} />
          </button>
          {topicsOpen && (
            <ul className="space-y-1">
              {subTopics.map((st) => (
                <li key={st.slug}>
                  <Link
                    href={`/learn/${pillarSlug}/${st.slug}`}
                    className="block text-[13px] text-white/30 hover:text-white/60 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    {st.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Related blog posts */}
        {relatedBlogSlugs.length > 0 && (
          <div>
            <button
              onClick={() => setBlogsOpen(!blogsOpen)}
              className="w-full flex items-center justify-between text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2"
            >
              Articles
              <ChevronDown className={`w-3 h-3 transition-transform ${blogsOpen ? "rotate-180" : ""}`} />
            </button>
            {blogsOpen && (
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
            )}
          </div>
        )}

        {/* Industry pages */}
        {relatedIndustryPageSlugs.length > 0 && (
          <div>
            <button
              onClick={() => setIndustryOpen(!industryOpen)}
              className="w-full flex items-center justify-between text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2"
            >
              Industries
              <ChevronDown className={`w-3 h-3 transition-transform ${industryOpen ? "rotate-180" : ""}`} />
            </button>
            {industryOpen && (
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
            )}
          </div>
        )}

        {/* Cross-link pillars */}
        {crossLinkPillarSlugs.length > 0 && (
          <div>
            <div className="text-[12px] font-medium text-white/40 uppercase tracking-wider mb-2">
              Related Guides
            </div>
            <ul className="space-y-1">
              {crossLinkPillarSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/learn/${slug}`}
                    className="block text-[13px] text-white/30 hover:text-white/60 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    {pillarLabels[slug] || formatBlogSlug(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="p-4 rounded-xl card-hairline">
          <p className="text-[13px] font-medium text-white/60 mb-2">See it in action</p>
          <p className="text-[12px] text-white/25 mb-3">Try the free demo — no signup required.</p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-400/80 hover:text-blue-400 transition-colors"
          >
            Try the demo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

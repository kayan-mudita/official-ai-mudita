"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Menu } from "lucide-react";

interface SubTopicItem {
  slug: string;
  title: string;
}

interface MobileSidebarNavProps {
  pillarSlug: string;
  pillarTitle: string;
  accentColor: string;
  subTopics: SubTopicItem[];
  currentSubTopicSlug?: string;
  relatedBlogSlugs: string[];
  relatedIndustryPageSlugs: string[];
  crossLinkPillarSlugs?: string[];
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

export default function MobileSidebarNav({
  pillarSlug,
  pillarTitle,
  accentColor,
  subTopics,
  currentSubTopicSlug,
  relatedBlogSlugs,
  relatedIndustryPageSlugs,
  crossLinkPillarSlugs,
}: MobileSidebarNavProps) {
  const [open, setOpen] = useState(false);

  const isUtility = ["blue", "cyan", "emerald"].includes(accentColor);
  const accentBorder = isUtility
    ? "border-utility-400/30"
    : "border-special-500/30";
  const activeBg = isUtility
    ? "bg-utility-400/[0.08]"
    : "bg-special-500/[0.08]";

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
          open
            ? `${accentBorder} bg-white/[0.02]`
            : "border-white/[0.06] hover:border-white/[0.1]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Menu className="w-4 h-4 text-white/40" />
          <div className="text-left">
            <div className="text-p3 font-medium text-white/70">
              {pillarTitle}
            </div>
            <div className="text-p3 text-white/30">
              {subTopics.length} topics
              {relatedBlogSlugs.length > 0 && ` · ${relatedBlogSlugs.length} articles`}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/30 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.015] space-y-5">
          {/* Topics */}
          <div>
            <div className="text-p3 font-medium text-white/30 uppercase tracking-wider mb-2 px-1">
              Topics
            </div>
            <ul className="space-y-0.5">
              {subTopics.map((st) => {
                const isActive = st.slug === currentSubTopicSlug;
                return (
                  <li key={st.slug}>
                    <Link
                      href={`/${pillarSlug}/${st.slug}`}
                      onClick={() => setOpen(false)}
                      className={`block text-p2 py-2.5 px-3 rounded-lg transition-colors ${
                        isActive
                          ? `text-white/90 font-medium ${activeBg}`
                          : "text-white/40 active:text-white/70 active:bg-white/[0.04]"
                      }`}
                    >
                      {st.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Related articles */}
          {relatedBlogSlugs.length > 0 && (
            <div>
              <div className="text-p3 font-medium text-white/30 uppercase tracking-wider mb-2 px-1">
                Articles
              </div>
              <ul className="space-y-0.5">
                {relatedBlogSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/blog/${slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-p2 text-white/35 active:text-white/70 py-2 px-3 rounded-lg active:bg-white/[0.04] transition-colors"
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
              <div className="text-p3 font-medium text-white/30 uppercase tracking-wider mb-2 px-1">
                Industries
              </div>
              <ul className="space-y-0.5">
                {relatedIndustryPageSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/for/${slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-p2 text-white/35 active:text-white/70 py-2 px-3 rounded-lg active:bg-white/[0.04] transition-colors"
                    >
                      {industryLabels[slug] || slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cross-link pillars (pillar pages only) */}
          {crossLinkPillarSlugs && crossLinkPillarSlugs.length > 0 && (
            <div>
              <div className="text-p3 font-medium text-white/30 uppercase tracking-wider mb-2 px-1">
                Related Guides
              </div>
              <ul className="space-y-0.5">
                {crossLinkPillarSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/${slug}`}
                      onClick={() => setOpen(false)}
                      className="block text-p2 text-white/35 active:text-white/70 py-2 px-3 rounded-lg active:bg-white/[0.04] transition-colors"
                    >
                      {pillarLabels[slug] || formatBlogSlug(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="pt-3 border-t border-white/[0.06]">
            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] active:bg-white/[0.06] transition-colors"
            >
              <div>
                <div className="text-p3 font-medium text-white/60">Try the free demo</div>
                <div className="text-p3 text-white/25">No signup required</div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

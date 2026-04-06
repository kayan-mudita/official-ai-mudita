"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import ShareButtons from "@/components/marketing/ShareButtons";
import FadeIn from "@/components/motion/FadeIn";
import SubTopicSidebar from "@/components/pillar/SubTopicSidebar";
import MobileSidebarNav from "@/components/pillar/MobileSidebarNav";
import ReferencesSection from "@/components/pillar/ReferencesSection";
import { getSubTopic } from "@/data/topic-libraries";

interface SubTopicPageTemplateProps {
  pillarSlug: string;
  subTopicSlug: string;
  children: React.ReactNode;
}

const accentBadge: Record<string, string> = {
  blue: "text-blue-400/80 bg-blue-500/[0.08] border-blue-500/[0.12]",
  violet: "text-violet-400/80 bg-violet-500/[0.08] border-violet-500/[0.12]",
  emerald: "text-emerald-400/80 bg-emerald-500/[0.08] border-emerald-500/[0.12]",
  amber: "text-amber-400/80 bg-amber-500/[0.08] border-amber-500/[0.12]",
  cyan: "text-cyan-400/80 bg-cyan-500/[0.08] border-cyan-500/[0.12]",
  rose: "text-rose-400/80 bg-rose-500/[0.08] border-rose-500/[0.12]",
};

export default function SubTopicPageTemplate({
  pillarSlug,
  subTopicSlug,
  children,
}: SubTopicPageTemplateProps) {
  const result = getSubTopic(pillarSlug, subTopicSlug);
  if (!result) return null;

  const { pillar, subTopic, prevSubTopic, nextSubTopic } = result;
  const siteUrl = "https://officialai.com";
  const pageUrl = `${siteUrl}/learn/${pillarSlug}/${subTopicSlug}`;
  const badge = accentBadge[pillar.accentColor] || accentBadge.blue;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: subTopic.title,
    description: subTopic.description,
    author: { "@type": "Organization", name: "Official AI" },
    publisher: {
      "@type": "Organization",
      name: "Official AI",
      logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    isPartOf: {
      "@type": "Article",
      name: pillar.title,
      url: `${siteUrl}/learn/${pillarSlug}`,
    },
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn duration={0.6}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Guides", href: "/learn" },
                { label: pillar.title, href: `/learn/${pillarSlug}` },
                { label: subTopic.title },
              ]}
            />

            <Link
              href={`/learn/${pillarSlug}`}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[12px] font-medium mb-6 ${badge} hover:opacity-80 transition-opacity`}
            >
              <pillar.icon className="w-3.5 h-3.5" />
              {pillar.title}
            </Link>

            <h1 className="text-[32px] sm:text-[42px] font-bold tracking-[-0.03em] leading-[1.08] text-white mb-4">
              {subTopic.title}
            </h1>

            <p className="text-[16px] text-white/35 max-w-2xl leading-relaxed mb-6">
              {subTopic.description}
            </p>

            <ShareButtons url={pageUrl} title={subTopic.title} />
          </FadeIn>
        </div>
      </section>

      {/* 2-column layout */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto flex gap-12">
          <SubTopicSidebar
            pillarSlug={pillarSlug}
            pillarTitle={pillar.title}
            accentColor={pillar.accentColor}
            subTopics={pillar.subTopics.map((st) => ({ slug: st.slug, title: st.title }))}
            currentSubTopicSlug={subTopicSlug}
            relatedBlogSlugs={subTopic.blogSlugs}
            relatedIndustryPageSlugs={subTopic.industryPageSlugs}
          />

          <div className="flex-1 min-w-0">
            {/* Mobile sidebar nav — visible below lg */}
            <MobileSidebarNav
              pillarSlug={pillarSlug}
              pillarTitle={pillar.title}
              accentColor={pillar.accentColor}
              subTopics={pillar.subTopics.map((st) => ({ slug: st.slug, title: st.title }))}
              currentSubTopicSlug={subTopicSlug}
              relatedBlogSlugs={subTopic.blogSlugs}
              relatedIndustryPageSlugs={subTopic.industryPageSlugs}
            />

            {/* Prose content */}
            <FadeIn duration={0.6}>
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-tight prose-p:text-white/50 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/70 prose-li:text-white/50 prose-blockquote:border-blue-500/30 prose-blockquote:text-white/40 prose-h2:text-[22px] prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-[17px] prose-h3:mt-8 prose-h3:mb-3">
                {children}
              </div>
            </FadeIn>

            {/* References */}
            {subTopic.references && <ReferencesSection references={subTopic.references} />}

            {/* Prev / Next navigation */}
            <FadeIn delay={0.1} duration={0.5}>
              <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/[0.06]">
                {prevSubTopic ? (
                  <Link
                    href={`/learn/${pillarSlug}/${prevSubTopic.slug}`}
                    className="group p-4 rounded-xl card-hairline hover:border-white/[0.12] transition-all"
                  >
                    <div className="text-[11px] text-white/20 mb-1 flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Previous
                    </div>
                    <div className="text-[14px] font-medium text-white/50 group-hover:text-white/80 transition-colors">
                      {prevSubTopic.title}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextSubTopic ? (
                  <Link
                    href={`/learn/${pillarSlug}/${nextSubTopic.slug}`}
                    className="group p-4 rounded-xl card-hairline hover:border-white/[0.12] transition-all text-right"
                  >
                    <div className="text-[11px] text-white/20 mb-1 flex items-center justify-end gap-1">
                      Next <ArrowRight className="w-3 h-3" />
                    </div>
                    <div className="text-[14px] font-medium text-white/50 group-hover:text-white/80 transition-colors">
                      {nextSubTopic.title}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </FadeIn>

            {/* Bottom CTA */}
            <FadeIn delay={0.2} duration={0.5}>
              <div className="mt-12 p-8 rounded-2xl card-hairline text-center">
                <h3 className="text-[20px] font-bold text-white mb-2">
                  Ready to try it yourself?
                </h3>
                <p className="text-[14px] text-white/30 mb-6">
                  Upload a photo and see AI create a video of you in 30 seconds.
                </p>
                <Link
                  href="/demo"
                  className="btn-cta-glow inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 transition-all"
                >
                  Try the free demo
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import ShareButtons from "@/components/marketing/ShareButtons";
import FadeIn from "@/components/motion/FadeIn";
import PillarSidebar from "@/components/pillar/PillarSidebar";
import ReferencesSection from "@/components/pillar/ReferencesSection";
import { getPillarBySlug } from "@/data/topic-libraries";

interface TocItem {
  id: string;
  label: string;
}

interface PillarPageTemplateProps {
  slug: string;
  toc: TocItem[];
  children: React.ReactNode;
}

const accentGradients: Record<string, string> = {
  blue: "from-blue-400 to-violet-400",
  violet: "from-violet-400 to-blue-400",
  emerald: "from-emerald-400 to-blue-400",
  amber: "from-amber-400 to-orange-400",
  cyan: "from-cyan-400 to-blue-400",
  rose: "from-rose-400 to-violet-400",
};

const accentBadge: Record<string, string> = {
  blue: "text-blue-400/80 bg-blue-500/[0.08] border-blue-500/[0.12]",
  violet: "text-violet-400/80 bg-violet-500/[0.08] border-violet-500/[0.12]",
  emerald: "text-emerald-400/80 bg-emerald-500/[0.08] border-emerald-500/[0.12]",
  amber: "text-amber-400/80 bg-amber-500/[0.08] border-amber-500/[0.12]",
  cyan: "text-cyan-400/80 bg-cyan-500/[0.08] border-cyan-500/[0.12]",
  rose: "text-rose-400/80 bg-rose-500/[0.08] border-rose-500/[0.12]",
};

export default function PillarPageTemplate({ slug, toc, children }: PillarPageTemplateProps) {
  const pillar = getPillarBySlug(slug);
  if (!pillar) return null;

  const siteUrl = "https://officialai.com";
  const pageUrl = `${siteUrl}/learn/${slug}`;
  const gradient = accentGradients[pillar.accentColor] || accentGradients.blue;
  const badge = accentBadge[pillar.accentColor] || accentBadge.blue;

  // Collect unique blog slugs from all subtopics
  const allBlogSlugs = Array.from(new Set(pillar.subTopics.flatMap((st) => st.blogSlugs)));

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pillar.headline,
    description: pillar.description,
    author: { "@type": "Organization", name: "Official AI" },
    publisher: {
      "@type": "Organization",
      name: "Official AI",
      logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    hasPart: pillar.subTopics.map((st) => ({
      "@type": "Article",
      name: st.title,
      url: `${siteUrl}/learn/${slug}/${st.slug}`,
    })),
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn duration={0.6}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Guides", href: "/learn" },
                { label: pillar.title },
              ]}
            />

            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[12px] font-medium mb-6 ${badge}`}>
              <pillar.icon className="w-3.5 h-3.5" />
              Complete Guide
            </div>

            <h1 className="text-[36px] sm:text-[46px] font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
              {pillar.headline}
            </h1>

            <p className="text-[17px] text-white/35 max-w-2xl leading-relaxed mb-8">
              {pillar.heroSubtitle}
            </p>

            <div className="flex items-center gap-4">
              <ShareButtons url={pageUrl} title={pillar.headline} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2-column layout: sidebar + content */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto flex gap-12">
          <PillarSidebar
            pillarSlug={slug}
            pillarTitle={pillar.title}
            accentColor={pillar.accentColor}
            subTopics={pillar.subTopics.map((st) => ({ slug: st.slug, title: st.title }))}
            relatedBlogSlugs={allBlogSlugs}
            relatedIndustryPageSlugs={pillar.relatedIndustryPageSlugs}
            crossLinkPillarSlugs={pillar.crossLinkPillarSlugs}
          />

          <div className="flex-1 min-w-0">
            {/* Table of Contents */}
            <FadeIn duration={0.5}>
              <div className="p-6 rounded-xl card-hairline mb-10">
                <h2 className="text-[14px] font-semibold text-white/50 uppercase tracking-wider mb-4">
                  In this guide
                </h2>
                <ol className="space-y-2">
                  {toc.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-start gap-3 text-[14px] text-white/40 hover:text-white/70 transition-colors"
                      >
                        <span className="text-white/15 font-mono text-[12px] mt-0.5 w-5 flex-shrink-0">
                          {i + 1}.
                        </span>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeIn>

            {/* Prose content */}
            <FadeIn delay={0.1} duration={0.6}>
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-tight prose-p:text-white/50 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/70 prose-li:text-white/50 prose-blockquote:border-blue-500/30 prose-blockquote:text-white/40 prose-h2:text-[24px] prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-[18px] prose-h3:mt-8 prose-h3:mb-3">
                {children}
              </div>
            </FadeIn>

            {/* References */}
            {pillar.references && <ReferencesSection references={pillar.references} />}

            {/* Deep Dives — subtopic cards */}
            <FadeIn delay={0.2} duration={0.6}>
              <section className="mt-16">
                <h2 className="text-[20px] font-bold text-white mb-6">
                  Deep dives
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pillar.subTopics.map((st) => (
                    <Link
                      key={st.slug}
                      href={`/learn/${slug}/${st.slug}`}
                      className="group p-5 rounded-xl card-hairline hover:border-white/[0.12] transition-all"
                    >
                      <h3 className="text-[15px] font-medium text-white/70 group-hover:text-white/90 transition-colors mb-1.5">
                        {st.title}
                      </h3>
                      <p className="text-[13px] text-white/25 leading-relaxed line-clamp-2">
                        {st.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[12px] text-blue-400/60 group-hover:text-blue-400 mt-3 transition-colors">
                        Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </FadeIn>

            {/* Lead magnet CTA */}
            <FadeIn delay={0.3} duration={0.6}>
              <div className="mt-16 p-8 rounded-2xl card-hairline text-center">
                <h3 className="text-[20px] font-bold text-white mb-2">
                  {pillar.leadMagnet.title}
                </h3>
                <p className="text-[14px] text-white/30 mb-6 max-w-md mx-auto">
                  {pillar.leadMagnet.description}
                </p>
                <Link
                  href="/demo"
                  className="btn-cta-glow inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 transition-all"
                >
                  {pillar.leadMagnet.ctaText}
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, Layers, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import ShareButtons from "@/components/marketing/ShareButtons";
import FadeIn from "@/components/motion/FadeIn";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import StatCard from "@/components/marketing/StatCard";
import BentoGrid from "@/components/marketing/BentoGrid";
import BentoCard from "@/components/marketing/BentoCard";
import GlowBlob from "@/components/marketing/GlowBlob";
import Eyebrow from "@/components/marketing/Eyebrow";
import MeshMockup from "@/components/marketing/MeshMockup";
import PillarSidebar from "@/components/pillar/PillarSidebar";
import MobileSidebarNav from "@/components/pillar/MobileSidebarNav";
import ReferencesSection from "@/components/pillar/ReferencesSection";
import { getPillarBySlug } from "@/data/topic-libraries";
import { getFeaturesForPillar } from "@/data/pillar-feature-map";
import { siteUrl } from "@/lib/site-config";

interface TocItem {
  id: string;
  label: string;
}

interface PillarPageTemplateProps {
  slug: string;
  toc: TocItem[];
  children: React.ReactNode;
}

/** Map pillar accent colors → brand-token tones (utility cyan or special magenta). */
const accentToBrand: Record<
  string,
  { tone: "utility" | "special"; eyebrow: "utility" | "special" }
> = {
  blue: { tone: "utility", eyebrow: "utility" },
  cyan: { tone: "utility", eyebrow: "utility" },
  emerald: { tone: "utility", eyebrow: "utility" },
  violet: { tone: "special", eyebrow: "special" },
  amber: { tone: "special", eyebrow: "special" },
  rose: { tone: "special", eyebrow: "special" },
};

/** Split a headline so the last `n` words are wrapped in gradient text. */
function splitHeadline(headline: string, n = 3) {
  const words = headline.trim().split(/\s+/);
  if (words.length <= n) return { lead: "", tail: headline };
  return {
    lead: words.slice(0, words.length - n).join(" "),
    tail: words.slice(words.length - n).join(" "),
  };
}

export default function PillarPageTemplate({
  slug,
  toc,
  children,
}: PillarPageTemplateProps) {
  const pillar = getPillarBySlug(slug);
  if (!pillar) return null;

  const pageUrl = `${siteUrl}/${slug}`;
  const brand = accentToBrand[pillar.accentColor] ?? accentToBrand.blue;

  const allBlogSlugs = Array.from(
    new Set(pillar.subTopics.flatMap((st) => st.blogSlugs)),
  );

  const { lead, tail } = splitHeadline(pillar.headline, 3);

  // Auto-derived stats — no content edits required
  const subTopicCount = pillar.subTopics.length;
  const referenceCount = pillar.references?.length ?? 0;
  // Rough estimate: ~700 words/subtopic / 230 wpm
  const estimatedReadMin = Math.max(8, Math.round((subTopicCount * 700) / 230));

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pillar.headline,
    description: pillar.description,
    author: { "@type": "Organization", name: "Official AI" },
    publisher: {
      "@type": "Organization",
      name: "Official AI",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    hasPart: pillar.subTopics.map((st) => ({
      "@type": "Article",
      name: st.title,
      url: `${siteUrl}/${slug}/${st.slug}`,
    })),
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Ambient page backdrop */}
      <PageBackdrop intensity={0.05} />

      {/* Hero — aurora wrapped */}
      <HeroAurora
        eyebrow="Complete Guide"
        eyebrowIcon={pillar.icon}
        eyebrowVariant={brand.eyebrow}
        spacing="pt-32 pb-16"
        align="left"
        aboveEyebrow={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/learn" },
              { label: pillar.title },
            ]}
          />
        }
        headline={
          <>
            {lead && <span className="text-white">{lead} </span>}
            <GradientText tone={brand.tone}>{tail}</GradientText>
          </>
        }
        description={pillar.heroSubtitle}
        actions={<ShareButtons url={pageUrl} title={pillar.headline} />}
      />

      {/* Featured image banner */}
      {pillar.featuredImage && (
        <section className="relative px-6 -mt-4 mb-12">
          <div className="max-w-5xl mx-auto">
            <FadeIn duration={0.6}>
              <MeshMockup aspect="aspect-[21/9]">
                <Image
                  src={pillar.featuredImage.src}
                  alt={pillar.featuredImage.alt}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                  priority
                />
              </MeshMockup>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Stat strip */}
      <section className="relative px-6 -mt-10">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <StatCard
                value={subTopicCount}
                label="Deep dives"
                caption="In-depth chapters covering every angle of this topic."
                accent={brand.tone}
              />
              <StatCard
                value={`${estimatedReadMin}m`}
                label="Read time"
                caption="A complete walkthrough you can read in one sitting."
                accent="mix"
              />
              <StatCard
                value={referenceCount > 0 ? referenceCount : "100%"}
                label={referenceCount > 0 ? "Cited sources" : "Original research"}
                caption="Built on first-party expertise and verified references."
                accent={brand.tone === "utility" ? "special" : "utility"}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2-column layout: sidebar + content */}
      <section className="relative px-6 pt-20 pb-24">
        <div className="max-w-5xl mx-auto flex gap-12">
          <PillarSidebar
            pillarSlug={slug}
            pillarTitle={pillar.title}
            accentColor={pillar.accentColor}
            subTopics={pillar.subTopics.map((st) => ({
              slug: st.slug,
              title: st.title,
            }))}
            relatedBlogSlugs={allBlogSlugs}
            relatedIndustryPageSlugs={pillar.relatedIndustryPageSlugs}
            crossLinkPillarSlugs={pillar.crossLinkPillarSlugs}
          />

          <div className="flex-1 min-w-0">
            <MobileSidebarNav
              pillarSlug={slug}
              pillarTitle={pillar.title}
              accentColor={pillar.accentColor}
              subTopics={pillar.subTopics.map((st) => ({
                slug: st.slug,
                title: st.title,
              }))}
              relatedBlogSlugs={allBlogSlugs}
              relatedIndustryPageSlugs={pillar.relatedIndustryPageSlugs}
              crossLinkPillarSlugs={pillar.crossLinkPillarSlugs}
            />

            {/* Table of Contents — glass card with accent line */}
            <FadeIn duration={0.5}>
              <div className="relative overflow-hidden p-6 rounded-2xl card-hairline mb-12">
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                    brand.tone === "utility"
                      ? "from-utility-400/40 via-utility-400/15 to-transparent"
                      : "from-special-500/40 via-special-500/15 to-transparent"
                  }`}
                />
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-3.5 h-3.5 text-white/70" />
                  <h2 className="text-p3 font-semibold text-white/70 uppercase tracking-wider">
                    In this guide
                  </h2>
                </div>
                <ol className="space-y-2">
                  {toc.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="group flex items-start gap-3 text-p2 text-white/70 hover:text-white/85 transition-colors"
                      >
                        <span className="text-white/70 group-hover:text-white/70 font-mono text-p3 mt-0.5 w-5 flex-shrink-0 transition-colors">
                          {String(i + 1).padStart(2, "0")}
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
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-[-0.02em] prose-p:text-white/70 prose-p:leading-relaxed prose-a:text-utility-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/85 prose-li:text-white/70 prose-blockquote:border-special-500/40 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-white/70 prose-h2:text-h3 prose-h2:mt-14 prose-h2:mb-4 prose-h3:text-title prose-h3:mt-8 prose-h3:mb-3 prose-figcaption:text-p3 prose-figcaption:text-white/70 prose-figcaption:text-center prose-figcaption:mt-2">
                {children}
              </div>
            </FadeIn>

            {/* References */}
            {pillar.references && (
              <ReferencesSection references={pillar.references} />
            )}

            {/* Deep Dives — bento */}
            <FadeIn delay={0.2} duration={0.6}>
              <section className="mt-20">
                <div className="flex items-center gap-3 mb-8">
                  <Eyebrow icon={Layers} variant={brand.eyebrow}>
                    Deep dives
                  </Eyebrow>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <BentoGrid cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                  {pillar.subTopics.map((st, i) => {
                    const isHero = i === 0;
                    return (
                      <BentoCard
                        key={st.slug}
                        href={`/${slug}/${st.slug}`}
                        accent={
                          i % 2 === 0 ? brand.tone : brand.tone === "utility" ? "special" : "utility"
                        }
                        span={
                          isHero
                            ? "md:col-span-2 md:row-span-2"
                            : "md:col-span-2"
                        }
                        hero={isHero}
                        title={st.title}
                        description={st.description}
                      >
                        <span className="inline-flex items-center gap-1.5 text-p3 text-white/70 group-hover:text-white/85 transition-colors">
                          Read chapter
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </BentoCard>
                    );
                  })}
                </BentoGrid>
              </section>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Related features — full width */}
      {(() => {
        const relatedFeatures = getFeaturesForPillar(slug);
        if (relatedFeatures.length === 0) return null;
        return (
          <section className="relative py-20 px-6 border-t border-white/[0.04]">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <div className="mb-10">
                  <Eyebrow icon={Sparkles} variant={brand.eyebrow}>
                    Powered by
                  </Eyebrow>
                  <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mt-4">
                    The features that make this work.
                  </h2>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedFeatures.map((feature) => {
                    const FeatureIcon = feature.icon;
                    const isUtility = feature.accent === "utility";
                    const isSpecial = feature.accent === "special";
                    return (
                      <Link
                        key={feature.slug}
                        href={`/features/${feature.slug}`}
                        className="group relative block p-7 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] transition-colors"
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                            isUtility
                              ? "from-utility-400/50 via-utility-400/15 to-transparent"
                              : isSpecial
                                ? "from-special-500/50 via-special-500/15 to-transparent"
                                : "from-utility-400/40 via-special-500/30 to-transparent"
                          }`}
                        />
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${
                              isUtility
                                ? "bg-utility-400/[0.08] border-utility-400/25"
                                : isSpecial
                                  ? "bg-special-500/[0.08] border-special-500/30"
                                  : "bg-white/[0.04] border-white/[0.10]"
                            }`}
                          >
                            <FeatureIcon
                              className={`w-5 h-5 ${
                                isUtility
                                  ? "text-utility-300"
                                  : isSpecial
                                    ? "text-special-300"
                                    : "text-white"
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-p1 font-semibold text-white/90 mb-1">
                              {feature.shortLabel}
                            </h3>
                            <p className="text-p2 text-white/70 leading-relaxed">
                              {feature.subtitle}
                            </p>
                          </div>
                          <ArrowRight className="flex-shrink-0 w-4 h-4 text-white/70 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all mt-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </FadeIn>
            </div>
          </section>
        );
      })()}

      {/* Lead magnet CTA outro — full width with dual GlowBlobs */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                Ready to start?
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              <GradientText tone="brand">{pillar.leadMagnet.title}</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              {pillar.leadMagnet.description}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/demo"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                {pillar.leadMagnet.ctaText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                See pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import ShareButtons from "@/components/marketing/ShareButtons";
import FadeIn from "@/components/motion/FadeIn";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import Eyebrow from "@/components/marketing/Eyebrow";
import MeshMockup from "@/components/marketing/MeshMockup";
import SubTopicSidebar from "@/components/pillar/SubTopicSidebar";
import MobileSidebarNav from "@/components/pillar/MobileSidebarNav";
import ReferencesSection from "@/components/pillar/ReferencesSection";
import { getSubTopic } from "@/data/topic-libraries";
import { getFeaturesForPillar } from "@/data/pillar-feature-map";

interface SubTopicPageTemplateProps {
  pillarSlug: string;
  subTopicSlug: string;
  children: React.ReactNode;
}

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

function splitHeadline(headline: string, n = 2) {
  const words = headline.trim().split(/\s+/);
  if (words.length <= n) return { lead: "", tail: headline };
  return {
    lead: words.slice(0, words.length - n).join(" "),
    tail: words.slice(words.length - n).join(" "),
  };
}

export default function SubTopicPageTemplate({
  pillarSlug,
  subTopicSlug,
  children,
}: SubTopicPageTemplateProps) {
  const result = getSubTopic(pillarSlug, subTopicSlug);
  if (!result) return null;

  const { pillar, subTopic, prevSubTopic, nextSubTopic } = result;
  const siteUrl = "https://officialai.com";
  const pageUrl = `${siteUrl}/${pillarSlug}/${subTopicSlug}`;
  const brand = accentToBrand[pillar.accentColor] ?? accentToBrand.blue;
  const { lead, tail } = splitHeadline(subTopic.title, 2);

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
      url: `${siteUrl}/${pillarSlug}`,
    },
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <PageBackdrop intensity={0.04} />

      {/* Hero — aurora */}
      <HeroAurora
        spacing="pt-32 pb-12"
        align="left"
        eyebrow={pillar.title}
        eyebrowIcon={pillar.icon}
        eyebrowVariant={brand.eyebrow}
        aboveEyebrow={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/learn" },
              { label: pillar.title, href: `/${pillarSlug}` },
              { label: subTopic.title },
            ]}
          />
        }
        headline={
          <>
            {lead && <span className="text-white">{lead} </span>}
            <GradientText tone={brand.tone}>{tail}</GradientText>
          </>
        }
        description={subTopic.description}
        actions={<ShareButtons url={pageUrl} title={subTopic.title} />}
      />

      {/* Featured image banner */}
      {subTopic.featuredImage && (
        <section className="relative px-6 -mt-2 mb-8">
          <div className="max-w-5xl mx-auto">
            <FadeIn duration={0.6}>
              <MeshMockup aspect="aspect-[16/9]">
                <Image
                  src={subTopic.featuredImage.src}
                  alt={subTopic.featuredImage.alt}
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

      {/* 2-column layout */}
      <section className="relative px-6 pt-12 pb-24">
        <div className="max-w-5xl mx-auto flex gap-12">
          <SubTopicSidebar
            pillarSlug={pillarSlug}
            pillarTitle={pillar.title}
            accentColor={pillar.accentColor}
            subTopics={pillar.subTopics.map((st) => ({
              slug: st.slug,
              title: st.title,
            }))}
            currentSubTopicSlug={subTopicSlug}
            relatedBlogSlugs={subTopic.blogSlugs}
            relatedIndustryPageSlugs={subTopic.industryPageSlugs}
          />

          <div className="flex-1 min-w-0">
            <MobileSidebarNav
              pillarSlug={pillarSlug}
              pillarTitle={pillar.title}
              accentColor={pillar.accentColor}
              subTopics={pillar.subTopics.map((st) => ({
                slug: st.slug,
                title: st.title,
              }))}
              currentSubTopicSlug={subTopicSlug}
              relatedBlogSlugs={subTopic.blogSlugs}
              relatedIndustryPageSlugs={subTopic.industryPageSlugs}
            />

            {/* Prose content */}
            <FadeIn duration={0.6}>
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-[-0.02em] prose-p:text-white/55 prose-p:leading-relaxed prose-a:text-utility-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/85 prose-li:text-white/55 prose-blockquote:border-special-500/40 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-white/65 prose-h2:text-h4 prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-title prose-h3:mt-8 prose-h3:mb-3 prose-figcaption:text-p3 prose-figcaption:text-white/35 prose-figcaption:text-center prose-figcaption:mt-2">
                {children}
              </div>
            </FadeIn>

            {/* References */}
            {subTopic.references && (
              <ReferencesSection references={subTopic.references} />
            )}

            {/* Prev / Next navigation */}
            <FadeIn delay={0.1} duration={0.5}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-white/[0.06]">
                {prevSubTopic ? (
                  <Link
                    href={`/${pillarSlug}/${prevSubTopic.slug}`}
                    className="group relative overflow-hidden p-5 rounded-2xl card-hairline transition-all hover:border-white/[0.12] hover:-translate-y-0.5"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                        brand.tone === "utility"
                          ? "from-utility-400/40 via-utility-400/15 to-transparent"
                          : "from-special-500/40 via-special-500/15 to-transparent"
                      }`}
                    />
                    <div className="text-p3 text-white/30 mb-1.5 flex items-center gap-1.5">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />{" "}
                      Previous chapter
                    </div>
                    <div className="text-p1 font-semibold text-white/65 group-hover:text-white transition-colors">
                      {prevSubTopic.title}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextSubTopic ? (
                  <Link
                    href={`/${pillarSlug}/${nextSubTopic.slug}`}
                    className="group relative overflow-hidden p-5 rounded-2xl card-hairline transition-all sm:text-right hover:border-white/[0.12] hover:-translate-y-0.5"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                        brand.tone === "utility"
                          ? "from-utility-400/40 via-utility-400/15 to-transparent"
                          : "from-special-500/40 via-special-500/15 to-transparent"
                      }`}
                    />
                    <div className="text-p3 text-white/30 mb-1.5 flex items-center sm:justify-end gap-1.5">
                      Next chapter{" "}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-p1 font-semibold text-white/65 group-hover:text-white transition-colors">
                      {nextSubTopic.title}
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* More chapters from this guide */}
      {(() => {
        const otherChapters = pillar.subTopics
          .filter((st) => st.slug !== subTopicSlug)
          .slice(0, 3);
        if (otherChapters.length === 0) return null;
        return (
          <section className="relative py-20 px-6 border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="mb-10">
                  <Eyebrow icon={BookOpen} variant={brand.eyebrow}>
                    More from this guide
                  </Eyebrow>
                  <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mt-4">
                    Keep reading{" "}
                    <GradientText tone={brand.tone}>{pillar.title}</GradientText>
                    .
                  </h2>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {otherChapters.map((ch) => (
                    <Link
                      key={ch.slug}
                      href={`/${pillarSlug}/${ch.slug}`}
                      className="group relative block p-6 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] hover:-translate-y-0.5 transition-all"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                          brand.tone === "utility"
                            ? "from-utility-400/40 via-utility-400/15 to-transparent"
                            : "from-special-500/40 via-special-500/15 to-transparent"
                        }`}
                      />
                      <div className="text-p3 text-white/30 font-mono mb-2">
                        Chapter
                      </div>
                      <h3 className="text-p1 font-semibold text-white/90 mb-2 leading-snug">
                        {ch.title}
                      </h3>
                      <p className="text-p2 text-white/45 leading-relaxed mb-4 line-clamp-2">
                        {ch.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-p3 text-white/50 group-hover:text-white/85 transition-colors">
                        Read chapter
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        );
      })()}

      {/* Related features */}
      {(() => {
        const relatedFeatures = getFeaturesForPillar(pillarSlug);
        if (relatedFeatures.length === 0) return null;
        return (
          <section className="relative py-20 px-6 border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto">
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
                        className="group relative block p-6 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] hover:-translate-y-0.5 transition-all"
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
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${
                              isUtility
                                ? "bg-utility-400/[0.08] border-utility-400/25"
                                : isSpecial
                                  ? "bg-special-500/[0.08] border-special-500/30"
                                  : "bg-white/[0.04] border-white/[0.10]"
                            }`}
                          >
                            <FeatureIcon
                              className={`w-4 h-4 ${
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
                            <p className="text-p2 text-white/45 leading-relaxed">
                              {feature.subtitle}
                            </p>
                          </div>
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

      {/* CTA outro — full width with dual GlowBlobs */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                See it live
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Ready to{" "}
              <GradientText tone="brand">try it yourself?</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/45 max-w-xl mx-auto mb-8">
              Upload a photo and see AI create a video of you in 30 seconds. No
              credit card needed.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/demo"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                Try the free demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${pillarSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                Back to {pillar.title}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

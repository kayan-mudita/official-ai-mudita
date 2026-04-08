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

  const siteUrl = "https://officialai.com";
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
      logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.png` },
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
                  <BookOpen className="w-3.5 h-3.5 text-white/50" />
                  <h2 className="text-p3 font-semibold text-white/50 uppercase tracking-wider">
                    In this guide
                  </h2>
                </div>
                <ol className="space-y-2">
                  {toc.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="group flex items-start gap-3 text-p2 text-white/45 hover:text-white/85 transition-colors"
                      >
                        <span className="text-white/20 group-hover:text-white/50 font-mono text-p3 mt-0.5 w-5 flex-shrink-0 transition-colors">
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
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-[-0.02em] prose-p:text-white/55 prose-p:leading-relaxed prose-a:text-utility-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/85 prose-li:text-white/55 prose-blockquote:border-special-500/40 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-white/65 prose-h2:text-h3 prose-h2:mt-14 prose-h2:mb-4 prose-h3:text-title prose-h3:mt-8 prose-h3:mb-3 prose-figcaption:text-p3 prose-figcaption:text-white/35 prose-figcaption:text-center prose-figcaption:mt-2">
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
                        <span className="inline-flex items-center gap-1.5 text-p3 text-white/50 group-hover:text-white/85 transition-colors">
                          Read chapter
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </BentoCard>
                    );
                  })}
                </BentoGrid>
              </section>
            </FadeIn>

            {/* Lead magnet CTA */}
            <FadeIn delay={0.3} duration={0.6}>
              <div className="relative mt-20 overflow-hidden rounded-3xl card-hairline">
                <GlowBlob
                  color={brand.tone}
                  size="lg"
                  position="center"
                  intensity={0.10}
                />
                <div className="relative p-10 sm:p-14 text-center">
                  <div className="flex justify-center mb-5">
                    <Eyebrow icon={Sparkles} variant={brand.eyebrow}>
                      Ready to start?
                    </Eyebrow>
                  </div>
                  <h3 className="text-h3 sm:text-h2 font-bold text-white tracking-[-0.02em] mb-3">
                    {pillar.leadMagnet.title}
                  </h3>
                  <p className="text-p1 text-white/45 mb-8 max-w-md mx-auto leading-relaxed">
                    {pillar.leadMagnet.description}
                  </p>
                  <Link
                    href="/demo"
                    className="btn-cta-glow inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#050508] text-p2 font-semibold min-h-[48px] hover:bg-white/95 transition-all"
                  >
                    {pillar.leadMagnet.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
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
                    className="group relative overflow-hidden p-5 rounded-2xl card-hairline transition-all"
                  >
                    <div className="text-p3 text-white/30 mb-1.5 flex items-center gap-1.5">
                      <ArrowLeft className="w-3 h-3" /> Previous chapter
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
                    className="group relative overflow-hidden p-5 rounded-2xl card-hairline transition-all sm:text-right"
                  >
                    <div className="text-p3 text-white/30 mb-1.5 flex items-center sm:justify-end gap-1.5">
                      Next chapter <ArrowRight className="w-3 h-3" />
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

            {/* Bottom CTA */}
            <FadeIn delay={0.2} duration={0.5}>
              <div className="relative mt-16 overflow-hidden rounded-3xl card-hairline">
                <GlowBlob
                  color={brand.tone}
                  size="md"
                  position="center"
                  intensity={0.10}
                />
                <div className="relative p-10 text-center">
                  <div className="flex justify-center mb-4">
                    <Eyebrow icon={Sparkles} variant={brand.eyebrow}>
                      See it live
                    </Eyebrow>
                  </div>
                  <h3 className="text-h4 sm:text-h3 font-bold text-white tracking-[-0.02em] mb-2">
                    Ready to try it yourself?
                  </h3>
                  <p className="text-p1 text-white/45 mb-6 max-w-md mx-auto">
                    Upload a photo and see AI create a video of you in 30 seconds.
                  </p>
                  <Link
                    href="/demo"
                    className="btn-cta-glow inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#050508] text-p2 font-semibold min-h-[48px] hover:bg-white/95 transition-all"
                  >
                    Try the free demo
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

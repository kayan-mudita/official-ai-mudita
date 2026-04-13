"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import BentoGrid from "@/components/marketing/BentoGrid";
import BentoCard from "@/components/marketing/BentoCard";
import FadeIn from "@/components/motion/FadeIn";
import { getAllPillars } from "@/data/topic-libraries";

export default function GuidesIndexClient() {
  const pillars = getAllPillars();
  const totalChapters = pillars.reduce(
    (sum, p) => sum + p.subTopics.length,
    0,
  );
  const totalReferences = pillars.reduce(
    (sum, p) => sum + (p.references?.length ?? 0),
    0,
  );

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Learn"
        eyebrowIcon={BookOpen}
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        align="left"
        aboveEyebrow={
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Guides" }]}
          />
        }
        headline={
          <>
            In-depth guides on{" "}
            <GradientText tone="brand">AI video marketing.</GradientText>
          </>
        }
        description="Everything you need to know about creating, distributing, and scaling professional video content with AI."
      />

      {/* Stat strip */}
      <section className="relative px-6 -mt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <StatCard
                value={pillars.length}
                label="Pillar guides"
                caption="Comprehensive walkthroughs across every angle of AI video."
                accent="utility"
              />
              <StatCard
                value={totalChapters}
                label="Chapters"
                caption="Deep-dive sub-topics covering every facet of each guide."
                accent="mix"
              />
              <StatCard
                value={totalReferences > 0 ? `${totalReferences}+` : "100%"}
                label={
                  totalReferences > 0 ? "Cited sources" : "Original research"
                }
                caption="Built on first-party expertise and verified references."
                accent="special"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pillar bento */}
      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <BentoGrid>
            {pillars.map((pillar, i) => {
              const isUtility = ["blue", "cyan", "emerald"].includes(
                pillar.accentColor,
              );
              const accent = isUtility ? "utility" : "special";
              const isHero = i === 0;
              const span = isHero
                ? "md:col-span-4 md:row-span-2"
                : "md:col-span-2";
              return (
                <BentoCard
                  key={pillar.slug}
                  href={`/${pillar.slug}`}
                  icon={pillar.icon}
                  accent={accent}
                  span={span}
                  hero={isHero}
                  title={pillar.title}
                  description={pillar.navDescription}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-p3 font-semibold text-white/70">
                      {pillar.subTopics.length} chapters
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-p3 font-semibold text-white/70 group-hover:text-white/95 transition-colors">
                      Explore
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </BentoCard>
              );
            })}
          </BentoGrid>
        </div>
      </section>

      {/* CTA outro */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                Free guides — no signup required
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Stop reading.{" "}
              <GradientText tone="brand">Start shipping.</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              The guides will still be here. Try the platform that does the
              work for you.
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
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                Read the blog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

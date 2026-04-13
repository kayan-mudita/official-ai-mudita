"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Calculator,
  Sparkles,
  Wrench,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import BentoGrid from "@/components/marketing/BentoGrid";
import BentoCard from "@/components/marketing/BentoCard";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { features } from "@/data/features";

const tools = [
  {
    href: "/tools/speaking-time-calculator",
    icon: Clock,
    name: "Speaking Time Calculator",
    description:
      "Paste a script, get the exact runtime. Tuned for short-form video pacing on LinkedIn, TikTok, and Reels.",
    accent: "utility" as const,
    span: "md:col-span-3",
    hero: true,
  },
  {
    href: "/tools/video-roi-calculator",
    icon: Calculator,
    name: "Video ROI Calculator",
    description:
      "See what you spend (and lose) on agencies, freelancers, or DIY filming vs. an AI-generated workflow.",
    accent: "special" as const,
    span: "md:col-span-3",
    hero: true,
  },
  {
    href: "/tools/hook-generator",
    icon: Sparkles,
    name: "Hook Generator",
    description:
      "100+ proven first-line hooks for short-form video. Filter by industry — realtor, lawyer, advisor, doctor.",
    accent: "mix" as const,
    span: "md:col-span-6",
    hero: false,
  },
];

/** Features the free tools naturally lead into. */
const RELATED_FEATURE_SLUGS = ["script-engine", "ai-video-studio", "analytics"];

export default function ToolsIndexClient() {
  const relatedFeatures = RELATED_FEATURE_SLUGS.map((s) =>
    features.find((f) => f.slug === s),
  ).filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Free Tools"
        eyebrowIcon={Wrench}
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Free tools for{" "}
            <GradientText tone="brand">video marketers.</GradientText>
          </>
        }
        description="No signup. No email gate. Built for solo professionals who ship short-form video."
      />

      {/* Stat strip */}
      <section className="relative px-6 -mt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <StatCard
                value={tools.length}
                label="Free tools"
                caption="Built specifically for short-form video pros."
                accent="utility"
              />
              <StatCard
                value="0"
                label="Email required"
                caption="No signup, no gate. Open and use."
                accent="mix"
              />
              <StatCard
                value="$0"
                label="Forever"
                caption="Free utilities — paid product is the full workflow."
                accent="special"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Tools bento */}
      <section className="relative px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <BentoGrid>
            {tools.map((tool) => (
              <BentoCard
                key={tool.href}
                href={tool.href}
                icon={tool.icon}
                accent={tool.accent}
                span={tool.span}
                hero={tool.hero}
                title={tool.name}
                description={tool.description}
              >
                <span className="inline-flex items-center gap-1.5 text-p3 font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                  Open tool
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </BentoCard>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Related features */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  Want the full workflow?
                </span>
              </div>
              <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                Free tools end at the input.{" "}
                <GradientText tone="brand">
                  Official AI ships the video.
                </GradientText>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {relatedFeatures.map((feature) => {
                const FeatureIcon = feature.icon;
                const isUtility = feature.accent === "utility";
                const isSpecial = feature.accent === "special";
                return (
                  <motion.div
                    key={feature.slug}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    <Link
                      href={`/features/${feature.slug}`}
                      className="group relative block p-6 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] transition-colors"
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
                          <p className="text-p2 text-white/70 leading-relaxed">
                            {feature.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </FadeIn>
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
                $79/mo flat
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              These tools are free forever.{" "}
              <GradientText tone="brand">The platform isn&apos;t.</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              Official AI is the platform that automates the rest — script,
              video, captions, and auto-posting.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                See pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                How it works
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

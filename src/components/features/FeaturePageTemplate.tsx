"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { getFeatureBySlug, getRelatedFeatures } from "@/data/features";
import StudioMockup from "@/components/features/mockups/StudioMockup";
import TwinMockup from "@/components/features/mockups/TwinMockup";
import ScriptMockup from "@/components/features/mockups/ScriptMockup";
import PublishingMockup from "@/components/features/mockups/PublishingMockup";
import AnalyticsMockup from "@/components/features/mockups/AnalyticsMockup";

const MOCKUPS: Record<string, () => ReactElement> = {
  "ai-video-studio": StudioMockup,
  "ai-twin-voice": TwinMockup,
  "script-engine": ScriptMockup,
  "auto-posting": PublishingMockup,
  analytics: AnalyticsMockup,
};

const accent = {
  utility: {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.08]",
    text: "text-utility-300",
    line: "from-utility-400/50 via-utility-400/15 to-transparent",
    chip: "bg-utility-400/[0.10] border-utility-400/25 text-utility-200",
    eyebrow: "utility" as const,
  },
  special: {
    border: "border-special-500/30",
    bg: "bg-special-500/[0.08]",
    text: "text-special-300",
    line: "from-special-500/50 via-special-500/15 to-transparent",
    chip: "bg-special-500/[0.10] border-special-500/25 text-special-200",
    eyebrow: "special" as const,
  },
  mix: {
    border: "border-white/[0.10]",
    bg: "bg-white/[0.04]",
    text: "text-white",
    line: "from-utility-400/40 via-special-500/30 to-transparent",
    chip: "bg-white/[0.06] border-white/[0.12] text-white/85",
    eyebrow: "neutral" as const,
  },
};

interface FeaturePageTemplateProps {
  slug: string;
}

export default function FeaturePageTemplate({
  slug,
}: FeaturePageTemplateProps) {
  const feature = getFeatureBySlug(slug);
  if (!feature) return null;
  const colors = accent[feature.accent];
  const Icon = feature.icon;
  const related = getRelatedFeatures(feature.slug);
  const Mockup = MOCKUPS[feature.slug];

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow={feature.shortLabel}
        eyebrowVariant={colors.eyebrow}
        eyebrowIcon={Icon}
        spacing="pt-32 pb-12"
        headline={
          <>
            {feature.title.split(" ").slice(0, -1).join(" ")}{" "}
            <GradientText tone="brand">
              {feature.title.split(" ").slice(-1).join(" ")}
            </GradientText>
            .
          </>
        }
        description={feature.subtitle}
      />

      {/* Mockup hero */}
      {Mockup && (
        <section className="relative px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <FadeIn delay={0.1}>
              <div className="relative rounded-2xl card-hairline overflow-hidden">
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                />
                <Mockup />
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-8 max-w-3xl mx-auto text-center text-p1 text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Highlights strip */}
      <section className="relative px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {feature.highlights.map((h, i) => (
                <div
                  key={i}
                  className="relative p-5 rounded-2xl card-hairline overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center mt-0.5`}
                    >
                      <Sparkles className={`w-3 h-3 ${colors.text}`} />
                    </div>
                    <p className="text-p2 text-white/80 leading-relaxed">{h}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Capabilities bento */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  Capabilities
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                What it actually{" "}
                <GradientText tone="brand">does.</GradientText>
              </h2>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {feature.capabilities.map((cap) => {
              const CapIcon = cap.icon;
              return (
                <motion.div
                  key={cap.label}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                  className="group relative p-7 rounded-2xl card-hairline overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                  />
                  <div
                    className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-5`}
                  >
                    <CapIcon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h3 className="text-p1 sm:text-h5 font-semibold text-white/90 mb-2">
                    {cap.label}
                  </h3>
                  <p className="text-p2 text-white/70 leading-relaxed">
                    {cap.text}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works mini */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  How it works
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                Three steps,{" "}
                <GradientText tone="brand">end to end.</GradientText>
              </h2>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {feature.howItWorks.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="relative p-6 rounded-2xl card-hairline overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                />
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}
                  >
                    <span
                      className={`text-p3 font-mono font-semibold ${colors.text}`}
                    >
                      {step.num}
                    </span>
                  </div>
                  {i < feature.howItWorks.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                  )}
                </div>
                <h3 className="text-p1 font-semibold text-white/90 mb-2">
                  {step.label}
                </h3>
                <p className="text-p2 text-white/70 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-2 text-p3 font-semibold text-utility-300 hover:text-utility-200 transition-colors"
            >
              See the full process
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related features */}
      {related.length > 0 && (
        <section className="relative py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                  <span className="text-p3 text-white/60 font-medium">
                    Pairs with
                  </span>
                </div>
                <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                  Better together.
                </h2>
              </div>
            </FadeIn>

            <motion.div
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {related.map((rel) => {
                const RelIcon = rel.icon;
                const relColors = accent[rel.accent];
                return (
                  <motion.div
                    key={rel.slug}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                  >
                    <Link
                      href={`/features/${rel.slug}`}
                      className="group block relative p-7 rounded-2xl card-hairline overflow-hidden h-full"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${relColors.line}`}
                      />
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-11 h-11 rounded-xl ${relColors.bg} ${relColors.border} border flex items-center justify-center`}
                        >
                          <RelIcon className={`w-5 h-5 ${relColors.text}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-p1 font-semibold text-white/90 mb-1">
                            {rel.shortLabel}
                          </h3>
                          <p className="text-p2 text-white/70 leading-relaxed">
                            {rel.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="flex-shrink-0 w-4 h-4 text-white/70 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all mt-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA outro */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.07} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.05} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                Included in every plan
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Ready to use{" "}
              <GradientText tone="brand">{feature.shortLabel}?</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              Every feature is included on every plan. The difference is volume.
              Your first video in under five minutes.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                Start free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                All features
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

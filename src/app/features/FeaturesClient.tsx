"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Layers,
  MonitorPlay,
  Globe,
  Film,
  Check,
  X,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { features, type FeatureAccent } from "@/data/features";

const accent: Record<
  FeatureAccent,
  {
    border: string;
    bg: string;
    text: string;
    line: string;
    chip: string;
    glow: string;
  }
> = {
  utility: {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.08]",
    text: "text-utility-300",
    line: "from-utility-400/50 via-utility-400/15 to-transparent",
    chip: "bg-utility-400/[0.10] border-utility-400/25 text-utility-200",
    glow: "from-utility-400/20 via-utility-400/[0.04] to-transparent",
  },
  special: {
    border: "border-special-500/30",
    bg: "bg-special-500/[0.08]",
    text: "text-special-300",
    line: "from-special-500/50 via-special-500/15 to-transparent",
    chip: "bg-special-500/[0.10] border-special-500/25 text-special-200",
    glow: "from-special-500/20 via-special-500/[0.04] to-transparent",
  },
  mix: {
    border: "border-white/[0.12]",
    bg: "bg-white/[0.04]",
    text: "text-white",
    line: "from-utility-400/40 via-special-500/30 to-transparent",
    chip: "bg-white/[0.06] border-white/[0.12] text-white/85",
    glow: "from-utility-400/15 via-special-500/15 to-transparent",
  },
};

const techHighlights = [
  {
    icon: Layers,
    label: "Multi-model routing",
    text: "Kling 2.6, Seedance 2.0, and Sora 2 — picked automatically per shot type for the best result.",
    accent: "utility" as FeatureAccent,
  },
  {
    icon: MonitorPlay,
    label: "Starting frames",
    text: "Every shot begins from a composed frame — angle, expression, and position planned like a real production.",
    accent: "special" as FeatureAccent,
  },
  {
    icon: Globe,
    label: "Platform-native formats",
    text: "Aspect ratios, captions, and durations re-encoded automatically for each destination platform.",
    accent: "mix" as FeatureAccent,
  },
  {
    icon: Film,
    label: "Real editing pipeline",
    text: "Hook, B-roll, talking head, CTA — structured like a real production, not a single AI prompt.",
    accent: "utility" as FeatureAccent,
  },
];

/* ------------------------------------------------------------------ */
/*  Portal preview rail                                                */
/* ------------------------------------------------------------------ */

function FeatureRail() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {features.map((f) => {
          const colors = accent[f.accent];
          const Icon = f.icon;
          return (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              className={`group relative flex flex-col items-center gap-2 px-3 py-4 rounded-2xl card-hairline ${colors.border} hover:border-white/20 transition-all overflow-hidden text-center`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-50 group-hover:opacity-100 transition-opacity`}
              />
              <div
                className={`relative w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className="relative text-p3 font-semibold text-white/85">
                {f.shortLabel}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card                                                       */
/* ------------------------------------------------------------------ */

function FeatureCard({
  feature,
  hero = false,
}: {
  feature: (typeof features)[number];
  hero?: boolean;
}) {
  const colors = accent[feature.accent];
  const Icon = feature.icon;
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
      className={hero ? "md:col-span-3 md:row-span-2" : "md:col-span-3"}
    >
      <Link
        href={`/features/${feature.slug}`}
        className={`group relative block h-full rounded-2xl card-hairline overflow-hidden transition-colors hover:border-white/[0.12] ${
          hero ? "p-8 md:p-10" : "p-7"
        }`}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-${hero ? "70" : "40"} pointer-events-none`}
        />

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div
              className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
            >
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${colors.chip}`}
            >
              {feature.pillStat}
            </div>
          </div>

          <h3
            className={`font-semibold text-white tracking-[-0.02em] mb-3 ${
              hero ? "text-h3 sm:text-h2" : "text-p1 sm:text-h4"
            }`}
          >
            {feature.shortLabel}
          </h3>
          <p
            className={`text-white/70 leading-relaxed mb-5 ${
              hero ? "text-p1 max-w-xl" : "text-p2"
            }`}
          >
            {feature.subtitle}
          </p>

          {hero && (
            <p className="text-p2 text-white/70 leading-relaxed mb-6 max-w-xl">
              {feature.description}
            </p>
          )}

          {/* Highlights */}
          <ul className="space-y-2 mb-6">
            {feature.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-2 text-p3 text-white/60"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Check
                    className={`w-2 h-2 ${colors.text}`}
                    strokeWidth={3}
                  />
                </div>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto inline-flex items-center gap-2 text-p3 font-semibold text-white/70 group-hover:text-white transition-colors">
            Explore {feature.shortLabel}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeaturesClient() {
  const [heroFeature, ...restFeatures] = features;

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Features"
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Everything you need.{" "}
            <GradientText tone="brand">Nothing you don&apos;t.</GradientText>
          </>
        }
        description="A complete content production system — from AI video generation to cross-platform publishing — built for professionals who never have time to film."
        belowActions={<FeatureRail />}
      />

      {/* Feature bento grid */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-6 gap-5"
          >
            <FeatureCard feature={heroFeature} hero />
            {restFeatures.map((f) => (
              <FeatureCard key={f.slug} feature={f} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="relative py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-utility-400/[0.06] border border-utility-400/[0.15] mb-5">
                <span className="text-p3 text-utility-300/90 font-medium">
                  By the numbers
                </span>
              </div>
              <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                Built for{" "}
                <GradientText tone="brand">scale and quality.</GradientText>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                value="3-8"
                label="Cuts per video"
                caption="Real multi-cut editing"
                accent="utility"
              />
              <StatCard
                value="360°"
                label="Likeness consistency"
                caption="Every angle, every shot"
                accent="utility"
              />
              <StatCard
                value="5+"
                label="Content formats"
                caption="Format dictates structure"
                accent="special"
              />
              <StatCard
                value="5"
                label="Platforms covered"
                caption="One approval, everywhere"
                accent="special"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Under the hood — tech bento */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-special-500/[0.06] border border-special-500/[0.15] mb-5">
                <span className="text-p3 text-special-300/90 font-medium">
                  Under the hood
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                The engineering that{" "}
                <GradientText tone="brand">makes it real.</GradientText>
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
            {techHighlights.map((item) => {
              const colors = accent[item.accent];
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                  className="relative p-7 rounded-2xl card-hairline overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                    >
                      <ItemIcon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-p1 font-semibold text-white/90 mb-2">
                        {item.label}
                      </h3>
                      <p className="text-p2 text-white/70 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Compare strip */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="relative rounded-2xl card-hairline p-8 sm:p-10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/40 via-special-500/30 to-transparent" />
              <GlowBlob
                color="mix"
                size="lg"
                position="bottom-right"
                intensity={0.06}
              />

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
                    <span className="text-p3 text-white/60 font-medium">
                      How we compare
                    </span>
                  </div>
                  <h3 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mb-3">
                    Why this looks real{" "}
                    <GradientText tone="brand">
                      and others don&apos;t.
                    </GradientText>
                  </h3>
                  <p className="text-p2 text-white/70 leading-relaxed mb-5">
                    Multi-cut composition, character sheets, format-first
                    writing, directed starting frames. Every other AI video tool
                    skips at least one of these — that&apos;s why their videos
                    look like AI.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-utility-400/[0.06] border border-utility-400/20">
                      <Check
                        className="w-3 h-3 text-utility-300"
                        strokeWidth={3}
                      />
                      <span className="text-p3 text-utility-200">
                        Official AI
                      </span>
                    </div>
                    <span className="text-p3 text-white/70">vs</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                      <X className="w-3 h-3 text-white/70" strokeWidth={3} />
                      <span className="text-p3 text-white/70">
                        Other AI tools
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-5 flex md:justify-end">
                  <Link
                    href="/compare"
                    className="btn-cta-glow inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
                  >
                    Compare side-by-side
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA outro */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                All features on every plan
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Five features.{" "}
              <GradientText tone="brand">One workflow.</GradientText>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-2xl mx-auto mb-8">
              Every feature is included in every plan — the difference is
              volume. Your first video in under five minutes.
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

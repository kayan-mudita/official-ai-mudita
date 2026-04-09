"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Quote, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import {
  industries,
  getIndustryBySlug,
  type IndustryAccent,
} from "@/data/industries";
import { features } from "@/data/features";

const accent: Record<
  IndustryAccent,
  {
    border: string;
    bg: string;
    text: string;
    line: string;
    chip: string;
    glow: string;
    eyebrow: "utility" | "special" | "neutral";
    statTone: "utility" | "special" | "mix";
  }
> = {
  utility: {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.08]",
    text: "text-utility-300",
    line: "from-utility-400/50 via-utility-400/15 to-transparent",
    chip: "bg-utility-400/[0.10] border-utility-400/25 text-utility-200",
    glow: "from-utility-400/20 via-utility-400/[0.04] to-transparent",
    eyebrow: "utility",
    statTone: "utility",
  },
  special: {
    border: "border-special-500/30",
    bg: "bg-special-500/[0.08]",
    text: "text-special-300",
    line: "from-special-500/50 via-special-500/15 to-transparent",
    chip: "bg-special-500/[0.10] border-special-500/25 text-special-200",
    glow: "from-special-500/20 via-special-500/[0.04] to-transparent",
    eyebrow: "special",
    statTone: "special",
  },
  mix: {
    border: "border-white/[0.12]",
    bg: "bg-white/[0.04]",
    text: "text-white",
    line: "from-utility-400/40 via-special-500/30 to-transparent",
    chip: "bg-white/[0.06] border-white/[0.12] text-white/85",
    glow: "from-utility-400/15 via-special-500/15 to-transparent",
    eyebrow: "neutral",
    statTone: "mix",
  },
};

interface IndustryPageTemplateProps {
  slug: string;
}

export default function IndustryPageTemplate({
  slug,
}: IndustryPageTemplateProps) {
  const industry = getIndustryBySlug(slug);
  if (!industry) return null;
  const colors = accent[industry.accent];
  const Icon = industry.icon;
  const relatedFeatures = industry.relatedFeatures
    .map((s) => features.find((f) => f.slug === s))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow={industry.heroEyebrow}
        eyebrowIcon={Icon}
        eyebrowVariant={colors.eyebrow}
        spacing="pt-32 pb-16"
        headline={
          <>
            Your AI content team.{" "}
            <GradientText tone="brand">{industry.headlineSuffix}</GradientText>
          </>
        }
        description={industry.description}
        actions={
          <>
            <Link
              href="/auth/signup"
              className="btn-cta-glow group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] rounded-xl bg-white text-[#050508] text-p2 font-semibold hover:bg-white/95 transition-all"
            >
              Start your free week
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href={`/use-cases#${industry.useCaseAnchor}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl border border-white/[0.10] bg-white/[0.04] text-p2 text-white/70 hover:text-white hover:border-white/[0.20] transition-all"
            >
              {industry.secondaryCtaLabel}
            </Link>
          </>
        }
        belowActions={
          <p className="text-p3 text-white/35">
            Try free for 7 days. Cancel anytime.
          </p>
        }
      />

      {/* Results stat strip */}
      <section className="relative px-6 -mt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {industry.results.map((stat, i) => (
                <StatCard
                  key={i}
                  value={stat.value}
                  label={stat.label}
                  accent={
                    i % 2 === 0 ? colors.statTone : colors.statTone === "utility" ? "special" : "utility"
                  }
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Industry switcher rail */}
      <section className="relative px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {industries.map((other) => {
                const oColors = accent[other.accent];
                const OIcon = other.icon;
                const isCurrent = other.slug === industry.slug;
                return (
                  <Link
                    key={other.slug}
                    href={`/for/${other.slug}`}
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl card-hairline overflow-hidden transition-all ${
                      isCurrent
                        ? `${oColors.border}`
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${oColors.glow} ${
                        isCurrent ? "opacity-80" : "opacity-30 group-hover:opacity-60"
                      } transition-opacity`}
                    />
                    <div
                      className={`relative w-8 h-8 rounded-lg ${oColors.bg} ${oColors.border} border flex items-center justify-center flex-shrink-0`}
                    >
                      <OIcon className={`w-4 h-4 ${oColors.text}`} />
                    </div>
                    <span
                      className={`relative text-p3 font-semibold ${
                        isCurrent ? "text-white" : "text-white/65"
                      }`}
                    >
                      {other.shortLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Workflow — how it works for [industry] */}
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
                <GradientText tone="brand">tailored to you.</GradientText>
              </h2>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {industry.workflow.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                className="relative p-6 rounded-2xl card-hairline overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                />
                <div
                  className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center mb-4`}
                >
                  <span
                    className={`text-p3 font-mono font-semibold ${colors.text}`}
                  >
                    {step.num}
                  </span>
                </div>
                <h3 className="text-p1 font-semibold text-white/90 mb-2">
                  {step.title}
                </h3>
                <p className="text-p2 text-white/45 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Content library bento */}
      <section className="relative py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-12">
              <p
                className={`text-p3 font-semibold ${colors.text}/80 uppercase tracking-widest mb-3`}
              >
                {industry.contentLibrary.eyebrow}
              </p>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                {industry.contentLibrary.titleLead}
                <br />
                <GradientText tone="brand">
                  {industry.contentLibrary.titleAccent}
                </GradientText>
              </h2>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {industry.contentLibrary.types.map((type, i) => (
              <motion.div
                key={type}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                className="relative p-5 rounded-2xl card-hairline overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                />
                <div
                  className={`text-p3 font-mono font-semibold ${colors.text} mb-2`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-p2 font-semibold text-white/85 leading-snug">
                  {type}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="relative p-8 sm:p-10 rounded-2xl card-hairline overflow-hidden">
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
              />
              <GlowBlob
                color={industry.accent === "special" ? "special" : industry.accent === "utility" ? "utility" : "mix"}
                size="md"
                position="top-right"
                intensity={0.06}
              />
              <Quote
                className={`relative w-10 h-10 ${colors.text} opacity-30 mb-6`}
              />
              <p className="relative text-title text-white/75 leading-relaxed mb-8">
                &ldquo;{industry.testimonial.quote}&rdquo;
              </p>
              <div className="relative flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}
                >
                  <span className={`text-p2 font-bold ${colors.text}`}>
                    {industry.testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="text-p1 font-semibold text-white/90">
                    {industry.testimonial.name}
                  </div>
                  <div className="text-p3 text-white/45">
                    {industry.testimonial.title}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Related features */}
      {relatedFeatures.length > 0 && (
        <section className="relative py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                  <span className="text-p3 text-white/60 font-medium">
                    Powered by
                  </span>
                </div>
                <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                  The features that make this work.
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
              {relatedFeatures.map((rel) => {
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
                          <p className="text-p2 text-white/45 leading-relaxed">
                            {rel.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="flex-shrink-0 w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all mt-1" />
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
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                {industry.cta.badge}
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              {industry.cta.heading}{" "}
              <GradientText tone="brand">
                {industry.cta.headingAccent}
              </GradientText>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/45 max-w-xl mx-auto mb-8">
              {industry.cta.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                Start your free week
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

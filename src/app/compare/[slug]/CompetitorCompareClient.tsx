"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  Scale,
  GitCompareArrows,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FadeIn from "@/components/motion/FadeIn";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import Eyebrow from "@/components/marketing/Eyebrow";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { competitors, type Competitor } from "@/data/competitors";
import { features } from "@/data/features";

/** Features compare pages cross-link to — the differentiators competitors typically lack. */
const COMPARE_FEATURE_SLUGS = ["script-engine", "auto-posting", "analytics"];

function Cell({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === "yes") {
    return (
      <Check
        className={`w-4 h-4 mx-auto ${highlight ? "text-positive-400" : "text-white/35"}`}
      />
    );
  }
  if (value === "no") {
    return <X className="w-4 h-4 mx-auto text-white/15" />;
  }
  return (
    <span
      className={`text-p3 ${highlight ? "text-white font-semibold" : "text-white/40"}`}
    >
      {value}
    </span>
  );
}

export default function CompetitorCompareClient({
  competitor,
}: {
  competitor: Competitor;
}) {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow={`Official AI vs ${competitor.name}`}
        eyebrowIcon={Scale}
        eyebrowVariant="utility"
        spacing="pt-32 pb-12"
        headline={
          <>
            <span className="text-white">Official AI vs </span>
            <GradientText tone="brand">{competitor.name}</GradientText>
          </>
        }
        description={competitor.hookSub}
      />

      {/* Featured stats strip */}
      {competitor.featuredStats && competitor.featuredStats.length > 0 && (
        <section className="relative px-6 -mt-2 pb-16">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
                {competitor.featuredStats.map((stat, i) => (
                  <StatCard
                    key={i}
                    value={stat.value}
                    label={stat.label}
                    caption={stat.caption}
                    accent={stat.accent ?? "mix"}
                  />
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Positioning — two glass cards */}
      <FadeIn>
        <section className="relative px-6 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative overflow-hidden p-6 rounded-2xl card-hairline">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 via-utility-400/10 to-transparent" />
              <h3 className="text-p2 font-semibold text-white/85 mb-2">
                Where {competitor.name} fits
              </h3>
              <p className="text-p3 text-white/45 leading-relaxed">
                {competitor.whoItsFor}
              </p>
            </div>
            <div className="relative overflow-hidden p-6 rounded-2xl card-hairline">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-special-500/30 via-special-500/10 to-transparent" />
              <h3 className="text-p2 font-semibold text-white/85 mb-2">
                Where it falls short
              </h3>
              <p className="text-p3 text-white/45 leading-relaxed">
                {competitor.whereItFalls}
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Comparison table */}
      <FadeIn>
        <section className="relative px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div />
              <div className="p-5 rounded-t-2xl border border-white/[0.06] border-b-0 bg-white/[0.02] text-center">
                <div className="text-p3 text-white/30 uppercase tracking-wider font-semibold mb-2">
                  Them
                </div>
                <h3 className="text-p2 font-semibold text-white/65">
                  {competitor.name}
                </h3>
              </div>
              <div className="relative p-5 rounded-t-2xl border border-special-500/30 border-b-0 bg-special-500/[0.06] text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-p3 font-semibold text-special-200 bg-special-500/15 border border-special-500/30 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_24px_rgba(129,0,158,0.25)]">
                    Best for personal brands
                  </span>
                </div>
                <div className="text-p3 text-special-300/70 uppercase tracking-wider font-semibold mb-2">
                  Us
                </div>
                <h3 className="text-p2 font-semibold text-white">Official AI</h3>
              </div>
            </div>

            <div className="space-y-0">
              {competitor.rows.map((row, i) => {
                const isLast = i === competitor.rows.length - 1;
                return (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-3 group/row"
                  >
                    <div
                      className={`flex items-center px-4 py-4 text-p3 text-white/55 font-semibold transition-colors group-hover/row:text-white/85 ${
                        i === 0 ? "" : "border-t border-white/[0.06]"
                      }`}
                    >
                      {row.label}
                    </div>
                    <div
                      className={`flex items-center justify-center px-4 py-4 bg-white/[0.02] border-x border-white/[0.06] transition-colors group-hover/row:bg-white/[0.04] ${
                        i === 0 ? "" : "border-t border-white/[0.06]"
                      } ${isLast ? "rounded-b-2xl border-b" : ""}`}
                    >
                      <Cell value={row.competitor} />
                    </div>
                    <div
                      className={`flex items-center justify-center px-4 py-4 bg-special-500/[0.06] border-x border-special-500/25 transition-colors group-hover/row:bg-special-500/[0.10] ${
                        i === 0 ? "" : "border-t border-special-500/15"
                      } ${isLast ? "rounded-b-2xl border-b border-special-500/25" : ""}`}
                    >
                      <Cell value={row.official} highlight />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Why Official AI */}
      <FadeIn>
        <section className="relative px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Eyebrow icon={Sparkles} variant="special">
                Why solo pros pick us
              </Eyebrow>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <h2 className="text-h3 sm:text-h2 font-bold text-white tracking-[-0.02em] mb-8">
              The case against switching costs
            </h2>
            <ul className="space-y-3">
              {competitor.whyOfficial.map((point, i) => (
                <li
                  key={i}
                  className="relative overflow-hidden flex items-start gap-3 p-5 rounded-xl card-hairline"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/25 via-special-500/15 to-transparent" />
                  <Check className="w-4 h-4 mt-1 text-positive-400 flex-shrink-0" />
                  <span className="text-p2 text-white/70 leading-relaxed">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* FAQs */}
      {competitor.faqs.length > 0 && (
        <FadeIn>
          <section className="relative px-6 pb-24">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Eyebrow variant="utility">FAQ</Eyebrow>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <h2 className="text-h3 sm:text-h2 font-bold text-white tracking-[-0.02em] mb-8">
                Frequently asked
              </h2>
              <div className="space-y-3">
                {competitor.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden p-6 rounded-2xl card-hairline"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/25 via-utility-400/10 to-transparent" />
                    <h3 className="text-p1 font-semibold text-white/90 mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-p2 text-white/45 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </FadeIn>
      )}

      {/* Competitor switcher rail */}
      <section className="relative px-6 pb-20 border-t border-white/[0.04] pt-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-10">
              <Eyebrow icon={GitCompareArrows} variant="utility">
                Other comparisons
              </Eyebrow>
              <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mt-4">
                Compare us to{" "}
                <GradientText tone="brand">a different tool.</GradientText>
              </h2>
            </div>
          </FadeIn>
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {competitors.map((c) => {
              const isCurrent = c.slug === competitor.slug;
              return (
                <motion.div
                  key={c.slug}
                  variants={fadeUp}
                  whileHover={isCurrent ? undefined : { y: -3 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  <Link
                    href={`/compare/${c.slug}`}
                    className={`group relative block p-5 rounded-2xl card-hairline overflow-hidden h-full transition-colors ${
                      isCurrent
                        ? "border-special-500/30 bg-special-500/[0.04]"
                        : "hover:border-white/[0.12]"
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                        isCurrent
                          ? "from-special-500/60 via-special-500/20 to-transparent"
                          : "from-utility-400/30 via-special-500/20 to-transparent"
                      }`}
                    />
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                          isCurrent
                            ? "bg-special-500/[0.10] border-special-500/30"
                            : "bg-white/[0.04] border-white/[0.08]"
                        }`}
                      >
                        <GitCompareArrows
                          className={`w-4 h-4 ${
                            isCurrent ? "text-special-300" : "text-white/50"
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-p2 font-semibold ${
                          isCurrent ? "text-white" : "text-white/90"
                        }`}
                      >
                        vs {c.name}
                      </h3>
                    </div>
                    <p className="text-p3 text-white/40 leading-relaxed line-clamp-2">
                      {c.tagline}
                    </p>
                    {!isCurrent && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-p3 text-white/55 group-hover:text-white/85 transition-colors">
                        See comparison
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                    {isCurrent && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-p3 text-special-300 font-semibold">
                        You are here
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Related features */}
      {(() => {
        const relatedFeatures = COMPARE_FEATURE_SLUGS.map((s) =>
          features.find((f) => f.slug === s),
        ).filter((f): f is NonNullable<typeof f> => Boolean(f));
        if (relatedFeatures.length === 0) return null;
        return (
          <section className="relative px-6 pb-20 border-t border-white/[0.04] pt-20">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="mb-10">
                  <Eyebrow icon={Sparkles} variant="utility">
                    What sets us apart
                  </Eyebrow>
                  <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mt-4">
                    The features {competitor.name}{" "}
                    <GradientText tone="brand">doesn&apos;t ship.</GradientText>
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

      {/* CTA outro */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                $79 flat — no per-seat pricing
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Ready to switch from{" "}
              <GradientText tone="brand">{competitor.name}?</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/45 max-w-xl mx-auto mb-8">
              Get 30 professional videos a month, posted across every platform,
              for $79.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                All comparisons
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* JSON-LD for FAQ schema */}
      {competitor.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: competitor.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      )}
    </MarketingLayout>
  );
}

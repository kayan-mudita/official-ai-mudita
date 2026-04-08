"use client";

import Link from "next/link";
import { ArrowRight, Check, X, Sparkles, Scale } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import FadeIn from "@/components/motion/FadeIn";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import Eyebrow from "@/components/marketing/Eyebrow";
import type { Competitor } from "@/data/competitors";

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
        spacing="pt-32 pb-16"
        headline={
          <>
            <span className="text-white">Official AI vs </span>
            <GradientText tone="brand">{competitor.name}</GradientText>
          </>
        }
        description={competitor.hookSub}
      />

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

              <div className="mt-12 text-center">
                <Link
                  href="/compare"
                  className="group inline-flex items-center gap-2 text-p3 font-semibold text-white/55 hover:text-white/95 transition-colors"
                >
                  See all comparisons
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      <CTASection
        heading={`Ready to switch from ${competitor.name}?`}
        description="Get 30 professional videos a month, posted across every platform, for $79."
        badge="$79 flat — no per-seat pricing"
        buttonText="Start free trial"
      />

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

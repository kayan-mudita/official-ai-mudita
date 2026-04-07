"use client";

import Link from "next/link";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import FadeIn from "@/components/motion/FadeIn";
import type { Competitor } from "@/data/competitors";

function Cell({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === "yes") {
    return (
      <Check className={`w-4 h-4 mx-auto ${highlight ? "text-emerald-400" : "text-white/30"}`} />
    );
  }
  if (value === "no") {
    return <X className="w-4 h-4 mx-auto text-white/15" />;
  }
  return (
    <span className={`text-p3 ${highlight ? "text-white/70 font-medium" : "text-white/35"}`}>
      {value}
    </span>
  );
}

export default function CompetitorCompareClient({ competitor }: { competitor: Competitor }) {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn delay={0} duration={0.6}>
            <p className="text-p3 font-medium text-blue-400/70 uppercase tracking-widest mb-4">
              Official AI vs {competitor.name}
            </p>
          </FadeIn>
          <FadeIn delay={0.1} duration={0.7}>
            <h1 className="text-h1 sm:text-h0 font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
              {competitor.hookHeadline}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2} duration={0.7}>
            <p className="text-title text-white/35 max-w-xl mx-auto leading-relaxed font-light">
              {competitor.hookSub}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Positioning */}
      <FadeIn>
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl card-hairline">
              <h3 className="text-p2 font-semibold text-white/80 mb-2">Where {competitor.name} fits</h3>
              <p className="text-p3 text-white/40 leading-relaxed">{competitor.whoItsFor}</p>
            </div>
            <div className="p-6 rounded-2xl card-hairline">
              <h3 className="text-p2 font-semibold text-white/80 mb-2">Where it falls short</h3>
              <p className="text-p3 text-white/40 leading-relaxed">{competitor.whereItFalls}</p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Comparison table */}
      <FadeIn>
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div />
              <div className="p-5 rounded-t-2xl border border-white/[0.04] border-b-0 bg-white/[0.015] text-center">
                <div className="text-p3 text-white/25 uppercase tracking-wider font-medium mb-2">
                  Them
                </div>
                <h3 className="text-p2 font-semibold text-white/60">{competitor.name}</h3>
              </div>
              <div className="relative p-5 rounded-t-2xl border border-blue-500/20 border-b-0 bg-blue-500/[0.04] text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-p3 font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full whitespace-nowrap">
                    Best for personal brands
                  </span>
                </div>
                <div className="text-p3 text-blue-400/50 uppercase tracking-wider font-medium mb-2">
                  Us
                </div>
                <h3 className="text-p2 font-semibold text-white/90">Official AI</h3>
              </div>
            </div>

            <div className="space-y-0">
              {competitor.rows.map((row, i) => {
                const isLast = i === competitor.rows.length - 1;
                return (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <div
                      className={`flex items-center px-4 py-3.5 text-p3 text-white/45 font-medium ${
                        i === 0 ? "" : "border-t border-white/[0.04]"
                      }`}
                    >
                      {row.label}
                    </div>
                    <div
                      className={`flex items-center justify-center px-4 py-3.5 bg-white/[0.015] border-x border-white/[0.04] ${
                        i === 0 ? "" : "border-t border-white/[0.04]"
                      } ${isLast ? "rounded-b-2xl border-b" : ""}`}
                    >
                      <Cell value={row.competitor} />
                    </div>
                    <div
                      className={`flex items-center justify-center px-4 py-3.5 bg-blue-500/[0.04] border-x border-blue-500/20 ${
                        i === 0 ? "" : "border-t border-blue-500/10"
                      } ${isLast ? "rounded-b-2xl border-b border-blue-500/20" : ""}`}
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
        <section className="px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400/70" />
              <h2 className="text-h3 font-semibold text-white">
                Why solo professionals pick Official AI
              </h2>
            </div>
            <ul className="space-y-3">
              {competitor.whyOfficial.map((point, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-xl card-hairline">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-p2 text-white/60">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* FAQs */}
      {competitor.faqs.length > 0 && (
        <FadeIn>
          <section className="px-6 pb-24">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-h3 font-semibold text-white mb-6">Frequently asked</h2>
              <div className="space-y-3">
                {competitor.faqs.map((faq, i) => (
                  <div key={i} className="p-5 rounded-xl card-hairline">
                    <h3 className="text-p2 font-semibold text-white/80 mb-2">{faq.q}</h3>
                    <p className="text-p3 text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 text-p3 text-white/40 hover:text-white/70 transition-colors"
                >
                  See all comparisons
                  <ArrowRight className="w-3.5 h-3.5" />
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

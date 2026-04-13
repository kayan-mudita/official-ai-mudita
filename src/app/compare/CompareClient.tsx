"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  GitCompareArrows,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { competitors } from "@/data/competitors";

interface ComparisonRow {
  label: string;
  diy: string;
  agency: string;
  official: string;
}

const comparisonData: ComparisonRow[] = [
  { label: "Monthly cost", diy: "Free", agency: "$3,000 - $5,000", official: "$79" },
  { label: "Time investment", diy: "5+ hrs/month", agency: "10+ hrs/month (meetings)", official: "5 min setup" },
  { label: "Videos per month", diy: "2", agency: "4", official: "30" },
  { label: "Video quality", diy: "Amateur", agency: "Professional", official: "Professional" },
  { label: "Your face & voice", diy: "yes", agency: "yes", official: "yes" },
  { label: "Script writing", diy: "You write them", agency: "Agency writes", official: "AI writes (you approve)" },
  { label: "Auto-posting", diy: "no", agency: "no", official: "yes" },
  { label: "Multi-platform", diy: "Manual upload each", agency: "1-2 platforms", official: "5 platforms" },
  { label: "Analytics", diy: "no", agency: "Monthly report", official: "Real-time dashboard" },
  { label: "Turnaround time", diy: "Whenever you finish", agency: "1-2 weeks", official: "Under 5 minutes" },
];

function CellValue({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === "yes") {
    return (
      <Check
        className={`w-4 h-4 mx-auto ${highlight ? "text-positive-400" : "text-white/70"}`}
        strokeWidth={3}
      />
    );
  }
  if (value === "no") {
    return <X className="w-4 h-4 mx-auto text-white/70" strokeWidth={3} />;
  }
  return (
    <span
      className={`text-p3 ${highlight ? "text-white font-semibold" : "text-white/70"}`}
    >
      {value}
    </span>
  );
}

export default function CompareClient() {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Compare"
        eyebrowIcon={GitCompareArrows}
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Stop overpaying{" "}
            <GradientText tone="brand">for content.</GradientText>
          </>
        }
        description="See how Official AI stacks up against doing it yourself, hiring an agency, or every other AI video tool on the market."
      />

      {/* Stat strip */}
      <section className="relative px-6 -mt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              <StatCard
                value="$79"
                label="Flat / month"
                caption="Replaces $5K agency stacks"
                accent="utility"
              />
              <StatCard
                value="30"
                label="Videos / month"
                caption="vs 4 from an agency"
                accent="special"
              />
              <StatCard
                value="5 min"
                label="Setup"
                caption="vs 1-2 weeks turnaround"
                accent="utility"
              />
              <StatCard
                value="5"
                label="Platforms"
                caption="One approval, posted everywhere"
                accent="special"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* DIY vs Agency vs Official AI table */}
      <section className="relative px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  Three options
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                The cost of doing nothing{" "}
                <GradientText tone="brand">vs doing it right.</GradientText>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            {/* Column headers */}
            <div className="grid grid-cols-4 gap-3 mb-2">
              <div />
              <div className="p-5 rounded-t-2xl border border-white/[0.06] border-b-0 bg-white/[0.02] text-center">
                <div className="text-p3 text-white/70 uppercase tracking-wider font-semibold mb-2">
                  Option 1
                </div>
                <h3 className="text-p2 font-semibold text-white/70">
                  Do it yourself
                </h3>
              </div>
              <div className="p-5 rounded-t-2xl border border-white/[0.06] border-b-0 bg-white/[0.02] text-center">
                <div className="text-p3 text-white/70 uppercase tracking-wider font-semibold mb-2">
                  Option 2
                </div>
                <h3 className="text-p2 font-semibold text-white/70">
                  Hire an agency
                </h3>
              </div>
              <div className="relative p-5 rounded-t-2xl border border-special-500/30 border-b-0 bg-special-500/[0.06] text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-p3 font-semibold text-special-200 bg-special-500/15 border border-special-500/30 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_24px_rgba(129,0,158,0.25)]">
                    Best value
                  </span>
                </div>
                <div className="text-p3 text-special-300/70 uppercase tracking-wider font-semibold mb-2">
                  Option 3
                </div>
                <h3 className="text-p2 font-semibold text-white">Official AI</h3>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-0">
              {comparisonData.map((row, i) => {
                const isLast = i === comparisonData.length - 1;
                return (
                  <div key={i} className="grid grid-cols-4 gap-3 group/row">
                    <div
                      className={`flex items-center px-4 py-4 text-p3 text-white/70 font-semibold transition-colors group-hover/row:text-white/85 ${
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
                      <CellValue value={row.diy} />
                    </div>
                    <div
                      className={`flex items-center justify-center px-4 py-4 bg-white/[0.02] border-x border-white/[0.06] transition-colors group-hover/row:bg-white/[0.04] ${
                        i === 0 ? "" : "border-t border-white/[0.06]"
                      } ${isLast ? "rounded-b-2xl border-b" : ""}`}
                    >
                      <CellValue value={row.agency} />
                    </div>
                    <div
                      className={`flex items-center justify-center px-4 py-4 bg-special-500/[0.06] border-x border-special-500/25 transition-colors group-hover/row:bg-special-500/[0.10] ${
                        i === 0 ? "" : "border-t border-special-500/15"
                      } ${isLast ? "rounded-b-2xl border-b border-special-500/25" : ""}`}
                    >
                      <CellValue value={row.official} highlight />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA row */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div />
              <div />
              <div />
              <div className="text-center">
                <Link
                  href="/auth/signup"
                  className="btn-cta-glow inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#050508] text-p3 font-semibold hover:bg-white/90 transition-all"
                >
                  Start free trial
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Competitor switcher — head-to-head pages */}
      <section className="relative px-6 pb-20 border-t border-white/[0.04] pt-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  Head-to-head
                </span>
              </div>
              <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                Or compare us to{" "}
                <GradientText tone="brand">a specific tool.</GradientText>
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
            {competitors.map((c) => (
              <motion.div
                key={c.slug}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <Link
                  href={`/compare/${c.slug}`}
                  className="group relative block p-5 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] transition-colors"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 via-special-500/20 to-transparent" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <GitCompareArrows className="w-4 h-4 text-white/70" />
                    </div>
                    <h3 className="text-p2 font-semibold text-white/90">
                      vs {c.name}
                    </h3>
                  </div>
                  <p className="text-p3 text-white/70 leading-relaxed line-clamp-2">
                    {c.tagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-p3 text-white/70 group-hover:text-white/85 transition-colors">
                    See comparison
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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
                $79/mo replaces $5,000/mo agencies
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Ready to{" "}
              <GradientText tone="brand">switch to AI?</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              Get 30 professional videos a month for less than the cost of one
              agency-produced video.
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

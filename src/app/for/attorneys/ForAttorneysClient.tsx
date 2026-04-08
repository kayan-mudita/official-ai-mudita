"use client";

import Link from "next/link";
import { ArrowRight, Scale, Quote } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FadeIn from "@/components/motion/FadeIn";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import StatCard from "@/components/marketing/StatCard";

const results = [
  { value: "240K+", label: "Views per month" },
  { value: "8/mo", label: "Consultation calls" },
  { value: "20 min", label: "Weekly time investment" },
  { value: "$79", label: "Per month" },
];

const contentTypes = [
  "Know-your-rights tips",
  "Case result highlights",
  "Legal myth-busting",
  "Process explainers",
  "Client FAQ answers",
  "Legal news reactions",
  "Client success stories",
  "Weekly legal tips",
];

const testimonial = {
  name: "Marcus Rivera",
  title: "Managing Partner, Personal Injury",
  quote:
    "We were spending $4,000 a month on a videographer who delivered four videos. Official AI gives us 30 for a fraction of the cost and they actually look like me on camera.",
};

export default function ForAttorneysClient() {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Built for legal professionals"
        eyebrowIcon={Scale}
        eyebrowVariant="special"
        spacing="pt-32 pb-20"
        headline={
          <>
            Your AI content team.{" "}
            <GradientText tone="brand">Built for attorneys.</GradientText>
          </>
        }
        description="Generate know-your-rights content, case result videos, and legal tips that drive consultations — using your face and voice. You review every script before it goes live."
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
              href="/use-cases#legal"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl border border-white/[0.10] bg-white/[0.04] text-p2 text-white/70 hover:text-white hover:border-white/[0.20] transition-all"
            >
              See legal examples
            </Link>
          </>
        }
        belowActions={
          <p className="text-p3 text-white/35">
            Try free for 7 days. Cancel anytime.
          </p>
        }
      />

      {/* Results */}
      <section className="relative px-6 -mt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {results.map((stat, i) => (
                <StatCard
                  key={i}
                  value={stat.value}
                  label={stat.label}
                  accent={i % 2 === 0 ? "special" : "utility"}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content types */}
      <FadeIn>
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-14">
              <p className="text-p3 font-medium text-violet-400/70 uppercase tracking-widest mb-3">
                Legal content library
              </p>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                8 template categories.
                <br />
                <span className="text-white/40">Endless variations.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentTypes.map((type, i) => (
                <div key={i} className="p-5 rounded-xl card-hairline">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mb-3" />
                  <h3 className="text-p2 font-medium text-white/70">
                    {type}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Testimonial */}
      <FadeIn>
        <section className="py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-2xl mx-auto text-center">
            <Quote className="w-8 h-8 text-violet-400/20 mx-auto mb-6" />
            <p className="text-title text-white/50 leading-relaxed mb-8">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div>
              <div className="text-p2 font-medium text-white/70">
                {testimonial.name}
              </div>
              <div className="text-p3 text-white/30">
                {testimonial.title}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <CTASection
        heading="Your expertise. AI-powered content."
        description="Generate legal content videos using your face and voice. Review every script. Approve before it goes live."
        badge="Built specifically for attorneys"
      />
    </MarketingLayout>
  );
}

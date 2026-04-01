"use client";

import Link from "next/link";
import { ArrowRight, Home, Quote } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FadeIn from "@/components/motion/FadeIn";
import CTASection from "@/components/marketing/CTASection";

const results = [
  { value: "5/wk", label: "Videos per week" },
  { value: "12/mo", label: "New leads from content" },
  { value: "0 min", label: "Time filming" },
  { value: "$79", label: "Per month" },
];

const contentTypes = [
  "Listing video tours",
  "Market updates",
  "Just-sold celebrations",
  "Open house invites",
  "Neighborhood spotlights",
  "Buyer & seller tips",
];

const testimonial = {
  name: "Sarah Mitchell",
  title: "Broker / Owner",
  quote:
    "I went from posting once a month to five times a week. My DMs are full of people saying they see me everywhere. Three new listings came from social this quarter alone.",
};

export default function ForRealtorsClient() {
  return (
    <MarketingLayout>
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn delay={0} duration={0.6}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.12] mb-8">
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[12px] text-blue-400/80 font-medium">
                Built for real estate professionals
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} duration={0.7}>
            <h1 className="text-[46px] sm:text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-white mb-6">
              Your AI content team.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Built for realtors.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} duration={0.7}>
            <p className="text-[17px] sm:text-[19px] text-white/35 max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Generate listing tours, market updates, and neighborhood guides --
              using your face and voice. Post daily without ever touching a camera.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} duration={0.7}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/auth/signup"
                className="btn-cta-glow group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl bg-white text-[#050508] text-[15px] font-semibold hover:bg-white/90 active:bg-white/80 transition-all"
              >
                Start your free week
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/use-cases#real-estate"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl text-[15px] text-white/40 hover:text-white/60 active:text-white/70 transition-all"
              >
                See real estate examples
              </Link>
            </div>
            <p className="text-[13px] text-white/15">
              Try free for 7 days. Cancel anytime.
            </p>
          </FadeIn>
        </div>
      </section>

      <FadeIn>
        <section className="border-y border-white/[0.04] py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {results.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-[32px] font-bold tracking-tight text-white">{stat.value}</div>
                <div className="text-[13px] text-white/25">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-14">
              <p className="text-[13px] font-medium text-blue-400/70 uppercase tracking-widest mb-3">
                Real estate content library
              </p>
              <h2 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-white leading-tight">
                6 template categories.
                <br />
                <span className="text-white/40">Ready to customize.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {contentTypes.map((type, i) => (
                <div key={i} className="p-5 rounded-xl card-hairline">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mb-3" />
                  <h3 className="text-[14px] font-medium text-white/70">{type}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-2xl mx-auto text-center">
            <Quote className="w-8 h-8 text-blue-400/20 mx-auto mb-6" />
            <p className="text-[17px] text-white/50 leading-relaxed mb-8">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div>
              <div className="text-[14px] font-medium text-white/70">{testimonial.name}</div>
              <div className="text-[12px] text-white/30">{testimonial.title}</div>
            </div>
          </div>
        </section>
      </FadeIn>

      <CTASection
        heading="Post daily. Never film again."
        description="AI-generated listing tours, market updates, and more. Using your face, your voice, your branding."
        badge="Built specifically for realtors"
      />
    </MarketingLayout>
  );
}

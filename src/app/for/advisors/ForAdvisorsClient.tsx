"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Quote } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FadeIn from "@/components/motion/FadeIn";
import CTASection from "@/components/marketing/CTASection";

const results = [
  { value: "7/wk", label: "Posts per week" },
  { value: "45K", label: "LinkedIn impressions / mo" },
  { value: "3/mo", label: "New AUM inquiries" },
  { value: "$79", label: "Per month" },
];

const contentTypes = [
  "Market commentary",
  "Financial tips",
  "Retirement planning",
  "Economic news reactions",
  "Investment explainers",
  "Tax planning tips",
];

const testimonial = {
  name: "Rachel Chen",
  title: "Financial Advisor, $50M AUM",
  quote:
    "My competitors are posting daily market commentary on LinkedIn. Now I do too -- in 20 minutes a week. Three new AUM inquiries came from content last month alone.",
};

export default function ForAdvisorsClient() {
  return (
    <MarketingLayout>
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn delay={0} duration={0.6}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.12] mb-8">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[12px] text-emerald-400/80 font-medium">
                Built for financial advisors
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} duration={0.7}>
            <h1 className="text-[46px] sm:text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-white mb-6">
              Your AI content team.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Built for advisors.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} duration={0.7}>
            <p className="text-[17px] sm:text-[19px] text-white/35 max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Generate daily market commentary, financial tips, and thought
              leadership content -- using your face and voice. Review over morning
              coffee, auto-post by 8am.
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
                href="/use-cases#financial-services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl text-[15px] text-white/40 hover:text-white/60 active:text-white/70 transition-all"
              >
                See advisor examples
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
              <p className="text-[13px] font-medium text-emerald-400/70 uppercase tracking-widest mb-3">
                Financial content library
              </p>
              <h2 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-white leading-tight">
                6 template categories.
                <br />
                <span className="text-white/40">Market-ready daily.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {contentTypes.map((type, i) => (
                <div key={i} className="p-5 rounded-xl card-hairline">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mb-3" />
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
            <Quote className="w-8 h-8 text-emerald-400/20 mx-auto mb-6" />
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
        heading="Become the go-to advisor in your market."
        description="AI-generated market commentary, financial tips, and thought leadership. Using your face and voice."
        badge="Built specifically for financial advisors"
      />
    </MarketingLayout>
  );
}

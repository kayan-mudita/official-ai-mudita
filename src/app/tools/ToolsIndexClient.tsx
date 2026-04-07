"use client";

import Link from "next/link";
import { ArrowRight, Clock, Calculator, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import FadeIn from "@/components/motion/FadeIn";

const tools = [
  {
    href: "/tools/speaking-time-calculator",
    icon: Clock,
    name: "Speaking Time Calculator",
    description:
      "Paste a script, get the exact runtime. Tuned for short-form video pacing on LinkedIn, TikTok, and Reels.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    href: "/tools/video-roi-calculator",
    icon: Calculator,
    name: "Video ROI Calculator",
    description:
      "See what you spend (and lose) on agencies, freelancers, or DIY filming vs. an AI-generated workflow.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    href: "/tools/hook-generator",
    icon: Sparkles,
    name: "Hook Generator",
    description:
      "100+ proven first-line hooks for short-form video. Filter by industry — realtor, lawyer, advisor, doctor.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

export default function ToolsIndexClient() {
  return (
    <MarketingLayout>
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn delay={0} duration={0.6}>
            <p className="text-p3 font-medium text-blue-400/70 uppercase tracking-widest mb-4">
              Free Tools
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-h1 sm:text-h0 font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
              Free tools for video marketers
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-title text-white/35 max-w-xl mx-auto leading-relaxed font-light">
              No signup. No email gate. Built for solo professionals who ship short-form video.
            </p>
          </FadeIn>
        </div>
      </section>

      <FadeIn>
        <section className="px-6 pb-24">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group p-6 rounded-2xl card-hairline hover:border-white/[0.12] transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${tool.bg} border ${tool.border} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-4 h-4 ${tool.color}`} />
                  </div>
                  <h3 className="text-p1 font-semibold text-white/90 mb-2">{tool.name}</h3>
                  <p className="text-p3 text-white/40 leading-relaxed mb-4">{tool.description}</p>
                  <span className="inline-flex items-center gap-1 text-p3 text-white/50 group-hover:text-white/80 transition-colors">
                    Open tool
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </FadeIn>

      <CTASection
        heading="Want the full workflow?"
        description="These tools are free forever. Official AI is the platform that automates the rest."
        badge="$79/mo flat"
        buttonText="See pricing"
        buttonHref="/pricing"
      />
    </MarketingLayout>
  );
}

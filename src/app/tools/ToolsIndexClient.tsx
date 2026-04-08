"use client";

import { ArrowRight, Clock, Calculator, Sparkles, Wrench } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import BentoGrid from "@/components/marketing/BentoGrid";
import BentoCard from "@/components/marketing/BentoCard";

const tools = [
  {
    href: "/tools/speaking-time-calculator",
    icon: Clock,
    name: "Speaking Time Calculator",
    description:
      "Paste a script, get the exact runtime. Tuned for short-form video pacing on LinkedIn, TikTok, and Reels.",
    accent: "utility" as const,
    span: "md:col-span-3",
    hero: true,
  },
  {
    href: "/tools/video-roi-calculator",
    icon: Calculator,
    name: "Video ROI Calculator",
    description:
      "See what you spend (and lose) on agencies, freelancers, or DIY filming vs. an AI-generated workflow.",
    accent: "utility" as const,
    span: "md:col-span-3",
    hero: true,
  },
  {
    href: "/tools/hook-generator",
    icon: Sparkles,
    name: "Hook Generator",
    description:
      "100+ proven first-line hooks for short-form video. Filter by industry — realtor, lawyer, advisor, doctor.",
    accent: "special" as const,
    span: "md:col-span-6",
    hero: false,
  },
];

export default function ToolsIndexClient() {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Free Tools"
        eyebrowIcon={Wrench}
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Free tools for{" "}
            <GradientText tone="brand">video marketers</GradientText>
          </>
        }
        description="No signup. No email gate. Built for solo professionals who ship short-form video."
      />

      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <BentoGrid>
            {tools.map((tool) => (
              <BentoCard
                key={tool.href}
                href={tool.href}
                icon={tool.icon}
                accent={tool.accent}
                span={tool.span}
                hero={tool.hero}
                title={tool.name}
                description={tool.description}
              >
                <span className="inline-flex items-center gap-1.5 text-p3 font-semibold text-white/55 group-hover:text-white/90 transition-colors">
                  Open tool
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </BentoCard>
            ))}
          </BentoGrid>
        </div>
      </section>

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

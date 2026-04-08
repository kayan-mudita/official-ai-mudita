"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import BentoGrid from "@/components/marketing/BentoGrid";
import BentoCard from "@/components/marketing/BentoCard";
import { getAllPillars } from "@/data/topic-libraries";

export default function GuidesIndexClient() {
  const pillars = getAllPillars();

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Learn"
        eyebrowIcon={BookOpen}
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        align="left"
        aboveEyebrow={
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Guides" }]}
          />
        }
        headline={
          <>
            In-depth guides on{" "}
            <GradientText tone="brand">AI video marketing.</GradientText>
          </>
        }
        description="Everything you need to know about creating, distributing, and scaling professional video content with AI."
      />

      <section className="relative px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <BentoGrid>
            {pillars.map((pillar, i) => {
              const isUtility = ["blue", "cyan", "emerald"].includes(
                pillar.accentColor,
              );
              const accent = isUtility ? "utility" : "special";
              // First card hero, then alternate spans
              const isHero = i === 0;
              const span = isHero
                ? "md:col-span-4 md:row-span-2"
                : i === 1
                  ? "md:col-span-2"
                  : "md:col-span-2";
              return (
                <BentoCard
                  key={pillar.slug}
                  href={`/${pillar.slug}`}
                  icon={pillar.icon}
                  accent={accent}
                  span={span}
                  hero={isHero}
                  title={pillar.title}
                  description={pillar.navDescription}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-p3 font-semibold text-white/35">
                      {pillar.subTopics.length} chapters
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-p3 font-semibold text-white/55 group-hover:text-white/95 transition-colors">
                      Explore
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </BentoCard>
              );
            })}
          </BentoGrid>
        </div>
      </section>
    </MarketingLayout>
  );
}

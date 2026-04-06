"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import FadeIn from "@/components/motion/FadeIn";
import { getAllPillars } from "@/data/topic-libraries";

const accentGradients: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-500/0",
  violet: "from-violet-500/20 to-violet-500/0",
  emerald: "from-emerald-500/20 to-emerald-500/0",
  amber: "from-amber-500/20 to-amber-500/0",
  cyan: "from-cyan-500/20 to-cyan-500/0",
  rose: "from-rose-500/20 to-rose-500/0",
};

const accentText: Record<string, string> = {
  blue: "text-blue-400",
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  cyan: "text-cyan-400",
  rose: "text-rose-400",
};

export default function GuidesIndexClient() {
  const pillars = getAllPillars();

  return (
    <MarketingLayout>
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn duration={0.6}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Guides" },
              ]}
            />

            <div className="mb-14">
              <p className="text-[13px] font-medium text-blue-400/70 uppercase tracking-widest mb-3">
                Learn
              </p>
              <h1 className="text-[36px] sm:text-[46px] font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
                In-depth guides on
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                  AI video marketing.
                </span>
              </h1>
              <p className="text-[17px] text-white/35 max-w-xl leading-relaxed">
                Everything you need to know about creating, distributing, and scaling professional
                video content with AI.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pillars.map((pillar, i) => {
              const gradient = accentGradients[pillar.accentColor] || accentGradients.blue;
              const textColor = accentText[pillar.accentColor] || accentText.blue;
              return (
                <FadeIn key={pillar.slug} delay={i * 0.08} duration={0.5}>
                  <Link
                    href={`/learn/${pillar.slug}`}
                    className="group relative p-6 rounded-2xl card-hairline hover:border-white/[0.12] transition-all h-full flex flex-col"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${gradient}`} />

                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-white/[0.1] transition-colors">
                      <pillar.icon className={`w-5 h-5 ${textColor} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    </div>

                    <h2 className="text-[17px] font-semibold text-white/80 group-hover:text-white/95 transition-colors mb-2">
                      {pillar.title}
                    </h2>

                    <p className="text-[13px] text-white/25 leading-relaxed mb-4 flex-1">
                      {pillar.navDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-white/15">
                        {pillar.subTopics.length} topics
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[12px] ${textColor} opacity-60 group-hover:opacity-100 transition-opacity`}>
                        Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

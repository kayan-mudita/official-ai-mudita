"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import MeshMockup from "@/components/marketing/MeshMockup";

const OFFICIAL_AI_MONTHLY = 79;
const OFFICIAL_AI_VIDEOS_INCLUDED = 30;

function currency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (n: number) => void;
}

function Range({ label, value, min, max, step, suffix, onChange }: RangeProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-p3 font-semibold text-white/65 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-p1 font-bold text-white tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-utility-400"
      />
    </div>
  );
}

export default function VideoRoiClient() {
  const [videosPerMonth, setVideosPerMonth] = useState(20);
  const [hoursPerVideo, setHoursPerVideo] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [outsourceCost, setOutsourceCost] = useState(0);

  const result = useMemo(() => {
    const monthlyTimeCost = videosPerMonth * hoursPerVideo * hourlyRate;
    const monthlyTotal = monthlyTimeCost + outsourceCost;
    const annualTotal = monthlyTotal * 12;

    const officialMonthly = OFFICIAL_AI_MONTHLY;
    const officialAnnual = officialMonthly * 12;
    const monthlySavings = monthlyTotal - officialMonthly;
    const annualSavings = annualTotal - officialAnnual;
    const hoursSaved = videosPerMonth * hoursPerVideo;

    return {
      monthlyTotal,
      annualTotal,
      monthlySavings,
      annualSavings,
      hoursSaved,
      videosDelta: OFFICIAL_AI_VIDEOS_INCLUDED - videosPerMonth,
    };
  }, [videosPerMonth, hoursPerVideo, hourlyRate, outsourceCost]);

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Free tool"
        eyebrowIcon={Calculator}
        eyebrowVariant="utility"
        spacing="pt-32 pb-12"
        headline={
          <>
            Video <GradientText tone="brand">ROI Calculator</GradientText>
          </>
        }
        description="See exactly what you spend on video — and what you'd save with an AI workflow."
      />

      <section className="relative px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <MeshMockup aspect="aspect-auto" className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="relative overflow-hidden p-6 rounded-2xl card-hairline space-y-6">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/40 via-utility-400/15 to-transparent" />
                <h2 className="text-p1 font-semibold text-white/85">
                  Your current setup
                </h2>
                <Range
                  label="Videos per month"
                  value={videosPerMonth}
                  min={1}
                  max={60}
                  step={1}
                  onChange={setVideosPerMonth}
                />
                <Range
                  label="Hours per video"
                  value={hoursPerVideo}
                  min={0.5}
                  max={10}
                  step={0.5}
                  suffix="h"
                  onChange={setHoursPerVideo}
                />
                <Range
                  label="Your hourly rate"
                  value={hourlyRate}
                  min={25}
                  max={500}
                  step={25}
                  suffix="/h"
                  onChange={setHourlyRate}
                />
                <div>
                  <label className="text-p3 font-semibold text-white/65 uppercase tracking-wider block mb-2">
                    Monthly outsourcing spend (optional)
                  </label>
                  <input
                    type="number"
                    value={outsourceCost}
                    onChange={(e) =>
                      setOutsourceCost(Number(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg px-3 py-2 text-p2 text-white tabular-nums focus:outline-none focus:border-utility-400/40 focus:bg-white/[0.04] transition-colors"
                  />
                  <p className="text-p3 text-white/35 mt-2">
                    Editor, agency, freelancers, etc.
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden p-6 rounded-2xl card-hairline bg-special-500/[0.04] space-y-5">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-special-500/40 via-utility-400/15 to-transparent" />
                <h2 className="text-p1 font-semibold text-white/90">
                  Your savings with Official AI
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl card-hairline">
                    <div className="text-p3 text-white/35 uppercase tracking-wider mb-1 font-semibold">
                      You spend / mo
                    </div>
                    <div className="text-h3 font-bold text-white tabular-nums">
                      {currency(result.monthlyTotal)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl card-hairline">
                    <div className="text-p3 text-white/35 uppercase tracking-wider mb-1 font-semibold">
                      Official AI / mo
                    </div>
                    <div className="text-h3 font-bold text-white tabular-nums">
                      {currency(OFFICIAL_AI_MONTHLY)}
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden p-5 rounded-xl bg-positive-500/[0.06] border border-positive-500/25">
                  <div className="text-p3 text-positive-400/80 uppercase tracking-wider mb-1 font-semibold">
                    Annual savings
                  </div>
                  <div className="text-h1 font-bold text-positive-300 tabular-nums">
                    {currency(Math.max(0, result.annualSavings))}
                  </div>
                </div>

                <div className="space-y-2 text-p3 text-white/55">
                  <div className="flex justify-between">
                    <span>Hours back per month</span>
                    <span className="text-white font-semibold tabular-nums">
                      {result.hoursSaved.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra videos vs. today</span>
                    <span className="text-white font-semibold tabular-nums">
                      {result.videosDelta > 0
                        ? `+${result.videosDelta}`
                        : result.videosDelta}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <h2 className="text-p2 font-semibold text-white/85 mb-2">
                How we calculate
              </h2>
              <p className="text-p3 text-white/45 leading-relaxed">
                Monthly cost = (videos × hours per video × your hourly rate) +
                outsourcing spend. We compare against the Official AI flat plan:{" "}
                {currency(OFFICIAL_AI_MONTHLY)}/mo for {OFFICIAL_AI_VIDEOS_INCLUDED}{" "}
                finished, ready-to-post videos.
              </p>
            </div>
          </MeshMockup>
        </div>
      </section>

      <CTASection
        heading="Stop spending hours on video"
        description="Generate, caption, and post 30 videos a month for less than one hour of agency time."
        badge={`${currency(OFFICIAL_AI_MONTHLY)}/mo flat`}
        buttonText="Start free trial"
      />
    </MarketingLayout>
  );
}

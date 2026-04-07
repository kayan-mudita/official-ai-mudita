"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import FadeIn from "@/components/motion/FadeIn";

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
        <label className="text-p3 font-medium text-white/60">{label}</label>
        <span className="text-p2 font-semibold text-white">
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
        className="w-full accent-blue-500"
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
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Calculator className="w-3 h-3 text-emerald-400" />
              <span className="text-p3 text-emerald-400/80 font-medium">Free tool</span>
            </div>
            <h1 className="text-h1 sm:text-h0 font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
              Video ROI Calculator
            </h1>
            <p className="text-title text-white/35 max-w-xl mx-auto leading-relaxed font-light">
              See exactly what you spend on video — and what you'd save with an AI workflow.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl card-hairline space-y-6">
            <h2 className="text-p1 font-semibold text-white/80">Your current setup</h2>
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
              <label className="text-p3 font-medium text-white/60 block mb-2">
                Monthly outsourcing spend (optional)
              </label>
              <input
                type="number"
                value={outsourceCost}
                onChange={(e) => setOutsourceCost(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#0a0a12] border border-white/[0.06] rounded-lg px-3 py-2 text-p2 text-white focus:outline-none focus:border-blue-500/30"
              />
              <p className="text-p3 text-white/30 mt-2">Editor, agency, freelancers, etc.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] space-y-5">
            <h2 className="text-p1 font-semibold text-white/90">Your savings with Official AI</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-p3 text-white/30 uppercase tracking-wider mb-1">
                  You spend / mo
                </div>
                <div className="text-h3 font-bold text-white">{currency(result.monthlyTotal)}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-p3 text-white/30 uppercase tracking-wider mb-1">
                  Official AI / mo
                </div>
                <div className="text-h3 font-bold text-white">{currency(OFFICIAL_AI_MONTHLY)}</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
              <div className="text-p3 text-emerald-400/70 uppercase tracking-wider mb-1">
                Annual savings
              </div>
              <div className="text-h2 font-bold text-emerald-300">
                {currency(Math.max(0, result.annualSavings))}
              </div>
            </div>

            <div className="space-y-2 text-p3 text-white/50">
              <div className="flex justify-between">
                <span>Hours back per month</span>
                <span className="text-white font-semibold">{result.hoursSaved.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span>Extra videos vs. today</span>
                <span className="text-white font-semibold">
                  {result.videosDelta > 0 ? `+${result.videosDelta}` : result.videosDelta}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-6 p-5 rounded-xl card-hairline">
          <h2 className="text-p2 font-semibold text-white/80 mb-2">How we calculate</h2>
          <p className="text-p3 text-white/40 leading-relaxed">
            Monthly cost = (videos × hours per video × your hourly rate) + outsourcing spend. We compare
            against the Official AI flat plan: {currency(OFFICIAL_AI_MONTHLY)}/mo for {OFFICIAL_AI_VIDEOS_INCLUDED}{" "}
            finished, ready-to-post videos.
          </p>
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

"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, MousePointerClick } from "lucide-react";
import GlowBlob from "@/components/marketing/GlowBlob";

/**
 * Analytics mockup — KPI tile row with sparklines + 7-bar performance chart
 * with animated growing bars + platform legend pills.
 */
export default function AnalyticsMockup() {
  const bars = [
    { h: "h-8", grad: "from-utility-400/40" },
    { h: "h-12", grad: "from-utility-400/45" },
    { h: "h-10", grad: "from-utility-400/40" },
    { h: "h-16", grad: "from-utility-400/55" },
    { h: "h-14", grad: "from-special-500/40" },
    { h: "h-20", grad: "from-special-500/55" },
    { h: "h-24", grad: "from-special-500/65" },
  ];

  const kpis = [
    {
      label: "Views",
      value: "182k",
      delta: "+24%",
      icon: Eye,
      sparkPath: "M0 16 L8 14 L16 12 L24 8 L32 10 L40 6 L48 4",
    },
    {
      label: "Engage",
      value: "9.4%",
      delta: "+11%",
      icon: MousePointerClick,
      sparkPath: "M0 14 L8 12 L16 10 L24 12 L32 8 L40 7 L48 5",
    },
    {
      label: "ROI",
      value: "4.2×",
      delta: "+38%",
      icon: TrendingUp,
      sparkPath: "M0 18 L8 16 L16 14 L24 11 L32 8 L40 6 L48 3",
    },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] p-8 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-utility-400/[0.06] via-transparent to-utility-400/[0.04]" />
      <GlowBlob color="utility" size="lg" position="center" intensity={0.08} />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.10] backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-utility-300" />
              <span className="text-[10px] font-mono font-semibold text-utility-300/80 tracking-wider">
                PERFORMANCE
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-utility-400/[0.10] border border-utility-400/25">
              <span className="text-[9px] font-medium text-utility-200">
                7-day
              </span>
            </div>
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="relative p-2.5 rounded-lg bg-white/[0.025] border border-white/[0.08] overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-2.5 h-2.5 text-utility-300/80" />
                    <span className="text-[8px] font-mono text-positive-400">
                      {kpi.delta}
                    </span>
                  </div>
                  <div className="text-[14px] font-bold text-white tracking-tight leading-none mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-[8px] text-white/70 mb-1.5">
                    {kpi.label}
                  </div>
                  <svg
                    viewBox="0 0 48 20"
                    className="w-full h-3 overflow-visible"
                  >
                    <motion.path
                      d={kpi.sparkPath}
                      fill="none"
                      stroke="url(#sparkGradient)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3 + i * 0.08,
                        ease: [0.25, 0.4, 0.25, 1],
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="sparkGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="rgb(15 203 255)" />
                        <stop offset="100%" stopColor="rgb(129 0 158)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              );
            })}
          </div>

          {/* Bar chart */}
          <div className="mb-4">
            <div className="flex items-end justify-between gap-1.5 h-24 pb-1">
              {bars.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                >
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: 0.1 + i * 0.07,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                    style={{ transformOrigin: "bottom" }}
                    className={`w-full ${bar.h} rounded-sm bg-gradient-to-t ${bar.grad} to-transparent border-t border-white/15`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 px-0.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[8px] text-white/70 font-mono">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Platform legend */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-semibold text-white/70 tracking-widest">
                BY PLATFORM
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "IG", pct: "38%" },
                { name: "TT", pct: "27%" },
                { name: "LI", pct: "18%" },
                { name: "YT", pct: "12%" },
                { name: "FB", pct: "5%" },
              ].map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.7 + i * 0.06,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08]"
                >
                  <span className="text-[9px] font-semibold text-white/70">
                    {p.name}
                  </span>
                  <span className="text-[8px] font-mono text-utility-300/80">
                    {p.pct}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

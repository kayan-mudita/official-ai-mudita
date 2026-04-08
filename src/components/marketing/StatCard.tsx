import React from "react";
import GradientText from "@/components/marketing/GradientText";

interface StatCardProps {
  value: React.ReactNode;
  label: React.ReactNode;
  caption?: React.ReactNode;
  /** Top accent line color. Default: brand mix. */
  accent?: "utility" | "special" | "mix";
  className?: string;
}

const ACCENT_LINE: Record<NonNullable<StatCardProps["accent"]>, string> = {
  utility: "from-utility-400/40 via-utility-400/15 to-transparent",
  special: "from-special-500/40 via-special-500/15 to-transparent",
  mix: "from-utility-400/30 via-special-500/20 to-transparent",
};

/**
 * Bordered metric card — extracted from HomeClient.tsx (stats section).
 * Big gradient number, label, caption, ambient top accent line.
 */
export default function StatCard({
  value,
  label,
  caption,
  accent = "mix",
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`relative h-full p-8 rounded-2xl card-hairline overflow-hidden group ${className}`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${ACCENT_LINE[accent]}`}
      />

      {/* Big number */}
      <div className="text-[56px] sm:text-[64px] md:text-[80px] leading-[0.9] font-bold tracking-tighter mb-5">
        <GradientText tone="white">{value}</GradientText>
      </div>

      {/* Label */}
      <div className="text-p1 font-semibold text-white/90 mb-2">{label}</div>

      {/* Caption */}
      {caption && (
        <p className="text-p3 text-white/30 leading-relaxed">{caption}</p>
      )}
    </div>
  );
}

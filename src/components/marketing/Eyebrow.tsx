import React from "react";
import type { LucideIcon } from "lucide-react";

type EyebrowVariant = "neutral" | "utility" | "special";

interface EyebrowProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: EyebrowVariant;
  className?: string;
}

const VARIANT_MAP: Record<EyebrowVariant, string> = {
  neutral: "bg-white/[0.04] border-white/[0.08] text-white/70",
  utility: "bg-utility-400/[0.06] border-utility-400/[0.18] text-utility-300",
  special: "bg-special-500/[0.06] border-special-500/[0.18] text-special-300",
};

const DOT_MAP: Record<EyebrowVariant, string> = {
  neutral: "bg-white/40",
  utility: "bg-utility-400",
  special: "bg-special-400",
};

/**
 * Small pill-badge used above section headlines (Homepage pattern).
 * Renders an optional icon, otherwise a small accent dot.
 */
export default function Eyebrow({
  children,
  icon: Icon,
  variant = "neutral",
  className = "",
}: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-p3 font-medium ${VARIANT_MAP[variant]} ${className}`}
    >
      {Icon ? (
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full ${DOT_MAP[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

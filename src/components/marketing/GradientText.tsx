import React from "react";

type GradientTone = "brand" | "utility" | "special" | "white";

interface GradientTextProps {
  children: React.ReactNode;
  tone?: GradientTone;
  className?: string;
}

const TONE_MAP: Record<GradientTone, string> = {
  // Default brand: cyan → magenta — same as homepage hero highlight
  brand:
    "bg-gradient-to-r from-utility-400 via-special-400 to-utility-400 bg-[length:200%_100%]",
  utility: "bg-gradient-to-r from-utility-300 to-utility-500",
  special: "bg-gradient-to-r from-special-300 to-special-500",
  // Vertical white fade — used by big stat numbers on the homepage
  white: "bg-gradient-to-b from-white via-white to-white/30",
};

/**
 * Inline gradient text — wrap a <span> around a phrase to highlight it.
 * Use inside h1/h2/h3.
 */
export default function GradientText({
  children,
  tone = "brand",
  className = "",
}: GradientTextProps) {
  return (
    <span
      className={`bg-clip-text text-transparent ${TONE_MAP[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

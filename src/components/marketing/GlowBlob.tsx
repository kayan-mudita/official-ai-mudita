import React from "react";

type GlowColor = "special" | "utility" | "mix";
type GlowSize = "sm" | "md" | "lg" | "xl";
type GlowPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface GlowBlobProps {
  color?: GlowColor;
  size?: GlowSize;
  position?: GlowPosition;
  intensity?: number; // 0–1, default 0.06
  className?: string;
}

const SIZE_MAP: Record<GlowSize, string> = {
  sm: "w-[400px] h-[200px]",
  md: "w-[700px] h-[320px]",
  lg: "w-[900px] h-[400px]",
  xl: "w-[1200px] h-[560px]",
};

const POSITION_MAP: Record<GlowPosition, string> = {
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
  right: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
  "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
  "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
  "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
  "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
};

function buildGradient(color: GlowColor, intensity: number): string {
  // brand-anchor RGB equivalents (matches design-tokens.js)
  const SPECIAL = "129, 0, 158"; // #81009E
  const UTILITY = "15, 203, 255"; // #0FCBFF
  if (color === "special") {
    return `radial-gradient(ellipse at center, rgba(${SPECIAL}, ${intensity}) 0%, transparent 60%)`;
  }
  if (color === "utility") {
    return `radial-gradient(ellipse at center, rgba(${UTILITY}, ${intensity}) 0%, transparent 60%)`;
  }
  // mix — both anchors layered
  return `
    radial-gradient(ellipse at 30% 50%, rgba(${SPECIAL}, ${intensity}) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 50%, rgba(${UTILITY}, ${intensity * 0.85}) 0%, transparent 55%)
  `;
}

/**
 * Ambient radial-glow blob — extracted from inline patterns in HomeClient.tsx.
 * Drop inside any `relative` parent to add brand-tinted depth.
 */
export default function GlowBlob({
  color = "mix",
  size = "lg",
  position = "center",
  intensity = 0.06,
  className = "",
}: GlowBlobProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none ${SIZE_MAP[size]} ${POSITION_MAP[position]} ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{ background: buildGradient(color, intensity) }}
      />
    </div>
  );
}

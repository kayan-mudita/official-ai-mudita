"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { AuroraBackground } from "@/components/marketing/AuroraBackground";
import GlowBlob from "@/components/marketing/GlowBlob";
import Eyebrow from "@/components/marketing/Eyebrow";
import FadeIn from "@/components/motion/FadeIn";

interface HeroAuroraProps {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  eyebrowVariant?: "neutral" | "utility" | "special";
  /** Headline. Use a `<GradientText>` span inside to highlight a phrase. */
  headline: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional content slot below actions (e.g. social proof, breadcrumb). */
  belowActions?: React.ReactNode;
  /** Optional content slot above eyebrow (e.g. breadcrumbs). */
  aboveEyebrow?: React.ReactNode;
  align?: "center" | "left";
  /** Vertical padding. Default: pt-32 pb-20. */
  spacing?: string;
  className?: string;
}

/**
 * Standard marketing hero — animated aurora backdrop + ambient glow blobs +
 * eyebrow / headline / subhead / CTAs. One-line drop-in for any page.
 */
export default function HeroAurora({
  eyebrow,
  eyebrowIcon,
  eyebrowVariant = "neutral",
  headline,
  description,
  actions,
  belowActions,
  aboveEyebrow,
  align = "center",
  spacing = "pt-32 pb-20",
  className = "",
}: HeroAuroraProps) {
  const alignClasses =
    align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <AuroraBackground className={className}>
      <section className={`relative ${spacing} px-6 overflow-hidden`}>
        <GlowBlob color="special" size="xl" position="top" intensity={0.07} />
        <GlowBlob
          color="utility"
          size="lg"
          position="bottom"
          intensity={0.05}
        />

        <div
          className={`relative max-w-5xl mx-auto flex flex-col gap-6 ${alignClasses}`}
        >
          {aboveEyebrow}

          {eyebrow && (
            <FadeIn duration={0.5}>
              <Eyebrow icon={eyebrowIcon} variant={eyebrowVariant}>
                {eyebrow}
              </Eyebrow>
            </FadeIn>
          )}

          <FadeIn duration={0.7} delay={0.05}>
            <h1
              className={`text-h1 sm:text-h0 font-bold tracking-[-0.03em] leading-[1.05] text-white ${
                align === "center" ? "max-w-4xl" : "max-w-3xl"
              }`}
            >
              {headline}
            </h1>
          </FadeIn>

          {description && (
            <FadeIn duration={0.7} delay={0.15}>
              <p
                className={`text-title text-white/70 leading-relaxed ${
                  align === "center" ? "max-w-2xl" : "max-w-2xl"
                }`}
              >
                {description}
              </p>
            </FadeIn>
          )}

          {actions && (
            <FadeIn duration={0.6} delay={0.25}>
              <div
                className={`flex flex-wrap gap-4 mt-2 ${
                  align === "center" ? "justify-center" : "justify-start"
                }`}
              >
                {actions}
              </div>
            </FadeIn>
          )}

          {belowActions && (
            <FadeIn duration={0.6} delay={0.35}>
              <div
                className={`mt-6 ${align === "center" ? "" : "self-start"}`}
              >
                {belowActions}
              </div>
            </FadeIn>
          )}
        </div>
      </section>
    </AuroraBackground>
  );
}

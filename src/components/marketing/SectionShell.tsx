import React from "react";
import type { LucideIcon } from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";
import Eyebrow from "@/components/marketing/Eyebrow";
import GlowBlob from "@/components/marketing/GlowBlob";

type GlowColor = "special" | "utility" | "mix" | "none";

interface SectionShellProps {
  children: React.ReactNode;
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  eyebrowVariant?: "neutral" | "utility" | "special";
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  glow?: GlowColor;
  /** Max content width. Default: max-w-6xl */
  maxWidth?: string;
  /** Vertical padding. Default: py-24. */
  spacing?: string;
  className?: string;
  id?: string;
}

/**
 * Standard marketing section wrapper — eyebrow → title → description → children.
 * Wires `FadeIn` and an optional ambient `GlowBlob` automatically.
 */
export default function SectionShell({
  children,
  eyebrow,
  eyebrowIcon,
  eyebrowVariant = "neutral",
  title,
  description,
  align = "center",
  glow = "mix",
  maxWidth = "max-w-6xl",
  spacing = "py-24",
  className = "",
  id,
}: SectionShellProps) {
  const alignClasses =
    align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <section
      id={id}
      className={`relative ${spacing} px-6 overflow-hidden ${className}`}
    >
      {glow !== "none" && (
        <GlowBlob color={glow} size="lg" position="center" />
      )}

      <div className={`relative ${maxWidth} mx-auto`}>
        {(eyebrow || title || description) && (
          <FadeIn>
            <div
              className={`mb-12 ${align === "center" ? "text-center" : ""}`}
            >
              {eyebrow && (
                <div
                  className={`mb-6 ${align === "center" ? "flex justify-center" : ""}`}
                >
                  <Eyebrow icon={eyebrowIcon} variant={eyebrowVariant}>
                    {eyebrow}
                  </Eyebrow>
                </div>
              )}
              {title && (
                <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                  {title}
                </h2>
              )}
              {description && (
                <p
                  className={`text-title text-white/40 leading-relaxed mt-6 ${
                    align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"
                  }`}
                >
                  {description}
                </p>
              )}
            </div>
          </FadeIn>
        )}
        <div className={alignClasses}>{children}</div>
      </div>
    </section>
  );
}

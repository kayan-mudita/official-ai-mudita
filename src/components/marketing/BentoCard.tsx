"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/motion-variants";

type BentoAccent = "utility" | "special" | "mix" | "none";

interface BentoCardProps {
  children?: React.ReactNode;
  /** Optional inner header — icon + eyebrow + title + description. */
  icon?: LucideIcon;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Top hairline accent line. */
  accent?: BentoAccent;
  /** Tailwind grid span classes (e.g. "md:col-span-4 md:row-span-2"). */
  span?: string;
  /** If provided, the entire card becomes a link. */
  href?: string;
  /** Visual emphasis: hero cards get larger inner padding & headline. */
  hero?: boolean;
  className?: string;
}

const ACCENT_LINE: Record<Exclude<BentoAccent, "none">, string> = {
  utility: "from-utility-400/40 via-utility-400/15 to-transparent",
  special: "from-special-500/40 via-special-500/15 to-transparent",
  mix: "from-utility-400/30 via-special-500/20 to-transparent",
};

const ICON_TINT: Record<Exclude<BentoAccent, "none">, string> = {
  utility: "text-utility-300 bg-utility-400/[0.08] border-utility-400/[0.18]",
  special: "text-special-300 bg-special-500/[0.08] border-special-500/[0.18]",
  mix: "text-white/80 bg-white/[0.05] border-white/[0.10]",
};

/**
 * Single bento cell — composes the homepage feature-card pattern.
 * Use inside `<BentoGrid>`.
 */
export default function BentoCard({
  children,
  icon: Icon,
  eyebrow,
  title,
  description,
  accent = "mix",
  span,
  href,
  hero = false,
  className = "",
}: BentoCardProps) {
  const padding = hero ? "p-8 md:p-10" : "p-6";
  const innerClasses = `relative overflow-hidden rounded-2xl card-hairline group transition-colors block h-full ${padding} ${className}`;
  const wrapperSpan = span ?? "md:col-span-2";

  const inner = (
    <>
      {accent !== "none" && (
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${ACCENT_LINE[accent]}`}
          aria-hidden="true"
        />
      )}

      {(Icon || eyebrow || title || description) && (
        <div className="relative">
          {Icon && (
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border mb-5 ${ICON_TINT[accent === "none" ? "mix" : accent]}`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
          {eyebrow && (
            <div className="text-p3 font-semibold uppercase tracking-wider text-white/40 mb-2">
              {eyebrow}
            </div>
          )}
          {title && (
            <h3
              className={`font-semibold text-white tracking-[-0.02em] mb-3 ${
                hero ? "text-h3 sm:text-h2" : "text-h5 sm:text-h4"
              }`}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={`text-white/45 leading-relaxed ${
                hero ? "text-p1 max-w-xl" : "text-p2"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {children && <div className="relative mt-5">{children}</div>}
    </>
  );

  if (href) {
    return (
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -3 }}
        className={wrapperSpan}
      >
        <Link href={href} className={innerClasses}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className={wrapperSpan}
    >
      <div className={innerClasses}>{inner}</div>
    </motion.div>
  );
}

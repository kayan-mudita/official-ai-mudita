"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerChildren } from "@/lib/motion-variants";

interface BentoGridProps {
  children: React.ReactNode;
  /** Tailwind columns class. Default: 6 cols at md+. */
  cols?: string;
  /** Tailwind row class. Optional. */
  rows?: string;
  gap?: string;
  className?: string;
}

/**
 * 6-column bento grid wrapper. Uses Framer Motion stagger to reveal cards
 * sequentially when the grid scrolls into view.
 */
export default function BentoGrid({
  children,
  cols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-6",
  rows,
  gap = "gap-4 md:gap-5",
  className = "",
}: BentoGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "100px 0px" }}
      variants={staggerChildren}
      className={`grid ${cols} ${rows ?? ""} ${gap} ${className}`}
    >
      {children}
    </motion.div>
  );
}

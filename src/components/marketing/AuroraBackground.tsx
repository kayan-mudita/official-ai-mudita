"use client";

import React from "react";
import { motion } from "framer-motion";

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Aurora gradient background — animated brand-color sweep.
 *
 * Brand-token only:
 *   special-500  #81009E  (magenta/purple anchor)
 *   special-700  #66007E  (deep purple)
 *   utility-400  #0FCBFF  (cyan accent)
 *   utility-700  #0A3A54  (deep cyan)
 *
 * Designed as a wrapper — drop content as children. The aurora layer
 * sits behind, vignette darkens edges, content renders on top.
 */
export function AuroraBackground({
  className = "",
  children,
}: AuroraBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Aurora gradient layer */}
      <div
        className="absolute inset-0 overflow-hidden opacity-[0.18] pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-[-100%]"
          style={{
            background: `repeating-linear-gradient(100deg,
              #81009E 10%,
              #0FCBFF 20%,
              #66007E 30%,
              #089FCC 40%,
              #81009E 50%)`,
            backgroundSize: "300% 100%",
            filter: "blur(80px)",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-[-10px]"
          style={{
            background: `
              repeating-linear-gradient(100deg,
                rgba(129, 0, 158, 0.10) 0%,
                rgba(129, 0, 158, 0.10) 7%,
                transparent 10%,
                transparent 12%,
                rgba(15, 203, 255, 0.10) 16%),
              repeating-linear-gradient(100deg,
                #81009E 10%,
                #0FCBFF 20%,
                #66007E 30%,
                #089FCC 40%,
                #81009E 50%)
            `,
            backgroundSize: "200%, 100%",
            backgroundPosition: "50% 50%, 50% 50%",
            mixBlendMode: "difference",
          }}
          animate={{
            backgroundPosition: [
              "50% 50%, 50% 50%",
              "100% 50%, 150% 50%",
              "50% 50%, 50% 50%",
            ],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Vignette — fades aurora into pure black at edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 8, 0.7) 70%, #050508 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

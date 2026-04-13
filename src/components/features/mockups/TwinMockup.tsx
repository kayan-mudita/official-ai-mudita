"use client";

import { motion } from "framer-motion";
import GlowBlob from "@/components/marketing/GlowBlob";

/**
 * AI Twin & Voice mockup — fanned 3-card photo stack with animated cyan
 * scanline + a glass character-sheet panel with a 6-cell pose grid and
 * animated likeness/expression meters.
 */
export default function TwinMockup() {
  return (
    <div className="relative w-full h-full min-h-[400px] p-8 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-utility-400/[0.06] via-transparent to-utility-400/[0.04]" />
      <GlowBlob color="utility" size="lg" position="center" intensity={0.08} />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative grid grid-cols-2 gap-8 items-center w-full max-w-md">
        {/* Photo fan */}
        <div className="relative h-56">
          {[
            { rot: "-rot-12", offset: "left-0 top-4", grad: "from-utility-400/40" },
            { rot: "rotate-0", offset: "left-6 top-0", grad: "from-utility-400/55" },
            { rot: "rot-12", offset: "left-12 top-4", grad: "from-special-500/35" },
          ].map((c, i) => (
            <div
              key={i}
              className={`absolute ${c.offset} w-28 h-40 rounded-xl border border-white/[0.12] overflow-hidden shadow-2xl ${c.rot === "-rot-12" ? "-rotate-[10deg]" : c.rot === "rot-12" ? "rotate-[10deg]" : ""}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-b ${c.grad} via-black/40 to-special-500/15`}
              />
              <div className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-white/20" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/[0.10] border border-white/15" />
            </div>
          ))}
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, 160, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-utility-400 to-transparent"
            style={{ filter: "drop-shadow(0 0 6px rgb(15 203 255 / 0.7))" }}
          />
        </div>

        {/* Character sheet panel */}
        <div className="relative">
          <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.10] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-semibold text-utility-300/80 tracking-wider">
                CHARACTER SHEET
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-utility-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-utility-400/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-utility-400/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-gradient-to-br from-utility-400/15 to-special-500/10 border border-white/[0.08]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white/[0.12]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/70">Likeness</span>
                <span className="text-[9px] text-utility-300 font-mono">98%</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "98%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
                  className="h-full bg-gradient-to-r from-utility-400 to-utility-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/70">Expression</span>
                <span className="text-[9px] text-utility-300 font-mono">94%</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "94%" }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: 0.15,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="h-full bg-gradient-to-r from-utility-400 to-special-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

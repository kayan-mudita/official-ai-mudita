"use client";

import { motion } from "framer-motion";
import { Wand2, Film } from "lucide-react";
import GlowBlob from "@/components/marketing/GlowBlob";

/**
 * AI Video Studio mockup — format chip selector + multi-cut timeline with
 * 5 staggered clips and an animated playhead. Demonstrates real editing.
 */
export default function StudioMockup() {
  const formats = ["Market update", "Quick tip", "Story", "Testimonial", "Hook"];
  const cuts = [
    { label: "Hook", w: "w-14", grad: "from-special-500/40 to-special-500/10" },
    { label: "Cut 2", w: "w-20", grad: "from-special-500/30 to-utility-400/15" },
    { label: "B-roll", w: "w-12", grad: "from-utility-400/30 to-special-500/15" },
    { label: "Cut 4", w: "w-20", grad: "from-special-500/35 to-utility-400/15" },
    { label: "CTA", w: "w-14", grad: "from-utility-400/40 to-special-500/20" },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] p-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-special-500/[0.06] via-transparent to-special-500/[0.04]" />
      <GlowBlob color="special" size="lg" position="center" intensity={0.08} />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative h-full flex flex-col justify-center gap-6">
        {/* Format chip row */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-3 h-3 text-special-300" />
            <span className="text-[10px] font-mono font-semibold text-special-300/80 tracking-wider">
              FORMAT
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {formats.map((f, i) => (
              <div
                key={f}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-medium ${
                  i === 0
                    ? "bg-special-500/[0.12] border-special-500/40 text-special-200"
                    : "bg-white/[0.03] border-white/[0.08] text-white/70"
                }`}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Multi-cut timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Film className="w-3 h-3 text-special-300" />
              <span className="text-[10px] font-mono font-semibold text-special-300/80 tracking-wider">
                TIMELINE · 5 CUTS
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/70">
              00:00 — 00:48
            </span>
          </div>
          <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-end gap-1.5 mb-2">
              {cuts.map((cut, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.08,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                    style={{ transformOrigin: "bottom" }}
                    className={`${cut.w} h-16 rounded-md bg-gradient-to-b ${cut.grad} border border-white/[0.10] relative overflow-hidden`}
                  >
                    <div className="absolute top-1 left-1 text-[8px] font-mono text-white/60">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 h-0.5 rounded-full bg-white/15" />
                  </motion.div>
                  <span className="text-[8px] text-white/70 font-medium">
                    {cut.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "62%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.25, 0.4, 0.25, 1] }}
                className="h-full bg-gradient-to-r from-special-400 to-utility-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

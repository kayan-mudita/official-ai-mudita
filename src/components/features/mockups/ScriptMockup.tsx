"use client";

import { motion } from "framer-motion";
import { PenTool, Wand2, Sparkles } from "lucide-react";
import GlowBlob from "@/components/marketing/GlowBlob";

/**
 * Script Engine mockup — glass script-editor panel with HOOK / BODY / CTA
 * sections, an animated hook line being "written", and a 100+ hooks badge.
 */
export default function ScriptMockup() {
  return (
    <div className="relative w-full h-full min-h-[400px] p-8 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-special-500/[0.06] via-transparent to-special-500/[0.04]" />
      <GlowBlob color="special" size="lg" position="center" intensity={0.08} />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.10] backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PenTool className="w-3 h-3 text-special-300" />
              <span className="text-[10px] font-mono font-semibold text-special-300/80 tracking-wider">
                SCRIPT ENGINE
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-special-500/[0.12] border border-special-500/30">
              <Wand2 className="w-2.5 h-2.5 text-special-300" />
              <span className="text-[9px] font-medium text-special-200">
                100+ hooks
              </span>
            </div>
          </div>

          {/* Format chip row */}
          <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-white/[0.06]">
            {["Story", "Quick tip", "Hook", "Update"].map((f, i) => (
              <div
                key={f}
                className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${
                  i === 2
                    ? "bg-special-500/[0.14] border-special-500/40 text-special-200"
                    : "bg-white/[0.03] border-white/[0.08] text-white/70"
                }`}
              >
                {f}
              </div>
            ))}
          </div>

          {/* HOOK section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-semibold text-special-300 tracking-widest">
                HOOK
              </span>
              <Sparkles className="w-2.5 h-2.5 text-special-400/70" />
            </div>
            <div className="space-y-1.5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "92%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.25, 0.4, 0.25, 1] }}
                className="h-2 rounded-full bg-gradient-to-r from-special-500/50 to-special-500/15"
              />
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "78%" }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.2,
                  delay: 0.2,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                className="h-2 rounded-full bg-gradient-to-r from-special-500/40 to-special-500/10"
              />
            </div>
          </div>

          {/* BODY section */}
          <div className="mb-4">
            <span className="text-[9px] font-mono font-semibold text-white/70 tracking-widest mb-2 block">
              BODY
            </span>
            <div className="space-y-1.5">
              <div className="h-2 rounded-full bg-white/[0.06] w-full" />
              <div className="h-2 rounded-full bg-white/[0.06] w-11/12" />
              <div className="h-2 rounded-full bg-white/[0.06] w-4/5" />
              <div className="h-2 rounded-full bg-white/[0.06] w-3/4" />
            </div>
          </div>

          {/* CTA section */}
          <div className="pb-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-semibold text-utility-300 tracking-widest">
                CTA
              </span>
              <span className="text-[9px] font-mono text-white/70">
                01:48 runtime
              </span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "65%" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.1,
                delay: 0.5,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="h-2 rounded-full bg-gradient-to-r from-utility-400/50 to-utility-400/15"
            />
          </div>

          {/* Bottom action row */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-1.5">
            <div className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[9px] text-white/70 font-medium">
                + AI rewrite
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <span className="text-[9px] text-white/70 font-medium">
                Vary tone
              </span>
            </div>
            <div className="ml-auto px-2.5 py-0.5 rounded-full bg-special-500/[0.14] border border-special-500/30">
              <span className="text-[9px] text-special-200 font-semibold">
                Send to Studio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

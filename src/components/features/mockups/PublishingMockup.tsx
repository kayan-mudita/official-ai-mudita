"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Send,
  Play,
  Check,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Music2,
} from "lucide-react";
import GlowBlob from "@/components/marketing/GlowBlob";

/**
 * Auto-Posting mockup — left: 3-row approval queue with one approved + two
 * pending; right: 5-platform fan with check badges popping in.
 */
export default function PublishingMockup() {
  const platforms = [
    { name: "Instagram", icon: Instagram },
    { name: "TikTok", icon: Music2 },
    { name: "LinkedIn", icon: Linkedin },
    { name: "YouTube", icon: Youtube },
    { name: "Facebook", icon: Facebook },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] p-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-utility-400/[0.05] via-transparent to-special-500/[0.05]" />
      <GlowBlob color="mix" size="lg" position="center" intensity={0.07} />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative h-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Approval queue */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-3 h-3 text-utility-300" />
            <span className="text-[10px] font-mono font-semibold text-utility-300/80 tracking-wider">
              APPROVAL QUEUE
            </span>
          </div>
          <div className="space-y-2">
            {[
              { title: "March market update", state: "approved" },
              { title: "First-time buyer tip", state: "pending" },
              { title: "Listing tour — 142 Oak", state: "pending" },
            ].map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]"
              >
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-utility-400/30 via-black/30 to-special-500/30 border border-white/[0.10] flex items-center justify-center flex-shrink-0">
                  <Play className="w-3 h-3 text-white/70 ml-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-white/85 truncate">
                    {q.title}
                  </div>
                  <div className="text-[9px] text-white/70">5 platforms</div>
                </div>
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                    q.state === "approved"
                      ? "bg-positive-500/15 border-positive-500/35"
                      : "bg-white/[0.04] border-white/[0.10]"
                  }`}
                >
                  {q.state === "approved" ? (
                    <Check className="w-2.5 h-2.5 text-positive-400" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-white/35" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Platform fan */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-3 h-3 text-special-300" />
            <span className="text-[10px] font-mono font-semibold text-special-300/80 tracking-wider">
              PUBLISHED TO
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: 0.3 + i * 0.07,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className="relative aspect-square rounded-xl bg-white/[0.03] border border-white/[0.10] flex items-center justify-center group"
                >
                  <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-positive-500/80 border border-[#050508] flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" strokeWidth={3} />
                  </div>
                </motion.div>
              );
            })}
            <div className="aspect-square" />
          </div>
        </div>
      </div>
    </div>
  );
}

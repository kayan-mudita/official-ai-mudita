"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Hype loading screen shown between Voice Clone (Step 3) and Paywall (Step 4).
 * Cycles through exciting stages while the video pipeline runs in the background.
 * Auto-advances to onComplete when videoReady becomes true.
 */

interface VideoLoadingScreenProps {
  photoUrl: string | null;
  videoReady: boolean;
  onComplete: () => void;
  /** Real pipeline progress 0-100, if available */
  progress?: number;
}

const STAGES = [
  { main: "Cloning your voice...", sub: "Building a vocal model from 5 seconds of audio", icon: "voice" },
  { main: "Writing your first script...", sub: "AI is crafting your opening line right now", icon: "script" },
  { main: "Animating your face...", sub: "Your AI twin is learning your expressions", icon: "face" },
  { main: "Composing the scene...", sub: "Professional lighting, perfect framing", icon: "scene" },
  { main: "Syncing lips to voice...", sub: "Every word matched to your face", icon: "sync" },
  { main: "Adding finishing touches...", sub: "Color grading, transitions, captions", icon: "edit" },
  { main: "Running quality checks...", sub: "Making sure you look incredible", icon: "check" },
  { main: "Almost ready...", sub: "Your first video is about to drop", icon: "ready" },
];

const ICON_MAP: Record<string, string> = {
  voice: "\uD83C\uDFA4",
  script: "\u270D\uFE0F",
  face: "\uD83E\uDDEC",
  scene: "\uD83C\uDFAC",
  sync: "\uD83D\uDC44",
  edit: "\u2728",
  check: "\u2705",
  ready: "\uD83D\uDE80",
};

export default function VideoLoadingScreen({
  photoUrl,
  videoReady,
  onComplete,
  progress,
}: VideoLoadingScreenProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [showReady, setShowReady] = useState(false);

  // Cycle through stages every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // When video is ready, show celebration then advance
  useEffect(() => {
    if (videoReady) {
      setShowReady(true);
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [videoReady, onComplete]);

  const stage = STAGES[stageIndex];
  const displayProgress = progress ?? Math.min(95, (stageIndex / STAGES.length) * 90 + 5);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8 py-4">
      {/* Central animated orb with user photo */}
      <div className="relative w-32 h-32">
        {/* Outer pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full border border-indigo-500/20"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-violet-500/15"
          animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-500/10"
          animate={{ scale: [1, 2.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Inner glowing orb */}
        <motion.div
          className="absolute inset-4 rounded-full overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
            boxShadow: "0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(139,92,246,0.3)",
          }}
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(139,92,246,0.3)",
              "0 0 80px rgba(99,102,241,0.8), 0 0 150px rgba(139,92,246,0.4)",
              "0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(139,92,246,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* User photo ghosted inside orb */}
          {photoUrl && (
            <div className="absolute inset-0 opacity-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </motion.div>

        {/* Rotating stage icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#0a0a1a] border-2 border-indigo-500/30 flex items-center justify-center text-lg"
          >
            {ICON_MAP[stage.icon]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rotating stage text */}
      <div className="text-center space-y-2 min-h-[64px]">
        <AnimatePresence mode="wait">
          {showReady ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-1"
            >
              <p className="text-[20px] font-extrabold text-emerald-400">Your video is ready!</p>
              <p className="text-[13px] text-white/40">Loading your preview...</p>
            </motion.div>
          ) : (
            <motion.div
              key={stageIndex}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <p className="text-[18px] font-bold text-white">{stage.main}</p>
              <p className="text-[13px] text-white/35 font-medium">{stage.sub}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: showReady
                ? "linear-gradient(90deg, #10b981, #06b6d4)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
            }}
            animate={{ width: showReady ? "100%" : `${displayProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Stage dots */}
        <div className="flex items-center justify-center gap-1.5">
          {STAGES.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === stageIndex ? 16 : 4,
                height: 4,
                backgroundColor: i <= stageIndex ? "#6366f1" : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Fun fact / social proof while waiting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="text-center px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
      >
        <p className="text-[11px] text-white/20 italic">
          &ldquo;My first video got 12,000 views. I generated it in under 2 minutes.&rdquo;
        </p>
        <p className="text-[10px] text-white/10 mt-1">Sarah K. — Real Estate Agent</p>
      </motion.div>
    </div>
  );
}

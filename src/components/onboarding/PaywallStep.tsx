"use client";

import { useState, useEffect, useRef } from "react";
import { Play, ArrowRight, Loader2, Zap, Star, TrendingUp, Clock, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  { icon: "🎭", text: "AI digital twin from 1 photo" },
  { icon: "🎙️", text: "Voice cloned in seconds" },
  { icon: "📱", text: "Auto-posts to every platform" },
  { icon: "📅", text: "Content calendar fills itself" },
  { icon: "📊", text: "Analytics that tell you what works" },
  { icon: "♾️", text: "30 videos/month, every month" },
];

const SOCIAL_PROOF = [
  { name: "Sarah K.", role: "Real estate agent", quote: "First video got 12k views. I was floored.", avatar: "SK" },
  { name: "Marcus T.", role: "Attorney", quote: "My competitors have no idea how I'm doing this.", avatar: "MT" },
];

interface PaywallStepProps {
  videoUrl?: string;
  videoGenerating?: boolean;
  demoMode?: boolean;
}

function trackEvent(event: string) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }).catch(() => {});
}

export default function PaywallStep({ videoUrl, videoGenerating, demoMode }: PaywallStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { trackEvent("onboarding_paywall_viewed"); }, []);

  const handleSubscribe = async () => {
    if (demoMode) {
      trackEvent("demo_signup_clicked");
      window.location.href = "/auth/signup";
      return;
    }
    trackEvent("onboarding_trial_started");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "starter" }),
      });
      if (res.status === 401) { window.location.href = "/auth/signup"; return; }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/dashboard/welcome";
      }
    } catch {
      setError("Something went wrong — please try again");
      setLoading(false);
    }
  };

  const skipToDashboard = async () => {
    trackEvent("onboarding_skipped");
    setLoading(true);
    try {
      const stored = localStorage.getItem("officialai_onboarding_progress");
      if (stored) {
        const progress = JSON.parse(stored);
        await fetch("/api/onboarding/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoUrl: progress.photoUrl || undefined,
            characterSheetId: progress.characterSheetId || undefined,
            voiceId: progress.voiceId || undefined,
            step: progress.step || "paywall",
          }),
        });
      }
    } catch {}
    window.location.href = "/dashboard/welcome";
  };

  const hasVideo = !!videoUrl;

  return (
    <div className="w-full max-w-sm mx-auto space-y-5">

      {/* Hero section — video OR compelling visual */}
      {hasVideo ? (
        /* Video is ready — show it playing */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden aspect-[9/16] max-h-[360px] bg-black/40 border border-white/[0.08]"
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            playsInline
            muted
            autoPlay
            loop
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#060610] to-transparent" />
          {/* "Your AI twin" badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-300">This is you</span>
          </motion.div>
        </motion.div>
      ) : (
        /* No video yet — show exciting "ready" state instead of boring spinner */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/10 via-[#0a0a1a] to-violet-500/10 border border-indigo-500/20 p-6"
        >
          <div className="text-center space-y-4">
            {/* Animated icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600"
              style={{ boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>

            <div>
              <p className="text-[18px] font-extrabold text-white">Your AI twin is ready</p>
              <p className="text-[13px] text-white/70 mt-1">
                {videoGenerating ? "Preview video generating in background..." : "Start your free trial to see it in action"}
              </p>
            </div>

            {/* What's been created */}
            <div className="flex items-center justify-center gap-4">
              {[
                { label: "Face", done: true },
                { label: "Voice", done: true },
                { label: "AI Twin", done: true },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span className="text-[11px] text-white/70 font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Pricing card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden"
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none z-10"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(99,102,241,0.3)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-[#060610] to-violet-500/6" />

        <div className="relative p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/25">
                  <Zap className="w-3 h-3 text-indigo-300" />
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">7 days free</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[36px] font-black text-white leading-none">$79</span>
                <span className="text-[13px] text-white/70 font-medium">/mo after</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-white/60">4.9 · 200+ users</span>
            </div>
          </div>

          {/* Features — compact 2-column */}
          <div className="grid grid-cols-2 gap-1.5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="flex items-center gap-2"
              >
                <span className="text-[13px]">{f.icon}</span>
                <span className="text-[11px] text-white/70 font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* ROI callout */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-[11px] text-emerald-300/80 font-medium">
              One closed deal pays for <span className="font-bold text-emerald-300">years</span> of Official AI
            </p>
          </div>
        </div>
      </motion.div>

      {/* Social proof — single row */}
      <div className="flex gap-2">
        {SOCIAL_PROOF.map((sp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex-1 rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 space-y-1.5"
          >
            <p className="text-[11px] text-white/70 leading-relaxed italic">&ldquo;{sp.quote}&rdquo;</p>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">{sp.avatar}</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/70">{sp.name}</p>
                <p className="text-[9px] text-white/70">{sp.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2.5"
      >
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12px] text-red-400/80 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSubscribe}
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-black text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)",
            boxShadow: "0 0 30px rgba(99,102,241,0.4), 0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {!loading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
            />
          )}
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{demoMode ? "Create your account" : "Start free trial"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <Clock className="w-3 h-3 text-white/70" />
          <p className="text-[11px] text-white/60">Free for 7 days. No charge today. Cancel anytime.</p>
        </div>

        <button
          onClick={skipToDashboard}
          disabled={loading}
          className="w-full py-2 text-[11px] text-white/70 hover:text-white/70 transition-colors"
        >
          Skip for now
        </button>
      </motion.div>
    </div>
  );
}

"use client";

/**
 * UnifiedOnboarding — Single component for the pre-payment onboarding flow.
 *
 * Replaces TWO duplicate pages:
 *   /auth/onboarding → UnifiedOnboarding
 *   /demo            → UnifiedOnboarding demoMode={true}
 *
 * Flow:
 *   Step 1: Photo capture (camera-first, HEIC support, quality gate)
 *   Step 2: Character sheet (multi-select poses, extra photo uploads)
 *   Step 3: Voice clone (2-30s, noise suppression, auto-stop)
 *   Step 3.5: Video hype loading screen (full-screen takeover)
 *   Step 4: Paywall (video plays or "AI twin ready" card)
 *
 * After Stripe success → redirects to /dashboard/welcome?checkout=success
 * which handles the post-payment strategy flow (intake → research → calendar → social → dashboard).
 *
 * Props:
 *   demoMode: boolean — changes paywall CTA from "Start trial" to "Create account"
 */

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

import CameraCapture from "./CameraCapture";
import CharacterSheetReveal from "./CharacterSheetReveal";
import VoiceCapture from "./VoiceCapture";
import VideoLoadingScreen from "./VideoLoadingScreen";
import PaywallStep from "./PaywallStep";

type Step = "photo" | "character" | "voice" | "video_loading" | "paywall";

const STEP_CONFIG: { key: Step; label: string; emoji: string }[] = [
  { key: "photo", label: "Your photo", emoji: "\uD83D\uDCF8" },
  { key: "character", label: "AI twin", emoji: "\uD83E\uDD16" },
  { key: "voice", label: "Your voice", emoji: "\uD83C\uDF99\uFE0F" },
  { key: "paywall", label: "Go live", emoji: "\uD83D\uDE80" },
];

const STEP_HEADINGS: Record<Step, { heading: string; sub: string }> = {
  photo: { heading: "Let's see that face.", sub: "One photo. That's all it takes." },
  character: { heading: "Building your AI twin...", sub: "Give us a few seconds. You're going to love this." },
  voice: { heading: "Now let's hear you.", sub: "A few seconds is all we need to clone your voice." },
  video_loading: { heading: "Creating your first video...", sub: "Your face. Your voice. Almost ready." },
  paywall: { heading: "Your AI twin is alive.", sub: "Start posting daily. Zero effort." },
};

// Steps that hide the header for full-screen takeover
const FULLSCREEN_STEPS: Step[] = ["video_loading"];

interface UnifiedOnboardingProps {
  demoMode?: boolean;
}

function trackEvent(event: string, metadata?: Record<string, unknown>) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, metadata }),
  }).catch(() => {});
}

export default function UnifiedOnboarding({ demoMode = false }: UnifiedOnboardingProps) {
  const [step, setStep] = useState<Step>("photo");
  const [uploading, setUploading] = useState(false);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [characterSheetId, setCharacterSheetId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);

  const isFullscreen = FULLSCREEN_STEPS.includes(step);
  const { heading, sub } = STEP_HEADINGS[step];

  // Track step transitions
  useEffect(() => { trackEvent(`onboarding_step_${step}`); }, [step]);

  // Save progress to localStorage for recovery
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officialai_onboarding_progress", JSON.stringify({
        photoUrl, characterSheetId, voiceId, step,
        savedAt: new Date().toISOString(),
      }));
    }
  }, [photoUrl, characterSheetId, voiceId, step]);

  // ── Photo Capture ─────────────────────────────────────────

  const handlePhotoCapture = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "photo");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      let uploadedUrl: string;
      if (uploadRes.ok) {
        uploadedUrl = (await uploadRes.json()).url;
      } else {
        uploadedUrl = `/uploads/photos/${Date.now()}-${file.name}`;
      }

      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, url: uploadedUrl, isPrimary: true }),
      });

      trackEvent("onboarding_photo_captured");
      setPhotoUrl(uploadedUrl);
      setStep("character");
    } catch {
      setStep("character");
    } finally {
      setUploading(false);
    }
  }, []);

  // ── Character Sheet ───────────────────────────────────────

  const handleSheetSelect = useCallback((poseUrl: string, sheetId: string) => {
    trackEvent("onboarding_character_selected");
    setCharacterSheetId(sheetId);
    setStep("voice");
  }, []);

  // ── Preview Video ─────────────────────────────────────────

  const generatePreviewVideo = useCallback(async () => {
    setVideoGenerating(true);
    try {
      const res = await fetch("/api/onboarding/preview-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) { setVideoGenerating(false); return; }
      const data = await res.json();

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setVideoGenerating(false);
        return;
      }

      // Poll for completion
      if (data.videoId) {
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const statusRes = await fetch(`/api/onboarding/preview-video/status?videoId=${data.videoId}`);
            if (!statusRes.ok) continue;
            const statusData = await statusRes.json();
            if (statusData.status === "completed" && statusData.videoUrl) {
              setVideoUrl(statusData.videoUrl);
              setVideoGenerating(false);
              return;
            }
            if (statusData.status === "failed") { setVideoGenerating(false); return; }
          } catch {}
        }
      }
    } catch {}
    setVideoGenerating(false);
  }, []);

  // ── Voice Capture ─────────────────────────────────────────

  const handleVoiceCapture = useCallback(async (audioBlob: Blob) => {
    setVoiceUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);
      const res = await fetch("/api/onboarding/voice", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setVoiceId(data.voiceId || null);
        trackEvent("onboarding_voice_cloned");
      }
    } catch {}
    setVoiceUploading(false);
    generatePreviewVideo();
    setStep("video_loading");
  }, [generatePreviewVideo]);

  const handleSkipVoice = useCallback(() => {
    trackEvent("onboarding_voice_skipped");
    generatePreviewVideo();
    setStep("video_loading");
  }, [generatePreviewVideo]);

  // ── Step Bar ──────────────────────────────────────────────

  const StepBar = () => {
    const idx = STEP_CONFIG.findIndex((s) => s.key === step);
    return (
      <div className="flex items-center gap-1.5">
        {STEP_CONFIG.map((s, i) => {
          const done = i < idx;
          const active = i === idx || (step === "video_loading" && s.key === "paywall");
          return (
            <div key={s.key} className="flex items-center gap-1.5">
              {i > 0 && (
                <motion.div className="w-6 h-px" animate={{ backgroundColor: done ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)" }} transition={{ duration: 0.5 }} />
              )}
              <motion.div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all"
                animate={{
                  backgroundColor: active ? "rgba(99,102,241,0.15)" : done ? "rgba(99,102,241,0.06)" : "transparent",
                  borderColor: active ? "rgba(99,102,241,0.35)" : done ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                }}
                style={{ border: "1px solid" }}>
                {done ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </motion.div>
                ) : (
                  <span>{s.emoji}</span>
                )}
                <span className={active ? "text-indigo-300" : done ? "text-white/70" : "text-white/70"}>{s.label}</span>
              </motion.div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-[#060610] flex flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <motion.div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(79,110,247,0.12) 0%, transparent 70%)" }}
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }} />
      </div>

      {/* Header */}
      <div className={`relative z-10 flex items-center justify-between px-6 py-5 transition-opacity ${isFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-[12px]">{"\u2726"}</span>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Official AI</span>
          {demoMode && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-[10px] font-bold text-indigo-300 uppercase tracking-wide">Demo</span>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
          <StepBar />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16 pt-2">
        <div className="w-full max-w-sm">

          {/* Heading — hidden during fullscreen steps */}
          {!isFullscreen && (
            <AnimatePresence mode="wait">
              <motion.div key={step + "-h"} initial={{ opacity: 0, y: 16, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(4px)" }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-8">
                <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">{heading}</h1>
                <p className="text-[14px] text-white/70 mt-2 font-medium">{sub}</p>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === "photo" && (
              <motion.div key="photo" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <CameraCapture onCapture={handlePhotoCapture} uploading={uploading} />
              </motion.div>
            )}

            {step === "character" && photoUrl && (
              <motion.div key="character" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <CharacterSheetReveal photoUrl={photoUrl} industry="business" onSelect={handleSheetSelect} />
              </motion.div>
            )}

            {step === "voice" && (
              <motion.div key="voice" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="space-y-3">
                <VoiceCapture onCapture={handleVoiceCapture} uploading={voiceUploading} />
                <button onClick={handleSkipVoice} className="w-full py-2 text-[12px] text-white/70 hover:text-white/70 transition-colors">
                  Skip for now — you can add your voice later
                </button>
              </motion.div>
            )}

            {step === "video_loading" && (
              <motion.div key="video_loading" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <VideoLoadingScreen photoUrl={photoUrl} videoReady={!!videoUrl} onComplete={() => setStep("paywall")} />
              </motion.div>
            )}

            {step === "paywall" && (
              <motion.div key="paywall" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <PaywallStep videoUrl={videoUrl ?? undefined} videoGenerating={videoGenerating} demoMode={demoMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import SessionProvider from "@/components/SessionProvider";
import CameraCapture from "@/components/onboarding/CameraCapture";
import CharacterSheetReveal from "@/components/onboarding/CharacterSheetReveal";
import VoiceCapture from "@/components/onboarding/VoiceCapture";
import PaywallStep from "@/components/onboarding/PaywallStep";

type Step = "photo" | "character" | "voice" | "paywall";

const STEP_CONFIG: { key: Step; label: string; emoji: string }[] = [
  { key: "photo", label: "Your photo", emoji: "\uD83D\uDCF8" },
  { key: "character", label: "AI twin", emoji: "\uD83E\uDD16" },
  { key: "voice", label: "Your voice", emoji: "\uD83C\uDF99\uFE0F" },
  { key: "paywall", label: "Go live", emoji: "\uD83D\uDE80" },
];

// -- Ambient background orbs --
function AmbientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(79,110,247,0.12) 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
    </div>
  );
}

// -- Step bar --
function StepBar({ current }: { current: Step }) {
  const idx = STEP_CONFIG.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1.5">
      {STEP_CONFIG.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            {i > 0 && (
              <motion.div
                className="w-6 h-px"
                animate={{ backgroundColor: done ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)" }}
                transition={{ duration: 0.5 }}
              />
            )}
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all"
              animate={{
                backgroundColor: active
                  ? "rgba(99,102,241,0.15)"
                  : done
                    ? "rgba(99,102,241,0.06)"
                    : "transparent",
                borderColor: active
                  ? "rgba(99,102,241,0.35)"
                  : done
                    ? "rgba(99,102,241,0.2)"
                    : "rgba(255,255,255,0.06)",
              }}
              style={{ border: "1px solid" }}
            >
              {done ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center"
                >
                  <Check className="w-2 h-2 text-white" />
                </motion.div>
              ) : (
                <span>{s.emoji}</span>
              )}
              <span className={active ? "text-indigo-300" : done ? "text-white/40" : "text-white/15"}>
                {s.label}
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// -- Step headlines --
const STEP_CONTENT: Record<Step, { heading: string; sub: string }> = {
  photo: {
    heading: "Let's see that face.",
    sub: "One photo. That's all it takes.",
  },
  character: {
    heading: "Building your AI twin...",
    sub: "Give us a few seconds. You're going to love this.",
  },
  voice: {
    heading: "Now let's hear you.",
    sub: "5 seconds is all we need to clone your voice.",
  },
  paywall: {
    heading: "Your AI twin is alive.",
    sub: "Start posting daily. Zero effort.",
  },
};

function trackEvent(event: string, metadata?: Record<string, unknown>) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, metadata }),
  }).catch(() => {});
}

const ONBOARDING_STORAGE_KEY = "officialai_onboarding_progress";

function OnboardingFlow() {
  const [step, setStep] = useState<Step>("photo");
  const [uploading, setUploading] = useState(false);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [characterSheetId, setCharacterSheetId] = useState<string | null>(null);
  const [characterSheetUrl, setCharacterSheetUrl] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Track step transitions
  useEffect(() => {
    trackEvent(`onboarding_step_${step}`);
  }, [step]);

  // Persist onboarding progress to localStorage on every step/state change
  useEffect(() => {
    const progress = {
      photoUrl,
      characterSheetId,
      voiceId,
      step,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // localStorage not available — ignore
    }
  }, [step, photoUrl, characterSheetId, voiceId]);

  const handlePhotoCapture = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "photo");

      let uploadedUrl: string;
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
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
      // Still advance so user isn't stuck
      setStep("character");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSheetSelect = useCallback((poseUrl: string, sheetId: string, _selectedPose?: number) => {
    trackEvent("onboarding_character_selected");
    setCharacterSheetUrl(poseUrl);
    setCharacterSheetId(sheetId);
    setStep("voice");
  }, []);

  // Poll the status endpoint until video completes or fails
  const pollVideoStatus = useCallback(async (vid: string) => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let attempt = 0; attempt < 60; attempt++) {
      await wait(5000);
      try {
        const res = await fetch(`/api/onboarding/preview-video/status?videoId=${vid}`);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.status === "completed" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setVideoGenerating(false);
          return;
        }
        if (data.status === "failed") {
          setVideoGenerating(false);
          return;
        }
      } catch {
        // Network error — keep trying
      }
    }
    // Timed out
    setVideoGenerating(false);
  }, []);

  // Kick off preview video generation in the background (non-blocking)
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

      // If FAL returned synchronously (unlikely but possible)
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setVideoGenerating(false);
        return;
      }

      // Start polling for completion
      if (data.videoId) {
        setVideoId(data.videoId);
        pollVideoStatus(data.videoId);
      }
    } catch {
      // Non-blocking — paywall still works without the video
      setVideoGenerating(false);
    }
  }, [pollVideoStatus]);

  const handleVoiceCapture = useCallback(async (audioBlob: Blob) => {
    setVoiceUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

      const res = await fetch("/api/onboarding/voice", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.voiceId) {
          setVoiceId(data.voiceId);
        }
        trackEvent("onboarding_voice_cloned");
      }
    } catch {
      // Non-blocking: voice clone can be retried later
    } finally {
      setVoiceUploading(false);
      setStep("paywall");
      generatePreviewVideo();
    }
  }, [generatePreviewVideo]);

  const handleSkipVoice = useCallback(() => {
    trackEvent("onboarding_voice_skipped");
    setStep("paywall");
    generatePreviewVideo();
  }, [generatePreviewVideo]);

  const { heading, sub } = STEP_CONTENT[step];

  return (
    <div className="relative min-h-screen bg-[#060610] flex flex-col overflow-hidden">
      <AmbientBg />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-[12px]">{"\u2726"}</span>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Official AI</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <StepBar current={step} />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16 pt-2">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step + "-h"}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-8"
            >
              <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">
                {heading}
              </h1>
              <p className="text-[14px] text-white/40 mt-2 font-medium">{sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Step content */}
          <AnimatePresence mode="wait">

            {step === "photo" && (
              <motion.div
                key="photo"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <CameraCapture
                  onCapture={handlePhotoCapture}
                  uploading={uploading}
                />
              </motion.div>
            )}

            {step === "character" && photoUrl && (
              <motion.div
                key="character"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <CharacterSheetReveal
                  photoUrl={photoUrl}
                  industry="business"
                  onSelect={handleSheetSelect}
                />
              </motion.div>
            )}

            {step === "voice" && (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <VoiceCapture
                  onCapture={handleVoiceCapture}
                  uploading={voiceUploading}
                />
                <button
                  onClick={handleSkipVoice}
                  className="w-full py-2 text-[12px] text-white/15 hover:text-white/30 transition-colors"
                >
                  Skip for now — you can add your voice later
                </button>
              </motion.div>
            )}

            {step === "paywall" && (
              <motion.div
                key="paywall"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <PaywallStep videoUrl={videoUrl ?? undefined} videoGenerating={videoGenerating} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <OnboardingFlow />
    </SessionProvider>
  );
}

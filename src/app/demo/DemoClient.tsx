"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  Camera,
  Sparkles,
  Film,
  Check,
  ArrowRight,
  Play,
  Lock,
  Image as ImageIcon,
} from "lucide-react";
import FadeIn from "@/components/motion/FadeIn";

type DemoStage = "upload" | "processing" | "done";

const processingSteps = [
  { icon: Camera, label: "Analyzing your photo", duration: 1800 },
  { icon: Sparkles, label: "Building your AI character", duration: 2200 },
  { icon: Film, label: "Generating your video", duration: 2500 },
  { icon: Check, label: "Adding finishing touches", duration: 1200 },
];

export default function DemoClient() {
  const [stage, setStage] = useState<DemoStage>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState("");

  const simulateProcessing = useCallback(() => {
    setStage("processing");
    setCurrentStep(0);

    let step = 0;
    const advanceStep = () => {
      step++;
      if (step < processingSteps.length) {
        setCurrentStep(step);
        setTimeout(advanceStep, processingSteps[step].duration);
      } else {
        setTimeout(() => setStage("done"), 800);
      }
    };
    setTimeout(advanceStep, processingSteps[0].duration);
  }, []);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      setFileName(file.name);
      simulateProcessing();
    },
    [simulateProcessing],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile],
  );

  return (
    <div className="min-h-screen bg-[#050508] overflow-x-hidden">
      {/* Minimal header — no login required */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-transparent">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-tight text-white"
          >
            Official <span className="text-blue-400">AI</span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-violet-500/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-lg mx-auto">
          {/* ────── UPLOAD STAGE ────── */}
          {stage === "upload" && (
            <FadeIn duration={0.6}>
              <div className="text-center mb-10">
                <h1 className="text-[36px] sm:text-[46px] font-bold tracking-[-0.03em] leading-[1.08] text-white mb-4">
                  See yourself
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                    in 30 seconds
                  </span>
                </h1>
                <p className="text-[16px] text-white/35 font-light">
                  Upload one photo. No signup required.
                </p>
              </div>

              {/* Drop zone */}
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-blue-400/50 bg-blue-500/[0.05]"
                    : "border-white/[0.08] bg-white/[0.015] hover:border-white/[0.15] hover:bg-white/[0.025]"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("demo-file-input")?.click()
                }
              >
                <input
                  id="demo-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />

                <div className="flex flex-col items-center justify-center py-20 px-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
                    {dragActive ? (
                      <Upload className="w-7 h-7 text-blue-400/70" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-white/30" />
                    )}
                  </div>

                  <p className="text-[16px] text-white/60 font-medium mb-2">
                    {dragActive
                      ? "Drop your photo here"
                      : "Drag and drop your photo"}
                  </p>
                  <p className="text-[13px] text-white/25 mb-6">
                    or click to browse
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <Upload className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[13px] text-white/40 font-medium">
                      Choose a photo
                    </span>
                  </div>

                  <p className="text-[11px] text-white/15 mt-6">
                    JPG, PNG, or WEBP. Max 10MB.
                  </p>
                </div>
              </div>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                  <Lock className="w-3 h-3" />
                  Deleted after demo
                </div>
                <div className="w-px h-3 bg-white/[0.06]" />
                <div className="text-[11px] text-white/20">
                  No account needed
                </div>
              </div>
            </FadeIn>
          )}

          {/* ────── PROCESSING STAGE ────── */}
          {stage === "processing" && (
            <FadeIn duration={0.5}>
              <div className="text-center mb-10">
                <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-white mb-3">
                  Creating your video
                </h2>
                <p className="text-[14px] text-white/30">
                  {fileName && (
                    <span className="text-white/40">{fileName}</span>
                  )}
                </p>
              </div>

              {/* Progress steps */}
              <div className="space-y-3 mb-10">
                {processingSteps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                        isActive
                          ? "border-blue-500/20 bg-blue-500/[0.04]"
                          : isDone
                          ? "border-white/[0.06] bg-white/[0.015]"
                          : "border-white/[0.04] bg-transparent"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isActive
                            ? "bg-blue-500/15 border border-blue-500/25"
                            : isDone
                            ? "bg-emerald-500/10 border border-emerald-500/20"
                            : "bg-white/[0.03] border border-white/[0.06]"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <step.icon
                            className={`w-3.5 h-3.5 ${
                              isActive
                                ? "text-blue-400 animate-pulse"
                                : "text-white/20"
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[14px] font-medium transition-colors duration-500 ${
                          isActive
                            ? "text-white/80"
                            : isDone
                            ? "text-white/40"
                            : "text-white/20"
                        }`}
                      >
                        {step.label}
                        {isActive && (
                          <span className="text-blue-400/60 ml-1.5">...</span>
                        )}
                        {isDone && (
                          <span className="text-emerald-400/60 ml-1.5">
                            Done
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Overall progress bar */}
              <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 transition-all duration-1000 ease-out"
                  style={{
                    width: `${
                      ((currentStep + 1) / processingSteps.length) * 100
                    }%`,
                  }}
                />
              </div>
            </FadeIn>
          )}

          {/* ────── DONE STAGE ────── */}
          {stage === "done" && (
            <FadeIn duration={0.6}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-[12px] text-emerald-400/80 font-medium">
                    Video ready
                  </span>
                </div>
                <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-white mb-2">
                  Your video is ready
                </h2>
                <p className="text-[14px] text-white/30">
                  Here is what AI created from your photo.
                </p>
              </div>

              {/* Video result with frosted overlay */}
              <div className="relative max-w-xs mx-auto mb-10">
                {/* 9:16 video frame */}
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01]">
                  {/* Simulated video content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-[#0a0e17] to-violet-900/20" />

                  {/* Subtle grid overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />

                  {/* Play button center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-150 animate-pulse-slow" />
                      <div className="relative w-14 h-14 rounded-full bg-white/[0.1] border border-white/[0.15] flex items-center justify-center">
                        <Play className="w-5 h-5 text-white/90 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Frosted overlay */}
                  <div className="absolute inset-0 bg-[#050508]/40 backdrop-blur-[6px]" />

                  {/* Overlay CTA content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                    <Lock className="w-6 h-6 text-white/40 mb-4" />
                    <p className="text-[15px] text-white/70 font-medium text-center mb-2">
                      Love it?
                    </p>
                    <p className="text-[13px] text-white/35 text-center mb-6">
                      Sign up to download and share your AI video.
                    </p>
                    <Link
                      href="/auth/signup"
                      className="btn-cta-glow inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 active:bg-white/80 transition-all"
                    >
                      Sign up to download
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setStage("upload");
                    setFileName("");
                    setCurrentStep(0);
                  }}
                  className="text-[13px] text-blue-400/70 hover:text-blue-400 transition-colors"
                >
                  Try another photo &rarr;
                </button>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
    </div>
  );
}

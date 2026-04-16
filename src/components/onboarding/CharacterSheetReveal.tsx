"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, RefreshCw, Plus, Camera, ImagePlus, Shield, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CharacterSheetRevealProps {
  photoUrl: string;
  industry: string;
  onSelect: (poseUrl: string, sheetId: string, selectedPose?: number) => void;
  /** Pre-fetched composite URL from background generation */
  preloadedCompositeUrl?: string | null;
  /** Pre-fetched sheet ID from background generation */
  preloadedSheetId?: string | null;
  /** External signal that generation is already in progress */
  isGenerating?: boolean;
}

const LOADING_STAGES = [
  { copy: "Scanning your face... 👁️", sub: "Mapping 68 facial landmarks" },
  { copy: "Generating your twin... 🧬", sub: "Building from the ground up" },
  { copy: "Styling your looks... ✨", sub: "9 professional poses incoming" },
  { copy: "Adding the magic... 🔮", sub: "This one always gets people" },
  { copy: "Almost there... 🎯", sub: "Worth the wait, we promise" },
];

type RevealState = "loading" | "reveal" | "error";

// ── Confetti burst ────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  shape: "rect" | "circle" | "star";
}

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ec4899","#ffffff"];

function ConfettiBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const burst: Particle[] = Array.from({ length: 60 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5;
      const speed = 80 + Math.random() * 120;
      return {
        id: i,
        x: 50,
        y: 40,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        rotation: Math.random() * 360,
        shape: (["rect","circle","star"] as const)[Math.floor(Math.random() * 3)],
      };
    });
    setParticles(burst);
    const t = setTimeout(() => setParticles([]), 2200);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.shape === "circle" ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "star" ? "2px" : "1px",
            transform: `rotate(${p.rotation}deg)`,
          }}
          animate={{
            x: p.vx,
            y: p.vy + 200,
            opacity: [1, 1, 0],
            rotate: p.rotation + (Math.random() > 0.5 ? 360 : -360),
          }}
          transition={{ duration: 1.8 + Math.random() * 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      ))}
    </div>
  );
}

export default function CharacterSheetReveal({
  photoUrl,
  industry,
  onSelect,
  preloadedCompositeUrl,
  preloadedSheetId,
  isGenerating,
}: CharacterSheetRevealProps) {
  const [state, setState] = useState<RevealState>("loading");
  const [stageIndex, setStageIndex] = useState(0);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [selectedPoses, setSelectedPoses] = useState<Set<number>>(new Set());
  // Backwards compat: first selected pose is the "primary"
  const selectedPose = selectedPoses.size > 0 ? Array.from(selectedPoses)[0] : null;
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const [extraSheetGenerating, setExtraSheetGenerating] = useState(false);
  const [extraSheetUrl, setExtraSheetUrl] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const hasFetched = useRef(false);
  const elapsed = useRef(0);

  // Progress through loading stages
  useEffect(() => {
    if (state !== "loading") return;
    const interval = setInterval(() => {
      elapsed.current += 1;
      setStageIndex((i) => Math.min(i + 1, LOADING_STAGES.length - 1));
    }, 1600);
    return () => clearInterval(interval);
  }, [state]);

  const generate = useCallback(async () => {
    hasFetched.current = true;
    setState("loading");
    setErrorMsg(null);
    setStageIndex(0);
    elapsed.current = 0;
    setImageLoaded(false);

    try {
      const res = await fetch("/api/character-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls: [photoUrl], industry }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      const url = data.poses?.compositeUrl;
      const id = data.poses?.id;
      if (!url) throw new Error("No character sheet generated");

      setCompositeUrl(url);
      setSheetId(id || null);
      setState("reveal");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setState("error");
    } finally {
      setRetrying(false);
    }
  }, [photoUrl, industry]);

  // If preloaded data is provided, skip fetch and go straight to reveal
  useEffect(() => {
    if (preloadedCompositeUrl) {
      setCompositeUrl(preloadedCompositeUrl);
      setSheetId(preloadedSheetId || null);
      setState("reveal");
      hasFetched.current = true;
    }
  }, [preloadedCompositeUrl, preloadedSheetId]);

  // If external generation is signaled but no URL yet, stay in loading
  useEffect(() => {
    if (isGenerating && !preloadedCompositeUrl) {
      setState("loading");
      hasFetched.current = true;
    }
  }, [isGenerating, preloadedCompositeUrl]);

  useEffect(() => {
    if (!hasFetched.current && !preloadedCompositeUrl && !isGenerating) generate();
  }, [generate, preloadedCompositeUrl, isGenerating]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setTimeout(() => setConfetti(true), 400);
  };

  const handlePoseSelect = (index: number) => {
    setSelectedPoses((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!compositeUrl || selectedPose === null) return;

    // Save pose selection to backend
    if (sheetId) {
      try {
        await fetch("/api/character-sheet", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sheetId, selectedPose }),
        });
      } catch {
        // Non-blocking — don't prevent onboarding progress
      }
    }

    onSelect(compositeUrl, sheetId || "", selectedPose);
  };

  const handleRetry = () => {
    setRetrying(true);
    hasFetched.current = false;
    setSelectedPoses(new Set());
    setCompositeUrl(null);
    setConfetti(false);
    generate();
  };

  const currentStage = LOADING_STAGES[stageIndex];

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Loading ── */}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-7 py-6"
          >
            {/* Central orb */}
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute inset-0 rounded-full border border-indigo-500/20"
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-violet-500/20"
                animate={{ scale: [1, 2.0, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                  boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(139,92,246,0.3)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(139,92,246,0.3)",
                    "0 0 60px rgba(99,102,241,0.7), 0 0 100px rgba(139,92,246,0.4)",
                    "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(139,92,246,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {photoUrl && (
                <div className="absolute inset-4 rounded-full overflow-hidden opacity-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Animated stage copy */}
            <div className="text-center space-y-1.5 h-12">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stageIndex}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.45 }}
                  className="text-[17px] font-bold text-white"
                >
                  {currentStage.copy}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stageIndex + "sub"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-[13px] text-white/70"
                >
                  {currentStage.sub}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)" }}
                animate={{
                  width: [`${(stageIndex / (LOADING_STAGES.length - 1)) * 85}%`, `${((stageIndex + 0.9) / (LOADING_STAGES.length - 1)) * 85}%`],
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>

            {/* Floating dots */}
            <div className="flex items-center gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === stageIndex ? 20 : 6,
                    height: 6,
                    backgroundColor: i <= stageIndex ? "#6366f1" : "rgba(255,255,255,0.1)",
                  }}
                  animate={{ width: i === stageIndex ? 20 : 6 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Reveal with pose selection grid ── */}
        {state === "reveal" && compositeUrl && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-[26px] font-extrabold text-white tracking-tight"
              >
                Pick your best look
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[13px] text-white/70 mt-1.5 font-medium"
              >
                9 poses. Tap the one that looks most like you.
              </motion.p>
            </motion.div>

            {/* Character sheet with 3x3 selection grid overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, type: "spring", stiffness: 120, damping: 16 }}
              className="relative"
            >
              {/* Glow behind the image */}
              <div className="absolute -inset-4 rounded-3xl opacity-60"
                style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)" }}
              />

              <div className="relative rounded-2xl overflow-hidden border-2 border-white/[0.08]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={compositeUrl}
                  alt="Your AI character sheet"
                  className={`w-full h-auto transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={handleImageLoad}
                />

                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                    <motion.div
                      className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}

                {/* Confetti burst */}
                <ConfettiBurst active={confetti} />

                {/* 3x3 clickable pose selection grid */}
                {imageLoaded && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => {
                      const isSelected = selectedPoses.has(i);
                      return (
                        <button
                          key={i}
                          onClick={() => handlePoseSelect(i)}
                          className={`group relative transition-all duration-200 border-0 outline-none focus:outline-none focus-visible:outline-none ${
                            isSelected
                              ? "ring-2 ring-inset ring-indigo-400 bg-indigo-500/10"
                              : "hover:bg-white/[0.06]"
                          }`}
                        >
                          {/* Selection checkmark */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.6)] z-10"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* View / preview icon (bottom-right, hover-revealed) */}
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Preview pose ${i + 1}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setLightboxIndex(i);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                e.preventDefault();
                                setLightboxIndex(i);
                              }
                            }}
                            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/90 hover:text-white hover:bg-black/80 ring-1 ring-white/20 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-opacity z-10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            <Eye className="w-4 h-4" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Add more photos to improve AI twin */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-white/70">Improve your AI twin</p>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-emerald-400/60" />
                  <span className="text-[10px] text-emerald-400/60 font-medium">
                    {extraPhotos.length === 0 ? "Basic" : extraPhotos.length < 3 ? "Good" : "Excellent"} reference
                  </span>
                </div>
              </div>

              {/* Reference strength bar */}
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i <= extraPhotos.length
                        ? "bg-emerald-500/60"
                        : "bg-white/[0.06]"
                    }`}
                  />
                ))}
              </div>

              {/* Upload more photos */}
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.10] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] text-[11px] font-medium text-white/70 hover:text-white/70 cursor-pointer transition-all">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Add photos for better results
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      for (const file of files.slice(0, 5)) {
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("type", "photo");
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          if (res.ok) {
                            const { url } = await res.json();
                            await fetch("/api/photos", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ filename: file.name, url, isPrimary: false }),
                            });
                            setExtraPhotos((prev) => [...prev, url]);
                          }
                        } catch {}
                      }
                    }}
                  />
                </label>
                {extraPhotos.length > 0 && (
                  <div className="flex items-center gap-1">
                    {extraPhotos.map((url, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg overflow-hidden border border-white/[0.08]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {extraPhotos.length > 0 && !extraSheetGenerating && !extraSheetUrl && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={async () => {
                    setExtraSheetGenerating(true);
                    try {
                      const res = await fetch("/api/character-sheet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ photoUrls: extraPhotos, industry }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.poses?.compositeUrl) {
                          setExtraSheetUrl(data.poses.compositeUrl);
                        }
                      }
                    } catch {}
                    setExtraSheetGenerating(false);
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/15 transition-all"
                >
                  Generate new poses from {extraPhotos.length} photo{extraPhotos.length > 1 ? "s" : ""}
                </motion.button>
              )}

              {extraSheetGenerating && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                  <span className="text-[11px] text-indigo-400/60">Generating new pose variations...</span>
                </div>
              )}

              {extraSheetUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-emerald-500/20 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={extraSheetUrl} alt="Additional poses" className="w-full h-auto" />
                  <div className="px-3 py-2 bg-emerald-500/[0.04] text-[10px] text-emerald-400/60 text-center">
                    New poses generated — these will improve your video quality
                  </div>
                </motion.div>
              )}

              <p className="text-[10px] text-white/70 text-center">
                Different angles and lighting help the AI create more realistic videos
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2.5"
            >
              <motion.button
                onClick={handleConfirm}
                disabled={selectedPose === null}
                whileHover={selectedPose !== null ? { scale: 1.02 } : {}}
                whileTap={selectedPose !== null ? { scale: 0.97 } : {}}
                className="relative w-full py-4 rounded-2xl text-[15px] font-bold overflow-hidden disabled:opacity-35 disabled:cursor-not-allowed transition-opacity"
                style={selectedPose !== null ? {
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
                  boxShadow: "0 0 30px rgba(99,102,241,0.4)",
                } : {
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Shimmer on active */}
                {selectedPose !== null && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                )}
                <span className="relative text-white">
                  {selectedPoses.size > 0 ? `${selectedPoses.size} selected — Let's go 🚀` : "Tap poses to select (pick your favorites)"}
                </span>
              </motion.button>

              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full py-2.5 text-[12px] font-medium text-white/60 hover:text-white/70 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${retrying ? "animate-spin" : ""}`} />
                Not feeling it? Regenerate
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 py-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl"
            >
              😬
            </motion.div>
            <div>
              <p className="text-[17px] font-bold text-white/80">Generation glitched</p>
              <p className="text-[13px] text-white/70 mt-1">{errorMsg}</p>
            </div>
            <motion.button
              onClick={handleRetry}
              disabled={retrying}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10] text-[14px] font-semibold text-white/70 hover:text-white hover:bg-white/[0.09] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
              Try again
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

      <PoseLightbox
        compositeUrl={compositeUrl}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
        closeButtonRef={lightboxCloseBtnRef}
      />
    </div>
  );
}

// ── Pose lightbox ────────────────────────────────────────────────────
interface PoseLightboxProps {
  compositeUrl: string | null;
  index: number | null;
  onClose: () => void;
  onChange: (i: number) => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function PoseLightbox({ compositeUrl, index, onClose, onChange, closeButtonRef }: PoseLightboxProps) {
  const open = index !== null && compositeUrl !== null;
  const [cellAspect, setCellAspect] = useState<number | null>(null);

  useEffect(() => {
    if (!compositeUrl) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        // Each of the 9 cells shares the composite's aspect ratio (W/3 ÷ H/3 = W/H)
        setCellAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = compositeUrl;
  }, [compositeUrl]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onChange(((index as number) + 1) % 9);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onChange(((index as number) + 8) % 9);
      }
    };
    window.addEventListener("keydown", handleKey);
    const focusTimer = setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      clearTimeout(focusTimer);
    };
  }, [open, index, onClose, onChange, closeButtonRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Pose preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-[min(90vw,720px)] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full overflow-hidden rounded-2xl bg-black/40 border border-white/[0.08] mx-auto"
              style={{
                aspectRatio: cellAspect ?? 1,
                maxHeight: "90vh",
                // Keep the width bounded so the container fits within viewport height when cells are tall
                maxWidth: cellAspect ? `calc(90vh * ${cellAspect})` : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={compositeUrl as string}
                alt={`Pose ${(index as number) + 1}`}
                className="absolute"
                style={{
                  width: "300%",
                  height: "300%",
                  left: `-${((index as number) % 3) * 100}%`,
                  top: `-${Math.floor((index as number) / 3) * 100}%`,
                  maxWidth: "none",
                }}
              />
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close preview"
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/[0.10] hover:bg-white/[0.18] border border-white/[0.12] backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => onChange(((index as number) + 8) % 9)}
              aria-label="Previous pose"
              className="absolute top-1/2 -translate-y-1/2 left-2 sm:-left-5 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/[0.12] backdrop-blur-sm flex items-center justify-center text-white/90 hover:text-white transition outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => onChange(((index as number) + 1) % 9)}
              aria-label="Next pose"
              className="absolute top-1/2 -translate-y-1/2 right-2 sm:-right-5 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/[0.12] backdrop-blur-sm flex items-center justify-center text-white/90 hover:text-white transition outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="mt-3 text-center text-[12px] text-white/60 font-medium">
              Pose {(index as number) + 1} of 9
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

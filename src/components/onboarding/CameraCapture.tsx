"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, RefreshCw, Check, AlertTriangle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoQuality {
  passed: boolean;
  width: number;
  height: number;
  sizeKB: number;
  message: string;
}

function analyzePhotoQuality(file: File): Promise<PhotoQuality> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const sizeKB = Math.round(file.size / 1024);
      const dimOk = width >= 300 && height >= 300;
      const sizeOk = sizeKB >= 50;
      const passed = dimOk && sizeOk;
      const message = passed
        ? "Perfect. Let's do this."
        : !dimOk
          ? "A little blurry — try a clearer shot"
          : "Low quality — try a higher-res image";
      URL.revokeObjectURL(objectUrl);
      resolve({ passed, width, height, sizeKB, message });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ passed: false, width: 0, height: 0, sizeKB: 0, message: "Can't read this image" });
    };
    img.src = objectUrl;
  });
}

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  uploading?: boolean;
}

export default function CameraCapture({ onCapture, uploading = false }: CameraCaptureProps) {
  const [mode, setMode] = useState<"choose" | "camera" | "preview" | "upload-preview">("choose");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<PhotoQuality | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    setCameraReady(false);
    try {
      // Try high-res first, fall back to any available camera
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        });
      } catch {
        // Fallback: accept any camera resolution
        s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      }
      setStream(s);
      setMode("camera");
    } catch (err: any) {
      console.error("[CameraCapture] Camera access failed:", err.name, err.message);
      setCameraError(true);
      // Auto-open file picker as fallback
      setTimeout(() => fileInputRef.current?.click(), 300);
    }
  }, []);

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
      node.onloadedmetadata = () => setCameraReady(true);
    }
  }, [stream]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const snap = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Capture at full video resolution for best quality
    const captureWidth = Math.max(video.videoWidth, 1024);
    const captureHeight = Math.max(video.videoHeight, 768);
    canvas.width = captureWidth;
    canvas.height = captureHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror horizontally (selfie cameras are mirrored)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, captureWidth, captureHeight);

    // Use high quality JPEG (0.95) for better AI model results
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("[CameraCapture] Canvas toBlob returned null");
        return;
      }

      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const q = await analyzePhotoQuality(file);

      setCapturedFile(file);
      setPreviewUrl(url);
      setQuality(q);
      setMode("preview");

      // Stop camera tracks
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
    }, "image/jpeg", 0.95);
  }, [stream]);

  const retake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCapturedFile(null);
    setQuality(null);
    startCamera();
  }, [previewUrl, startCamera]);

  const confirm = useCallback(() => {
    if (capturedFile && previewUrl) onCapture(capturedFile, previewUrl);
  }, [capturedFile, previewUrl, onCapture]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept image/* plus HEIC/HEIF (iPhones)
    const isImage = file.type.startsWith("image/") ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (!isImage) {
      console.warn("[CameraCapture] Not an image file:", file.type, file.name);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      console.warn("[CameraCapture] File too large:", (file.size / 1024 / 1024).toFixed(1), "MB");
      return;
    }

    const url = URL.createObjectURL(file);
    const q = await analyzePhotoQuality(file);
    setCapturedFile(file);
    setPreviewUrl(url);
    setQuality(q);
    setMode("upload-preview");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto">
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" capture="user" className="hidden" onChange={handleFileChange} />

      <AnimatePresence mode="wait">

        {/* ── Choose ── */}
        {mode === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            {/* Primary: Camera */}
            <motion.button
              onClick={startCamera}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-violet-500/8 to-transparent p-5 flex items-center gap-4 transition-all hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
            >
              {/* Animated glow bg */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Pulsing icon */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-xl bg-indigo-500/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="text-left z-10">
                <p className="text-[15px] font-bold text-white">Take a photo now</p>
                <p className="text-[12px] text-indigo-300/60 mt-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Fastest way to get started
                </p>
              </div>

              <div className="ml-auto z-10">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-[10px] text-white/70">→</span>
                </div>
              </div>
            </motion.button>

            {/* Secondary: Upload */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4 text-white/70" />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-white/70">Upload a photo</p>
                <p className="text-[12px] text-white/60 mt-0.5">From your device</p>
              </div>
            </motion.button>

            {cameraError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-amber-400/70 text-center py-1"
              >
                Camera blocked — upload a photo instead
              </motion.p>
            )}

            {/* Trust signal */}
            <p className="text-[11px] text-white/70 text-center pt-1">
              🔒 Your photo is only used to build your AI twin. Never shared.
            </p>
          </motion.div>
        )}

        {/* ── Live camera ── */}
        {mode === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <video
                ref={attachVideo}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${cameraReady ? "opacity-100" : "opacity-0"}`}
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                  <motion.div
                    className="w-10 h-10 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}

              {/* Gradient border ring */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.08] pointer-events-none" />

              {/* Face oval guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="w-36 h-48 rounded-full border-2 border-white/25 border-dashed"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <p className="absolute bottom-4 inset-x-0 text-center text-[12px] font-medium text-white/70">
                Center your face ✦
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { stream?.getTracks().forEach((t) => t.stop()); setStream(null); setMode("choose"); }}
                className="flex-1 py-3.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-white/70 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={snap}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
              >
                📸 Take the shot
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Preview ── */}
        {(mode === "preview" || mode === "upload-preview") && previewUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[3/4] shadow-[0_0_40px_rgba(99,102,241,0.15)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover" />

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Quality badge */}
              {quality && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`absolute bottom-4 left-4 right-4 flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[13px] font-semibold backdrop-blur-xl ${
                    quality.passed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {quality.passed ? (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  {quality.message}
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={mode === "preview" ? retake : () => { setMode("choose"); setCapturedFile(null); setPreviewUrl(null); setQuality(null); }}
                className="flex items-center justify-center gap-1.5 flex-1 py-3.5 rounded-xl border border-white/[0.08] text-[13px] font-medium text-white/70 hover:text-white/70 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {mode === "preview" ? "Retake" : "Different photo"}
              </button>

              <motion.button
                onClick={confirm}
                disabled={uploading || !quality?.passed}
                whileHover={!uploading && quality?.passed ? { scale: 1.02 } : {}}
                whileTap={!uploading && quality?.passed ? { scale: 0.97 } : {}}
                className="flex items-center justify-center gap-2 flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {uploading ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    That&apos;s the one 🔥
                  </>
                )}
              </motion.button>
            </div>

            {quality && !quality.passed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-white/70 text-center"
              >
                Need a clearer photo for best results
              </motion.p>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

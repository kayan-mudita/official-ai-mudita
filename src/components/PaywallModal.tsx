"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, Download, Share2, Smartphone, ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaywallModalProps {
  /** URL of the video thumbnail to show behind the frosted overlay */
  thumbnailUrl?: string | null;
  /** What triggered the paywall: download, share, or publish */
  trigger?: "download" | "share" | "publish";
  /** Called when the user dismisses the modal */
  onClose: () => void;
}

const featurePills = [
  { icon: Download, label: "Download" },
  { icon: Share2, label: "Share" },
  { icon: Smartphone, label: "Auto-post" },
];

export default function PaywallModal({
  thumbnailUrl,
  trigger = "download",
  onClose,
}: PaywallModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      handleClose();
    }
  }

  async function handleSubscribe() {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "starter" }),
      });

      if (res.status === 401) {
        router.push("/auth/signup");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push("/pricing");
      }
    } catch {
      router.push("/pricing");
    }
  }

  const triggerText =
    trigger === "download"
      ? "download this video"
      : trigger === "share"
        ? "share this video"
        : "auto-post this video";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c0f1a] border border-white/[0.06] shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        {/* Video thumbnail with frosted overlay */}
        <div className="relative aspect-video bg-gradient-to-b from-white/[0.02] to-white/[0.005]">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-blue-900/20 via-[#0a0e17] to-violet-900/20" />
          )}

          {/* Frosted glass overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-lg flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
              <Lock className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-[13px] text-white/70 font-medium">
              Upgrade to {triggerText}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="text-[18px] font-semibold text-white mb-2">
              Love what you see?
            </h3>
            <p className="text-[14px] text-white/70 leading-relaxed">
              Unlock downloads, sharing, and auto-posting for{" "}
              <span className="text-white/60 font-medium">$79/mo</span>
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-2">
            {featurePills.map((pill, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
              >
                <pill.icon className="w-3.5 h-3.5 text-blue-400/70" />
                <span className="text-[12px] text-white/70 font-medium">
                  {pill.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-white text-[#050508] text-[15px] font-semibold hover:bg-white/90 active:bg-white/80 transition-all"
          >
            Start for $79/mo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Dismiss */}
          <button
            onClick={handleClose}
            className="w-full text-center text-[13px] text-white/60 hover:text-white/70 transition-colors py-1"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

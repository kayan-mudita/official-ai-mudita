"use client";

import { useState } from "react";
import { X, Sparkles, TrendingUp, Video, Zap, ArrowRight } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Stats from the user's first video, if available */
  firstVideoStats?: {
    title: string;
    views?: number;
    status?: string;
  } | null;
  /** Current usage info */
  usage?: {
    videosUsed: number;
    videosLimit: number;
    plan: string;
  };
}

export default function UpgradeModal({
  isOpen,
  onClose,
  firstVideoStats,
  usage,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "starter" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback: redirect to settings billing tab
      window.location.href = "/dashboard/settings?tab=plan";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0c1018] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white/60 hover:bg-white/[0.05] transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-white/90 mb-2">
            You&apos;ve reached your free limit
          </h2>

          {/* First video stats */}
          {firstVideoStats && (
            <div className="mt-4 mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {firstVideoStats.title}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {firstVideoStats.status === "published"
                      ? "Published and live"
                      : firstVideoStats.status === "approved"
                      ? "Approved and ready"
                      : "Your first video"}
                    {firstVideoStats.views
                      ? ` \u00B7 ${firstVideoStats.views} views`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Value proposition */}
          <p className="text-center text-sm text-white/70 leading-relaxed mb-6">
            Your first video is live. Upgrade to $79/mo to create 30 videos and
            keep your audience growing.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {[
              { icon: Video, text: "30 videos per month" },
              { icon: Zap, text: "Priority AI generation" },
              { icon: TrendingUp, text: "Full analytics dashboard" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white/70" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:from-blue-400 hover:to-purple-500 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-pulse">Redirecting...</span>
              ) : (
                <>
                  Upgrade Now - $79/mo
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-xl text-sm text-white/70 hover:text-white/70 hover:bg-white/[0.03] transition-all"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

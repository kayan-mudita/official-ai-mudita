"use client";

import Link from "next/link";
import { Play, Sparkles, ArrowRight, Clock, Share2 } from "lucide-react";
import { useState } from "react";

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  contentType: string;
  createdAt: string;
  creator: {
    name: string;
    avatarUrl: string | null;
  };
}

export default function PublicVideoClient({ video }: { video: VideoData }) {
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this video made with Official AI`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Top bar */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              Official <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#050508] text-[13px] font-medium hover:bg-white/90 transition-all"
          >
            Create Your Own
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Video content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06]">
              {video.videoUrl ? (
                <>
                  {!playing && video.thumbnailUrl && (
                    <div className="absolute inset-0 z-10">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <button
                        onClick={() => setPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center group"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:scale-110">
                          <Play className="w-7 h-7 text-white ml-1" />
                        </div>
                      </button>
                    </div>
                  )}
                  <video
                    src={video.videoUrl}
                    controls={playing}
                    autoPlay={playing}
                    className="w-full h-full object-contain"
                    onPlay={() => setPlaying(true)}
                    playsInline
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/70 text-sm">
                    Video preview not available
                  </p>
                </div>
              )}
            </div>

            {/* Video info */}
            <div className="mt-5">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {video.title}
              </h1>
              {video.description && (
                <p className="text-[14px] text-white/70 leading-relaxed mb-4">
                  {video.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-[13px] text-white/70">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(video.duration)}
                </div>
                <span className="text-white/10">|</span>
                <span>
                  {new Date(video.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 ml-auto text-white/70 hover:text-white/70 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Share"}
                </button>
              </div>
            </div>

            {/* Creator info */}
            <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                {video.creator.avatarUrl ? (
                  <img
                    src={video.creator.avatarUrl}
                    alt={video.creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white/70">
                    {video.creator.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[14px] font-medium text-white/80">
                  {video.creator.name}
                </p>
                <p className="text-[12px] text-white/70">
                  Created with Official AI
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar -- CTA */}
          <div className="lg:col-span-1">
            {/* Made with Official AI badge */}
            <div className="bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] border border-white/[0.06] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    Made with Official AI
                  </p>
                  <p className="text-[12px] text-white/70">
                    AI-Powered Video Creation
                  </p>
                </div>
              </div>
              <p className="text-[13px] text-white/70 leading-relaxed mb-5">
                Create studio-quality videos featuring your face and voice. No
                filming, no editing, no crew. Your AI twin posts for you.
              </p>
              <Link
                href="/auth/signup"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 transition-all"
              >
                Create Your Own AI Videos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                "Upload a few photos, get videos of you",
                "AI writes scripts for your industry",
                "Clone your voice for authentic narration",
                "Auto-publish to all social platforms",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.03]"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[13px] text-white/70">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <p className="text-[12px] text-white/70">
            &copy; {new Date().getFullYear()} Official AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/features"
              className="text-[12px] text-white/70 hover:text-white/70 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-[12px] text-white/70 hover:text-white/70 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

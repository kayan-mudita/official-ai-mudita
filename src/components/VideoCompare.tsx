"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  X,
  Check,
  Film,
  Cpu,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  script: string | null;
  model: string;
  status: string;
  contentType: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  createdAt: string;
}

interface VideoCompareProps {
  videoA: VideoItem;
  videoB: VideoItem;
  onClose: () => void;
  onSelect: (selectedId: string) => void;
}

const modelLabels: Record<string, string> = {
  "kling_2.6": "Kling 2.6",
  "seedance_2.0": "Seedance 2.0",
  sora_2: "Sora 2",
};

function formatDuration(seconds: number): string {
  if (!seconds) return "0:08";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isDemoOrInvalidUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("demo://")) return true;
  if (url.startsWith("/api/demo-video")) return true;
  return false;
}

function ComparisonPlayer({
  video,
  label,
  onSelect,
  selecting,
}: {
  video: VideoItem;
  label: string;
  onSelect: () => void;
  selecting: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const hasPlayable = !isDemoOrInvalidUrl(video.videoUrl);

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
          {label}
        </span>
        <span className="text-[10px] text-white/60">
          {new Date(video.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {hasPlayable ? (
          <>
            <video
              ref={videoRef}
              src={video.videoUrl!}
              poster={video.thumbnailUrl || undefined}
              controls
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <button
              onClick={toggleMute}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-white/80" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white/80" />
              )}
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Film className="w-8 h-8 text-white/[0.08] mb-2" />
            <span className="text-[11px] text-white/70">
              {video.status === "generating" ? "Generating..." : "No video"}
            </span>
          </div>
        )}

        {/* Model badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full">
          <Cpu className="w-2.5 h-2.5 text-white/60" />
          <span className="text-[10px] font-medium text-white/60">
            {modelLabels[video.model] || video.model}
          </span>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full">
          <Clock className="w-2.5 h-2.5 text-white/60" />
          <span className="text-[10px] text-white/60">{formatDuration(video.duration)}</span>
        </div>
      </div>

      {/* Title */}
      <div className="mt-3 mb-3">
        <h4 className="text-sm font-medium text-white/80 truncate">{video.title}</h4>
        {video.description && (
          <p className="text-[11px] text-white/70 mt-1 line-clamp-2">{video.description}</p>
        )}
      </div>

      {/* Use This One button */}
      <button
        onClick={onSelect}
        disabled={selecting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#050508] text-[13px] font-medium hover:bg-white/90 transition-all disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
        Use This One
      </button>
    </div>
  );
}

export default function VideoCompare({
  videoA,
  videoB,
  onClose,
  onSelect,
}: VideoCompareProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [selecting, setSelecting] = useState(false);

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

  async function handleSelect(videoId: string) {
    setSelecting(true);
    try {
      // Mark the selected video as the preferred version
      // For now, just call onSelect; could also update status via API
      onSelect(videoId);
    } finally {
      setSelecting(false);
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c0f1a] border border-white/[0.06] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.04]">
          <div>
            <h2 className="text-lg font-semibold text-white/90">Compare Versions</h2>
            <p className="text-xs text-white/70 mt-1">
              Compare different generations side by side. Choose which one to keep.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Side by side comparison -- stacked on mobile */}
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <ComparisonPlayer
            video={videoA}
            label="Version A"
            onSelect={() => handleSelect(videoA.id)}
            selecting={selecting}
          />

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="w-px h-full bg-white/[0.06]" />
            <span className="text-[10px] text-white/70 uppercase tracking-widest my-4 -rotate-90 whitespace-nowrap">
              vs
            </span>
            <div className="w-px h-full bg-white/[0.06]" />
          </div>
          <div className="md:hidden flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-white/70 uppercase tracking-widest">vs</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <ComparisonPlayer
            video={videoB}
            label="Version B"
            onSelect={() => handleSelect(videoB.id)}
            selecting={selecting}
          />
        </div>
      </div>
    </div>
  );
}

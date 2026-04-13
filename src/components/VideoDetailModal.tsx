"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Film,
  Cpu,
  Clock,
  FileText,
  Tag,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  Package,
  Copy,
  Check,
  Hash,
  Instagram,
} from "lucide-react";
import ContentScore from "@/components/ContentScore";

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
  schedule?: { platform: string } | null;
}

interface PostingPackage {
  videoId: string;
  videoTitle: string;
  generatedAt: string;
  captions: {
    instagram: string;
    tiktok: string;
    linkedin: string;
  };
  recommendedTimes: {
    instagram: { day: string; time: string; reason: string };
    tiktok: { day: string; time: string; reason: string };
    linkedin: { day: string; time: string; reason: string };
  };
  hashtags: string[];
  industry: string;
}

interface VideoDetailModalProps {
  video: VideoItem;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onRetry?: (id: string) => void;
  errorMessage?: string;
  /** Item 39: Called when a paywalled action is attempted (download, share, publish) */
  onPaywall?: (trigger: "download" | "share" | "publish") => void;
}

const statusStyles: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-white/[0.06] text-white/70 border-white/[0.06]",
  generating: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatContentType(ct: string): string {
  return ct
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Check if a video URL is a demo placeholder or otherwise non-playable */
function isDemoOrInvalidUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("demo://")) return true;
  if (url.startsWith("/api/demo-video")) return true;
  return false;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-white/70" />
      )}
    </button>
  );
}

// Platform icon components
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.28z"/>
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
    </svg>
  );
}

export default function VideoDetailModal({
  video,
  onClose,
  onStatusChange,
  onRetry,
  errorMessage,
  onPaywall,
}: VideoDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [updating, setUpdating] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "posting">("details");
  const [postingPackage, setPostingPackage] = useState<PostingPackage | null>(null);
  const [packageLoading, setPackageLoading] = useState(false);
  const [activePlatform, setActivePlatform] = useState<"instagram" | "tiktok" | "linkedin">("instagram");

  function toggleMute() {
    const vid = videoRef.current;
    if (!vid) return;
    const next = !isMuted;
    vid.muted = next;
    setIsMuted(next);
  }

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

  async function handleStatusUpdate(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onStatusChange(video.id, newStatus);
      }
    } catch {
      // silent fail
    } finally {
      setUpdating(false);
    }
  }

  async function generatePostingPackage() {
    setPackageLoading(true);
    try {
      const res = await fetch("/api/posting-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPostingPackage(data);
      }
    } catch {
      // silent fail
    } finally {
      setPackageLoading(false);
    }
  }

  function handlePostingTabClick() {
    setActiveTab("posting");
    if (!postingPackage && !packageLoading) {
      generatePostingPackage();
    }
  }

  const scriptText = video.script || "";
  const scriptIsLong = scriptText.length > 300;
  const displayScript = scriptExpanded
    ? scriptText
    : scriptText.substring(0, 300);

  const platformConfig = {
    instagram: { label: "Instagram", icon: Instagram, color: "text-pink-400", bgColor: "bg-pink-500/10 border-pink-500/20" },
    tiktok: { label: "TikTok", icon: TikTokIcon, color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
    linkedin: { label: "LinkedIn", icon: LinkedInIcon, color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c0f1a] border border-white/[0.06] shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        {/* Video Player / Generating Placeholder */}
        <div className="relative bg-black rounded-t-2xl overflow-hidden">
          {video.videoUrl && !isDemoOrInvalidUrl(video.videoUrl) ? (
            <div
              className="relative w-full mx-auto"
              style={{ aspectRatio: "9/16", maxHeight: "50vh" }}
            >
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl || undefined}
                controls
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              {/* Unmute button */}
              <button
                onClick={toggleMute}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 active:bg-black/90 transition-colors z-10"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/80" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white/80" />
                )}
              </button>
            </div>
          ) : (
            <div
              className="relative w-full mx-auto flex flex-col items-center justify-center"
              style={{ aspectRatio: "9/16", maxHeight: "40vh" }}
            >
              {video.status === "generating" ? (
                <>
                  <Loader2 className="w-10 h-10 text-purple-400/60 animate-spin mb-4" />
                  <p className="text-sm text-white/70 font-medium">
                    Generating video...
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    This may take a few minutes
                  </p>
                </>
              ) : video.status === "failed" ? (
                <>
                  <AlertTriangle className="w-10 h-10 text-red-400/60 mb-4" />
                  <p className="text-sm text-red-400/70 font-medium">
                    Generation failed
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    {errorMessage || "Something went wrong. Try again."}
                  </p>
                </>
              ) : isDemoOrInvalidUrl(video.videoUrl) && video.videoUrl ? (
                <>
                  <Film className="w-10 h-10 text-white/[0.08] mb-4" />
                  <p className="text-sm text-white/60 font-medium">
                    Demo mode — no real video
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    This video was generated in demo mode without API keys configured.
                  </p>
                </>
              ) : (
                <>
                  <Film className="w-10 h-10 text-white/[0.08] mb-4" />
                  <p className="text-sm text-white/60 font-medium">
                    No video yet
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    Video will appear here once generated
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-3 text-[13px] font-medium transition-colors border-b-2 ${
              activeTab === "details"
                ? "text-white/90 border-blue-500"
                : "text-white/70 border-transparent hover:text-white/70"
            }`}
          >
            Details
          </button>
          <button
            onClick={handlePostingTabClick}
            className={`flex-1 py-3 text-[13px] font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "posting"
                ? "text-white/90 border-blue-500"
                : "text-white/70 border-transparent hover:text-white/70"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Posting Package
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="p-6 space-y-5">
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-white/90 leading-tight">
                {video.title}
              </h2>
              <span
                className={`text-xs px-2.5 py-1 rounded-full capitalize border flex-shrink-0 ${
                  statusStyles[video.status] || statusStyles.draft
                }`}
              >
                {video.status}
              </span>
            </div>

            {/* Description */}
            {video.description && (
              <p className="text-sm text-white/70 leading-relaxed">
                {video.description}
              </p>
            )}

            {/* Metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <Cpu className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/70">
                  {modelLabels[video.model] || video.model}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <Clock className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/70">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <Tag className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/70">
                  {formatContentType(video.contentType)}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <Calendar className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/70">
                  {new Date(video.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Created date full */}
            <p className="text-xs text-white/70">
              Created {formatDate(video.createdAt)}
            </p>

            {/* Script / Prompt */}
            {scriptText && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    Script / Prompt
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] max-h-64 overflow-y-auto">
                  <pre className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap font-sans">
                    {displayScript}
                    {scriptIsLong && !scriptExpanded && "..."}
                  </pre>
                  {scriptIsLong && (
                    <button
                      onClick={() => setScriptExpanded(!scriptExpanded)}
                      className="mt-2 text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
                    >
                      {scriptExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Item 39: Download & Share action buttons (trigger paywall for free users) */}
            {video.videoUrl && !isDemoOrInvalidUrl(video.videoUrl) && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onPaywall ? onPaywall("download") : undefined}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] text-white/70 text-sm font-medium border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/70 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Download
                </button>
                <button
                  onClick={() => onPaywall ? onPaywall("share") : undefined}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] text-white/70 text-sm font-medium border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/70 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                  Share
                </button>
              </div>
            )}

            {/* Content Score (only for review status) */}
            {video.status === "review" && (
              <ContentScore video={video} />
            )}

            {/* Approve / Reject buttons (only for review status) */}
            {video.status === "review" && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={updating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("draft")}
                  disabled={updating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
              </div>
            )}

            {/* Retry button (only for failed status) */}
            {video.status === "failed" && (
              <div className="space-y-3 pt-2">
                {errorMessage && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400/80" />
                      <span className="text-xs font-medium text-red-400/80 uppercase tracking-wider">Error</span>
                    </div>
                    <p className="text-sm text-red-400/60">{errorMessage}</p>
                  </div>
                )}
                {onRetry && (
                  <button
                    onClick={() => onRetry(video.id)}
                    disabled={updating}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Retry Generation
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Posting Package Tab */}
        {activeTab === "posting" && (
          <div className="p-6 space-y-5">
            {packageLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
              </div>
            )}

            {!packageLoading && !postingPackage && (
              <div className="text-center py-16">
                <Package className="w-8 h-8 text-white/70 mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-4">Generate captions and posting recommendations</p>
                <button
                  onClick={generatePostingPackage}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                >
                  <Package className="w-4 h-4" />
                  Generate Package
                </button>
              </div>
            )}

            {!packageLoading && postingPackage && (
              <>
                {/* Platform selector */}
                <div className="flex gap-2">
                  {(["instagram", "tiktok", "linkedin"] as const).map((platform) => {
                    const config = platformConfig[platform];
                    const PIcon = config.icon;
                    return (
                      <button
                        key={platform}
                        onClick={() => setActivePlatform(platform)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                          activePlatform === platform
                            ? config.bgColor + " " + config.color
                            : "text-white/70 border-white/[0.04] hover:border-white/[0.08] hover:text-white/70"
                        }`}
                      >
                        <PIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                      {platformConfig[activePlatform].label} Caption
                    </span>
                    <CopyButton text={postingPackage.captions[activePlatform]} />
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] max-h-48 overflow-y-auto">
                    <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">
                      {postingPackage.captions[activePlatform]}
                    </p>
                  </div>
                </div>

                {/* Recommended posting time */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <Clock className="w-4 h-4 text-white/70 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[13px] text-white/70 font-medium">
                      Best time: {postingPackage.recommendedTimes[activePlatform].day} at {postingPackage.recommendedTimes[activePlatform].time}
                    </div>
                    <div className="text-[11px] text-white/70 mt-0.5">
                      {postingPackage.recommendedTimes[activePlatform].reason}
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                        Hashtags ({postingPackage.hashtags.length})
                      </span>
                    </div>
                    <CopyButton text={postingPackage.hashtags.join(" ")} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {postingPackage.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.04]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Regenerate button */}
                <button
                  onClick={generatePostingPackage}
                  disabled={packageLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] text-white/70 text-sm font-medium border border-white/[0.04] hover:bg-white/[0.06] hover:text-white/60 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate Package
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mic,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Play,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Film,
  Flame,
  Wifi,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────

interface SetupBlock {
  status: "complete" | "needs_improvement" | "missing";
  [key: string]: any;
}

interface PendingVideo {
  id: string;
  title: string;
  description: string;
  contentType: string;
  model: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: string;
}

interface DashboardSummary {
  setup: {
    face: SetupBlock & { photoCount: number; primaryPhotoUrl: string | null };
    voice: SetupBlock & { sampleCount: number; hasClone: boolean };
    business: SetupBlock & { hasIndustry: boolean; hasBrandProfile: boolean };
  };
  allGreen: boolean;
  pendingApprovals: PendingVideo[];
  stats: {
    totalVideos: number;
    publishedVideos: number;
    totalViews: number;
    currentStreak: number;
    longestStreak: number;
    connectedPlatforms: number;
  };
}

// ── Status helpers ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  complete: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Complete",
  },
  needs_improvement: {
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Improve",
  },
  missing: {
    icon: XCircle,
    color: "text-red-400/70",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Missing",
  },
} as const;

const SETUP_BLOCKS = [
  {
    key: "face" as const,
    icon: Camera,
    title: "Face",
    description: "Upload photos for your AI twin",
    href: "/dashboard/vault",
    cta: "Add photos",
  },
  {
    key: "voice" as const,
    icon: Mic,
    title: "Voice",
    description: "Clone your voice for video narration",
    href: "/dashboard/vault",
    cta: "Record voice",
  },
  {
    key: "business" as const,
    icon: Briefcase,
    title: "Business",
    description: "Set up your brand profile",
    href: "/dashboard/vault",
    cta: "Set up brand",
  },
];

// ── Main Dashboard Page ─────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (videoId: string) => {
    setActioningId(videoId);
    try {
      await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              pendingApprovals: prev.pendingApprovals.filter((v) => v.id !== videoId),
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to approve video:", err);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (videoId: string) => {
    setActioningId(videoId);
    try {
      await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              pendingApprovals: prev.pendingApprovals.filter((v) => v.id !== videoId),
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to reject video:", err);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-white/70 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-white/70 text-sm">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/70 mt-0.5">Your AI content studio at a glance</p>
        </div>
        <Link
          href="/dashboard/generate"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Create Video
        </Link>
      </div>

      {/* ── Section 1: Setup Status ── */}
      <AnimatePresence mode="wait">
        {data.allGreen ? (
          <motion.div
            key="all-green"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">All systems go</span>
            <div className="flex items-center gap-1.5 ml-auto">
              {SETUP_BLOCKS.map((b) => (
                <div key={b.key} className="w-2 h-2 rounded-full bg-emerald-400" />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="setup-blocks"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {SETUP_BLOCKS.map((block) => {
              const status = data.setup[block.key].status;
              const cfg = STATUS_CONFIG[status];
              const StatusIcon = cfg.icon;
              const BlockIcon = block.icon;

              return (
                <Link
                  key={block.key}
                  href={block.href}
                  className={`group relative p-4 rounded-xl border ${cfg.border} ${cfg.bg} hover:bg-white/[0.04] transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${cfg.bg}`}>
                      <BlockIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-white">{block.title}</p>
                  <p className="text-xs text-white/70 mt-0.5">{block.description}</p>
                  {status !== "complete" && (
                    <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      {block.cta}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 2: Pending Approvals ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-white">Needs Your Approval</h2>
            {data.pendingApprovals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">
                {data.pendingApprovals.length}
              </span>
            )}
          </div>
          {data.pendingApprovals.length > 0 && (
            <Link
              href="/dashboard/approvals"
              className="text-xs font-medium text-white/70 hover:text-white/60 transition-colors"
            >
              View all
            </Link>
          )}
        </div>

        {data.pendingApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <CheckCircle2 className="w-8 h-8 text-white/70 mb-3" />
            <p className="text-sm text-white/70 font-medium">You&apos;re all caught up</p>
            <Link
              href="/dashboard/generate"
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Create new content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.pendingApprovals.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group relative rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] transition-all"
              >
                {/* Video preview / thumbnail */}
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.target as HTMLVideoElement;
                        v.pause();
                        v.currentTime = 0;
                      }}
                    />
                  ) : (
                    <Film className="w-8 h-8 text-white/10" />
                  )}
                  {video.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-white truncate">
                    {video.title || "Untitled video"}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {video.model} &middot; {new Date(video.createdAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(video.id)}
                      disabled={actioningId === video.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-40"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(video.id)}
                      disabled={actioningId === video.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400/70 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Analytics Summary ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Impact</h2>
          <Link
            href="/dashboard/analytics"
            className="text-xs font-medium text-white/70 hover:text-white/60 transition-colors"
          >
            Full analytics
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={formatNumber(data.stats.totalViews)}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            icon={Film}
            label="Published"
            value={String(data.stats.publishedVideos)}
            sub={`of ${data.stats.totalVideos} total`}
            color="text-violet-400"
            bg="bg-violet-500/10"
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${data.stats.currentStreak}d`}
            sub={`Best: ${data.stats.longestStreak}d`}
            color="text-orange-400"
            bg="bg-orange-500/10"
          />
          <StatCard
            icon={Wifi}
            label="Platforms"
            value={String(data.stats.connectedPlatforms)}
            sub="connected"
            color="text-cyan-400"
            bg="bg-cyan-500/10"
          />
        </div>
      </section>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/70 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-white/60 mt-0.5">{sub}</p>}
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

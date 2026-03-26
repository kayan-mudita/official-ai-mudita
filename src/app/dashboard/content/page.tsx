"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Search,
  MoreVertical,
  Eye,
  Cpu,
  Grid3X3,
  List,
  Video,
  Loader2,
  Film,
  RefreshCw,
  Send,
  GitCompare,
  X,
  Check,
} from "lucide-react";
import VideoDetailModal from "@/components/VideoDetailModal";
import VideoCompare from "@/components/VideoCompare";
import PaywallModal from "@/components/PaywallModal";

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

const statusStyles: Record<string, string> = {
  published: "bg-green-500/10 text-green-400",
  review: "bg-yellow-500/10 text-yellow-400",
  scheduled: "bg-blue-500/10 text-blue-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-white/[0.06] text-white/40",
  generating: "bg-purple-500/10 text-purple-400",
  failed: "bg-red-500/10 text-red-400",
};

const modelLabels: Record<string, string> = {
  "kling_2.6": "Kling 2.6",
  "seedance_2.0": "Seedance 2.0",
  sora_2: "Sora 2",
};

const filters = ["All", "Published", "Needs Approval", "Scheduled", "Approved", "Draft", "Failed"];

/** Check if a video URL is a demo placeholder or otherwise non-playable */
function isDemoOrInvalidUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("demo://")) return true;
  if (url.startsWith("/api/demo-video")) return true;
  return false;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0:08";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContentPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videoError, setVideoError] = useState<string | undefined>();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmPublishVideo, setConfirmPublishVideo] = useState<VideoItem | null>(null);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  // Video comparison state
  const [compareVideos, setCompareVideos] = useState<{ a: VideoItem; b: VideoItem } | null>(null);
  // Item 39: Paywall modal state
  const [paywallTrigger, setPaywallTrigger] = useState<{ trigger: "download" | "share" | "publish"; thumbnail?: string | null } | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    try {
      const res = await fetch("/api/videos");
      if (res.ok) setVideos(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSelectVideo(video: VideoItem) {
    setSelectedVideo(video);
    setVideoError(undefined);

    if (video.status === "failed") {
      try {
        const res = await fetch(`/api/generate/status?videoId=${video.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.error) setVideoError(data.error);
        }
      } catch {}
    }
  }

  async function handleRetry(videoId: string) {
    try {
      const retryRes = await fetch("/api/generate/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({}));
        console.error("Retry failed:", errData.error);
        return;
      }

      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId ? { ...v, status: "generating", videoUrl: null, thumbnailUrl: null } : v
        )
      );
      setSelectedVideo(null);
    } catch (err) {
      console.error("Retry error:", err);
    }
  }

  // Item 12: One-Click Regenerate
  async function handleRegenerate(videoId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setRegeneratingId(videoId);
    try {
      const res = await fetch(`/api/videos/${videoId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newVideo?.id) {
          // Add the new video to the list and navigate
          await fetchVideos();
          router.push(`/dashboard/content`);
        }
      }
    } catch (err) {
      console.error("Regenerate error:", err);
    } finally {
      setRegeneratingId(null);
    }
  }

  // Item 14: Post Now
  function handlePostNowClick(video: VideoItem, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setConfirmPublishVideo(video);
    setPublishResult(null);
  }

  async function confirmPublish() {
    if (!confirmPublishVideo) return;
    setPublishingId(confirmPublishVideo.id);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: confirmPublishVideo.id,
          platforms: ["instagram", "tiktok", "linkedin"],
        }),
      });

      if (res.ok) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === confirmPublishVideo.id ? { ...v, status: "published" } : v
          )
        );
        setPublishResult({ success: true, message: "Posted successfully!" });
      } else {
        const errData = await res.json().catch(() => ({ error: "Publishing failed" }));
        setPublishResult({ success: false, message: errData.error || "Publishing failed" });
      }
    } catch {
      setPublishResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setPublishingId(null);
    }
  }

  // Item 13: Find regenerated versions (matching title root)
  function findRegeneratedVersions(video: VideoItem): VideoItem[] {
    const baseTitle = video.title.replace(/\s*\(v\d+\)$/, "");
    return videos.filter(
      (v) =>
        v.id !== video.id &&
        (v.title.replace(/\s*\(v\d+\)$/, "") === baseTitle ||
          (v.script && video.script && v.script === video.script))
    );
  }

  function handleCompare(video: VideoItem, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const versions = findRegeneratedVersions(video);
    if (versions.length > 0) {
      setCompareVideos({ a: video, b: versions[0] });
    }
  }

  const filtered = videos.filter((v) => {
    if (activeFilter !== "All") {
      const filterStatus = activeFilter === "Needs Approval" ? "review" : activeFilter.toLowerCase();
      if (v.status !== filterStatus) return false;
    }
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-sm text-white/40 mt-1">
            {loading ? "\u00A0" : `${videos.length} video${videos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/dashboard/generate" className="btn-primary gap-2 text-sm">
          <Video className="w-4 h-4" /> Create New
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 !py-2"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => {
            const reviewCount = f === "Needs Approval" ? videos.filter((v) => v.status === "review").length : 0;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeFilter === f
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "text-white/40 hover:text-white/60 border border-transparent"
                }`}
              >
                {f}
                {f === "Needs Approval" && reviewCount > 0 && (
                  <span className="w-4.5 h-4.5 min-w-[18px] rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] flex items-center justify-center font-semibold">
                    {reviewCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] mb-5">
            <Film className="w-6 h-6 text-white/15" />
          </div>
          <h3 className="text-[17px] font-semibold text-white/80 mb-1">No videos yet</h3>
          <p className="text-[14px] text-white/30 mb-6">Create your first AI video to get started.</p>
          <Link href="/dashboard/generate" className="btn-primary gap-2 text-sm">
            <Video className="w-4 h-4" /> Create Video
          </Link>
        </div>
      )}

      {/* No results for filter */}
      {!loading && videos.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-white/30">No videos match this filter.</p>
        </div>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((video) => (
            <VideoGridCard
              key={video.id}
              video={video}
              onSelect={() => handleSelectVideo(video)}
              onRegenerate={(e) => handleRegenerate(video.id, e)}
              onPostNow={(e) => handlePostNowClick(video, e)}
              onCompare={(e) => handleCompare(video, e)}
              isRegenerating={regeneratingId === video.id}
              hasVersions={findRegeneratedVersions(video).length > 0}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border border-white/[0.04] overflow-hidden divide-y divide-white/[0.03]">
          {filtered.map((video) => {
            const hasVersions = findRegeneratedVersions(video).length > 0;
            return (
              <div
                key={video.id}
                onClick={() => handleSelectVideo(video)}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.015] transition-colors cursor-pointer"
              >
                <div className="w-16 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Play className="w-3 h-3 text-white/15" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-white/90">{video.title}</div>
                  <div className="text-xs text-white/25">{modelLabels[video.model] || video.model} · {formatDuration(video.duration)}</div>
                </div>
                <div className="hidden sm:block text-xs text-white/25">{formatDate(video.createdAt)}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusStyles[video.status] || statusStyles.draft}`}>
                  {video.status}
                </span>
                <div className="flex items-center gap-1">
                  {/* Regenerate button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRegenerate(video.id, e); }}
                    disabled={regeneratingId === video.id}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === video.id ? "animate-spin" : ""}`} />
                  </button>
                  {/* Compare button */}
                  {hasVersions && (
                    <button
                      onClick={(e) => handleCompare(video, e)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors"
                      title="Compare versions"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Post Now button */}
                  {video.status === "approved" && (
                    <button
                      onClick={(e) => handlePostNowClick(video, e)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <Send className="w-3 h-3" /> Post
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onStatusChange={(id, newStatus) => {
            setVideos((prev) =>
              prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
            );
            setSelectedVideo(null);
          }}
          onRetry={handleRetry}
          errorMessage={videoError}
          onPaywall={(trigger) => {
            setSelectedVideo(null);
            setPaywallTrigger({
              trigger,
              thumbnail: selectedVideo.thumbnailUrl,
            });
          }}
        />
      )}

      {/* Item 39: Paywall Modal */}
      {paywallTrigger && (
        <PaywallModal
          trigger={paywallTrigger.trigger}
          thumbnailUrl={paywallTrigger.thumbnail}
          onClose={() => setPaywallTrigger(null)}
        />
      )}

      {/* Publish Confirmation Modal (Item 14) */}
      {confirmPublishVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => { setConfirmPublishVideo(null); setPublishResult(null); }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0c0f1a] border border-white/[0.06] shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {publishResult ? (
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${publishResult.success ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                  {publishResult.success ? (
                    <Check className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <X className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">
                  {publishResult.success ? "Published!" : "Publishing Failed"}
                </h3>
                <p className="text-sm text-white/40 mb-6">{publishResult.message}</p>
                <button
                  onClick={() => { setConfirmPublishVideo(null); setPublishResult(null); }}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.06] text-sm text-white/70 hover:bg-white/[0.1] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white/90">Post Now</h3>
                  <button
                    onClick={() => setConfirmPublishVideo(null)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-white/50 mb-4">
                  Post &quot;{confirmPublishVideo.title}&quot; to your connected platforms?
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Instagram", "TikTok", "LinkedIn"].map((p) => (
                    <span key={p} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/60">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmPublishVideo(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm text-white/50 hover:bg-white/[0.03] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPublish}
                    disabled={publishingId === confirmPublishVideo.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#050508] text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {publishingId === confirmPublishVideo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video Comparison Modal (Item 13) */}
      {compareVideos && (
        <VideoCompare
          videoA={compareVideos.a}
          videoB={compareVideos.b}
          onClose={() => setCompareVideos(null)}
          onSelect={(selectedId) => {
            // Keep the selected one, update state
            setCompareVideos(null);
          }}
        />
      )}
    </div>
  );
}

/** Grid card with inline hover video preview, regenerate button, and post now */
function VideoGridCard({
  video,
  onSelect,
  onRegenerate,
  onPostNow,
  onCompare,
  isRegenerating,
  hasVersions,
}: {
  video: VideoItem;
  onSelect: () => void;
  onRegenerate: (e: React.MouseEvent) => void;
  onPostNow: (e: React.MouseEvent) => void;
  onCompare: (e: React.MouseEvent) => void;
  isRegenerating: boolean;
  hasVersions: boolean;
}) {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);

  const hasPlayableVideo = !isDemoOrInvalidUrl(video.videoUrl);

  function handleMouseEnter() {
    setHovering(true);
    if (hasPlayableVideo && videoPreviewRef.current) {
      videoPreviewRef.current.play().catch(() => {});
    }
  }

  function handleMouseLeave() {
    setHovering(false);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.pause();
      videoPreviewRef.current.currentTime = 0;
    }
  }

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-xl border border-white/[0.04] bg-white/[0.015] overflow-hidden group hover:border-white/[0.08] transition-all cursor-pointer"
    >
      <div className="aspect-video bg-white/[0.02] relative flex items-center justify-center overflow-hidden">
        {/* Hover video preview */}
        {hasPlayableVideo && (
          <video
            ref={videoPreviewRef}
            src={video.videoUrl!}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              hovering ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Thumbnail / fallback */}
        {video.thumbnailUrl && !isDemoOrInvalidUrl(video.thumbnailUrl) ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              hovering && hasPlayableVideo ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : isDemoOrInvalidUrl(video.videoUrl) && video.status !== "generating" ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <Film className="w-8 h-8 text-white/[0.06]" />
            <span className="text-[10px] text-white/20">Demo mode</span>
          </div>
        ) : (
          <Film className="w-8 h-8 text-white/[0.06]" />
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur rounded-full">
          <Cpu className="w-2.5 h-2.5 text-white/60" />
          <span className="text-[10px] font-medium text-white/70">
            {modelLabels[video.model] || video.model}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/50 backdrop-blur rounded text-[10px] text-white/70">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium truncate text-white/90">
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/25">
            {formatDate(video.createdAt)}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
              statusStyles[video.status] || statusStyles.draft
            }`}
          >
            {video.status}
          </span>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
          {/* Regenerate button -- always visible */}
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </button>

          {/* Compare button -- only if regenerated versions exist */}
          {hasVersions && (
            <button
              onClick={onCompare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all"
            >
              <GitCompare className="w-3 h-3" />
              Compare
            </button>
          )}

          {/* Post Now button -- only for approved videos */}
          {video.status === "approved" && (
            <button
              onClick={onPostNow}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all ml-auto"
            >
              <Send className="w-3 h-3" />
              Post Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

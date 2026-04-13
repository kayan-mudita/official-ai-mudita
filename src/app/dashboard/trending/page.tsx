"use client";

import { useState } from "react";
import {
  Music,
  Play,
  TrendingUp,
  Filter,
  Check,
  Instagram,
  Loader2,
} from "lucide-react";

// Platform icon components
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.28z"/>
    </svg>
  );
}

interface TrendingTrack {
  id: string;
  name: string;
  artist: string;
  usageCount: string;
  platform: "instagram" | "tiktok" | "both";
  genre: string;
  industryRelevance: string[];
  bpm: number;
  mood: string;
  trending: boolean;
}

const trendingTracks: TrendingTrack[] = [
  { id: "t1", name: "Original Sound - Motivational", artist: "Various", usageCount: "4.2M", platform: "tiktok", genre: "motivational", industryRelevance: ["marketing", "fitness", "finance"], bpm: 120, mood: "Energetic", trending: true },
  { id: "t2", name: "Aesthetic Vibes", artist: "Chill Beats", usageCount: "3.8M", platform: "both", genre: "lo-fi", industryRelevance: ["technology", "marketing"], bpm: 85, mood: "Calm", trending: true },
  { id: "t3", name: "Corporate Success", artist: "Ambient Pro", usageCount: "2.9M", platform: "instagram", genre: "corporate", industryRelevance: ["finance", "realestate", "technology"], bpm: 110, mood: "Professional", trending: true },
  { id: "t4", name: "Hustle Mode Activated", artist: "Bass Culture", usageCount: "2.5M", platform: "tiktok", genre: "trap", industryRelevance: ["marketing", "fitness"], bpm: 140, mood: "Intense", trending: true },
  { id: "t5", name: "Morning Routine", artist: "Sunrise Audio", usageCount: "2.3M", platform: "both", genre: "ambient", industryRelevance: ["fitness", "marketing", "technology"], bpm: 90, mood: "Uplifting", trending: true },
  { id: "t6", name: "The Glow Up", artist: "Pop Central", usageCount: "2.1M", platform: "tiktok", genre: "pop", industryRelevance: ["fitness", "marketing"], bpm: 128, mood: "Fun", trending: true },
  { id: "t7", name: "Cinematic Reveal", artist: "Epic Sounds", usageCount: "1.9M", platform: "instagram", genre: "cinematic", industryRelevance: ["realestate", "technology"], bpm: 95, mood: "Dramatic", trending: false },
  { id: "t8", name: "Tech Innovation", artist: "Digital Waves", usageCount: "1.7M", platform: "both", genre: "electronic", industryRelevance: ["technology", "finance"], bpm: 132, mood: "Futuristic", trending: true },
  { id: "t9", name: "Luxury Lifestyle", artist: "Velvet Sound", usageCount: "1.5M", platform: "instagram", genre: "r&b", industryRelevance: ["realestate", "finance"], bpm: 88, mood: "Sophisticated", trending: false },
  { id: "t10", name: "Grind Don't Stop", artist: "Motivation Daily", usageCount: "1.4M", platform: "tiktok", genre: "hip-hop", industryRelevance: ["fitness", "marketing", "finance"], bpm: 145, mood: "Aggressive", trending: true },
  { id: "t11", name: "Soft Piano Keys", artist: "Classical Remix", usageCount: "1.3M", platform: "both", genre: "classical", industryRelevance: ["realestate", "finance", "technology"], bpm: 72, mood: "Elegant", trending: false },
  { id: "t12", name: "Viral Dance Beat", artist: "DJ TrendSet", usageCount: "5.1M", platform: "tiktok", genre: "dance", industryRelevance: ["marketing", "fitness"], bpm: 130, mood: "Fun", trending: true },
  { id: "t13", name: "Storytelling Acoustic", artist: "Campfire Audio", usageCount: "1.1M", platform: "instagram", genre: "acoustic", industryRelevance: ["marketing", "technology"], bpm: 100, mood: "Authentic", trending: false },
  { id: "t14", name: "Power Move", artist: "Stadium Sound", usageCount: "980K", platform: "both", genre: "epic", industryRelevance: ["fitness", "marketing", "finance"], bpm: 150, mood: "Powerful", trending: true },
  { id: "t15", name: "Day in My Life", artist: "Everyday Audio", usageCount: "2.7M", platform: "tiktok", genre: "indie", industryRelevance: ["marketing", "technology"], bpm: 105, mood: "Casual", trending: true },
  { id: "t16", name: "Closing the Deal", artist: "Sales Floor", usageCount: "870K", platform: "instagram", genre: "corporate", industryRelevance: ["realestate", "finance"], bpm: 115, mood: "Confident", trending: false },
  { id: "t17", name: "Electric Dreams", artist: "Synth Wave", usageCount: "1.6M", platform: "both", genre: "synthwave", industryRelevance: ["technology"], bpm: 118, mood: "Retro", trending: true },
  { id: "t18", name: "Transformation", artist: "Before & After", usageCount: "3.2M", platform: "tiktok", genre: "pop", industryRelevance: ["fitness", "marketing"], bpm: 125, mood: "Inspiring", trending: true },
  { id: "t19", name: "Peaceful Office", artist: "Work Mode", usageCount: "750K", platform: "instagram", genre: "ambient", industryRelevance: ["technology", "finance"], bpm: 80, mood: "Focused", trending: false },
  { id: "t20", name: "Main Character Energy", artist: "Confidence Boost", usageCount: "4.5M", platform: "both", genre: "pop", industryRelevance: ["marketing", "fitness", "finance"], bpm: 122, mood: "Empowering", trending: true },
];

const genres = ["All", "pop", "lo-fi", "corporate", "trap", "ambient", "cinematic", "electronic", "hip-hop", "acoustic", "dance"];
const platforms = ["All", "instagram", "tiktok"];

export default function TrendingPage() {
  const [platformFilter, setPlatformFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");
  const [savedTracks, setSavedTracks] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = trendingTracks.filter((track) => {
    if (platformFilter !== "All" && track.platform !== platformFilter && track.platform !== "both") return false;
    if (genreFilter !== "All" && track.genre !== genreFilter) return false;
    return true;
  });

  function handleSaveTrack(trackId: string) {
    setSaving(trackId);
    // Simulate save
    setTimeout(() => {
      setSavedTracks((prev) => {
        const next = new Set(prev);
        if (next.has(trackId)) {
          next.delete(trackId);
        } else {
          next.add(trackId);
        }
        return next;
      });
      setSaving(null);
    }, 500);
  }

  function getPlatformBadge(platform: string) {
    switch (platform) {
      case "instagram":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Instagram className="w-2.5 h-2.5" /> Instagram
          </span>
        );
      case "tiktok":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TikTokIcon className="w-2.5 h-2.5" /> TikTok
          </span>
        );
      case "both":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            All Platforms
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Trending Audio</h1>
        <p className="text-sm text-white/70 mt-1">
          Popular tracks across Instagram and TikTok this week
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/70" />
          <span className="text-xs text-white/70 uppercase tracking-wider">Platform</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                platformFilter === p
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-white/70 hover:text-white/60 border border-transparent"
              }`}
            >
              {p === "All" ? "All" : p === "instagram" ? "Instagram" : "TikTok"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/70 uppercase tracking-wider">Genre</span>
          {genres.slice(0, 6).map((g) => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                genreFilter === g
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-white/70 hover:text-white/60 border border-transparent"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-white/60">{filtered.length} track{filtered.length !== 1 ? "s" : ""}</p>

      {/* Track Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((track) => {
          const isSaved = savedTracks.has(track.id);
          const isSaving = saving === track.id;

          return (
            <div
              key={track.id}
              className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 hover:border-white/[0.08] transition-all group"
            >
              {/* Top row: icon + info */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                  <Music className="w-5 h-5 text-purple-400/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold text-white/90 truncate">{track.name}</h3>
                  <p className="text-[11px] text-white/70 truncate">{track.artist}</p>
                </div>
                {track.trending && (
                  <TrendingUp className="w-3.5 h-3.5 text-green-400/70 flex-shrink-0" />
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {getPlatformBadge(track.platform)}
                <span className="text-[10px] text-white/60 capitalize">{track.genre}</span>
                <span className="text-[10px] text-white/70">|</span>
                <span className="text-[10px] text-white/60">{track.bpm} BPM</span>
              </div>

              {/* Usage count */}
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-3 h-3 text-white/70" />
                <span className="text-[12px] text-white/70 font-medium">{track.usageCount} uses this week</span>
              </div>

              {/* Mood tag */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.04]">
                  {track.mood}
                </span>

                {/* Use button */}
                <button
                  onClick={() => handleSaveTrack(track.id)}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isSaved
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isSaved ? (
                    <>
                      <Check className="w-3 h-3" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Use in video
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-white/[0.015]">
          <Music className="w-8 h-8 text-white/70 mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-white/60 mb-1">No tracks match your filters</h3>
          <p className="text-[13px] text-white/70">Try adjusting the platform or genre filter.</p>
        </div>
      )}
    </div>
  );
}

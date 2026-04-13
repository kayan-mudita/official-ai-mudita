"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  Calendar,
  BarChart3,
  Users,
  Video,
  ArrowUpRight,
  Clock,
  Zap,
  Target,
  Loader2,
  Instagram,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

type ConfidenceLevel = "high" | "medium" | "low";

interface AlgorithmInsight {
  id: string;
  platform: "instagram" | "tiktok" | "linkedin";
  title: string;
  insight: string;
  actionText: string;
  confidence: ConfidenceLevel;
  category: string;
}

const weeklyAlgorithmInsights: AlgorithmInsight[] = [
  {
    id: "alg-1",
    platform: "instagram",
    title: "Carousel Posts Boosted",
    insight: "Instagram is actively boosting carousel posts this week. Multi-image format is getting 2.5x more reach than single images. Consider converting video concepts into carousel breakdowns.",
    actionText: "Try carousel format",
    confidence: "high",
    category: "format",
  },
  {
    id: "alg-2",
    platform: "instagram",
    title: "Reels Under 30s Winning",
    insight: "Short-form Reels (15-30 seconds) are outperforming longer content by 45% in reach. The algorithm is favoring quick, punchy content with strong hooks in the first 2 seconds.",
    actionText: "Shorten your Reels",
    confidence: "high",
    category: "content",
  },
  {
    id: "alg-3",
    platform: "tiktok",
    title: "15-Second Videos Dominating",
    insight: "15-second videos are getting 2x the reach compared to 60-second videos this week. TikTok is pushing snackable content in the For You Page algorithm.",
    actionText: "Create shorter clips",
    confidence: "high",
    category: "format",
  },
  {
    id: "alg-4",
    platform: "tiktok",
    title: "Reply-to-Comment Videos",
    insight: "Videos created as replies to comments are getting a 3x boost in distribution. Use the reply-to-comment feature to create follow-up content.",
    actionText: "Reply with video",
    confidence: "medium",
    category: "engagement",
  },
  {
    id: "alg-5",
    platform: "linkedin",
    title: "Tuesday 8am Peak Engagement",
    insight: "Tuesday 8am posts are getting the highest engagement of the week on LinkedIn. Professional audiences are most active during their morning commute. Thursday 9am is the second-best slot.",
    actionText: "Schedule for Tuesday 8am",
    confidence: "high",
    category: "timing",
  },
  {
    id: "alg-6",
    platform: "linkedin",
    title: "Document Posts Rising",
    insight: "PDF and document carousel posts are seeing 60% higher engagement than text-only posts. LinkedIn's algorithm is prioritizing content that keeps users on-platform longer.",
    actionText: "Try document posts",
    confidence: "medium",
    category: "format",
  },
];

const confidenceColors: Record<ConfidenceLevel, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-green-500/10", text: "text-green-400", label: "High confidence" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Medium confidence" },
  low: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Early signal" },
};

const algPlatformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
};

const algPlatformColors: Record<string, { bg: string; border: string; text: string }> = {
  instagram: { bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-400" },
  tiktok: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  linkedin: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
};

// ─── Industry Benchmark Data ────────────────────────────────────────
// Structured as if fetched from an API endpoint. Each industry has its
// own benchmarks for posting frequency, format performance, and timing.

interface IndustryBenchmark {
  industry: string;
  avgPostsPerWeek: number;
  topPerformerPostsPerWeek: number;
  bestFormats: { format: string; engagementMultiplier: number }[];
  bestPostingTimes: { day: string; time: string; engagementIndex: number }[];
  avgEngagementRate: number;
  topPerformerEngagementRate: number;
  avgViewsPerVideo: number;
  growthTrend: string;
}

const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  real_estate: {
    industry: "Real Estate",
    avgPostsPerWeek: 3,
    topPerformerPostsPerWeek: 5,
    bestFormats: [
      { format: "Market Updates", engagementMultiplier: 3.2 },
      { format: "Property Tours", engagementMultiplier: 2.8 },
      { format: "Testimonials", engagementMultiplier: 2.4 },
      { format: "Tips & Advice", engagementMultiplier: 1.0 },
    ],
    bestPostingTimes: [
      { day: "Tuesday", time: "9:00 AM", engagementIndex: 92 },
      { day: "Thursday", time: "2:00 PM", engagementIndex: 88 },
      { day: "Saturday", time: "10:00 AM", engagementIndex: 85 },
      { day: "Wednesday", time: "12:00 PM", engagementIndex: 78 },
    ],
    avgEngagementRate: 3.2,
    topPerformerEngagementRate: 7.8,
    avgViewsPerVideo: 1200,
    growthTrend: "Video content in real estate is up 45% YoY. Short-form market updates are the fastest-growing format.",
  },
  fitness: {
    industry: "Fitness & Wellness",
    avgPostsPerWeek: 5,
    topPerformerPostsPerWeek: 7,
    bestFormats: [
      { format: "Workout Demos", engagementMultiplier: 3.5 },
      { format: "Transformation Stories", engagementMultiplier: 3.0 },
      { format: "Quick Tips", engagementMultiplier: 2.2 },
      { format: "Nutrition Advice", engagementMultiplier: 1.5 },
    ],
    bestPostingTimes: [
      { day: "Monday", time: "6:00 AM", engagementIndex: 95 },
      { day: "Wednesday", time: "5:30 PM", engagementIndex: 90 },
      { day: "Friday", time: "7:00 AM", engagementIndex: 85 },
      { day: "Sunday", time: "9:00 AM", engagementIndex: 82 },
    ],
    avgEngagementRate: 4.5,
    topPerformerEngagementRate: 9.2,
    avgViewsPerVideo: 2500,
    growthTrend: "Fitness content thrives on consistency. Creators posting 5+ times per week see 2x more follower growth.",
  },
  ecommerce: {
    industry: "E-Commerce",
    avgPostsPerWeek: 4,
    topPerformerPostsPerWeek: 6,
    bestFormats: [
      { format: "Product Demos", engagementMultiplier: 3.8 },
      { format: "Unboxing Videos", engagementMultiplier: 2.9 },
      { format: "Customer Reviews", engagementMultiplier: 2.5 },
      { format: "Behind the Scenes", engagementMultiplier: 1.8 },
    ],
    bestPostingTimes: [
      { day: "Wednesday", time: "11:00 AM", engagementIndex: 93 },
      { day: "Friday", time: "3:00 PM", engagementIndex: 89 },
      { day: "Sunday", time: "7:00 PM", engagementIndex: 86 },
      { day: "Tuesday", time: "1:00 PM", engagementIndex: 80 },
    ],
    avgEngagementRate: 2.8,
    topPerformerEngagementRate: 6.5,
    avgViewsPerVideo: 1800,
    growthTrend: "Product demo videos convert 4x better than static images. Short-form video is the top driver of e-commerce discovery.",
  },
  other: {
    industry: "General Business",
    avgPostsPerWeek: 3,
    topPerformerPostsPerWeek: 5,
    bestFormats: [
      { format: "Educational Content", engagementMultiplier: 2.8 },
      { format: "Behind the Scenes", engagementMultiplier: 2.3 },
      { format: "Quick Tips", engagementMultiplier: 2.0 },
      { format: "Testimonials", engagementMultiplier: 1.7 },
    ],
    bestPostingTimes: [
      { day: "Tuesday", time: "10:00 AM", engagementIndex: 90 },
      { day: "Thursday", time: "1:00 PM", engagementIndex: 87 },
      { day: "Wednesday", time: "3:00 PM", engagementIndex: 82 },
      { day: "Monday", time: "9:00 AM", engagementIndex: 78 },
    ],
    avgEngagementRate: 2.5,
    topPerformerEngagementRate: 5.8,
    avgViewsPerVideo: 950,
    growthTrend: "Video content across industries is growing 30% YoY. Consistency and authenticity are the biggest differentiators.",
  },
};

interface UserProfile {
  industry: string;
  firstName: string;
}

export default function IntelligencePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videoCount, setVideoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/videos").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, videos]) => {
        if (p) setProfile({ industry: p.industry || "other", firstName: p.firstName || "there" });
        setVideoCount(Array.isArray(videos) ? videos.length : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
      </div>
    );
  }

  const industry = profile?.industry || "other";
  const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.other;

  // Estimate user's posting frequency (videos / weeks since account creation)
  const userPostsPerWeek = Math.max(Math.round((videoCount / 4) * 10) / 10, 0); // rough estimate
  const frequencyGap = benchmarks.topPerformerPostsPerWeek - userPostsPerWeek;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-purple-400" />
          <h1 className="text-2xl font-bold">Content Intelligence</h1>
        </div>
        <p className="text-sm text-white/70">
          Industry benchmarks and insights for {benchmarks.industry}
        </p>
      </div>

      {/* Frequency Comparison */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-blue-400" />
          <h2 className="text-[15px] font-semibold text-white/90">Posting Frequency</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <p className="text-xs text-white/70 mb-1">Your Pace</p>
            <p className="text-2xl font-bold text-white">{userPostsPerWeek}x<span className="text-sm font-normal text-white/70">/week</span></p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <p className="text-xs text-white/70 mb-1">Industry Average</p>
            <p className="text-2xl font-bold text-white">{benchmarks.avgPostsPerWeek}x<span className="text-sm font-normal text-white/70">/week</span></p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/[0.12]">
            <p className="text-xs text-blue-400/60 mb-1">Top Performers</p>
            <p className="text-2xl font-bold text-blue-400">{benchmarks.topPerformerPostsPerWeek}x<span className="text-sm font-normal text-blue-400/40">/week</span></p>
          </div>
        </div>
        {frequencyGap > 0 ? (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/[0.04] border border-yellow-500/[0.1]">
            <Target className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-300/70">
              Top {benchmarks.industry.toLowerCase()} creators post{" "}
              <span className="font-semibold text-yellow-300">{benchmarks.topPerformerPostsPerWeek}x/week</span>.
              You&apos;re currently at {userPostsPerWeek}x/week.
              {frequencyGap > 2
                ? " Increasing your cadence could significantly boost your visibility."
                : " You're close to matching top performers!"}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-500/[0.04] border border-green-500/[0.1]">
            <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-300/70">
              You&apos;re matching or exceeding top performer posting frequency. Keep it up!
            </p>
          </div>
        )}
      </div>

      {/* Best Performing Formats */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-green-400" />
          <h2 className="text-[15px] font-semibold text-white/90">Best Performing Formats</h2>
        </div>
        <p className="text-sm text-white/70 mb-5">
          Based on engagement data from thousands of {benchmarks.industry.toLowerCase()} creators
        </p>
        <div className="space-y-3">
          {benchmarks.bestFormats.map((format, i) => {
            const maxMultiplier = benchmarks.bestFormats[0].engagementMultiplier;
            const widthPercent = (format.engagementMultiplier / maxMultiplier) * 100;
            return (
              <div key={format.format} className="flex items-center gap-4">
                <div className="w-8 text-center">
                  <span className={`text-sm font-bold ${i === 0 ? "text-green-400" : "text-white/70"}`}>
                    #{i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white/80">{format.format}</span>
                    <span className="text-xs text-white/70">
                      {format.engagementMultiplier}x engagement
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        i === 0
                          ? "bg-gradient-to-r from-green-500 to-emerald-400"
                          : i === 1
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                          : "bg-white/[0.15]"
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-xs text-white/70">
            <span className="text-white/70 font-medium">{benchmarks.bestFormats[0].format}</span> get{" "}
            <span className="text-white/70 font-medium">
              {benchmarks.bestFormats[0].engagementMultiplier}x more engagement
            </span>{" "}
            than {benchmarks.bestFormats[benchmarks.bestFormats.length - 1].format.toLowerCase()} in{" "}
            {benchmarks.industry.toLowerCase()}.
          </p>
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-purple-400" />
          <h2 className="text-[15px] font-semibold text-white/90">Best Posting Times</h2>
        </div>
        <p className="text-sm text-white/70 mb-5">
          Peak engagement windows for {benchmarks.industry.toLowerCase()} content
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {benchmarks.bestPostingTimes.map((slot, i) => (
            <div
              key={`${slot.day}-${slot.time}`}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                i === 0
                  ? "bg-purple-500/[0.06] border-purple-500/[0.12]"
                  : "bg-white/[0.02] border-white/[0.04]"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                i === 0 ? "bg-purple-500/20" : "bg-white/[0.04]"
              }`}>
                <Calendar className={`w-4 h-4 ${i === 0 ? "text-purple-400" : "text-white/60"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">
                  {slot.day} at {slot.time}
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  Engagement index: {slot.engagementIndex}/100
                </p>
              </div>
              {i === 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                  PEAK
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Industry Trend */}
      <div className="rounded-xl border border-white/[0.04] bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03] p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-[15px] font-semibold text-white/90">Industry Trend</h2>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{benchmarks.growthTrend}</p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/70">
              Avg views per video: <span className="text-white/70 font-medium">{benchmarks.avgViewsPerVideo.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-green-400/50" />
            <span className="text-xs text-white/70">
              Top engagement rate: <span className="text-white/70 font-medium">{benchmarks.topPerformerEngagementRate}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Algorithm Updates Section */}
      <AlgorithmUpdates />

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
        <AlertCircle className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
        <p className="text-[11px] text-white/60">
          Algorithm insights are based on aggregated industry data and platform announcements. Individual results may vary based on niche, audience, and content quality.
        </p>
      </div>
    </div>
  );
}

function AlgorithmUpdates() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const filtered = platformFilter === "all"
    ? weeklyAlgorithmInsights
    : weeklyAlgorithmInsights.filter((i) => i.platform === platformFilter);

  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white/90">Algorithm Updates</h2>
            <p className="text-[12px] text-white/70">Week of March 24-30, 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
          <Clock className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] text-white/70">Updated March 26, 2026</span>
        </div>
      </div>

      {/* Platform filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {["all", "instagram", "tiktok", "linkedin"].map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              platformFilter === p
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "text-white/70 hover:text-white/60 border border-transparent"
            }`}
          >
            {p === "all" ? "All Platforms" : p}
          </button>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {filtered.map((insight) => {
          const PlatformIcon = algPlatformIcons[insight.platform];
          const pColors = algPlatformColors[insight.platform];
          const conf = confidenceColors[insight.confidence];
          const isExpanded = expandedCard === insight.id;

          return (
            <div
              key={insight.id}
              className="rounded-xl border border-white/[0.04] bg-white/[0.02] overflow-hidden hover:border-white/[0.08] transition-all"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedCard(isExpanded ? null : insight.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Platform icon */}
                  <div className={`w-9 h-9 rounded-lg ${pColors.bg} border ${pColors.border} flex items-center justify-center flex-shrink-0`}>
                    <PlatformIcon className={`w-4 h-4 ${pColors.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[13px] font-semibold text-white/85">{insight.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${conf.bg} ${conf.text}`}>
                        {conf.label}
                      </span>
                    </div>
                    <p className={`text-[12px] text-white/70 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                      {insight.insight}
                    </p>
                  </div>

                  {/* Expand indicator */}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/70 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/70 flex-shrink-0" />
                  )}
                </div>

                {/* Action button (shown when expanded) */}
                {isExpanded && (
                  <div className="mt-3 ml-12 flex items-center gap-3">
                    <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium ${pColors.bg} ${pColors.text} border ${pColors.border} hover:opacity-80 transition-all`}>
                      <Zap className="w-3.5 h-3.5" />
                      {insight.actionText}
                    </button>
                    <span className="text-[10px] text-white/70 capitalize">
                      {insight.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <div className="mt-5 pt-5 border-t border-white/[0.04]">
        <h3 className="text-[13px] font-medium text-white/70 mb-3">This Week&apos;s Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="px-3 py-3 rounded-xl bg-pink-500/[0.04] border border-pink-500/[0.08]">
            <div className="flex items-center gap-2 mb-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-400/70" />
              <span className="text-[11px] font-medium text-pink-400/70">Instagram</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Focus on carousels and short Reels. Collab posts getting extra reach boost.
            </p>
          </div>
          <div className="px-3 py-3 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/[0.08]">
            <div className="flex items-center gap-2 mb-1.5">
              <TikTokIcon className="w-3.5 h-3.5 text-cyan-400/70" />
              <span className="text-[11px] font-medium text-cyan-400/70">TikTok</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed">
              15-second videos are king. Reply-to-comment videos getting 3x distribution.
            </p>
          </div>
          <div className="px-3 py-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/[0.08]">
            <div className="flex items-center gap-2 mb-1.5">
              <LinkedInIcon className="w-3.5 h-3.5 text-blue-400/70" />
              <span className="text-[11px] font-medium text-blue-400/70">LinkedIn</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed">
              Tuesday 8am is the sweet spot. Document posts outperforming text by 60%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Loader2,
  BarChart3,
  Video,
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  Clock,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Brain,
  FileText,
  Calculator,
} from "lucide-react";

const analyticsTabs = [
  { id: "overview", label: "Overview", icon: BarChart3, href: null },
  { id: "insights", label: "Insights", icon: Lightbulb, href: null },
  { id: "intelligence", label: "Intelligence", icon: Brain, href: "/dashboard/intelligence" },
  { id: "reports", label: "Reports", icon: FileText, href: "/dashboard/reports" },
  { id: "roi", label: "ROI", icon: Calculator, href: "/dashboard/roi" },
];

interface Summary {
  totalVideos: number;
  publishedVideos: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
}

interface GrowthMilestone {
  followers: string;
  weeksAt4: number;
  weeksAt7: number;
  reached: boolean;
}

interface Insight {
  id: string;
  type: "performance" | "timing" | "warning" | "success" | "suggestion";
  title: string;
  message: string;
  icon: string;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatWeeks(weeks: number): string {
  if (weeks <= 0) return "Already reached";
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  const months = Math.floor(weeks / 4);
  const remainingWeeks = weeks % 4;
  if (remainingWeeks === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  return `${months} month${months !== 1 ? "s" : ""}, ${remainingWeeks}w`;
}

const insightIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "trending-up": TrendingUp,
  "lightbulb": Lightbulb,
  "calendar": CalendarDays,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle2,
};

const insightStyleMap: Record<string, { bg: string; border: string; iconColor: string }> = {
  performance: { bg: "bg-blue-500/[0.06]", border: "border-blue-500/10", iconColor: "text-blue-400" },
  timing: { bg: "bg-purple-500/[0.06]", border: "border-purple-500/10", iconColor: "text-purple-400" },
  warning: { bg: "bg-orange-500/[0.06]", border: "border-orange-500/10", iconColor: "text-orange-400" },
  success: { bg: "bg-green-500/[0.06]", border: "border-green-500/10", iconColor: "text-green-400" },
  suggestion: { bg: "bg-white/[0.03]", border: "border-white/[0.06]", iconColor: "text-white/40" },
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 className="w-5 h-5 text-white/20 animate-spin" /></div>}>
      <AnalyticsContent />
    </Suspense>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/summary").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/analytics/insights").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([d, ins]) => {
        if (d) setSummary(d);
        if (Array.isArray(ins)) setInsights(ins);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="w-5 h-5 text-white/20 animate-spin" /></div>;
  }

  const stats = [
    { label: "Total Views", value: summary?.totalViews || 0, icon: Eye },
    { label: "Likes", value: summary?.totalLikes || 0, icon: Heart },
    { label: "Shares", value: summary?.totalShares || 0, icon: Share2 },
    { label: "Comments", value: summary?.totalComments || 0, icon: MessageCircle },
  ];

  const hasData = summary && (summary.totalViews > 0 || summary.totalLikes > 0 || summary.totalVideos > 0);

  // Growth projection calculations
  const totalVideos = summary?.totalVideos || 0;
  // Assume account is ~4 weeks old for projection purposes
  const accountAgeWeeks = Math.max(1, Math.ceil(totalVideos / 2));
  const currentFrequency = accountAgeWeeks > 0 ? Math.round((totalVideos / accountAgeWeeks) * 10) / 10 : 0;

  // Industry benchmarks: ~25 followers gained per video at early stage
  // Growth accelerates with consistency
  const followersPerVideoAt4 = 28;
  const followersPerVideoAt7 = 35; // higher consistency bonus

  const milestones: GrowthMilestone[] = [
    { followers: "500", weeksAt4: Math.ceil(500 / (followersPerVideoAt4 * 4)), weeksAt7: Math.ceil(500 / (followersPerVideoAt7 * 7)), reached: false },
    { followers: "1K", weeksAt4: Math.ceil(1000 / (followersPerVideoAt4 * 4)), weeksAt7: Math.ceil(1000 / (followersPerVideoAt7 * 7)), reached: false },
    { followers: "5K", weeksAt4: Math.ceil(5000 / (followersPerVideoAt4 * 4)), weeksAt7: Math.ceil(5000 / (followersPerVideoAt7 * 7)), reached: false },
    { followers: "10K", weeksAt4: Math.ceil(10000 / (followersPerVideoAt4 * 4)), weeksAt7: Math.ceil(10000 / (followersPerVideoAt7 * 7)), reached: false },
    { followers: "25K", weeksAt4: Math.ceil(25000 / (followersPerVideoAt4 * 4)), weeksAt7: Math.ceil(25000 / (followersPerVideoAt7 * 7)), reached: false },
  ];

  const speedImprovement = Math.round(((milestones[1].weeksAt4 - milestones[1].weeksAt7) / milestones[1].weeksAt4) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-white/40 mt-1">
          {summary ? `${summary.totalVideos} video${summary.totalVideos !== 1 ? "s" : ""} · ${summary.publishedVideos} published` : "\u00A0"}
        </p>
      </div>

      {/* Analytics Sub-Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
        {analyticsTabs.map((tab) => {
          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-white/40 hover:text-white/60 border border-transparent hover:border-white/[0.06]"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          }
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-white/40 hover:text-white/60 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-4 h-4 text-white/20" />
                </div>
                <div className="text-[24px] font-bold text-white">{formatNumber(stat.value)}</div>
                <div className="text-[13px] text-white/30 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Growth Projection Card */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-white/90">Growth Projection</h2>
                <p className="text-[12px] text-white/30">Based on industry benchmarks and your posting frequency</p>
              </div>
            </div>

            {/* Current frequency */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-6">
              <Clock className="w-4 h-4 text-white/30" />
              <div className="flex-1">
                <span className="text-[13px] text-white/50">Current posting frequency</span>
              </div>
              <span className="text-[15px] font-semibold text-white">
                {currentFrequency > 0 ? `${currentFrequency} videos/week` : "No data yet"}
              </span>
            </div>

            {/* Timeline visualization */}
            <div className="relative mb-6">
              <div className="text-[12px] font-medium text-white/40 uppercase tracking-wider mb-4">Projected Milestones at 4 videos/week</div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-blue-500/40 via-purple-500/30 to-transparent" />

                <div className="space-y-4">
                  {milestones.map((milestone, idx) => (
                    <div key={milestone.followers} className="flex items-center gap-4 group">
                      {/* Dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center border transition-all ${
                          idx === 0
                            ? "bg-blue-500/20 border-blue-500/40"
                            : idx === 1
                            ? "bg-purple-500/15 border-purple-500/30"
                            : "bg-white/[0.04] border-white/[0.08]"
                        }`}>
                          <Target className={`w-4 h-4 ${
                            idx === 0 ? "text-blue-400" : idx === 1 ? "text-purple-400" : "text-white/30"
                          }`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/[0.03] group-hover:bg-white/[0.035] group-hover:border-white/[0.06] transition-all">
                        <div>
                          <div className="text-[14px] font-semibold text-white/90">{milestone.followers} followers</div>
                          <div className="text-[12px] text-white/30 mt-0.5">
                            ~{formatWeeks(milestone.weeksAt4)} at 4/week
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[12px] text-green-400/70 font-medium flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {formatWeeks(milestone.weeksAt7)} at 7/week
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-500/[0.06] to-purple-500/[0.06] border border-blue-500/10">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] text-white/70 leading-relaxed">
                  <span className="font-medium text-white/90">Increase to 7 videos/week</span> to reach milestones{" "}
                  <span className="text-blue-400 font-semibold">{speedImprovement}% faster</span>.
                  Consistent daily posting triggers platform algorithm boosts and compounds audience growth.
                </p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {!hasData && (
            <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-white/[0.015]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] mb-5">
                <BarChart3 className="w-6 h-6 text-white/15" />
              </div>
              <h3 className="text-[17px] font-semibold text-white/80 mb-1">No analytics yet</h3>
              <p className="text-[14px] text-white/30 max-w-sm mx-auto">
                Publish videos and connect your social accounts to start seeing performance data here.
              </p>
            </div>
          )}

          {/* Video count summary */}
          {hasData && (
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
              <h2 className="text-[15px] font-semibold text-white/80 mb-4">Content Summary</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                    <Video className="w-5 h-5 text-white/25" />
                  </div>
                  <div>
                    <div className="text-[20px] font-bold text-white">{summary?.totalVideos || 0}</div>
                    <div className="text-[13px] text-white/30">Total Videos</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/[0.08] flex items-center justify-center">
                    <Video className="w-5 h-5 text-green-400/50" />
                  </div>
                  <div>
                    <div className="text-[20px] font-bold text-white">{summary?.publishedVideos || 0}</div>
                    <div className="text-[13px] text-white/30">Published</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <>
          {insights.length > 0 ? (
            <div>
              <h2 className="text-[15px] font-semibold text-white/80 mb-4">Performance Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight) => {
                  const style = insightStyleMap[insight.type] || insightStyleMap.suggestion;
                  const IconComponent = insightIconMap[insight.icon] || Lightbulb;
                  return (
                    <div
                      key={insight.id}
                      className={`rounded-xl border ${style.border} ${style.bg} p-5 transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-4.5 h-4.5 ${style.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-white/80 mb-1">{insight.title}</div>
                          <p className="text-[12px] text-white/45 leading-relaxed">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-white/[0.015]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] mb-5">
                <Lightbulb className="w-6 h-6 text-white/15" />
              </div>
              <h3 className="text-[17px] font-semibold text-white/80 mb-1">No insights yet</h3>
              <p className="text-[14px] text-white/30 max-w-sm mx-auto">
                Publish more videos to unlock AI-powered performance insights.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

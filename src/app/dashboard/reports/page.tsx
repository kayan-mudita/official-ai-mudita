"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Loader2,
  Video,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Trophy,
  Calendar,
  Download,
  ArrowUpRight,
  Lightbulb,
  BarChart3,
} from "lucide-react";

interface MonthlyReport {
  period: {
    month: string;
    year: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalVideosPosted: number;
    publishedVideos: number;
    totalEstimatedReach: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
  };
  bestPerformingVideo: {
    id: string;
    title: string;
    contentType: string;
    views: number;
    engagement: number;
    createdAt: string;
  } | null;
  growth: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
    trend: "up" | "down" | "flat";
  };
  roi: {
    estimatedCost: number;
    estimatedEngagementValue: number;
    roiPercentage: number;
  };
  contentTypeBreakdown: Record<string, number>;
  recommendations: string[];
  generatedAt: string;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatContentType(ct: string): string {
  return ct
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function ReportsPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/reports/monthly")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setReport(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDownload() {
    if (!reportRef.current || !report) return;

    // Create a printable version
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Report - ${report.period.month} ${report.period.year} | Official AI</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; color: #333; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .stat-card { background: #f8f9fa; border-radius: 12px; padding: 16px; }
          .stat-value { font-size: 24px; font-weight: 700; }
          .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
          .recommendation { padding: 12px 16px; background: #f0f4ff; border-radius: 8px; margin-bottom: 8px; font-size: 14px; color: #333; }
          .section { margin-bottom: 24px; padding: 20px; background: #fafafa; border-radius: 12px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Monthly Content Report</h1>
        <p class="subtitle">${report.period.month} ${report.period.year} | Official AI</p>

        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">${report.summary.totalVideosPosted}</div><div class="stat-label">Videos Posted</div></div>
          <div class="stat-card"><div class="stat-value">${formatNumber(report.summary.totalEstimatedReach)}</div><div class="stat-label">Est. Reach</div></div>
          <div class="stat-card"><div class="stat-value">${formatNumber(report.summary.totalViews)}</div><div class="stat-label">Total Views</div></div>
          <div class="stat-card"><div class="stat-value">${report.growth.growthRate}%</div><div class="stat-label">Growth Rate</div></div>
        </div>

        ${report.bestPerformingVideo ? `
        <div class="section">
          <h2>Best Performing Video</h2>
          <p><strong>${report.bestPerformingVideo.title}</strong></p>
          <p>Type: ${formatContentType(report.bestPerformingVideo.contentType)} | Engagement: ${report.bestPerformingVideo.engagement}</p>
        </div>
        ` : ""}

        <div class="section">
          <h2>Engagement Breakdown</h2>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-value">${formatNumber(report.summary.totalViews)}</div><div class="stat-label">Views</div></div>
            <div class="stat-card"><div class="stat-value">${formatNumber(report.summary.totalLikes)}</div><div class="stat-label">Likes</div></div>
            <div class="stat-card"><div class="stat-value">${formatNumber(report.summary.totalShares)}</div><div class="stat-label">Shares</div></div>
            <div class="stat-card"><div class="stat-value">${formatNumber(report.summary.totalComments)}</div><div class="stat-label">Comments</div></div>
          </div>
        </div>

        <div class="section">
          <h2>ROI Summary</h2>
          <p>Estimated Cost: ${formatCurrency(report.roi.estimatedCost)}</p>
          <p>Estimated Engagement Value: ${formatCurrency(report.roi.estimatedEngagementValue)}</p>
          <p>ROI: ${report.roi.roiPercentage}%</p>
        </div>

        <h2>Recommendations for Next Month</h2>
        ${report.recommendations.map(r => `<div class="recommendation">${r}</div>`).join("")}

        <div class="footer">
          <p>Generated on ${new Date(report.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} by Official AI</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] mb-5">
            <FileText className="w-6 h-6 text-white/70" />
          </div>
          <h3 className="text-[17px] font-semibold text-white/80 mb-1">No report available</h3>
          <p className="text-[14px] text-white/70 max-w-sm mx-auto">
            Start creating and publishing videos to generate your monthly performance report.
          </p>
        </div>
      </div>
    );
  }

  const trendIcon = report.growth.trend === "up"
    ? <TrendingUp className="w-4 h-4 text-green-400" />
    : report.growth.trend === "down"
    ? <TrendingDown className="w-4 h-4 text-red-400" />
    : <Minus className="w-4 h-4 text-white/70" />;

  const trendColor = report.growth.trend === "up"
    ? "text-green-400"
    : report.growth.trend === "down"
    ? "text-red-400"
    : "text-white/70";

  const contentTypes = Object.entries(report.contentTypeBreakdown).sort(([, a], [, b]) => b - a);
  const maxContentCount = contentTypes.length > 0 ? contentTypes[0][1] : 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6" ref={reportRef}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Report</h1>
          <p className="text-sm text-white/70 mt-1">
            {report.period.month} {report.period.year} Performance Summary
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] text-sm text-white/60 font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all border border-white/[0.04]"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="flex items-center justify-between mb-3">
            <Video className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-[24px] font-bold text-white">{report.summary.totalVideosPosted}</div>
          <div className="text-[13px] text-white/70 mt-0.5">Videos Posted</div>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="flex items-center justify-between mb-3">
            <Eye className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-[24px] font-bold text-white">{formatNumber(report.summary.totalEstimatedReach)}</div>
          <div className="text-[13px] text-white/70 mt-0.5">Est. Reach</div>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="flex items-center justify-between mb-3">
            <Eye className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-[24px] font-bold text-white">{formatNumber(report.summary.totalViews)}</div>
          <div className="text-[13px] text-white/70 mt-0.5">Total Views</div>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="flex items-center justify-between mb-3">
            {trendIcon}
          </div>
          <div className={`text-[24px] font-bold ${trendColor}`}>
            {report.growth.growthRate > 0 ? "+" : ""}{report.growth.growthRate}%
          </div>
          <div className="text-[13px] text-white/70 mt-0.5">Growth Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Breakdown */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
          <h2 className="text-[15px] font-semibold text-white/80 mb-4">Engagement Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white/90">{formatNumber(report.summary.totalViews)}</div>
                  <div className="text-[11px] text-white/70">Views</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white/90">{formatNumber(report.summary.totalLikes)}</div>
                  <div className="text-[11px] text-white/70">Likes</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white/90">{formatNumber(report.summary.totalShares)}</div>
                  <div className="text-[11px] text-white/70">Shares</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white/90">{formatNumber(report.summary.totalComments)}</div>
                  <div className="text-[11px] text-white/70">Comments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth & ROI */}
        <div className="space-y-6">
          {/* Growth */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
            <h2 className="text-[15px] font-semibold text-white/80 mb-4">Month-over-Month Growth</h2>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[11px] text-white/70 mb-1">This Month</div>
                <div className="text-[20px] font-bold text-white">{report.growth.thisMonth} videos</div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className={`w-5 h-5 ${trendColor}`} />
              </div>
              <div>
                <div className="text-[11px] text-white/70 mb-1">Last Month</div>
                <div className="text-[20px] font-bold text-white/70">{report.growth.lastMonth} videos</div>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-green-400" />
              <h2 className="text-[15px] font-semibold text-white/80">ROI Estimate</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] text-white/70 mb-1">Est. Cost</div>
                <div className="text-[16px] font-bold text-white">{formatCurrency(report.roi.estimatedCost)}</div>
              </div>
              <div>
                <div className="text-[11px] text-white/70 mb-1">Eng. Value</div>
                <div className="text-[16px] font-bold text-white">{formatCurrency(report.roi.estimatedEngagementValue)}</div>
              </div>
              <div>
                <div className="text-[11px] text-white/70 mb-1">ROI</div>
                <div className={`text-[16px] font-bold ${report.roi.roiPercentage > 0 ? "text-green-400" : "text-white/70"}`}>
                  {report.roi.roiPercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Performing Video */}
      {report.bestPerformingVideo && (
        <div className="rounded-xl border border-white/[0.04] bg-gradient-to-r from-yellow-500/[0.03] to-orange-500/[0.03] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-[15px] font-semibold text-white/90">Best Performing Video</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-yellow-400/60" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-white/90 truncate">{report.bestPerformingVideo.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[12px] text-white/70">{formatContentType(report.bestPerformingVideo.contentType)}</span>
                <span className="text-[12px] text-white/70">|</span>
                <span className="text-[12px] text-white/70">{report.bestPerformingVideo.engagement} engagements</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Type Breakdown */}
      {contentTypes.length > 0 && (
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h2 className="text-[15px] font-semibold text-white/80">Content Mix</h2>
          </div>
          <div className="space-y-3">
            {contentTypes.map(([type, count]) => {
              const widthPercent = (count / maxContentCount) * 100;
              return (
                <div key={type} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0">
                    <span className="text-[13px] text-white/60 font-medium">{formatContentType(type)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[12px] text-white/70 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <h2 className="text-[15px] font-semibold text-white/80">Recommendations for Next Month</h2>
          </div>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="text-[12px] font-bold text-blue-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-[13px] text-white/70 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report generation time */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
        <Calendar className="w-3.5 h-3.5 text-white/70" />
        <p className="text-[11px] text-white/60">
          Report generated on {new Date(report.generatedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

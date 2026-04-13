"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Calculator,
  DollarSign,
  Eye,
  Users,
  TrendingUp,
  Share2,
  Video,
  Building2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Link2,
  Copy,
  Check,
} from "lucide-react";

// ─── ROI Calculation Constants by Industry ──────────────────────────
// Structured as if served from an API. Each industry has different
// conversion rates and deal sizes.

interface IndustryROIConfig {
  label: string;
  avgViewsPerVideo: number;
  leadConversionRate: number; // % of viewers who become leads
  dealCloseRate: number; // % of leads that close
  avgDealSize: number;
  monthlySubscriptionCost: number;
}

const INDUSTRY_ROI: Record<string, IndustryROIConfig> = {
  real_estate: {
    label: "Real Estate",
    avgViewsPerVideo: 1200,
    leadConversionRate: 0.02,
    dealCloseRate: 0.15,
    avgDealSize: 12000,
    monthlySubscriptionCost: 99,
  },
  fitness: {
    label: "Fitness & Wellness",
    avgViewsPerVideo: 2500,
    leadConversionRate: 0.03,
    dealCloseRate: 0.25,
    avgDealSize: 200,
    monthlySubscriptionCost: 99,
  },
  ecommerce: {
    label: "E-Commerce",
    avgViewsPerVideo: 1800,
    leadConversionRate: 0.025,
    dealCloseRate: 0.08,
    avgDealSize: 85,
    monthlySubscriptionCost: 99,
  },
  other: {
    label: "General Business",
    avgViewsPerVideo: 950,
    leadConversionRate: 0.015,
    dealCloseRate: 0.12,
    avgDealSize: 2500,
    monthlySubscriptionCost: 99,
  },
};

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
}

export default function ROIPage() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form inputs
  const [videosPerMonth, setVideosPerMonth] = useState(8);
  const [industry, setIndustry] = useState("real_estate");
  const [avgDealSize, setAvgDealSize] = useState(12000);

  // Load user data to pre-fill
  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/videos").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([profile, videos]) => {
        if (profile?.industry) {
          const ind = profile.industry || "other";
          setIndustry(ind);
          const config = INDUSTRY_ROI[ind] || INDUSTRY_ROI.other;
          setAvgDealSize(config.avgDealSize);
        }
        if (Array.isArray(videos) && videos.length > 0) {
          // Estimate monthly video rate from actual data
          const oldestDate = new Date(videos[videos.length - 1]?.createdAt || Date.now());
          const monthsActive = Math.max(
            (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
            1
          );
          const estimatedPerMonth = Math.round(videos.length / monthsActive);
          if (estimatedPerMonth > 0) setVideosPerMonth(estimatedPerMonth);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // When industry changes, update deal size default
  function handleIndustryChange(newIndustry: string) {
    setIndustry(newIndustry);
    const config = INDUSTRY_ROI[newIndustry] || INDUSTRY_ROI.other;
    setAvgDealSize(config.avgDealSize);
  }

  // ROI Calculations
  const calculations = useMemo(() => {
    const config = INDUSTRY_ROI[industry] || INDUSTRY_ROI.other;
    const estimatedViews = videosPerMonth * config.avgViewsPerVideo;
    const estimatedLeads = Math.round(estimatedViews * config.leadConversionRate);
    const estimatedDeals = Math.max(Math.round(estimatedLeads * config.dealCloseRate * 10) / 10, 0);
    const estimatedRevenue = estimatedDeals * avgDealSize;
    const monthlyCost = config.monthlySubscriptionCost;
    const annualRevenue = estimatedRevenue * 12;
    const annualCost = monthlyCost * 12;
    const roiMultiplier = annualCost > 0 ? Math.round((annualRevenue / annualCost) * 10) / 10 : 0;

    return {
      estimatedViews,
      estimatedLeads,
      estimatedDeals,
      estimatedRevenue,
      monthlyCost,
      annualRevenue,
      annualCost,
      roiMultiplier,
      config,
    };
  }, [videosPerMonth, industry, avgDealSize]);

  async function handleCopyLink() {
    const params = new URLSearchParams({
      v: videosPerMonth.toString(),
      i: industry,
      d: avgDealSize.toString(),
    });
    const shareUrl = `${window.location.origin}/dashboard/roi?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Load URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    const i = params.get("i");
    const d = params.get("d");
    if (v) setVideosPerMonth(parseInt(v, 10) || 8);
    if (i && INDUSTRY_ROI[i]) setIndustry(i);
    if (d) setAvgDealSize(parseInt(d, 10) || 12000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-green-400" />
          <h1 className="text-2xl font-bold">ROI Calculator</h1>
        </div>
        <p className="text-sm text-white/70">
          See the potential revenue impact of your AI video content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6 space-y-5">
            <h2 className="text-[15px] font-semibold text-white/90">Your Inputs</h2>

            {/* Videos Per Month */}
            <div>
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider block mb-2">
                Videos per Month
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={videosPerMonth}
                  onChange={(e) => setVideosPerMonth(parseInt(e.target.value, 10))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-lg font-bold text-white w-10 text-right">{videosPerMonth}</span>
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider block mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="input-field"
              >
                {Object.entries(INDUSTRY_ROI).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Average Deal Size */}
            <div>
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider block mb-2">
                Average Deal Size ($)
              </label>
              <input
                type="number"
                value={avgDealSize}
                onChange={(e) => setAvgDealSize(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="input-field"
                min={0}
              />
            </div>
          </div>

          {/* Industry defaults note */}
          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[11px] text-white/60 leading-relaxed">
              Defaults are pre-filled based on your profile and {calculations.config.label} industry benchmarks.
              Adjust to match your specific business.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key Outputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-blue-400/50" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(calculations.estimatedViews)}
              </div>
              <div className="text-xs text-white/70 mt-0.5">Estimated Monthly Views</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-purple-400/50" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(calculations.estimatedLeads)}
              </div>
              <div className="text-xs text-white/70 mt-0.5">Estimated Monthly Leads</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-400/50" />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(calculations.estimatedRevenue)}
              </div>
              <div className="text-xs text-white/70 mt-0.5">Estimated Monthly Revenue</div>
            </div>
            <div className={`rounded-xl border p-5 ${
              calculations.roiMultiplier >= 10
                ? "bg-green-500/[0.04] border-green-500/[0.12]"
                : "bg-white/[0.015] border-white/[0.04]"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`w-4 h-4 ${calculations.roiMultiplier >= 10 ? "text-green-400" : "text-white/70"}`} />
              </div>
              <div className={`text-2xl font-bold ${calculations.roiMultiplier >= 10 ? "text-green-400" : "text-white"}`}>
                {calculations.roiMultiplier}x
              </div>
              <div className="text-xs text-white/70 mt-0.5">Annual ROI Multiplier</div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
            <h3 className="text-[15px] font-semibold text-white/90 mb-4">Calculation Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-sm text-white/70">Videos per month</span>
                </div>
                <span className="text-sm font-medium text-white/70">{videosPerMonth}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-sm text-white/70">
                    Avg views per video ({calculations.config.label})
                  </span>
                </div>
                <span className="text-sm font-medium text-white/70">
                  {calculations.config.avgViewsPerVideo.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-sm text-white/70 ml-6">= Estimated monthly views</span>
                <span className="text-sm font-medium text-white/70">
                  {calculations.estimatedViews.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-sm text-white/70">
                    Lead conversion rate
                  </span>
                </div>
                <span className="text-sm font-medium text-white/70">
                  {(calculations.config.leadConversionRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="text-sm text-white/70 ml-6">= Monthly leads</span>
                <span className="text-sm font-medium text-white/70">
                  {calculations.estimatedLeads}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-sm text-white/70">
                    Deal close rate x avg deal size
                  </span>
                </div>
                <span className="text-sm font-medium text-white/70">
                  {(calculations.config.dealCloseRate * 100)}% x {formatCurrency(avgDealSize)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 bg-green-500/[0.03] px-3 -mx-3 rounded-lg">
                <span className="text-sm font-semibold text-green-400">
                  = Estimated monthly revenue
                </span>
                <span className="text-sm font-bold text-green-400">
                  {formatCurrency(calculations.estimatedRevenue)}
                </span>
              </div>
            </div>

            {/* Annual Summary */}
            <div className="mt-6 pt-4 border-t border-white/[0.04]">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-white/60 mb-1">Annual Revenue</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(calculations.annualRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Annual Cost</p>
                  <p className="text-lg font-bold text-white/60">{formatCurrency(calculations.annualCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">ROI</p>
                  <p className={`text-lg font-bold ${calculations.roiMultiplier >= 10 ? "text-green-400" : "text-white"}`}>
                    {calculations.roiMultiplier}x return
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share CTA */}
          <div className="rounded-xl border border-blue-500/[0.12] bg-gradient-to-r from-blue-500/[0.04] to-purple-500/[0.04] p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-semibold text-white/90 mb-1">
                  Share this ROI report with your team
                </h3>
                <p className="text-sm text-white/70">
                  Generate a shareable link with your current inputs pre-filled
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-white/70 hover:bg-white/[0.12] hover:text-white/90 transition-all flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copy Share Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

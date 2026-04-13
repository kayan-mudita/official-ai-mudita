"use client";

import { useState, useEffect } from "react";
import { BarChart3, Users, TrendingDown, ArrowRight } from "lucide-react";

interface FunnelStep {
  event: string;
  label: string;
  step: number;
  uniqueUsers: number;
  conversionFromSignup: number;
}

interface FunnelData {
  totalSignups: number;
  funnel: FunnelStep[];
  recentEvents: number;
}

// Only show the main steps (not sub-actions) for the visual funnel
const PRIMARY_STEPS = [
  "onboarding_step_photo",
  "onboarding_photo_captured",
  "onboarding_step_character",
  "onboarding_character_selected",
  "onboarding_step_voice",
  "onboarding_step_paywall",
  "onboarding_trial_started",
  "onboarding_industry_selected",
];

export default function FunnelDashboard() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/funnel")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-white/70">
        Failed to load funnel data
      </div>
    );
  }

  const primaryFunnel = data.funnel.filter((s) =>
    PRIMARY_STEPS.includes(s.event)
  );

  const maxUsers = Math.max(data.totalSignups, 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Onboarding Funnel
        </h1>
        <p className="text-sm text-white/70 mt-1">
          Drop-off analysis per onboarding step. Unique users who reached each stage.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
            <Users className="w-4 h-4" />
            Total Signups
          </div>
          <p className="text-3xl font-bold text-white">{data.totalSignups}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
            <TrendingDown className="w-4 h-4" />
            Trial Conversions
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {data.funnel.find((s) => s.event === "onboarding_trial_started")?.uniqueUsers || 0}
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
            <BarChart3 className="w-4 h-4" />
            Conversion Rate
          </div>
          <p className="text-3xl font-bold text-indigo-400">
            {data.funnel.find((s) => s.event === "onboarding_trial_started")?.conversionFromSignup || 0}%
          </p>
        </div>
      </div>

      {/* Funnel visualization */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-6 space-y-1">
        <h2 className="text-sm font-semibold text-white/70 mb-4">Step-by-Step Drop-off</h2>

        {/* Signup baseline */}
        <div className="flex items-center gap-4 py-3">
          <div className="w-40 text-right">
            <p className="text-sm font-semibold text-white/70">Signup</p>
          </div>
          <div className="flex-1 relative">
            <div
              className="h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600"
              style={{ width: "100%" }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
              {data.totalSignups}
            </span>
          </div>
          <div className="w-16 text-right text-sm font-mono text-white/70">100%</div>
        </div>

        {primaryFunnel.map((step, i) => {
          const widthPct = Math.max(
            (step.uniqueUsers / maxUsers) * 100,
            2
          );
          const prevUsers =
            i === 0
              ? data.totalSignups
              : primaryFunnel[i - 1]?.uniqueUsers || data.totalSignups;
          const dropoff =
            prevUsers > 0
              ? Math.round(((prevUsers - step.uniqueUsers) / prevUsers) * 100)
              : 0;

          return (
            <div key={step.event}>
              {/* Drop-off indicator */}
              {dropoff > 0 && (
                <div className="flex items-center gap-4 py-1">
                  <div className="w-40" />
                  <div className="flex-1 flex items-center gap-2 px-2">
                    <ArrowRight className="w-3 h-3 text-red-400/50" />
                    <span className="text-xs text-red-400/60">
                      -{dropoff}% dropped ({prevUsers - step.uniqueUsers} users)
                    </span>
                  </div>
                  <div className="w-16" />
                </div>
              )}

              <div className="flex items-center gap-4 py-3">
                <div className="w-40 text-right">
                  <p className="text-sm font-semibold text-white/70">
                    {step.label}
                  </p>
                </div>
                <div className="flex-1 relative">
                  <div
                    className="h-8 rounded-lg transition-all duration-500"
                    style={{
                      width: `${widthPct}%`,
                      background:
                        step.conversionFromSignup > 50
                          ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                          : step.conversionFromSignup > 20
                            ? "linear-gradient(90deg, #f59e0b, #f97316)"
                            : "linear-gradient(90deg, #ef4444, #dc2626)",
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                    {step.uniqueUsers}
                  </span>
                </div>
                <div className="w-16 text-right text-sm font-mono text-white/70">
                  {step.conversionFromSignup}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All events table */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-6">
        <h2 className="text-sm font-semibold text-white/70 mb-4">All Tracked Events</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/[0.05]">
              <th className="py-2 font-medium">Event</th>
              <th className="py-2 font-medium text-right">Users</th>
              <th className="py-2 font-medium text-right">% of Signups</th>
            </tr>
          </thead>
          <tbody>
            {data.funnel.map((step) => (
              <tr
                key={step.event}
                className="border-b border-white/[0.03] hover:bg-white/[0.02]"
              >
                <td className="py-2.5 text-white/60 font-mono text-xs">
                  {step.event}
                </td>
                <td className="py-2.5 text-right text-white/80 font-semibold">
                  {step.uniqueUsers}
                </td>
                <td className="py-2.5 text-right text-white/70">
                  {step.conversionFromSignup}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

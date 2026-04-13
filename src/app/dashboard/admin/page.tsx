"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Settings2,
  MessageSquare,
  Sparkles,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Film,
  Loader2,
} from "lucide-react";

interface ConfigRow {
  id: string;
  key: string;
  value: string;
  label: string;
  category: string;
  updatedAt: string;
}

interface CostSummary {
  totalUsers: number;
  payingUsers: number;
  totalVideosThisMonth: number;
  totalVideosAllTime: number;
  totalApiCostThisMonth: number;
  totalApiCostAllTime: number;
  revenueThisMonth: number;
  grossMargin: number;
  costPerMinute: number;
  mrrPerUser: number;
  month: string;
}

interface UserCost {
  userId: string;
  email: string;
  name: string;
  plan: string;
  totalVideos: number;
  totalPhotos: number;
  totalVoiceSamples: number;
  videosThisMonth: number;
  estimatedCostThisMonth: number;
  estimatedCostAllTime: number;
}

interface CostData {
  summary: CostSummary;
  perUser: UserCost[];
}

const MODEL_OPTIONS = [
  { value: "kling_2.6", label: "Kling 2.6" },
  { value: "seedance_2.0", label: "Seedance 2.0" },
  { value: "sora_2", label: "Sora 2" },
  { value: "ltx", label: "LTX" },
  { value: "nano_banana", label: "Nano Banana (Gemini)" },
  { value: "kling_2.6_fal", label: "Kling 2.6 (via FAL)" },
];

const TABS = [
  { id: "models", label: "Models", icon: Sparkles },
  { id: "prompts", label: "Prompts", icon: MessageSquare },
  { id: "onboarding", label: "Onboarding", icon: Settings2 },
  { id: "promo", label: "Promo", icon: Settings2 },
  { id: "costs", label: "Cost Tracking", icon: DollarSign },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [configs, setConfigs] = useState<ConfigRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("models");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [costLoading, setCostLoading] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (activeTab === "costs" && !costData) {
      loadCosts();
    }
  }, [activeTab, costData]);

  async function loadConfigs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
        const values: Record<string, string> = {};
        data.forEach((c: ConfigRow) => {
          values[c.key] = c.value;
        });
        setEditedValues(values);
      }
    } catch (err) {
      console.error("Failed to load configs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCosts() {
    setCostLoading(true);
    try {
      const res = await fetch("/api/admin/costs");
      if (res.ok) {
        const data = await res.json();
        setCostData(data);
      }
    } catch (err) {
      console.error("Failed to load costs:", err);
    } finally {
      setCostLoading(false);
    }
  }

  async function saveConfig(key: string) {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editedValues[key] }),
      });
      if (res.ok) {
        showToast(`Saved "${key}"`);
        setConfigs((prev) =>
          prev.map((c) =>
            c.key === key
              ? { ...c, value: editedValues[key], updatedAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        showToast("Failed to save");
      }
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function isChanged(key: string) {
    const original = configs.find((c) => c.key === key);
    return original && editedValues[key] !== original.value;
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const filtered = configs.filter((c) => c.category === activeTab);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <p className="text-white/70 text-sm mt-1">
          Manage AI models, prompts, and onboarding settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/70 hover:text-white/60"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading for config tabs */}
      {loading && activeTab !== "costs" && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-5 h-5 text-white/70 animate-spin" />
        </div>
      )}

      {/* Cost Tracking Tab */}
      {activeTab === "costs" && (
        <div>
          {costLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
            </div>
          )}

          {!costLoading && costData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400/60" />
                    <span className="text-[11px] text-white/70 uppercase tracking-wider">
                      Total Users
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {costData.summary.totalUsers}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    {costData.summary.payingUsers} paying
                  </p>
                </div>

                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Film className="w-4 h-4 text-purple-400/60" />
                    <span className="text-[11px] text-white/70 uppercase tracking-wider">
                      Videos This Month
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {costData.summary.totalVideosThisMonth}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    {costData.summary.totalVideosAllTime} all time
                  </p>
                </div>

                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-red-400/60" />
                    <span className="text-[11px] text-white/70 uppercase tracking-wider">
                      API Cost (Month)
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(costData.summary.totalApiCostThisMonth)}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    {formatCurrency(costData.summary.totalApiCostAllTime)} all time
                  </p>
                </div>

                <div className="bg-[#0f1420] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {costData.summary.grossMargin >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400/60" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400/60" />
                    )}
                    <span className="text-[11px] text-white/70 uppercase tracking-wider">
                      Gross Margin
                    </span>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      costData.summary.grossMargin >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {costData.summary.grossMargin}%
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    Revenue: {formatCurrency(costData.summary.revenueThisMonth)}
                  </p>
                </div>
              </div>

              {/* Revenue vs Cost Breakdown */}
              <div className="bg-[#0f1420] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Monthly P&L Snapshot
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">
                      Revenue ({costData.summary.payingUsers} users x $
                      {costData.summary.mrrPerUser}/mo)
                    </span>
                    <span className="text-sm font-medium text-emerald-400">
                      +{formatCurrency(costData.summary.revenueThisMonth)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">
                      API Costs ({costData.summary.totalVideosThisMonth} videos x $
                      {costData.summary.costPerMinute}/min)
                    </span>
                    <span className="text-sm font-medium text-red-400">
                      -{formatCurrency(costData.summary.totalApiCostThisMonth)}
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      Gross Profit
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        costData.summary.revenueThisMonth -
                          costData.summary.totalApiCostThisMonth >=
                        0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatCurrency(
                        costData.summary.revenueThisMonth -
                          costData.summary.totalApiCostThisMonth
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Per-User Cost Table */}
              <div className="bg-[#0f1420] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">
                    Per-User Cost Breakdown
                  </h3>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Estimated cost = $5 x (duration / 60s) per generated video
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-5 py-3 text-[11px] text-white/70 uppercase tracking-wider font-medium">
                          User
                        </th>
                        <th className="text-left px-3 py-3 text-[11px] text-white/70 uppercase tracking-wider font-medium">
                          Plan
                        </th>
                        <th className="text-right px-3 py-3 text-[11px] text-white/70 uppercase tracking-wider font-medium">
                          Videos (Total)
                        </th>
                        <th className="text-right px-3 py-3 text-[11px] text-white/70 uppercase tracking-wider font-medium">
                          Videos (Month)
                        </th>
                        <th className="text-right px-3 py-3 text-[11px] text-white/70 uppercase tracking-wider font-medium">
                          Cost (Month)
                        </th>
                        <th className="text-right px-5 py-3 text-[11px] text-white/70 uppercase tracking-wider font-medium">
                          Cost (All Time)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costData.perUser.map((u) => (
                        <tr
                          key={u.userId}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div>
                              <p className="text-white/80 font-medium text-[13px]">
                                {u.name}
                              </p>
                              <p className="text-white/60 text-[11px]">
                                {u.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                u.plan === "free"
                                  ? "bg-white/5 text-white/70"
                                  : u.plan === "authority"
                                  ? "bg-purple-500/15 text-purple-400"
                                  : "bg-blue-500/15 text-blue-400"
                              }`}
                            >
                              {u.plan}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-white/70 font-mono text-[13px]">
                            {u.totalVideos}
                          </td>
                          <td className="px-3 py-3 text-right text-white/70 font-mono text-[13px]">
                            {u.videosThisMonth}
                          </td>
                          <td className="px-3 py-3 text-right text-white/70 font-mono text-[13px]">
                            {formatCurrency(u.estimatedCostThisMonth)}
                          </td>
                          <td className="px-5 py-3 text-right text-white/70 font-mono text-[13px]">
                            {formatCurrency(u.estimatedCostAllTime)}
                          </td>
                        </tr>
                      ))}
                      {costData.perUser.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-10 text-white/60"
                          >
                            No user data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Refresh button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setCostData(null);
                    loadCosts();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10 hover:text-white/60 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Data
                </button>
              </div>
            </div>
          )}

          {!costLoading && !costData && (
            <div className="text-center py-20 text-white/70">
              Failed to load cost data. You may not have admin access.
            </div>
          )}
        </div>
      )}

      {/* Config List (for non-cost tabs) */}
      {!loading && activeTab !== "costs" && (
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/70">
              No configuration found for this category.
            </div>
          )}

          {filtered.map((config) => (
            <div
              key={config.key}
              className="bg-[#0f1420] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {config.label}
                  </h3>
                  <p className="text-xs text-white/70 font-mono mt-0.5">
                    {config.key}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isChanged(config.key) && (
                    <span className="text-xs text-amber-400/80">unsaved</span>
                  )}
                  <button
                    onClick={() => saveConfig(config.key)}
                    disabled={!isChanged(config.key) || saving === config.key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isChanged(config.key)
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                        : "bg-white/5 text-white/70 cursor-not-allowed"
                    }`}
                  >
                    {saving === config.key ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Save
                  </button>
                </div>
              </div>

              {/* Model selector for model configs */}
              {config.category === "models" && (
                <select
                  value={editedValues[config.key] || config.value}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-[#0f1420]"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Textarea for prompt configs */}
              {config.category === "prompts" && (
                <textarea
                  value={editedValues[config.key] || config.value}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-blue-500/50 resize-y font-mono leading-relaxed"
                />
              )}

              {/* JSON editor for onboarding configs */}
              {config.category === "onboarding" && (
                <textarea
                  value={editedValues[config.key] || config.value}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-blue-500/50 resize-y font-mono"
                />
              )}

              {/* Promo config — toggle and text inputs */}
              {config.category === "promo" && (
                config.key === "promo_enabled" ? (
                  <select
                    value={editedValues[config.key] || config.value}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        [config.key]: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                  >
                    <option value="true" className="bg-[#0f1420]">Enabled</option>
                    <option value="false" className="bg-[#0f1420]">Disabled</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editedValues[config.key] || config.value}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        [config.key]: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-blue-500/50"
                  />
                )
              )}

              {/* Timestamp */}
              <p className="text-[10px] text-white/70 mt-2">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

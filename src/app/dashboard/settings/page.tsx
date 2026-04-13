"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  User,
  CreditCard,
  Bell,
  Link2,
  Shield,
  Check,
  ExternalLink,
  Trash2,
  Plus,
  Loader2,
  Info,
  Unlink,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Zap,
  Users,
  Mail,
  Crown,
  Pencil,
  Eye,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "plan", label: "Plan & Billing", icon: CreditCard },
  { id: "team", label: "Team", icon: Users },
  { id: "social", label: "Connected Accounts", icon: Link2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
  { id: "vault", label: "Vault", icon: Shield, href: "/dashboard/vault" },
  { id: "referrals", label: "Referrals", icon: Crown, href: "/dashboard/referral" },
];

// Platform visual metadata: name, abbreviated icon text, gradient color
const platformMeta: Record<
  string,
  { name: string; icon: string; color: string; description: string }
> = {
  instagram: {
    name: "Instagram",
    icon: "IG",
    color: "from-pink-500 to-purple-500",
    description: "Share Reels and posts to your Instagram business account",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "in",
    color: "from-blue-600 to-blue-400",
    description: "Publish professional content to your LinkedIn profile",
  },
  tiktok: {
    name: "TikTok",
    icon: "TT",
    color: "from-gray-600 to-gray-400",
    description: "Upload short-form videos directly to TikTok",
  },
  facebook: {
    name: "Facebook",
    icon: "FB",
    color: "from-blue-700 to-blue-500",
    description: "Post videos and content to your Facebook Page",
  },
  youtube: {
    name: "YouTube",
    icon: "YT",
    color: "from-red-600 to-red-400",
    description: "Upload videos to your YouTube channel",
  },
};

const allPlatformIds = ["instagram", "linkedin", "tiktok", "facebook", "youtube"];

interface ConnectedAccount {
  id: string;
  platform: string;
  handle: string;
  connected: boolean;
  accountId: string | null;
  expiresAt: string | null;
}

interface PlatformStatus {
  platform: string;
  configured: boolean;
  missingVars: string[];
}

interface UsageData {
  plan: string;
  planLabel: string;
  videosUsed: number;
  videosLimit: number | null;
  videosRemaining: number | null;
  canGenerate: boolean;
  currentPeriodEnd: string | null;
  softLimit: number;
  hardLimit: number | null;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  avatarUrl: string | null;
  industry: string | null;
}

const availablePlans = [
  {
    id: "starter",
    name: "Everything Plan",
    price: "$79",
    period: "/month",
    features: [
      "30 videos per month",
      "All platforms",
      "Voice cloning & AI digital twin",
      "Multi-cut composition",
      "Analytics & auto-posting",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited videos",
      "All platforms",
      "Dedicated support",
      "Custom AI models",
      "API access",
    ],
    popular: false,
  },
];

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-6 text-white/70">Loading settings...</div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialTab = searchParams.get("tab") || "profile";
  const successMsg = searchParams.get("success");
  const errorMsg = searchParams.get("error");
  const checkoutStatus = searchParams.get("checkout");

  const [activeTab, setActiveTab] = useState(initialTab);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", company: "", industry: "" });

  // Billing state
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [billingAction, setBillingAction] = useState<string | null>(null);

  // Show toast from URL params (after OAuth redirect or checkout)
  useEffect(() => {
    if (checkoutStatus === "success") {
      setToast({ type: "success", message: "Subscription activated successfully! Welcome aboard." });
      window.history.replaceState({}, "", "/dashboard/settings?tab=plan");
    } else if (checkoutStatus === "cancelled") {
      setToast({ type: "error", message: "Checkout was cancelled. No charges were made." });
      window.history.replaceState({}, "", "/dashboard/settings?tab=plan");
    } else if (successMsg) {
      setToast({ type: "success", message: successMsg });
      window.history.replaceState({}, "", "/dashboard/settings?tab=social");
    } else if (errorMsg) {
      setToast({ type: "error", message: errorMsg });
      window.history.replaceState({}, "", "/dashboard/settings?tab=social");
    }
  }, [successMsg, errorMsg, checkoutStatus]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch usage/plan data for billing tab
  const fetchUsage = useCallback(async () => {
    setLoadingUsage(true);
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
    } finally {
      setLoadingUsage(false);
    }
  }, []);

  // Fetch connected accounts from the database
  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/social/accounts");
      if (res.ok) {
        const data = await res.json();
        setConnectedAccounts(data);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  // Fetch platform configuration statuses (which have env vars set)
  const fetchPlatformStatuses = useCallback(async () => {
    setLoadingPlatforms(true);
    try {
      const res = await fetch("/api/social/platforms");
      if (res.ok) {
        const data = await res.json();
        setPlatformStatuses(data);
      }
    } catch (err) {
      console.error("Failed to fetch platform statuses:", err);
    } finally {
      setLoadingPlatforms(false);
    }
  }, []);

  // Save profile changes
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setToast({ type: "success", message: "Profile saved successfully" });
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ type: "error", message: data.error || "Failed to save profile" });
      }
    } catch {
      setToast({ type: "error", message: "Failed to save profile" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Fetch user profile for the profile tab
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfileForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          company: data.company || "",
          industry: data.industry || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "profile") {
      fetchProfile();
    }
    if (activeTab === "social") {
      fetchAccounts();
      fetchPlatformStatuses();
    }
    if (activeTab === "plan") {
      fetchUsage();
    }
  }, [activeTab, fetchProfile, fetchAccounts, fetchPlatformStatuses, fetchUsage]);

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    window.location.href = `/api/social/connect/${platformId}`;
  };

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    try {
      const res = await fetch(`/api/social/disconnect/${platformId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConnectedAccounts((prev) =>
          prev.filter((a) => a.platform !== platformId)
        );
        setToast({
          type: "success",
          message: `${platformMeta[platformId]?.name || platformId} disconnected successfully`,
        });
      } else {
        const data = await res.json();
        setToast({
          type: "error",
          message: data.error || "Failed to disconnect",
        });
      }
    } catch {
      setToast({ type: "error", message: "Failed to disconnect account" });
    } finally {
      setDisconnecting(null);
    }
  };

  const handleCheckout = async (planId: string) => {
    if (planId === "enterprise") return;
    setBillingAction(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ type: "error", message: data.error || "Failed to start checkout" });
      }
    } catch {
      setToast({ type: "error", message: "Failed to start checkout. Please try again." });
    } finally {
      setBillingAction(null);
    }
  };

  const handleManageSubscription = async () => {
    setBillingAction("portal");
    try {
      const res = await fetch("/api/stripe/portal");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ type: "error", message: data.error || "Failed to open billing portal" });
      }
    } catch {
      setToast({ type: "error", message: "Failed to open billing portal. Please try again." });
    } finally {
      setBillingAction(null);
    }
  };

  const getAccountForPlatform = (platformId: string) => {
    return connectedAccounts.find(
      (a) => a.platform === platformId && a.connected
    );
  };

  const getPlatformStatus = (platformId: string) => {
    return platformStatuses.find((p) => p.platform === platformId);
  };

  const connectedCount = allPlatformIds.filter(
    (id) => !!getAccountForPlatform(id)
  ).length;

  const isLoading = loadingAccounts || loadingPlatforms;

  // Usage progress bar percentage
  const usagePercent =
    usage && usage.videosLimit
      ? Math.min(100, Math.round((usage.videosUsed / usage.videosLimit) * 100))
      : 0;

  const isPaidPlan = usage && usage.plan !== "free";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-white/70 mt-1">
          Manage your account, plan, and connected platforms
        </p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-white/70 hover:text-white/60 transition-colors p-1"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const tabHref = (tab as { href?: string }).href;
          if (tabHref) {
            return (
              <Link
                key={tab.id}
                href={tabHref}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all text-white/70 hover:text-white/60 border border-transparent hover:border-white/[0.06]"
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
                  : "text-white/70 hover:text-white/60 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-semibold">Personal Information</h3>
          {loadingProfile ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/70">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading profile...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {profile?.firstName?.charAt(0) || session?.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    Change avatar
                  </button>
                  <p className="text-xs text-white/70 mt-0.5">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="input-field !py-2.5 text-sm"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="input-field !py-2.5 text-sm"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field !py-2.5 text-sm opacity-50 cursor-not-allowed"
                    value={profile?.email || session?.user?.email || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    className="input-field !py-2.5 text-sm"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="btn-primary gap-2 text-sm !py-2.5 disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Plan & Billing Tab */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          {loadingUsage ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center gap-3 text-white/70">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading billing information...</span>
            </div>
          ) : (
            <>
              {/* Current plan overview */}
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {usage?.planLabel || "Free"} Plan
                      </h3>
                      {isPaidPlan && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                      {!isPaidPlan && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/70 border border-white/10">
                          Free tier
                        </span>
                      )}
                    </div>
                    {usage?.currentPeriodEnd && (
                      <p className="text-xs text-white/70 mt-1">
                        Current period ends{" "}
                        {new Date(usage.currentPeriodEnd).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {!isPaidPlan && (
                      <p className="text-xs text-white/70 mt-1">
                        Upgrade to unlock more videos and features.
                      </p>
                    )}
                  </div>

                  {/* Manage subscription button for paid users */}
                  {isPaidPlan && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={billingAction === "portal"}
                      className="btn-secondary !py-2 !px-4 text-xs gap-1.5 transition-all duration-200 disabled:opacity-50"
                    >
                      {billingAction === "portal" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3" />
                          Manage subscription
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Usage bar */}
                {usage && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Videos this month</span>
                      <span className="text-white/60 font-medium">
                        {isPaidPlan
                          ? `${usage.videosUsed} created (${usage.softLimit} videos included, unlimited generation)`
                          : usage.videosLimit !== null
                            ? `${usage.videosUsed} / ${usage.videosLimit}`
                            : `${usage.videosUsed} (unlimited)`}
                      </span>
                    </div>
                    {!isPaidPlan && usage.videosLimit !== null && (
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            usagePercent >= 90
                              ? "bg-red-500"
                              : usagePercent >= 70
                                ? "bg-amber-500"
                                : "bg-blue-500"
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                    {isPaidPlan && (
                      <div className="flex items-center gap-2 text-xs text-blue-400/80 bg-blue-500/10 border border-blue-500/15 rounded-lg p-3 mt-2">
                        <Info className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {usage.softLimit} videos included in your plan. Generation is unlimited for active subscribers.
                        </span>
                      </div>
                    )}
                    {!isPaidPlan && usage.videosLimit !== null && !usage.canGenerate && (
                      <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/15 rounded-lg p-3 mt-2">
                        <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          You have reached your monthly video limit. Upgrade your
                          plan to continue generating.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Plan cards */}
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-4">
                  {isPaidPlan ? "Change plan" : "Choose a plan"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePlans.map((plan) => {
                    const isCurrent = usage?.plan === plan.id;
                    const isEnterprise = plan.id === "enterprise";
                    const isUpgrade =
                      !isCurrent &&
                      !isEnterprise &&
                      usage?.plan === "free";
                    const isCheckingOut = billingAction === plan.id;

                    return (
                      <div
                        key={plan.id}
                        className={`glass-card p-5 relative transition-all duration-200 ${
                          isCurrent
                            ? "border-blue-500/30 bg-blue-500/5"
                            : "hover:border-white/10"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-[10px] font-semibold">
                            Popular
                          </div>
                        )}
                        <h4 className="font-semibold text-lg">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          {plan.period && (
                            <span className="text-sm text-white/70">{plan.period}</span>
                          )}
                        </div>
                        <ul className="mt-4 space-y-2">
                          {plan.features.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs text-white/70"
                            >
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {isCurrent ? (
                          <button
                            disabled
                            className="mt-5 w-full btn-secondary gap-2 text-sm !py-2.5 opacity-60 cursor-default"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Current plan
                          </button>
                        ) : isEnterprise ? (
                          <a
                            href="mailto:hello@theofficial.ai?subject=Enterprise%20Inquiry"
                            className="mt-5 w-full btn-secondary gap-2 text-sm !py-2.5 inline-flex items-center justify-center"
                          >
                            Contact sales
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        ) : isPaidPlan ? (
                          <button
                            onClick={handleManageSubscription}
                            disabled={billingAction === "portal"}
                            className="mt-5 w-full btn-secondary gap-2 text-sm !py-2.5 disabled:opacity-50"
                          >
                            {billingAction === "portal" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                {isUpgrade ? "Upgrade" : "Change plan"}
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckout(plan.id)}
                            disabled={!!billingAction}
                            className="mt-5 w-full btn-primary gap-2 text-sm !py-2.5 disabled:opacity-50"
                          >
                            {isCheckingOut ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                {isUpgrade ? "Upgrade" : "Subscribe"}
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && <TeamTabContent />}

      {/* Connected Accounts Tab */}
      {activeTab === "social" && (
        <div className="space-y-5">
          {/* Header with connection count */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">
                Connect your social media accounts for automatic content
                publishing.
              </p>
            </div>
            {!isLoading && (
              <div className="flex items-center gap-2 text-xs text-white/70">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectedCount > 0 ? "bg-green-400" : "bg-white/20"
                  }`}
                />
                {connectedCount} of {allPlatformIds.length} connected
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center gap-3 text-white/70">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading connected accounts...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {allPlatformIds.map((platformId) => {
                const meta = platformMeta[platformId];
                const account = getAccountForPlatform(platformId);
                const status = getPlatformStatus(platformId);
                const isConnected = !!account;
                const isConfigured = status?.configured ?? true;
                const isDisconnecting = disconnecting === platformId;
                const isConnecting = connecting === platformId;

                return (
                  <div
                    key={platformId}
                    className={`glass-card p-5 transition-all duration-200 ${
                      isConnected
                        ? "border-green-500/10 bg-green-500/[0.02]"
                        : !isConfigured
                          ? "opacity-60"
                          : "hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Platform icon */}
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-bold text-xs shadow-lg ${
                          !isConfigured && !isConnected ? "grayscale" : ""
                        }`}
                      >
                        {meta.icon}
                      </div>

                      {/* Platform info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {meta.name}
                          </span>

                          {/* Connected badge */}
                          {isConnected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Connected
                            </span>
                          )}

                          {/* Not configured indicator */}
                          {!isConfigured && !isConnected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400/80 border border-amber-500/15">
                              <Info className="w-2.5 h-2.5" />
                              Setup required
                            </span>
                          )}
                        </div>

                        {/* Connected handle or description */}
                        {isConnected && account.handle ? (
                          <div className="text-xs text-green-400/70 mt-0.5 truncate">
                            {account.handle}
                            {account.expiresAt && (
                              <span className="text-white/70 ml-2">
                                Expires{" "}
                                {new Date(
                                  account.expiresAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-white/70 mt-0.5">
                            {!isConfigured
                              ? `Requires ${status?.missingVars.join(", ") || "OAuth credentials"}`
                              : meta.description}
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="flex-shrink-0">
                        {isConnected ? (
                          <button
                            onClick={() => handleDisconnect(platformId)}
                            disabled={isDisconnecting}
                            className="btn-secondary !py-2 !px-4 text-xs text-red-400 border-red-500/10 hover:bg-red-500/5 hover:border-red-500/20 disabled:opacity-50 gap-1.5 transition-all duration-200"
                          >
                            {isDisconnecting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Unlink className="w-3 h-3" />
                                Disconnect
                              </>
                            )}
                          </button>
                        ) : !isConfigured ? (
                          <div className="relative group">
                            <button
                              disabled
                              className="btn-secondary !py-2 !px-4 text-xs opacity-40 cursor-not-allowed gap-1.5"
                            >
                              <Plus className="w-3 h-3" /> Connect
                            </button>
                            {/* Tooltip showing missing env vars */}
                            <div className="absolute bottom-full right-0 mb-2 w-72 p-3 rounded-xl bg-[#111827] border border-white/10 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
                              <div className="text-[11px] font-medium text-amber-400 mb-1.5">
                                Missing environment variables:
                              </div>
                              <div className="space-y-1">
                                {(status?.missingVars || []).map((v) => (
                                  <code
                                    key={v}
                                    className="block text-[10px] text-white/70 bg-white/5 px-2 py-1 rounded-md font-mono"
                                  >
                                    {v}
                                  </code>
                                ))}
                              </div>
                              <div className="text-[10px] text-white/70 mt-2">
                                Add these to your .env file to enable this
                                connection.
                              </div>
                              {/* Tooltip arrow */}
                              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-[#111827] border-b border-r border-white/10 rotate-45" />
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConnect(platformId)}
                            disabled={isConnecting}
                            className="btn-primary !py-2 !px-4 text-xs gap-1.5 transition-all duration-200"
                          >
                            {isConnecting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-3 h-3" /> Connect
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Help text at the bottom */}
          {!isLoading && (
            <div className="glass-card p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400/60 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-white/70 leading-relaxed">
                <p>
                  Social account connections use OAuth 2.0 for secure
                  authorization. Official AI never stores your social media
                  passwords. You can disconnect any account at any time to
                  revoke access.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-semibold">Notification Preferences</h3>
          {[
            {
              label: "New content ready for review",
              desc: "Get notified when AI generates new content",
              checked: true,
            },
            {
              label: "Content published",
              desc: "Notify when scheduled content goes live",
              checked: true,
            },
            {
              label: "Weekly performance digest",
              desc: "Weekly summary of your content analytics",
              checked: true,
            },
            {
              label: "AI model updates",
              desc: "Notified about Kling 2.6 and Seedance 2.0 improvements",
              checked: false,
            },
            {
              label: "Marketing tips",
              desc: "Content strategy tips from the Official AI team",
              checked: false,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-white/70 mt-0.5">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/50 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-white" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" /> Data & Privacy
            </h3>
            <p className="text-sm text-white/70">
              You own all content generated by Official AI. We never sell,
              share, or train on your data.
            </p>
            <div className="space-y-3 pt-2">
              <button className="btn-secondary gap-2 text-sm !py-2.5 w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" /> Download All My Data
              </button>
              <button className="btn-secondary gap-2 text-sm !py-2.5 w-full sm:w-auto">
                Revoke AI Consent
              </button>
              <button className="btn-secondary gap-2 text-sm !py-2.5 w-full sm:w-auto text-red-400 border-red-500/10 hover:bg-red-500/5">
                <Trash2 className="w-4 h-4" /> Delete My Account & All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Team Tab ────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "owner" | "admin" | "editor" | "viewer";
  videosCreated: number;
  status: "active" | "pending" | "inactive";
  joinedAt: string;
}

interface TeamData {
  members: TeamMember[];
  seats: { used: number; limit: number; pricePerSeat: number };
  pendingInvites: Array<{ email: string; role: string; status: string }>;
}

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  editor: Pencil,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: "text-amber-400 bg-amber-500/10",
  admin: "text-blue-400 bg-blue-500/10",
  editor: "text-green-400 bg-green-500/10",
  viewer: "text-white/70 bg-white/[0.06]",
};

function TeamTabContent() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setTeamData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    setInviting(true);
    setInviteResult(null);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInviteResult({
          type: "success",
          message: `Invite sent to ${inviteEmail}`,
        });
        setInviteEmail("");
      } else {
        setInviteResult({
          type: "error",
          message: data.error || "Failed to send invite",
        });
      }
    } catch {
      setInviteResult({ type: "error", message: "Failed to send invite" });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/70">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading team...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pricing info */}
      <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.03] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-400/70 flex-shrink-0" />
          <div>
            <div className="text-[14px] sm:text-[15px] font-medium text-white/85">
              Team & Agency Mode
            </div>
            <div className="text-xs sm:text-sm text-white/70">
              $79/seat/month. Add team members to collaborate on video creation.
            </div>
          </div>
        </div>
      </div>

      {/* Invite form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-white/90">Invite Team Member</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="input-field !py-2.5 text-sm w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite();
              }}
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/[0.06] bg-transparent text-sm text-white/60 hover:border-white/10 transition-all appearance-none cursor-pointer"
          >
            <option value="admin" className="bg-[#0c1018]">
              Admin
            </option>
            <option value="editor" className="bg-[#0c1018]">
              Editor
            </option>
            <option value="viewer" className="bg-[#0c1018]">
              Viewer
            </option>
          </select>
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#050508] text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 flex-shrink-0"
          >
            {inviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4" /> Send Invite
              </>
            )}
          </button>
        </div>
        {inviteResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              inviteResult.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {inviteResult.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {inviteResult.message}
          </div>
        )}
      </div>

      {/* Team members list */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
          <h3 className="font-semibold text-white/90">Team Members</h3>
          <span className="text-xs text-white/70">
            {teamData?.seats.used || 0} / {teamData?.seats.limit || 1} seats
          </span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {teamData?.members.map((member) => {
            const RoleIcon = roleIcons[member.role] || User;
            const roleColor = roleColors[member.role] || roleColors.viewer;
            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.015] transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {member.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/85 truncate">
                    {member.name}
                  </div>
                  <div className="text-xs text-white/70 truncate">
                    {member.email}
                  </div>
                </div>

                {/* Videos created */}
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-white/60">
                    {member.videosCreated}
                  </div>
                  <div className="text-[10px] text-white/60">videos</div>
                </div>

                {/* Role badge */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${roleColor}`}
                >
                  <RoleIcon className="w-3 h-3" />
                  {member.role}
                </div>

                {/* Status */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    member.status === "active"
                      ? "bg-green-400"
                      : member.status === "pending"
                      ? "bg-yellow-400"
                      : "bg-white/20"
                  }`}
                  title={member.status}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

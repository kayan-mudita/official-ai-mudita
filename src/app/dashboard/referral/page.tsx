"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Copy,
  Check,
  Mail,
  Share2,
  Users,
  UserPlus,
  UserCheck,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: {
    invited: number;
    signedUp: number;
    active: number;
    rewardMonths: number;
  };
  reward: {
    give: string;
    get: string;
  };
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select input
    }
  };

  const handleEmailShare = () => {
    if (!data) return;
    const subject = encodeURIComponent("Try Official AI - Get 1 month free");
    const body = encodeURIComponent(
      `I've been using Official AI to create professional videos with AI. Use my link to get 1 month free:\n\n${data.referralLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSocialShare = () => {
    if (!data) return;
    const text = encodeURIComponent(
      `I've been using Official AI to create professional videos with AI. Try it free: ${data.referralLink}`
    );
    // Use Web Share API if available, otherwise open Twitter
    if (navigator.share) {
      navigator.share({
        title: "Official AI",
        text: `Try Official AI - Get 1 month free`,
        url: data.referralLink,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-white/70">Unable to load referral data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Referral Program</h1>
        <p className="text-sm text-white/70 mt-1">
          Give 1 month free, get 1 month free
        </p>
      </div>

      {/* Hero card */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-blue-500/[0.06] to-purple-500/[0.04] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white/90">
                Share Official AI, earn free months
              </h2>
              <p className="text-sm text-white/70 mt-1 leading-relaxed">
                For every friend who subscribes with your link, you both get 1 month free.
                There is no limit to how many months you can earn.
              </p>
            </div>
          </div>

          {/* Referral link */}
          <div className="mb-6">
            <label className="block text-xs text-white/70 mb-2 font-medium uppercase tracking-wide">
              Your referral link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
                <span className="text-sm text-white/60 truncate font-mono">
                  {data.referralLink}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#050508] text-sm font-medium hover:bg-white/90 transition-all flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleEmailShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm text-white/70 hover:text-white/70 hover:bg-white/[0.03] transition-all"
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              onClick={handleSocialShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm text-white/70 hover:text-white/70 hover:bg-white/[0.03] transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Referral stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
            <UserPlus className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data.stats.invited}</div>
          <div className="text-sm text-white/70 mt-0.5">Invited</div>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
            <Users className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data.stats.signedUp}</div>
          <div className="text-sm text-white/70 mt-0.5">Signed Up</div>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data.stats.active}</div>
          <div className="text-sm text-white/70 mt-0.5">Active</div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
        <h3 className="text-[15px] font-semibold text-white/90 mb-4">How it works</h3>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Share your link",
              description: "Send your unique referral link to friends and colleagues",
            },
            {
              step: "2",
              title: "They sign up",
              description: "When they subscribe using your link, they get 1 month free",
            },
            {
              step: "3",
              title: "You earn a reward",
              description: "You also get 1 month free added to your account",
            },
          ].map((item, i) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-xs font-bold text-white/70">
                {item.step}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-white/70">{item.title}</p>
                <p className="text-xs text-white/70 mt-0.5">{item.description}</p>
              </div>
              {i < 2 && (
                <ArrowRight className="w-3 h-3 text-white/10 mt-2 flex-shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

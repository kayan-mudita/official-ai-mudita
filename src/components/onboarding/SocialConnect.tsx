"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Loader2, ArrowRight } from "lucide-react";

/**
 * Social account connection screen shown after calendar approval,
 * before landing on the dashboard. Connects via PostBridge OAuth.
 */

interface SocialConnectProps {
  onComplete: () => void;
}

interface PlatformConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

const PLATFORMS: PlatformConfig[] = [
  { id: "instagram", label: "Instagram", icon: "\uD83D\uDCF7", color: "text-pink-400", bgColor: "bg-pink-500/10 border-pink-500/20" },
  { id: "tiktok", label: "TikTok", icon: "\uD83C\uDFB5", color: "text-white/70", bgColor: "bg-white/[0.06] border-white/[0.12]" },
  { id: "linkedin", label: "LinkedIn", icon: "\uD83D\uDCBC", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  { id: "youtube", label: "YouTube", icon: "\u25B6\uFE0F", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  { id: "facebook", label: "Facebook", icon: "\uD83D\uDC4D", color: "text-blue-300", bgColor: "bg-blue-600/10 border-blue-500/20" },
];

interface ConnectedAccount {
  platform: string;
  handle: string;
}

export default function SocialConnect({ onComplete }: SocialConnectProps) {
  const [connected, setConnected] = useState<ConnectedAccount[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch already-connected accounts
  useEffect(() => {
    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((accounts: { platform: string; handle: string }[]) => {
        if (Array.isArray(accounts)) {
          setConnected(accounts.filter((a) => a.handle));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Listen for OAuth callback (platform connects in new tab, returns here)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "social_connected" && event.data.platform) {
        setConnected((prev) => [
          ...prev.filter((a) => a.platform !== event.data.platform),
          { platform: event.data.platform, handle: event.data.handle || event.data.platform },
        ]);
        setConnecting(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const res = await fetch(`/api/social/connect/${platformId}`);
      const data = await res.json();
      if (data.url) {
        // Open OAuth in new tab
        window.open(data.url, "_blank", "width=600,height=700");
      }
    } catch {
      setConnecting(null);
    }
  };

  const isConnected = (platformId: string) =>
    connected.some((a) => a.platform === platformId);

  const connectedCount = connected.length;

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl"
        >
          {"\uD83D\uDD17"}
        </motion.div>
        <h2 className="text-[24px] font-extrabold text-white tracking-tight">
          Connect your accounts
        </h2>
        <p className="text-[14px] text-white/40 font-medium">
          So your videos auto-publish when they are ready.
          {connectedCount > 0 && (
            <span className="text-emerald-400 ml-1">{connectedCount} connected</span>
          )}
        </p>
      </div>

      {/* Platform list */}
      <div className="space-y-3">
        {PLATFORMS.map((platform, i) => {
          const connected_acct = isConnected(platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <motion.button
              key={platform.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => !connected_acct && handleConnect(platform.id)}
              disabled={connected_acct || isConnecting}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                connected_acct
                  ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                  : isConnecting
                  ? "border-indigo-500/30 bg-indigo-500/[0.04]"
                  : `${platform.bgColor} hover:bg-white/[0.06]`
              }`}
            >
              <span className="text-[22px]">{platform.icon}</span>
              <div className="flex-1 text-left">
                <p className={`text-[14px] font-semibold ${
                  connected_acct ? "text-emerald-300" : "text-white/80"
                }`}>
                  {platform.label}
                </p>
                {connected_acct && (
                  <p className="text-[11px] text-emerald-400/60">Connected</p>
                )}
              </div>
              {connected_acct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isConnecting ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 text-white/20" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <motion.button
          onClick={onComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-bold text-white transition-all"
          style={{
            background: connectedCount > 0
              ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)"
              : "rgba(255,255,255,0.06)",
            boxShadow: connectedCount > 0
              ? "0 0 25px rgba(99,102,241,0.35)"
              : "none",
            border: connectedCount > 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {connectedCount > 0 ? (
            <>
              Go to dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Skip for now"
          )}
        </motion.button>

        {connectedCount === 0 && (
          <p className="text-[11px] text-white/15 text-center">
            You can connect accounts later from Settings.
          </p>
        )}
      </div>
    </div>
  );
}

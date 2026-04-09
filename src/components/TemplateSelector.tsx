"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Loader2,
  Check,
  X,
  Sparkles,
  Film,
  Mic,
  Users,
  MessageSquare,
} from "lucide-react";

/**
 * TemplateSelector — Paste a social media URL to create a reference template,
 * or select from previously saved templates.
 *
 * Used in:
 * - Onboarding welcome page (intake Screen C)
 * - Dashboard generate page (before prompt input)
 */

interface Template {
  id: string;
  name: string;
  sourceUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
  duration: number | null;
  createdAt: string;
}

interface TemplateSelectorProps {
  onSelect: (templateId: string | null) => void;
  selectedId?: string | null;
  /** Compact mode for inline use in forms */
  compact?: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Film; label: string; color: string }> = {
  ugc_hook: { icon: Sparkles, label: "UGC Hook", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  podcast: { icon: Mic, label: "Podcast", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  discovery: { icon: Film, label: "Discovery", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  founders: { icon: Users, label: "Founders", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  broll: { icon: Film, label: "B-Roll", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export default function TemplateSelector({
  onSelect,
  selectedId,
  compact,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing templates
  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async () => {
    if (!url.trim() || analyzing) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const { template } = await res.json();
      setTemplates((prev) => [template, ...prev]);
      onSelect(template.id);
      setUrl("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelect = (id: string) => {
    onSelect(selectedId === id ? null : id);
  };

  return (
    <div className={`space-y-4 ${compact ? "" : ""}`}>
      {/* URL Paste Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-white/50">
          <Link2 className="w-3.5 h-3.5" />
          Paste a video you like
          <span className="text-white/20 font-normal">(TikTok, Instagram, YouTube)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/..."
            disabled={analyzing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 transition-all disabled:opacity-50"
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <motion.button
            onClick={handleAnalyze}
            disabled={!url.trim() || analyzing}
            whileHover={url.trim() && !analyzing ? { scale: 1.02 } : {}}
            whileTap={url.trim() && !analyzing ? { scale: 0.97 } : {}}
            className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white disabled:opacity-30 transition-all flex items-center gap-1.5"
            style={{
              background: url.trim() && !analyzing
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)"
                : "rgba(255,255,255,0.06)",
            }}
          >
            {analyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {analyzing ? "Analyzing..." : "Analyze"}
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12px] text-red-400/80"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Saved Templates Grid */}
      {!loading && templates.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-white/25 uppercase tracking-wider">
            Saved templates ({templates.length})
          </p>
          <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
            {templates.map((t) => {
              const isSelected = selectedId === t.id;
              const cat = CATEGORY_CONFIG[t.category || ""] || CATEGORY_CONFIG.broll;
              const CatIcon = cat.icon;

              return (
                <motion.button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-indigo-500/40 bg-indigo-500/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  {/* Thumbnail or placeholder */}
                  <div className="w-full aspect-video rounded-lg bg-white/[0.03] mb-2 flex items-center justify-center overflow-hidden">
                    {t.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Film className="w-5 h-5 text-white/10" />
                    )}
                  </div>

                  {/* Name + category */}
                  <p className="text-[11px] font-semibold text-white/70 truncate">{t.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${cat.color}`}>
                      <CatIcon className="w-2.5 h-2.5" />
                      {cat.label}
                    </span>
                    {t.duration && (
                      <span className="text-[9px] text-white/20">{Math.round(t.duration)}s</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && templates.length === 0 && !compact && (
        <div className="text-center py-4">
          <MessageSquare className="w-5 h-5 text-white/10 mx-auto mb-2" />
          <p className="text-[11px] text-white/20">
            Paste a video URL above to create your first template.
          </p>
        </div>
      )}
    </div>
  );
}

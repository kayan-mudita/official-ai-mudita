"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import FadeIn from "@/components/motion/FadeIn";

const PACES = [
  { label: "Slow (120 wpm)", wpm: 120 },
  { label: "Conversational (150 wpm)", wpm: 150 },
  { label: "Fast (180 wpm)", wpm: 180 },
];

function formatTime(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function SpeakingTimeClient() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(150);

  const stats = useMemo(() => {
    const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    const characters = text.length;
    const seconds = (words / wpm) * 60;
    return { words, characters, seconds };
  }, [text, wpm]);

  const fits = {
    tiktok: stats.seconds <= 60,
    reel: stats.seconds <= 90,
    short: stats.seconds <= 60,
    linkedin: stats.seconds <= 600,
  };

  return (
    <MarketingLayout>
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-p3 text-blue-400/80 font-medium">Free tool</span>
            </div>
            <h1 className="text-h1 sm:text-h0 font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
              Speaking Time Calculator
            </h1>
            <p className="text-title text-white/35 max-w-xl mx-auto leading-relaxed font-light">
              Paste your script. See exactly how long it will take to read aloud — and which platforms it fits.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl card-hairline">
            <div className="flex items-center justify-between mb-3">
              <label className="text-p3 font-medium text-white/60">Your script</label>
              <div className="flex items-center gap-2">
                {PACES.map((p) => (
                  <button
                    key={p.wpm}
                    onClick={() => setWpm(p.wpm)}
                    className={`text-p3 px-3 py-1.5 rounded-lg border transition-all ${
                      wpm === p.wpm
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your script here…"
              rows={10}
              className="w-full bg-[#0a0a12] border border-white/[0.06] rounded-xl p-4 text-p2 text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 resize-y"
            />

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-p3 text-white/30 uppercase tracking-wider mb-1">Words</div>
                <div className="text-h3 font-bold text-white">{stats.words}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-p3 text-white/30 uppercase tracking-wider mb-1">Characters</div>
                <div className="text-h3 font-bold text-white">{stats.characters}</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 text-center">
                <div className="text-p3 text-blue-400/60 uppercase tracking-wider mb-1">Runtime</div>
                <div className="text-h3 font-bold text-white">{formatTime(stats.seconds)}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-p3 text-white/40 uppercase tracking-wider mb-3">Fits on</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "TikTok", ok: fits.tiktok, max: "≤ 60s" },
                  { name: "IG Reel", ok: fits.reel, max: "≤ 90s" },
                  { name: "YT Short", ok: fits.short, max: "≤ 60s" },
                  { name: "LinkedIn", ok: fits.linkedin, max: "≤ 10m" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`p-3 rounded-lg border text-center ${
                      stats.words === 0
                        ? "bg-white/[0.02] border-white/[0.06] text-white/30"
                        : p.ok
                        ? "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300"
                        : "bg-red-500/[0.06] border-red-500/20 text-red-300"
                    }`}
                  >
                    <div className="text-p3 font-semibold">{p.name}</div>
                    <div className="text-p3 opacity-60">{p.max}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-xl card-hairline">
            <h2 className="text-p2 font-semibold text-white/80 mb-2">How it works</h2>
            <p className="text-p3 text-white/40 leading-relaxed">
              We count words and divide by your selected speaking pace. 150 wpm is the average for natural,
              conversational delivery on social video. Slower paces work better for emotional or educational
              content; faster paces fit punchy hooks and listicles.
            </p>
          </div>
        </div>
      </section>

      <CTASection
        heading="Want scripts written for you?"
        description="Official AI writes scripts in your voice and turns them into ready-to-post videos."
        badge="No filming, no editing"
        buttonText="See how it works"
        buttonHref="/how-it-works"
      />
    </MarketingLayout>
  );
}

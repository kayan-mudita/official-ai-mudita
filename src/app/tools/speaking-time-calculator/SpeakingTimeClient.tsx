"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import MeshMockup from "@/components/marketing/MeshMockup";

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
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Free tool"
        eyebrowIcon={Clock}
        eyebrowVariant="utility"
        spacing="pt-32 pb-12"
        headline={
          <>
            Speaking Time{" "}
            <GradientText tone="brand">Calculator</GradientText>
          </>
        }
        description="Paste your script. See exactly how long it will take to read aloud — and which platforms it fits."
      />

      <section className="relative px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <MeshMockup aspect="aspect-auto" className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label className="text-p3 font-semibold text-white/70 uppercase tracking-wider">
                Your script
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PACES.map((p) => (
                  <button
                    key={p.wpm}
                    onClick={() => setWpm(p.wpm)}
                    className={`text-p3 font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                      wpm === p.wpm
                        ? "bg-utility-400/[0.12] border-utility-400/40 text-utility-200"
                        : "bg-white/[0.02] border-white/[0.08] text-white/45 hover:text-white/85 hover:border-white/[0.16]"
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
              className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 text-p2 text-white/85 placeholder:text-white/25 focus:outline-none focus:border-utility-400/40 focus:bg-white/[0.04] transition-colors resize-y"
            />

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="relative overflow-hidden p-4 rounded-xl card-hairline text-center">
                <div className="text-p3 text-white/35 uppercase tracking-wider mb-1 font-semibold">
                  Words
                </div>
                <div className="text-h3 font-bold text-white tabular-nums">
                  {stats.words}
                </div>
              </div>
              <div className="relative overflow-hidden p-4 rounded-xl card-hairline text-center">
                <div className="text-p3 text-white/35 uppercase tracking-wider mb-1 font-semibold">
                  Characters
                </div>
                <div className="text-h3 font-bold text-white tabular-nums">
                  {stats.characters}
                </div>
              </div>
              <div className="relative overflow-hidden p-4 rounded-xl card-hairline text-center bg-utility-400/[0.04]">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/40 via-utility-400/15 to-transparent" />
                <div className="text-p3 text-utility-300/70 uppercase tracking-wider mb-1 font-semibold">
                  Runtime
                </div>
                <div className="text-h3 font-bold text-white tabular-nums">
                  {formatTime(stats.seconds)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-p3 text-white/45 uppercase tracking-wider mb-3 font-semibold">
                Fits on
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "TikTok", ok: fits.tiktok, max: "≤ 60s" },
                  { name: "IG Reel", ok: fits.reel, max: "≤ 90s" },
                  { name: "YT Short", ok: fits.short, max: "≤ 60s" },
                  { name: "LinkedIn", ok: fits.linkedin, max: "≤ 10m" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      stats.words === 0
                        ? "bg-white/[0.02] border-white/[0.06] text-white/30"
                        : p.ok
                          ? "bg-positive-500/[0.06] border-positive-500/25 text-positive-300"
                          : "bg-negative-500/[0.06] border-negative-500/25 text-negative-300"
                    }`}
                  >
                    <div className="text-p3 font-semibold">{p.name}</div>
                    <div className="text-p3 opacity-60">{p.max}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <h2 className="text-p2 font-semibold text-white/85 mb-2">
                How it works
              </h2>
              <p className="text-p3 text-white/45 leading-relaxed">
                We count words and divide by your selected speaking pace. 150 wpm is
                the average for natural, conversational delivery on social video.
                Slower paces work better for emotional or educational content; faster
                paces fit punchy hooks and listicles.
              </p>
            </div>
          </MeshMockup>
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

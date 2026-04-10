"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Zap, Sparkles, Play } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { AuroraBackground } from "@/components/marketing/AuroraBackground";
import FadeIn from "@/components/motion/FadeIn";

const demoVideos = [
  {
    id: "attorney",
    label: "Attorney",
    title: "Watch AI create a video",
    subtitle: "in 30 seconds",
    duration: "0:30",
    gradient: "from-utility-400/15 via-[#050508] to-special-500/15",
  },
  {
    id: "doctor",
    label: "Doctor",
    title: "Watch AI explain a procedure",
    subtitle: "in 45 seconds",
    duration: "0:45",
    gradient: "from-utility-400/25 via-[#050508] to-utility-400/10",
  },
  {
    id: "realtor",
    label: "Realtor",
    title: "Watch AI tour a listing",
    subtitle: "in 60 seconds",
    duration: "1:00",
    gradient: "from-special-500/15 via-[#050508] to-utility-400/15",
  },
  {
    id: "advisor",
    label: "Advisor",
    title: "Watch AI break down a market move",
    subtitle: "in 30 seconds",
    duration: "0:30",
    gradient: "from-special-500/25 via-[#050508] to-special-500/10",
  },
];

export default function HomeClient() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % demoVideos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <MarketingLayout>
      {/* Hero */}
      <AuroraBackground>
      <section className="relative pt-32 pb-24 px-6">
        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn delay={0} duration={0.6}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-positive-400 animate-pulse" />
              <span className="text-p3 text-white/40 font-medium">
                Now in beta
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} duration={0.7}>
            <h1 className="text-h1 sm:text-h0 font-bold tracking-[-0.03em] leading-[1.05] text-white mb-6">
              Your AI twin.
              <br />
              <span className="bg-gradient-to-r from-utility-400 via-special-500 to-utility-400 bg-clip-text text-transparent">
                Posting for you.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} duration={0.7}>
            <p className="text-title text-white/35 max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Upload a few photos. Get a full content team that creates,
              schedules, and posts — using your face and voice.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} duration={0.7}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/demo"
                className="btn-cta-glow group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl bg-white text-[#050508] text-p2 font-semibold hover:bg-white/90 active:bg-white/80 transition-all"
              >
                Try it free — no signup
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl text-p2 text-white/40 hover:text-white/60 active:text-white/70 transition-all"
              >
                See how it works
              </Link>
            </div>

            <p className="text-p3 text-white/15">
              No credit card required
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Hero Demo Video — stacked deck carousel */}
      <FadeIn delay={0.15} duration={0.8}>
        <section className="pb-24 px-6">
          <div
            className="max-w-3xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Stacked deck container */}
            <div className="relative h-[560px] sm:h-[640px] flex items-center justify-center">
              {/* Outer glow */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[600px] bg-gradient-to-b from-special-500/[0.10] via-utility-400/[0.06] to-transparent rounded-[40px] blur-3xl pointer-events-none" />

              {demoVideos.map((video, i) => {
                // Circular distance from active (-2..-1..0..1..2)
                const len = demoVideos.length;
                let offset = i - activeVideo;
                if (offset > len / 2) offset -= len;
                if (offset < -len / 2) offset += len;

                const isActive = offset === 0;
                const absOffset = Math.abs(offset);

                // Stack styling — center is full, sides shrink/dim
                const translateX = offset * 60; // % of card width
                const scale = isActive ? 1 : absOffset === 1 ? 0.82 : 0.68;
                const opacity = isActive ? 1 : absOffset === 1 ? 0.45 : 0;
                const blurPx = isActive ? 0 : absOffset === 1 ? 2 : 6;
                const zIndex = 10 - absOffset;

                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setActiveVideo(i)}
                    aria-label={`Show ${video.label} demo`}
                    aria-current={isActive}
                    tabIndex={isActive ? 0 : -1}
                    className="absolute w-[260px] sm:w-[300px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.01] transition-all duration-700 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-utility-400/40"
                    style={{
                      transform: `translateX(${translateX}%) scale(${scale})`,
                      opacity,
                      filter: `blur(${blurPx}px)`,
                      zIndex,
                      pointerEvents: absOffset > 1 ? "none" : "auto",
                    }}
                  >
                    {/* Poster background */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${video.gradient}`} />

                    {/* Subtle mesh grid */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }}
                    />

                    {/* AI badge */}
                    <div className="absolute top-5 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 text-utility-400/80" />
                      <span className="text-[10px] text-white/40 font-medium">
                        AI Generated
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="absolute top-5 right-4 px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
                      <span className="text-[10px] text-white/40 font-medium">
                        {video.duration}
                      </span>
                    </div>

                    {/* Center play + label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative mb-5">
                        {isActive && (
                          <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-150 animate-pulse-slow" />
                        )}
                        <div className="relative w-14 h-14 rounded-full bg-white/[0.1] border border-white/[0.15] flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-5 h-5 text-white/90 ml-0.5" />
                        </div>
                      </div>
                      <p className="text-p2 text-white/60 font-medium text-center px-6 leading-snug">
                        {video.title}
                        <br />
                        {video.subtitle}
                      </p>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050508] to-transparent" />

                    {/* Progress bar — only on active card */}
                    {isActive && (
                      <div className="absolute bottom-4 left-5 right-5">
                        <div className="h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            key={`${activeVideo}-${isPaused}`}
                            className={`h-full bg-gradient-to-r from-special-500 to-utility-400 rounded-full ${
                              isPaused ? "w-full opacity-30" : "animate-progress-bar"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Thumbnail/dot picker */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {demoVideos.map((video, i) => (
                <button
                  key={video.id}
                  onClick={() => {
                    setActiveVideo(i);
                  }}
                  className={`group/dot flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${
                    i === activeVideo
                      ? "bg-white/[0.08] border-white/[0.15]"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
                  }`}
                  aria-label={`Play ${video.label} demo`}
                  aria-current={i === activeVideo}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === activeVideo
                        ? "bg-gradient-to-r from-utility-400 to-special-500"
                        : "bg-white/20 group-hover/dot:bg-white/40"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium transition-colors duration-300 ${
                      i === activeVideo ? "text-white/70" : "text-white/30 group-hover/dot:text-white/50"
                    }`}
                  >
                    {video.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Caption below video */}
            <p className="text-center mt-4 text-p2 text-white/30 leading-relaxed font-light">
              This was made by AI. No camera. No crew. No editing.
            </p>
          </div>
        </section>
      </FadeIn>
      </AuroraBackground>

      {/* Stats — Trusted by + credentials + bordered cards */}
      <FadeIn>
        <section className="relative border-b border-white/[0.04] py-28 px-6 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(129,0,158,0.06)_0%,transparent_60%)]" />
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Headline */}
            <div className="text-center mb-12">
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-utility-400 to-special-500 bg-clip-text text-transparent">
                  200+ professionals
                </span>
                <br />
                <span className="text-white/40">creating real results.</span>
              </h2>
            </div>

            {/* Credentials strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-16 opacity-50">
              {[
                "American Bar Association",
                "AMA",
                "NAR",
                "CFP Board",
                "FINRA",
              ].map((org) => (
                <span
                  key={org}
                  className="text-p3 sm:text-p2 text-white/60 font-semibold tracking-wide uppercase"
                >
                  {org}
                </span>
              ))}
            </div>

            {/* 3 stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  value: "90%",
                  label: "Less time creating",
                  caption: "Average across all users compared to traditional content workflows.",
                },
                {
                  value: "60x",
                  label: "More views on average",
                  caption: "Multi-platform automation drives compounding reach across every channel.",
                },
                {
                  value: "5 min",
                  label: "Setup to first video",
                  caption: "From signing up to publishing your first AI-generated video.",
                },
              ].map((stat, i) => (
                <FadeIn key={i} delay={i * 0.1} duration={0.6}>
                  <div className="relative h-full p-8 rounded-2xl card-hairline overflow-hidden group">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 via-special-500/20 to-transparent" />

                    {/* Big number */}
                    <div className="text-[72px] md:text-[88px] leading-[0.9] font-bold tracking-tighter bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent mb-6">
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div className="text-p1 font-semibold text-white/90 mb-3">
                      {stat.label}
                    </div>

                    {/* Caption */}
                    <p className="text-p3 text-white/30 leading-relaxed">
                      {stat.caption}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* How it Works — alternating bento with UI mockups */}
      <FadeIn>
        <section id="how" className="py-28 px-6 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-utility-400/[0.06] border border-utility-400/[0.15] mb-6">
                <span className="text-p3 text-utility-400/80 font-medium">
                  Never been easier
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                Create AI{" "}
                <span className="bg-gradient-to-r from-utility-400 to-special-500 bg-clip-text text-transparent">
                  videos
                </span>{" "}
                in minutes
              </h2>
              <p className="text-p1 text-white/40 mt-4">
                From idea to video in minutes — ready to use instantly.
              </p>
            </div>

            {/* 3 alternating bento rows */}
            <div className="space-y-5">
              {/* Row 1 — text left, script editor mockup right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative p-10 rounded-2xl card-hairline flex flex-col justify-center min-h-[280px] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 to-transparent" />
                  {/* Step progress */}
                  <div className="flex items-center gap-1.5 mb-8">
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-utility-400 to-utility-400/40" />
                    <div className="w-8 h-1 rounded-full bg-white/[0.08]" />
                    <div className="w-8 h-1 rounded-full bg-white/[0.08]" />
                  </div>
                  <h3 className="text-h3 font-bold text-white mb-3">
                    Upload your photos
                  </h3>
                  <p className="text-p2 text-white/40 leading-relaxed">
                    A few selfies or headshots from your phone. The AI builds a
                    consistent character model of you for every video.
                  </p>
                </div>

                {/* Script editor mockup */}
                <div className="relative p-8 rounded-2xl card-hairline min-h-[280px] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-utility-400/[0.04] via-transparent to-special-500/[0.04]" />
                  <div className="relative w-full max-w-md p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-p3 text-white/30">Write your script…</span>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-utility-400/[0.08] border border-utility-400/[0.15]">
                        <Sparkles className="w-2.5 h-2.5 text-utility-400/80" />
                        <span className="text-[10px] text-utility-400/80 font-medium">AI Script writer</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="h-2 rounded-full bg-white/[0.06] w-full" />
                      <div className="h-2 rounded-full bg-white/[0.06] w-5/6" />
                      <div className="h-2 rounded-full bg-white/[0.06] w-3/4" />
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                      <div className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-[10px] text-white/40 font-medium">+ Credits 6</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-[10px] text-white/40 font-medium">Talking Actors</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-[10px] text-white/40 font-medium">Edit Voice</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 — avatar grid mockup left, text right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Avatar grid mockup */}
                <div className="relative p-8 rounded-2xl card-hairline min-h-[280px] overflow-hidden flex items-center justify-center order-2 md:order-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-special-500/[0.05] via-transparent to-utility-400/[0.04]" />
                  <div className="relative flex items-end gap-2">
                    {[
                      { h: "h-32", scale: "scale-90", grad: "from-utility-400/30 to-transparent" },
                      { h: "h-36", scale: "scale-95", grad: "from-special-500/30 to-transparent" },
                      { h: "h-44", scale: "scale-100", grad: "from-utility-400/40 to-special-500/20", active: true },
                      { h: "h-36", scale: "scale-95", grad: "from-special-500/30 to-transparent" },
                      { h: "h-32", scale: "scale-90", grad: "from-utility-400/30 to-transparent" },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className={`relative w-16 ${card.h} ${card.scale} rounded-xl border ${card.active ? "border-white/20" : "border-white/[0.08]"} overflow-hidden`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-b ${card.grad}`} />
                        <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                          <div className="h-1 rounded-full bg-white/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative p-10 rounded-2xl card-hairline flex flex-col justify-center min-h-[280px] overflow-hidden order-1 md:order-2">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-special-500/30 to-transparent" />
                  {/* Step progress */}
                  <div className="flex items-center gap-1.5 mb-8">
                    <div className="w-8 h-1 rounded-full bg-white/[0.08]" />
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-special-500 to-special-500/40" />
                    <div className="w-8 h-1 rounded-full bg-white/[0.08]" />
                  </div>
                  <h3 className="text-h3 font-bold text-white mb-3">
                    AI creates your content
                  </h3>
                  <p className="text-p2 text-white/40 leading-relaxed">
                    Type what you want or let AI decide. It writes the script,
                    plans the shots, and builds a multi-cut video that looks
                    professionally produced.
                  </p>
                </div>
              </div>

              {/* Row 3 — text left, video stack mockup right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative p-10 rounded-2xl card-hairline flex flex-col justify-center min-h-[280px] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 via-special-500/20 to-transparent" />
                  {/* Step progress */}
                  <div className="flex items-center gap-1.5 mb-8">
                    <div className="w-8 h-1 rounded-full bg-white/[0.08]" />
                    <div className="w-8 h-1 rounded-full bg-white/[0.08]" />
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-utility-400 to-special-500" />
                  </div>
                  <h3 className="text-h3 font-bold text-white mb-3">
                    Review and publish
                  </h3>
                  <p className="text-p2 text-white/40 leading-relaxed">
                    Every video hits your approval queue first. Approve it,
                    schedule it, and it auto-posts to Instagram, TikTok,
                    LinkedIn, YouTube, and Facebook.
                  </p>
                </div>

                {/* Video stack mockup */}
                <div className="relative p-8 rounded-2xl card-hairline min-h-[280px] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-utility-400/[0.04] via-transparent to-special-500/[0.05]" />
                  <div className="relative">
                    {/* Back card */}
                    <div className="absolute -left-12 top-2 w-24 h-40 rounded-xl border border-white/[0.08] overflow-hidden -rotate-12">
                      <div className="absolute inset-0 bg-gradient-to-b from-special-500/30 via-black/40 to-utility-400/20" />
                    </div>
                    {/* Right back card */}
                    <div className="absolute -right-12 top-2 w-24 h-40 rounded-xl border border-white/[0.08] overflow-hidden rotate-12">
                      <div className="absolute inset-0 bg-gradient-to-b from-utility-400/30 via-black/40 to-special-500/20" />
                    </div>
                    {/* Front center card */}
                    <div className="relative w-28 h-44 rounded-xl border border-white/20 overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-utility-400/30 via-black/30 to-special-500/30" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                        <span className="text-[8px] text-white/70 font-medium">01:48</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/[0.15] border border-white/[0.25] flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-3 h-3 text-white/90 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/how-it-works"
                className="text-p3 text-utility-400/70 hover:text-utility-400 transition-colors"
              >
                Learn more about our process &rarr;
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Looping reel strip — visual proof of the process at scale */}
      <FadeIn delay={0.1} duration={0.8}>
        <section className="relative py-20 overflow-hidden border-y border-white/[0.04]">
          {/* Section label */}
          <div className="max-w-4xl mx-auto px-6 mb-12 text-center">
            <p className="text-p3 font-medium text-utility-400/70 uppercase tracking-widest mb-3">
              The output
            </p>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
              This is what you get.
              <br />
              <span className="text-white/40">Every single day.</span>
            </h2>
          </div>

          {/* Edge fade masks */}
          <div className="absolute left-0 bottom-20 top-44 w-32 bg-gradient-to-r from-[#050508] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 bottom-20 top-44 w-32 bg-gradient-to-l from-[#050508] to-transparent z-10 pointer-events-none" />

          {/* Looping track */}
          <div className="flex gap-5 animate-loop-left hover:[animation-play-state:paused] w-max">
            {[...Array(2)].map((_, dupIdx) =>
              [
                "from-utility-400/20 via-[#050508] to-special-500/15",
                "from-special-500/20 via-[#050508] to-utility-400/15",
                "from-utility-400/25 via-[#050508] to-utility-400/10",
                "from-special-500/25 via-[#050508] to-special-500/10",
                "from-utility-400/15 via-[#050508] to-special-500/25",
                "from-special-500/15 via-[#050508] to-utility-400/25",
                "from-utility-400/20 via-[#050508] to-utility-400/20",
                "from-special-500/20 via-[#050508] to-special-500/20",
              ].map((gradient, i) => (
                <div
                  key={`${dupIdx}-${i}`}
                  className="relative w-[180px] sm:w-[220px] aspect-[9/16] flex-shrink-0 rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent group/reel"
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
                  {/* Subtle mesh */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                    }}
                  />
                  {/* AI badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
                    <Sparkles className="w-2.5 h-2.5 text-utility-400/70" />
                    <span className="text-[9px] text-white/40 font-medium">AI</span>
                  </div>
                  {/* Center play */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover/reel:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-4 h-4 text-white/80 ml-0.5" />
                    </div>
                  </div>
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050508] to-transparent" />
                </div>
              ))
            )}
          </div>

          {/* Caption */}
          <p className="text-center mt-10 text-p3 text-white/30 font-light">
            Every video on this page was generated by Official AI
          </p>
        </section>
      </FadeIn>

      {/* Features — bento with hero card + 5 supporting */}
      <FadeIn>
        <section id="features" className="py-28 px-6 border-t border-white/[0.04] scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-utility-400/[0.06] border border-utility-400/[0.15] mb-6">
                <span className="text-p3 text-utility-400/80 font-medium">
                  What you get
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                A content team{" "}
                <span className="bg-gradient-to-r from-utility-400 to-special-500 bg-clip-text text-transparent">
                  that never sleeps.
                </span>
              </h2>
              <p className="text-p1 text-white/40 mt-4">
                Everything you need to show up every day — without showing up.
              </p>
            </div>

            {/* 6-col bento: hero (col-span-4 row-span-2) + 5 smalls */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-5 auto-rows-fr">
              {/* Hero feature */}
              <div className="relative md:col-span-4 md:row-span-2 rounded-2xl card-hairline overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/40 via-special-500/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-utility-400/[0.05] via-transparent to-special-500/[0.05]" />

                <div className="relative h-full grid grid-cols-1 md:grid-cols-5 gap-0">
                  {/* Copy */}
                  <div className="md:col-span-3 p-10 md:p-12 flex flex-col justify-center">
                    <div className="w-12 h-12 rounded-xl bg-utility-400/[0.08] border border-utility-400/[0.15] flex items-center justify-center mb-6">
                      <Sparkles className="w-5 h-5 text-utility-400/90" />
                    </div>
                    <h3 className="text-h3 font-bold text-white mb-3">
                      Your face, your voice
                    </h3>
                    <p className="text-p2 text-white/40 leading-relaxed">
                      Character sheets and voice cloning ensure every video
                      looks and sounds like you — not a generic avatar. Once
                      you upload, your AI twin is consistent across every
                      post, forever.
                    </p>
                  </div>

                  {/* Mockup — character cards */}
                  <div className="md:col-span-2 relative min-h-[200px] md:min-h-0 flex items-center justify-center p-8">
                    <div className="relative flex items-end gap-2">
                      <div className="relative w-16 h-28 rounded-xl border border-white/[0.08] overflow-hidden -rotate-6 translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-b from-utility-400/30 via-black/40 to-special-500/20" />
                      </div>
                      <div className="relative w-20 h-36 rounded-xl border border-white/20 overflow-hidden shadow-2xl z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-utility-400/40 via-black/30 to-special-500/30" />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                          <span className="text-[8px] text-white/70 font-medium">YOU · HD</span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                            <div className="h-full w-2/3 bg-gradient-to-r from-utility-400 to-special-500" />
                          </div>
                        </div>
                      </div>
                      <div className="relative w-16 h-28 rounded-xl border border-white/[0.08] overflow-hidden rotate-6 translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-b from-special-500/30 via-black/40 to-utility-400/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 supporting feature cards */}
              {[
                {
                  icon: Sparkles,
                  title: "AI content team",
                  desc: "A full creative team powered by AI — writing scripts, generating videos, and building your brand presence daily.",
                  accent: "from-utility-400/30 to-transparent",
                },
                {
                  icon: Zap,
                  title: "Automated posting",
                  desc: "Schedule to Instagram, TikTok, LinkedIn, YouTube, and Facebook from one dashboard. Set it and forget it.",
                  accent: "from-special-500/30 to-transparent",
                },
                {
                  icon: ArrowRight,
                  title: "Performance insights",
                  desc: "Track views, engagement, and ROI across every platform. Know what drives real results.",
                  accent: "from-utility-400/30 to-transparent",
                },
                {
                  icon: Check,
                  title: "Content calendar",
                  desc: "Plan, preview, and approve your entire week of content in one place. Nothing posts without your sign-off.",
                  accent: "from-special-500/30 to-transparent",
                },
                {
                  icon: Play,
                  title: "Multi-platform optimization",
                  desc: "Every video is automatically optimized per platform — aspect ratios, captions, and posting times.",
                  accent: "from-utility-400/20 via-special-500/20 to-transparent",
                },
              ].map((feature, i) => {
                // First 2 small cards take col-span-2 next to hero (top-right area)
                // Remaining 3 form the bottom row
                const span = i < 2 ? "md:col-span-2" : "md:col-span-2";
                return (
                  <div
                    key={i}
                    className={`relative ${span} p-7 rounded-2xl card-hairline overflow-hidden group`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${feature.accent}`}
                    />
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 group-hover:border-white/[0.12] transition-colors">
                      <feature.icon className="w-4 h-4 text-white/50" />
                    </div>
                    <h3 className="text-p1 font-semibold text-white/90 mb-2.5">
                      {feature.title}
                    </h3>
                    <p className="text-p3 text-white/30 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/features"
                className="text-p3 text-utility-400/70 hover:text-utility-400 transition-colors"
              >
                See all features &rarr;
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Real results spotlight — replaces flat industries section */}
      <FadeIn>
        <section className="py-28 px-6 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-special-500/[0.06] border border-special-500/[0.15] mb-6">
                <span className="text-p3 text-special-500/90 font-medium">
                  Real results
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                Built for{" "}
                <span className="bg-gradient-to-r from-utility-400 to-special-500 bg-clip-text text-transparent">
                  professionals
                </span>{" "}
                who need to be everywhere.
              </h2>
              <p className="text-p1 text-white/40 mt-4">
                Real outcomes from people using Official AI today.
              </p>
            </div>

            {/* 4 spotlight cards — one per ICP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  industry: "Legal",
                  metric: "3",
                  unit: "new clients",
                  outcome: "from a single TikTok clip in week one",
                  name: "Marcus Rivera",
                  title: "Managing Partner · Personal Injury Law",
                  initials: "MR",
                  accent: "from-utility-400/30 to-transparent",
                  glow: "from-utility-400/[0.08]",
                },
                {
                  industry: "Medical",
                  metric: "60%",
                  unit: "of new patients",
                  outcome: "mention seeing my videos before booking",
                  name: "Dr. Priya Patel",
                  title: "Board-Certified Dermatologist",
                  initials: "PP",
                  accent: "from-special-500/30 to-transparent",
                  glow: "from-special-500/[0.08]",
                },
                {
                  industry: "Real Estate",
                  metric: "$2.4M",
                  unit: "in listings",
                  outcome: "sourced from social this quarter alone",
                  name: "Sarah Mitchell",
                  title: "Broker / Owner",
                  initials: "SM",
                  accent: "from-utility-400/20 via-special-500/20 to-transparent",
                  glow: "from-utility-400/[0.06]",
                },
                {
                  industry: "Advisors",
                  metric: "5x",
                  unit: "discovery calls",
                  outcome: "after switching from monthly to daily content",
                  name: "James Chen",
                  title: "CFP · Wealth Management",
                  initials: "JC",
                  accent: "from-special-500/30 to-transparent",
                  glow: "from-special-500/[0.08]",
                },
              ].map((card, i) => (
                <FadeIn key={i} delay={i * 0.08} duration={0.6}>
                  <div className="relative h-full p-8 md:p-10 rounded-2xl card-hairline overflow-hidden group">
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${card.accent}`} />
                    {/* Ambient corner glow */}
                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${card.glow} to-transparent rounded-full blur-3xl pointer-events-none`} />

                    {/* Industry tag */}
                    <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
                      <div className="w-1 h-1 rounded-full bg-gradient-to-r from-utility-400 to-special-500" />
                      <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                        {card.industry}
                      </span>
                    </div>

                    {/* Big metric */}
                    <div className="relative mb-4">
                      <div className="text-[56px] md:text-[72px] leading-[0.9] font-bold tracking-tighter bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                        {card.metric}
                      </div>
                      <div className="text-p2 text-white/50 font-medium mt-1">
                        {card.unit}
                      </div>
                    </div>

                    {/* Outcome */}
                    <p className="relative text-p2 text-white/60 leading-relaxed mb-8">
                      {card.outcome}
                    </p>

                    {/* Author */}
                    <div className="relative flex items-center gap-3 pt-6 border-t border-white/[0.04]">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-utility-400/20 to-special-500/20 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <span className="text-p3 font-semibold text-white/60">
                          {card.initials}
                        </span>
                      </div>
                      <div>
                        <div className="text-p3 font-medium text-white/80">
                          {card.name}
                        </div>
                        <div className="text-p3 text-white/30">
                          {card.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/use-cases"
                className="text-p3 text-utility-400/70 hover:text-utility-400 transition-colors"
              >
                Explore all use cases &rarr;
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Pricing — elevated main plan + enterprise */}
      <FadeIn>
        <section id="pricing" className="py-28 px-6 border-t border-white/[0.04] scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-utility-400/[0.06] border border-utility-400/[0.15] mb-6">
                <span className="text-p3 text-utility-400/80 font-medium">
                  Pricing
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                One plan. Everything{" "}
                <span className="bg-gradient-to-r from-utility-400 to-special-500 bg-clip-text text-transparent">
                  included.
                </span>
              </h2>
              <p className="text-p1 text-white/40 mt-4">
                Replaces a $4,000/mo videographer. Costs less than your morning coffee.
              </p>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mb-12">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-p3 font-medium transition-all cursor-pointer ${
                  billing === "monthly"
                    ? "bg-white/[0.08] border border-white/[0.15] text-white"
                    : "border border-transparent text-white/40 hover:text-white/60"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`relative px-5 py-2 rounded-full text-p3 font-medium transition-all cursor-pointer ${
                  billing === "annual"
                    ? "bg-white/[0.08] border border-white/[0.15] text-white"
                    : "border border-transparent text-white/40 hover:text-white/60"
                }`}
              >
                Annual
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-gradient-to-r from-utility-400/20 to-special-500/20 border border-utility-400/30 text-[10px] text-utility-400 font-semibold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {/* Main plan — elevated */}
              <div className="relative">
                {/* "Most popular" badge — outside overflow-hidden container so it doesn't clip */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center gap-1.5 text-p3 font-semibold text-white bg-gradient-to-r from-utility-400 to-special-500 px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    Most popular
                  </span>
                </div>

                <div className="relative p-8 md:p-10 rounded-2xl overflow-hidden">
                  {/* Brand-gradient ring */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-utility-400/40 via-special-500/30 to-white/[0.06] p-px">
                    <div className="h-full w-full rounded-2xl bg-[#050508]" />
                  </div>
                  {/* Ambient corner glow */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-utility-400/[0.10] rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-special-500/[0.08] rounded-full blur-3xl pointer-events-none" />

                  <div className="relative">
                  <h3 className="text-p1 font-semibold text-white/90 mt-2">
                    Official AI
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-4 mb-2">
                    <span className="text-[64px] leading-none font-bold tracking-tighter text-white">
                      ${billing === "annual" ? "63" : "79"}
                    </span>
                    <span className="text-p2 text-white/40">/mo</span>
                  </div>
                  <p className="text-p3 text-white/30 mb-8">
                    {billing === "annual"
                      ? "Billed $756 annually — save $192/yr"
                      : "Billed monthly. Cancel anytime."}
                  </p>

                  {/* Grouped features */}
                  <div className="space-y-5 mb-8">
                    <div>
                      <p className="text-[11px] font-semibold text-utility-400/70 uppercase tracking-wider mb-3">
                        Create
                      </p>
                      <ul className="space-y-2.5">
                        {[
                          "30 videos per month",
                          "Voice cloning + character sheets",
                          "Multi-cut composition",
                        ].map((f, j) => (
                          <li
                            key={j}
                            className="flex items-center gap-2.5 text-p3 text-white/60"
                          >
                            <Check className="w-3.5 h-3.5 text-positive-400/70 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-white/[0.04]">
                      <p className="text-[11px] font-semibold text-special-500/80 uppercase tracking-wider mb-3">
                        Distribute
                      </p>
                      <ul className="space-y-2.5">
                        {[
                          "Auto-post to all platforms",
                          "Approval queue + content calendar",
                          "Performance analytics",
                        ].map((f, j) => (
                          <li
                            key={j}
                            className="flex items-center gap-2.5 text-p3 text-white/60"
                          >
                            <Check className="w-3.5 h-3.5 text-positive-400/70 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    href="/auth/signup"
                    className="group relative block text-center text-p2 font-semibold py-4 min-h-[52px] flex items-center justify-center rounded-xl bg-white text-[#050508] hover:bg-white/95 transition-all shadow-xl"
                  >
                    Start free trial
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                </div>
              </div>

              {/* Enterprise */}
              <div className="relative p-8 md:p-10 rounded-2xl card-hairline overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/[0.1] to-transparent" />

                <h3 className="text-p1 font-semibold text-white/90 mt-2">
                  Enterprise
                </h3>
                <div className="flex items-baseline gap-1.5 mt-4 mb-2">
                  <span className="text-[64px] leading-none font-bold tracking-tighter text-white">
                    Custom
                  </span>
                </div>
                <p className="text-p3 text-white/30 mb-8">
                  Volume pricing for teams of 10+
                </p>

                <div className="space-y-5 mb-8">
                  <div>
                    <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
                      Everything in Official AI, plus
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        "Unlimited videos",
                        "Dedicated success manager",
                        "Custom AI models",
                        "API access",
                        "Multi-user accounts + SSO",
                        "Priority support + SLA",
                      ].map((f, j) => (
                        <li
                          key={j}
                          className="flex items-center gap-2.5 text-p3 text-white/50"
                        >
                          <Check className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href="mailto:hello@theofficial.ai?subject=Enterprise%20Inquiry"
                  className="group block text-center text-p2 font-semibold py-4 min-h-[52px] flex items-center justify-center rounded-xl border border-white/[0.1] text-white/80 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.02] transition-all"
                >
                  Talk to sales
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Reassurance row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {[
                "No credit card required",
                "7-day free trial",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-positive-400/60" />
                  <span className="text-p3 text-white/40 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/pricing"
                className="text-p3 text-utility-400/70 hover:text-utility-400 transition-colors"
              >
                See full pricing details &rarr;
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <FadeIn>
        <section className="py-28 px-6 border-t border-white/[0.04]">
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none">
              <div className="absolute inset-0 bg-utility-400/[0.03] rounded-full blur-[80px]" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-8">
                <Zap className="w-3 h-3 text-yellow-400/70" />
                <span className="text-p3 text-white/40 font-medium">
                  Get your first video in 5 minutes
                </span>
              </div>

              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white mb-4">
                Ready to stop filming?
              </h2>
              <p className="text-p1 text-white/30 mb-8 max-w-md mx-auto">
                Upload your photos and let AI handle the rest. Your social
                presence, automated.
              </p>
              <Link
                href="/demo"
                className="btn-cta-glow group inline-flex items-center justify-center gap-2.5 px-8 py-4 min-h-[48px] w-full sm:w-auto rounded-xl bg-white text-[#050508] text-p2 font-semibold hover:bg-white/90 active:bg-white/80 transition-all"
              >
                Try it free — no signup
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>
    </MarketingLayout>
  );
}

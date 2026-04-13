"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Copy, Check, Shuffle } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import MeshMockup from "@/components/marketing/MeshMockup";
import FadeIn from "@/components/motion/FadeIn";

type Industry = "general" | "realtor" | "lawyer" | "advisor" | "doctor";

const HOOKS: Record<Industry, string[]> = {
  general: [
    "Nobody's telling you this, but…",
    "Here's what I wish I knew 5 years ago.",
    "If you're doing X, stop. Here's why.",
    "I tested this for 30 days. The result shocked me.",
    "Three things nobody tells you about [topic].",
    "This is the cheat code for [outcome].",
    "Most people get this completely wrong.",
    "The biggest myth about [topic] — debunked in 60 seconds.",
    "I made every mistake so you don't have to.",
    "Steal this 60-second framework.",
    "Your competitors are doing this. You should too.",
    "Here's the version of this story nobody tells.",
    "I broke this down so a 10-year-old could understand it.",
    "If you only have 60 seconds, watch this.",
    "Three signs you're about to make a $10,000 mistake.",
    "The 1% know this. The 99% don't.",
    "Read this before you do anything else today.",
    "What I'd do if I had to start from scratch.",
    "This took me 10 years to learn. You get it free.",
    "If you're [audience], you need to hear this.",
  ],
  realtor: [
    "The #1 reason your house isn't selling.",
    "Three things that drop your home value overnight.",
    "What sellers don't tell you about closing costs.",
    "If you're buying in [city], read this first.",
    "Why I just turned down a listing — and what that tells you.",
    "The hidden fee buyers always miss.",
    "Here's what $500k buys you in [neighborhood] right now.",
    "I'd never buy a house without checking this one thing.",
    "Five red flags during a home tour.",
    "How I helped a client win a bidding war for $20k under asking.",
    "The market just shifted. Here's what it means for you.",
    "My honest take on rates this month.",
    "Three upgrades that actually pay back at resale.",
    "What I'd do if I were a first-time buyer in 2026.",
    "The best time to list isn't when you think.",
  ],
  lawyer: [
    "If you're getting sued, do these three things first.",
    "The biggest mistake people make signing contracts.",
    "What I tell every client on day one.",
    "Here's what 'as is' really means in [state].",
    "Three clauses you should never agree to.",
    "Why I'd never represent myself — even as an attorney.",
    "If you're starting a business, read this first.",
    "The free legal advice nobody gives you.",
    "Here's what really happens when you call a lawyer.",
    "Why your DIY contract probably isn't enforceable.",
    "Five things to never say to police.",
    "The estate plan mistake that costs families everything.",
    "If you're getting divorced, do this in week one.",
    "How to negotiate without a lawyer in the room.",
    "This one clause has saved my clients millions.",
  ],
  advisor: [
    "If you have $100k saved, do this next.",
    "The biggest tax mistake high-earners make.",
    "Three signs your portfolio is too risky.",
    "Why I told my own family to stop doing this.",
    "Here's what the wealthy actually invest in.",
    "If you're 5 years from retirement, read this.",
    "The Roth vs. Traditional decision — settled in 60 seconds.",
    "What I'd do with $50k right now.",
    "Three retirement myths I'm tired of hearing.",
    "Here's the math nobody runs on a 401(k) match.",
    "How to legally pay less in taxes this year.",
    "If your advisor isn't doing this, fire them.",
    "The fee that's quietly eating your returns.",
    "Three signs you can actually afford to retire.",
    "Why most people retire poorer than they should.",
  ],
  doctor: [
    "Three symptoms you should never ignore.",
    "What I tell every patient about sleep.",
    "If you only do one thing for your health this year, do this.",
    "The supplement aisle is mostly marketing. Here's what works.",
    "Why I stopped recommending [common thing].",
    "Three lab numbers your doctor should be tracking.",
    "Here's what 10,000 patient visits taught me.",
    "If you're over 40, ask your doctor for these.",
    "The biggest lie in wellness right now.",
    "Why your back actually hurts.",
    "Three foods I eat almost every day.",
    "If you're constantly tired, check these first.",
    "The honest truth about [popular trend].",
    "What I'd do at the first sign of [condition].",
    "Five questions to ask before any procedure.",
  ],
};

const LABELS: Record<Industry, string> = {
  general: "General",
  realtor: "Real Estate",
  lawyer: "Legal",
  advisor: "Financial",
  doctor: "Medical",
};

export default function HookGeneratorClient() {
  const [industry, setIndustry] = useState<Industry>("general");
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const shown = useMemo(() => {
    const list = [...HOOKS[industry]];
    // Shuffle deterministically by seed
    const out: string[] = [];
    const rng = (n: number) => {
      let x = (seed + 1) * (n + 1) * 9301 + 49297;
      return (x % 233280) / 233280;
    };
    while (list.length) {
      const i = Math.floor(rng(list.length) * list.length);
      out.push(list.splice(i, 1)[0]);
    }
    return out.slice(0, 12);
  }, [industry, seed]);

  const totalCount = HOOKS.general.length + HOOKS.realtor.length + HOOKS.lawyer.length + HOOKS.advisor.length + HOOKS.doctor.length;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Free tool"
        eyebrowIcon={Sparkles}
        eyebrowVariant="special"
        spacing="pt-32 pb-12"
        headline={
          <>
            Video <GradientText tone="brand">Hook Generator</GradientText>
          </>
        }
        description={`${totalCount}+ proven first-line hooks for short-form video. Pick your industry and start scripting.`}
      />

      <section className="relative px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <MeshMockup aspect="aspect-auto" className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LABELS) as Industry[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setIndustry(key);
                      setSeed((s) => s + 1);
                    }}
                    className={`text-p3 font-semibold px-4 py-2 rounded-lg border transition-all ${
                      industry === key
                        ? "bg-special-500/[0.12] border-special-500/40 text-special-200"
                        : "bg-white/[0.02] border-white/[0.08] text-white/70 hover:text-white/85 hover:border-white/[0.16]"
                    }`}
                  >
                    {LABELS[key]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="inline-flex items-center gap-2 text-p3 font-semibold px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.10] text-white/70 hover:text-white hover:border-white/[0.20] transition-all"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Shuffle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {shown.map((hook, i) => (
                  <motion.button
                    key={`${industry}-${seed}-${i}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: 0.35,
                      delay: i * 0.025,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                    onClick={() => copy(hook)}
                    className="group relative overflow-hidden text-left p-4 rounded-xl card-hairline transition-all flex items-start justify-between gap-3"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-special-500/30 via-utility-400/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-p2 text-white/80 leading-relaxed">
                      {hook}
                    </span>
                    {copied === hook ? (
                      <Check className="w-4 h-4 mt-1 text-utility-400 flex-shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 mt-1 text-white/60 group-hover:text-white/70 flex-shrink-0 transition-colors" />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <h2 className="text-p2 font-semibold text-white/85 mb-2">
                How to use these hooks
              </h2>
              <p className="text-p3 text-white/70 leading-relaxed">
                The first 3 seconds of a short-form video decide whether someone keeps
                watching. These hooks are pattern-tested across LinkedIn, TikTok, and
                Reels. Pair one with a single concrete claim and one CTA — that's the
                entire script.
              </p>
            </div>
          </MeshMockup>
        </div>
      </section>

      {/* CTA outro */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                Trained on your tone
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Want hooks written{" "}
              <GradientText tone="brand">in your voice?</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              Official AI writes the hook, the script, and ships the whole
              video — automatically.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/how-it-works"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                See how it works
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features/script-engine"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                Script engine
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

"use client";

import Link from "next/link";
import { useRef, type ReactElement } from "react";
import { motion, useInView } from "framer-motion";
import {
  Camera,
  Sparkles,
  Send,
  ArrowRight,
  ScanFace,
  Layers,
  Film,
  MonitorPlay,
  Mic,
  CalendarCheck,
  CheckCircle,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import StatCard from "@/components/marketing/StatCard";
import GlowBlob from "@/components/marketing/GlowBlob";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import TwinMockup from "@/components/features/mockups/TwinMockup";
import StudioMockup from "@/components/features/mockups/StudioMockup";
import PublishingMockup from "@/components/features/mockups/PublishingMockup";

/* ------------------------------------------------------------------ */
/*  Accent map                                                         */
/* ------------------------------------------------------------------ */

type Accent = "utility" | "special" | "mix";

const accent: Record<
  Accent,
  {
    border: string;
    bg: string;
    text: string;
    line: string;
    dot: string;
    chip: string;
    glow: string;
    pillBorder: string;
  }
> = {
  utility: {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.08]",
    text: "text-utility-300",
    line: "from-utility-400/50 via-utility-400/15 to-transparent",
    dot: "bg-utility-400",
    chip: "bg-utility-400/[0.10] border-utility-400/25 text-utility-200",
    glow: "from-utility-400/20 via-utility-400/[0.04] to-transparent",
    pillBorder: "border-utility-400/30",
  },
  special: {
    border: "border-special-500/30",
    bg: "bg-special-500/[0.08]",
    text: "text-special-300",
    line: "from-special-500/50 via-special-500/15 to-transparent",
    dot: "bg-special-400",
    chip: "bg-special-500/[0.10] border-special-500/25 text-special-200",
    glow: "from-special-500/20 via-special-500/[0.04] to-transparent",
    pillBorder: "border-special-500/30",
  },
  mix: {
    border: "border-white/[0.10]",
    bg: "bg-white/[0.04]",
    text: "text-white",
    line: "from-utility-400/40 via-special-500/30 to-transparent",
    dot: "bg-gradient-to-br from-utility-400 to-special-500",
    chip: "bg-white/[0.06] border-white/[0.12] text-white/85",
    glow: "from-utility-400/15 via-special-500/15 to-transparent",
    pillBorder: "border-white/[0.18]",
  },
};

/* ------------------------------------------------------------------ */
/*  Step data                                                          */
/* ------------------------------------------------------------------ */

type Detail = { icon: LucideIcon; label: string; text: string };
type Step = {
  num: string;
  id: string;
  icon: LucideIcon;
  accent: Accent;
  title: string;
  subtitle: string;
  description: string;
  shortLabel: string;
  pillStat: string;
  details: Detail[];
};

const steps: Step[] = [
  {
    num: "01",
    id: "upload",
    icon: Camera,
    accent: "utility",
    title: "Upload 3 photos",
    subtitle: "AI builds your digital twin",
    shortLabel: "Upload photos",
    pillStat: "3 selfies",
    description:
      "Take three photos from your phone — front-facing, slight angle, and profile. That is all the AI needs to build a complete digital representation of you.",
    details: [
      {
        icon: ScanFace,
        label: "Character sheets",
        text: "The AI generates detailed character sheets that capture your facial structure, skin tone, hair, and distinguishing features from every angle.",
      },
      {
        icon: ImageIcon,
        label: "360-degree consistency",
        text: "Your digital twin maintains perfect likeness whether the camera is head-on, in profile, or anywhere between. No uncanny valley.",
      },
      {
        icon: Layers,
        label: "Expression mapping",
        text: "The model captures your natural expressions — how you smile, how you talk, how you emphasize a point. It looks like you because it learned from you.",
      },
    ],
  },
  {
    num: "02",
    id: "create",
    icon: Sparkles,
    accent: "special",
    title: "Choose a format",
    subtitle: "AI creates multi-cut video with real editing",
    shortLabel: "Generate video",
    pillStat: "5+ formats",
    description:
      "Pick from proven content formats — market update, quick tip, story-based, testimonial highlight, or let the AI recommend what works for your industry.",
    details: [
      {
        icon: Film,
        label: "Multi-cut composition",
        text: "Every video is 3-8 separate clips stitched together with hooks, transitions, B-roll, and CTAs. Real video editing, not one-shot AI output.",
      },
      {
        icon: MonitorPlay,
        label: "Starting frames",
        text: "Each cut begins from a carefully composed starting frame — specific camera angle, expression, body position. How real directors plan shots.",
      },
      {
        icon: Mic,
        label: "Format-first approach",
        text: "The format dictates the video structure, not the other way around. A market update has different pacing than a quick tip — the AI knows the difference.",
      },
    ],
  },
  {
    num: "03",
    id: "publish",
    icon: Send,
    accent: "mix",
    title: "Approve and auto-post",
    subtitle: "Scheduled publishing to every platform",
    shortLabel: "Publish everywhere",
    pillStat: "5 platforms",
    description:
      "Every video lands in your approval queue. Review it, request changes, or approve it. Once approved, it auto-posts to every platform on your schedule.",
    details: [
      {
        icon: CheckCircle,
        label: "Approval queue",
        text: "Nothing goes live without your sign-off. Preview every video, check the script, and approve or request revisions. You always have final say.",
      },
      {
        icon: CalendarCheck,
        label: "Smart scheduling",
        text: "The AI analyzes when your audience is most active on each platform and suggests optimal posting times. Or set your own schedule.",
      },
      {
        icon: Send,
        label: "Cross-platform publishing",
        text: "One approval publishes to Instagram Reels, TikTok, LinkedIn, YouTube Shorts, and Facebook — each version optimized for that platform.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Hero step rail                                                     */
/* ------------------------------------------------------------------ */

function HeroStepRail() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const colors = accent[step.accent];
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="flex items-center gap-2 sm:gap-3 min-w-0"
            >
              <Link
                href={`#${step.id}`}
                className={`group relative flex-1 min-w-0 flex items-center gap-3 px-4 py-3 rounded-2xl card-hairline ${colors.pillBorder} hover:border-white/20 transition-all overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-60 group-hover:opacity-100 transition-opacity`}
                />
                <div
                  className={`relative flex-shrink-0 w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="relative min-w-0">
                  <div className="text-[10px] font-mono font-semibold text-white/70 tracking-widest">
                    STEP {step.num}
                  </div>
                  <div className="text-p3 sm:text-p2 font-semibold text-white/90 truncate">
                    {step.shortLabel}
                  </div>
                </div>
                <div
                  className={`relative ml-auto hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${colors.chip}`}
                >
                  {step.pillStat}
                </div>
              </Link>
              {i < steps.length - 1 && (
                <ArrowRight className="flex-shrink-0 w-4 h-4 text-white/60" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mockup map                                                         */
/* ------------------------------------------------------------------ */

const mockups: Record<string, () => ReactElement> = {
  upload: TwinMockup,
  create: StudioMockup,
  publish: PublishingMockup,
};

/* ------------------------------------------------------------------ */
/*  Step section                                                       */
/* ------------------------------------------------------------------ */

function StepSection({ step, index }: { step: Step; index: number }) {
  const colors = accent[step.accent];
  const Icon = step.icon;
  const Mockup = mockups[step.id];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px 0px" });
  const titleFirst = index % 2 === 0;

  return (
    <section
      ref={ref}
      id={step.id}
      className={`relative py-24 px-6 scroll-mt-24 ${index > 0 ? "border-t border-white/[0.04]" : ""}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title + Mockup row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Title block */}
          <div
            className={`lg:col-span-5 flex ${titleFirst ? "lg:order-1" : "lg:order-2"}`}
          >
            <FadeIn className="w-full">
              <div className="h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <span className="text-p3 text-white/70 font-mono font-semibold tracking-widest">
                    STEP {step.num}
                  </span>
                </div>
                <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mb-3">
                  {step.title}
                </h2>
                <p className={`text-p1 font-semibold ${colors.text} mb-4`}>
                  {step.subtitle}
                </p>
                <p className="text-p2 text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Mockup */}
          <div
            className={`lg:col-span-7 ${titleFirst ? "lg:order-2" : "lg:order-1"}`}
          >
            <FadeIn delay={0.08}>
              <div className="relative h-full rounded-2xl card-hairline overflow-hidden">
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                />
                <Mockup />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Detail cards row */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {step.details.map((detail) => {
            const DIcon = detail.icon;
            return (
              <motion.div
                key={detail.label}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                className="group relative overflow-hidden p-5 rounded-2xl card-hairline"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                />
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                  >
                    <DIcon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="text-p2 font-semibold text-white/85 mb-1">
                      {detail.label}
                    </h3>
                    <p className="text-p3 text-white/70 leading-relaxed">
                      {detail.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Comparison section                                                 */
/* ------------------------------------------------------------------ */

const compareRows = [
  {
    feature: "Editing approach",
    ours: "3-8 separate clips stitched with professional transitions and pacing",
    theirs: "Single continuous AI generation that screams artificial",
  },
  {
    feature: "Likeness model",
    ours: "Detailed character sheets with 360-degree consistency",
    theirs: "Basic face swap that breaks on angles and lighting",
  },
  {
    feature: "Content strategy",
    ours: "Format-first — structure, pacing, and editing driven by the format",
    theirs: "Generic prompt-to-video with no understanding of content",
  },
  {
    feature: "Shot planning",
    ours: "Composed starting frames — angle, expression, and position planned",
    theirs: "Random generation with no directorial intent",
  },
];

function ComparisonSection() {
  return (
    <section className="relative py-28 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-utility-400/[0.06] border border-utility-400/[0.15] mb-6">
              <span className="text-p3 text-utility-300/90 font-medium">
                The difference
              </span>
            </div>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
              Why this looks real{" "}
              <GradientText tone="brand">and others don&apos;t.</GradientText>
            </h2>
            <p className="text-p1 text-white/70 mt-5 max-w-2xl mx-auto">
              The four engineering decisions that separate us from every other
              AI video tool on the market.
            </p>
          </div>
        </FadeIn>

        {/* Comparison table */}
        <FadeIn delay={0.1}>
          <div className="relative rounded-2xl card-hairline overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/40 via-special-500/30 to-transparent" />

            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="col-span-12 md:col-span-3 text-p3 font-mono font-semibold text-white/70 uppercase tracking-widest">
                Feature
              </div>
              <div className="col-span-12 md:col-span-5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-utility-400/[0.12] border border-utility-400/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-utility-300" strokeWidth={3} />
                </div>
                <span className="text-p3 font-semibold text-utility-200 tracking-wide">
                  Official AI
                </span>
              </div>
              <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center">
                  <X className="w-3 h-3 text-white/70" strokeWidth={3} />
                </div>
                <span className="text-p3 font-semibold text-white/70 tracking-wide">
                  Other AI tools
                </span>
              </div>
            </div>

            {/* Rows */}
            <div>
              {compareRows.map((row, i) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/[0.015] transition-colors ${i < compareRows.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                >
                  <div className="col-span-12 md:col-span-3 text-p2 font-semibold text-white/85">
                    {row.feature}
                  </div>
                  <div className="col-span-12 md:col-span-5 flex items-start gap-2.5">
                    <div className="w-4 h-4 mt-1 rounded-full bg-positive-500/10 border border-positive-500/25 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-positive-400" />
                    </div>
                    <p className="text-p2 text-white/70 leading-relaxed">
                      {row.ours}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex items-start gap-2.5">
                    <div className="w-4 h-4 mt-1 rounded-full bg-negative-500/10 border border-negative-500/25 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-negative-400" />
                    </div>
                    <p className="text-p2 text-white/70 leading-relaxed">
                      {row.theirs}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Stat strip */}
        <FadeIn delay={0.2}>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              value="3-8"
              label="Cuts per video"
              caption="Real multi-cut editing"
              accent="utility"
            />
            <StatCard
              value="360°"
              label="Likeness consistency"
              caption="Every angle, every shot"
              accent="utility"
            />
            <StatCard
              value="5+"
              label="Content formats"
              caption="Format dictates structure"
              accent="special"
            />
            <StatCard
              value="100%"
              label="Directed frames"
              caption="No random generation"
              accent="special"
            />
          </div>
        </FadeIn>

        <div className="mt-10 text-center">
          <Link
            href="/features"
            className="group inline-flex items-center gap-2 text-p3 font-semibold text-utility-300 hover:text-utility-200 transition-colors"
          >
            Explore all features
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA outro                                                          */
/* ------------------------------------------------------------------ */

function CtaOutro() {
  return (
    <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
      <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
      <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

      <div className="relative max-w-4xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
            <Sparkles className="w-3 h-3 text-utility-300" />
            <span className="text-p3 text-white/60 font-medium">
              Setup takes less than 5 minutes
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
            Three steps.{" "}
            <GradientText tone="brand">One approval queue.</GradientText>
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-p1 text-white/70 max-w-2xl mx-auto mb-8">
            Upload your photos, pick a format, and let the AI handle the rest.
            From idea to published clip in under five minutes.
          </p>
        </FadeIn>

        {/* Mini step recap */}
        <FadeIn delay={0.15}>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
            {steps.map((step, i) => {
              const colors = accent[step.accent];
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.border} border`}
                  >
                    <Icon className={`w-3 h-3 ${colors.text}`} />
                    <span className={`text-p3 font-medium ${colors.text}`}>
                      {step.shortLabel}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
            >
              Start with step 1
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              See all features
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HowItWorksClient() {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="How it works"
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Three steps to{" "}
            <GradientText tone="brand">content autopilot.</GradientText>
          </>
        }
        description="Upload your photos. Pick a format. The AI does the rest — writing, filming, editing, and publishing. Here is exactly how each step works."
        belowActions={<HeroStepRail />}
      />

      {steps.map((step, i) => (
        <StepSection key={step.id} step={step} index={i} />
      ))}

      <ComparisonSection />
      <CtaOutro />
    </MarketingLayout>
  );
}

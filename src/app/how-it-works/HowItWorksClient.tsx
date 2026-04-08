"use client";

import Link from "next/link";
import {
  Camera,
  Sparkles,
  Send,
  ArrowRight,
  Image,
  Layers,
  Film,
  Mic,
  MonitorPlay,
  CalendarCheck,
  CheckCircle,
  ScanFace,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import FadeIn from "@/components/motion/FadeIn";

const steps = [
  {
    num: "01",
    icon: Camera,
    title: "Upload 3 photos",
    subtitle: "AI builds your digital twin",
    accent: "blue",
    description:
      "Take three photos from your phone — front-facing, slight angle, and profile. That is all the AI needs to build a complete digital representation of you.",
    details: [
      {
        icon: ScanFace,
        label: "Character sheets",
        text: "The AI generates detailed character sheets that capture your facial structure, skin tone, hair, and distinguishing features from every angle.",
      },
      {
        icon: Image,
        label: "360-degree consistency",
        text: "Your digital twin maintains perfect likeness whether the camera is head-on, in profile, or at any angle between. No uncanny valley.",
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
    icon: Sparkles,
    title: "Choose a format",
    subtitle: "AI creates multi-cut video with real editing",
    accent: "violet",
    description:
      "Pick from proven content formats — market update, quick tip, story-based, testimonial highlight, or let the AI recommend what works for your industry.",
    details: [
      {
        icon: Film,
        label: "Multi-cut composition",
        text: "Every video is 3-8 separate clips stitched together with hooks, transitions, B-roll, and CTAs. This is real video editing, not one-shot AI output.",
      },
      {
        icon: MonitorPlay,
        label: "Starting frames",
        text: "Each cut begins from a carefully composed starting frame — specific camera angle, expression, and body position. This is how real directors plan shots.",
      },
      {
        icon: Mic,
        label: "Format-first approach",
        text: "The content format dictates the video structure, not the other way around. A market update has different pacing than a quick tip. The AI knows the difference.",
      },
    ],
  },
  {
    num: "03",
    icon: Send,
    title: "Approve and auto-post",
    subtitle: "Scheduled publishing to all platforms",
    accent: "emerald",
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
        text: "One approval publishes to Instagram Reels, TikTok, LinkedIn, YouTube Shorts, and Facebook. Each version is optimized for that platform's format.",
      },
    ],
  },
];

const accentColors: Record<
  string,
  { border: string; bg: string; text: string; line: string }
> = {
  blue: {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.06]",
    text: "text-utility-300",
    line: "from-utility-400/40 via-utility-400/15 to-transparent",
  },
  violet: {
    border: "border-special-500/25",
    bg: "bg-special-500/[0.06]",
    text: "text-special-300",
    line: "from-special-500/40 via-special-500/15 to-transparent",
  },
  emerald: {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.06]",
    text: "text-utility-300",
    line: "from-utility-400/40 via-special-500/15 to-transparent",
  },
};

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
      />


      {/* Steps */}
      {steps.map((step, index) => {
        const colors = accentColors[step.accent];
        return (
          <section
            key={step.num}
            className={`relative py-24 px-6 ${index > 0 ? "border-t border-white/[0.04]" : ""}`}
          >
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5">
                  <FadeIn>
                    <div className="sticky top-24">
                      <div className="flex items-center gap-3 mb-5">
                        <div
                          className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                        >
                          <step.icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <span className="text-p3 text-white/30 font-mono font-semibold">
                          STEP {step.num}
                        </span>
                      </div>

                      <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mb-3">
                        {step.title}
                      </h2>
                      <p
                        className={`text-p1 font-semibold ${colors.text} mb-4`}
                      >
                        {step.subtitle}
                      </p>
                      <p className="text-p2 text-white/45 leading-relaxed">
                        {step.description}
                      </p>

                      {index < steps.length - 1 && (
                        <div className="hidden lg:block mt-8">
                          <div className="w-px h-16 bg-gradient-to-b from-white/[0.10] to-transparent ml-5" />
                        </div>
                      )}
                    </div>
                  </FadeIn>
                </div>

                <div className="lg:col-span-7">
                  <div className="space-y-4">
                    {step.details.map((detail, i) => (
                      <FadeIn key={i} delay={0.05 + i * 0.08}>
                        <div className="group relative overflow-hidden p-6 rounded-2xl card-hairline transition-all duration-300">
                          <div
                            className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                          />
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors`}
                            >
                              <detail.icon
                                className={`w-4 h-4 ${colors.text}`}
                              />
                            </div>
                            <div>
                              <h3 className="text-p1 font-semibold text-white/85 mb-1.5">
                                {detail.label}
                              </h3>
                              <p className="text-p2 text-white/45 leading-relaxed">
                                {detail.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Tech advantage section */}
      <section className="relative py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="mb-14">
              <p className="text-p3 font-semibold text-utility-300/80 uppercase tracking-widest mb-3">
                The difference
              </p>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                Why this looks real
                <br />
                <span className="text-white/40">
                  and others look like AI.
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "Multi-cut vs. one-shot",
                ours: "3-8 separate clips stitched with professional editing, transitions, and pacing",
                theirs: "Single continuous AI generation that screams artificial",
              },
              {
                title: "Character sheets vs. face swap",
                ours: "Detailed character model trained from your photos with 360-degree consistency",
                theirs: "Basic face swap that breaks on angles and lighting changes",
              },
              {
                title: "Format-first vs. prompt-first",
                ours: "Content format drives video structure, pacing, and editing decisions",
                theirs: "Generic prompt-to-video with no understanding of content strategy",
              },
              {
                title: "Starting frames vs. random generation",
                ours: "Each shot starts from a composed frame — specific angle, expression, position",
                theirs: "Random generation with no directorial intent or visual planning",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="relative overflow-hidden p-6 rounded-2xl card-hairline transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 via-special-500/15 to-transparent" />
                  <h3 className="text-p1 font-semibold text-white/90 mb-4">
                    {item.title}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-positive-500/10 border border-positive-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-positive-400" />
                      </div>
                      <p className="text-p2 text-white/60 leading-relaxed">
                        {item.ours}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-negative-500/10 border border-negative-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-negative-400" />
                      </div>
                      <p className="text-p2 text-white/30 leading-relaxed">
                        {item.theirs}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

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

      <CTASection
        heading="See it in action."
        description="Upload your photos and get your first AI video in under five minutes. No filming required."
        badge="Setup takes less than 5 minutes"
      />
    </MarketingLayout>
  );
}

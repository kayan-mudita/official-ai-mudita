"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
  ChevronDown,
  Loader2,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { features } from "@/data/features";

/* ─── Data ─────────────────────────────────────────────────────── */

const valueAnchors = [
  {
    label: "Video production agency",
    cost: "$3,000-5,000/month for 4 videos",
  },
  {
    label: "Freelance videographer",
    cost: "$1,500/month for 8 videos",
  },
  {
    label: "DIY with ring light",
    cost: "Free but 20 hours of your time",
    noStrike: true,
  },
];

const mainPlan = {
  name: "Everything Plan",
  planId: "starter",
  price: "$79",
  period: "/mo",
  description: "Everything included. No upsells. No limits that matter.",
  features: [
    "30 videos per month",
    "All platforms (Instagram, TikTok, LinkedIn, YouTube, Facebook)",
    "Voice cloning",
    "AI digital twin",
    "Multi-cut composition",
    "Advanced analytics",
    "Auto-posting & scheduling",
    "Content calendar",
    "Smart scripts",
    "Brand vault",
  ],
  cta: "Start your free week — $79/mo after",
};

const enterprisePlan = {
  name: "Enterprise",
  planId: "enterprise",
  price: "Custom",
  period: "",
  description: "For teams and agencies that need scale and control.",
  features: [
    "Unlimited videos",
    "All platforms",
    "Dedicated support",
    "Custom AI models",
    "API access",
    "Multi-user accounts",
  ],
  cta: "Contact sales",
};

const comparisonFeatures = [
  {
    category: "Content Creation",
    features: [
      { name: "Videos per month", pro: "30", enterprise: "Unlimited" },
      { name: "AI digital twin", pro: true, enterprise: true },
      { name: "Multi-cut composition", pro: true, enterprise: true },
      { name: "Voice cloning", pro: true, enterprise: true },
      { name: "Smart scripts", pro: true, enterprise: true },
      { name: "Custom AI models", pro: false, enterprise: true },
    ],
  },
  {
    category: "Publishing",
    features: [
      { name: "Platforms", pro: "All", enterprise: "All" },
      { name: "Auto-posting", pro: true, enterprise: true },
      { name: "Content calendar", pro: true, enterprise: true },
      { name: "Optimal time scheduling", pro: true, enterprise: true },
    ],
  },
  {
    category: "Analytics & Admin",
    features: [
      { name: "Basic analytics", pro: true, enterprise: true },
      { name: "Advanced analytics", pro: true, enterprise: true },
      { name: "Brand vault", pro: true, enterprise: true },
      { name: "Multi-user accounts", pro: false, enterprise: true },
      { name: "API access", pro: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Email support", pro: true, enterprise: true },
      { name: "Priority generation", pro: true, enterprise: true },
      { name: "Dedicated support", pro: false, enterprise: true },
    ],
  },
];

const faqs = [
  {
    q: "How does the free trial work?",
    a: "Start your free 7-day trial with full access to every feature. Cancel anytime during the trial and you will not be charged. After 7 days, your plan begins at $79/mo.",
  },
  {
    q: "Why one plan instead of tiers?",
    a: "Because you deserve every feature from day one. We don't believe in holding back voice cloning or analytics behind a higher price. You get everything for $79.",
  },
  {
    q: "What platforms do you support?",
    a: "Instagram Reels, TikTok, LinkedIn, YouTube Shorts, and Facebook. Each video is automatically optimized for the platform it is posted to.",
  },
  {
    q: "How long does it take to get my first video?",
    a: "Under five minutes from signup to your first generated video. Upload your photos, pick a format, and the AI handles the rest.",
  },
  {
    q: "Will the videos actually look like me?",
    a: "Yes. The AI builds a detailed character model from your photos that maintains your likeness from every angle. This is not a face swap — it is a full digital twin.",
  },
  {
    q: "What if I do not like a video?",
    a: "Every video goes through your approval queue before posting. You can request revisions, edit the script, or reject it entirely. Nothing goes live without your approval.",
  },
  {
    q: "How does team pricing work?",
    a: "Each team member gets their own AI twin, voice clone, and content calendar for $79/seat per month. Contact us for teams of 10 or more for volume discounts.",
  },
  {
    q: "Is there a contract?",
    a: "No. Month-to-month billing. Cancel anytime, effective at the end of your current billing period.",
  },
];

const RELATED_FEATURE_SLUGS = [
  "ai-video-studio",
  "ai-twin-voice",
  "auto-posting",
];

/* ─── Countdown Hook ─────────────────────────────────────────────── */

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const getExpiration = () => {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("promo_expiry")
          : null;
      if (stored) {
        const exp = new Date(stored);
        if (exp.getTime() > Date.now()) return exp;
      }
      const exp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      if (typeof window !== "undefined") {
        localStorage.setItem("promo_expiry", exp.toISOString());
      }
      return exp;
    };

    const expiry = getExpiration();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, expiry.getTime() - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-p3 text-white/65 font-medium">{value}</span>;
  }
  return value ? (
    <Check
      className="w-4 h-4 text-utility-300 mx-auto"
      strokeWidth={3}
    />
  ) : (
    <Minus className="w-4 h-4 text-white/15 mx-auto" />
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const countdown = useCountdown();

  const relatedFeatures = RELATED_FEATURE_SLUGS.map((s) =>
    features.find((f) => f.slug === s),
  ).filter((f): f is NonNullable<typeof f> => Boolean(f));

  async function handleSubscribe(planId: string) {
    if (planId === "enterprise") return;

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      if (res.status === 401) {
        router.push("/auth/signup");
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        router.push("/dashboard/settings?tab=plan");
      }
    } catch (err) {
      console.error("Checkout request failed:", err);
      router.push("/auth/signup");
    } finally {
      setLoadingPlan(null);
    }
  }

  const isLoading = loadingPlan === mainPlan.planId;

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Pricing"
        eyebrowVariant="utility"
        spacing="pt-32 pb-12"
        headline={
          <>
            One plan.{" "}
            <GradientText tone="brand">Everything included.</GradientText>
          </>
        }
        description="No tiers, no upsells. Every feature for one price. Try free for 7 days, then $79/mo. Cancel anytime."
      />

      {/* Stat strip */}
      <section className="relative px-6 -mt-2 pb-12">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <StatCard
                value="$79"
                label="Flat / month"
                caption="One plan, every feature included."
                accent="utility"
              />
              <StatCard
                value="30"
                label="Videos / month"
                caption="Generated, captioned, scheduled, and posted."
                accent="mix"
              />
              <StatCard
                value="7"
                label="Day free trial"
                caption="Full access. No credit card. Cancel anytime."
                accent="special"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Value anchor section */}
      <section className="pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <div className="relative rounded-2xl card-hairline overflow-hidden p-8">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/30 via-special-500/20 to-transparent" />
              <p className="text-p3 font-semibold text-white/45 uppercase tracking-widest mb-6 text-center">
                What this would cost elsewhere
              </p>

              <div className="space-y-4 mb-8">
                {valueAnchors.map((anchor, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-p2 text-white/55">{anchor.label}</span>
                    <span
                      className={`text-p2 font-semibold ${
                        anchor.noStrike
                          ? "text-white/35 italic"
                          : "text-negative-300/80 line-through decoration-negative-400/50 decoration-2"
                      }`}
                    >
                      {anchor.cost}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-6 text-center">
                <p className="text-p1 sm:text-h5 font-semibold text-white">
                  Official AI:{" "}
                  <GradientText tone="brand">$79/month</GradientText> for 30
                  videos.
                </p>
                <p className="text-p2 text-white/40 mt-1">
                  Zero hours of your time.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Promotional banner */}
      <section className="pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <div className="relative rounded-2xl card-hairline overflow-hidden p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/50 via-special-500/30 to-transparent" />
              <GlowBlob
                color="mix"
                size="md"
                position="top-right"
                intensity={0.08}
              />

              <div className="relative text-center">
                <p className="text-p3 font-semibold text-utility-300 uppercase tracking-widest mb-2">
                  Spring Launch Special
                </p>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="text-h2 font-bold text-white tracking-tight">
                    $59
                  </span>
                  <span className="text-p3 text-white/35">/mo</span>
                  <span className="text-p3 text-white/35 line-through ml-2">
                    $79/mo
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-white/65">
                    <Clock className="w-3.5 h-3.5 text-utility-300" />
                    <span className="text-p3 font-medium">Offer expires in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { value: countdown.days, label: "d" },
                      { value: countdown.hours, label: "h" },
                      { value: countdown.minutes, label: "m" },
                      { value: countdown.seconds, label: "s" },
                    ].map((unit, i) => (
                      <div key={i} className="flex items-center gap-0.5">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.10] text-p3 font-bold text-white tabular-nums">
                          {String(unit.value).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] text-white/30 font-medium">
                          {unit.label}
                        </span>
                        {i < 3 && (
                          <span className="text-white/15 text-p3 mx-0.5">
                            :
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-p3 text-utility-300/80 font-medium">
                  Lock in this rate forever
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main pricing card */}
      <section className="pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            <div className="relative p-8 rounded-2xl card-hairline overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/50 via-special-500/30 to-transparent" />

              {/* Popular badge */}
              <div className="absolute -top-3 left-8">
                <span className="text-p3 font-semibold text-utility-200 bg-utility-400/[0.12] border border-utility-400/30 px-3 py-1 rounded-full whitespace-nowrap shadow-[0_0_24px_rgba(15,203,255,0.18)]">
                  Everything included
                </span>
              </div>

              <h3 className="text-h5 font-semibold text-white/90 mt-2">
                {mainPlan.name}
              </h3>
              <div className="flex items-baseline gap-1.5 mt-3 mb-2">
                <span className="text-h1 font-bold text-white tracking-tight">
                  {mainPlan.price}
                </span>
                <span className="text-p2 text-white/35">{mainPlan.period}</span>
              </div>
              <p className="text-p3 text-white/40 mb-8">{mainPlan.description}</p>

              <ul className="space-y-3 mb-8">
                {mainPlan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2.5 text-p2 text-white/55"
                  >
                    <Check
                      className="w-3.5 h-3.5 text-utility-300 flex-shrink-0"
                      strokeWidth={3}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(mainPlan.planId)}
                disabled={isLoading}
                className="btn-cta-glow block w-full text-center text-p2 font-semibold py-4 min-h-[52px] flex items-center justify-center rounded-xl transition-all disabled:opacity-60 bg-white text-[#050508] hover:bg-white/90 active:bg-white/80"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mainPlan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              <p className="text-p3 text-white/30 text-center mt-3">
                Try free for 7 days. Cancel anytime.
              </p>
            </div>
          </FadeIn>

          {/* Enterprise below */}
          <FadeIn delay={0.05}>
            <div className="mt-5 p-6 rounded-2xl card-hairline overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-special-500/30 via-special-500/10 to-transparent" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-p1 font-semibold text-white/85">
                    {enterprisePlan.name}
                  </h3>
                  <p className="text-p3 text-white/40 mt-0.5">
                    {enterprisePlan.description}
                  </p>
                </div>
                <Link
                  href="mailto:hello@officialai.com?subject=Enterprise%20Inquiry"
                  className="text-p3 font-medium px-5 py-2.5 min-h-[40px] flex items-center justify-center rounded-xl transition-all border border-white/[0.10] text-white/65 hover:text-white hover:border-white/[0.20]"
                >
                  {enterprisePlan.cta}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Team pricing */}
      <section className="pb-24 px-6 border-t border-white/[0.04] pt-20">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
                <Users className="w-3 h-3 text-utility-300" />
                <span className="text-p3 text-white/60 font-medium">
                  Team pricing
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-3">
                Scale across{" "}
                <GradientText tone="brand">your firm.</GradientText>
              </h2>
              <p className="text-p1 text-white/45 max-w-lg mx-auto">
                Add team members at{" "}
                <span className="text-white/85 font-semibold">
                  $79/seat per month
                </span>
                . Each member gets their own AI twin, voice, and content
                calendar.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="relative rounded-2xl card-hairline overflow-hidden p-8 text-center">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-utility-400/40 via-special-500/30 to-transparent" />
              <p className="text-p3 text-white/45 uppercase tracking-widest mb-4 font-semibold">
                Example
              </p>
              <div className="flex items-center justify-center gap-3 text-white mb-4 flex-wrap">
                <span className="text-h3 font-bold tracking-tight">
                  5 attorneys
                </span>
                <span className="text-p1 text-white/30">×</span>
                <span className="text-h3 font-bold tracking-tight">$79</span>
                <span className="text-p1 text-white/30">=</span>
                <span className="text-h3 font-bold tracking-tight">
                  <GradientText tone="brand">$395/mo</GradientText>
                </span>
              </div>
              <p className="text-p2 text-white/40 mb-6">for your entire firm</p>

              <ul className="inline-flex flex-col items-start gap-2 text-left mb-8">
                {[
                  "Each member gets their own AI twin",
                  "Individual voice clones for every person",
                  "Separate content calendars",
                  "Shared brand vault & analytics",
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-p2 text-white/55"
                  >
                    <Check
                      className="w-3.5 h-3.5 text-utility-300 flex-shrink-0"
                      strokeWidth={3}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className="btn-cta-glow group inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl bg-white text-[#050508] text-p2 font-semibold hover:bg-white/90 transition-all"
              >
                Start with your team
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="mb-14 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  Compare plans
                </span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                Feature{" "}
                <GradientText tone="brand">comparison.</GradientText>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-4 pr-4 text-p3 font-semibold text-white/40 w-[50%]" />
                    <th className="text-center py-4 px-4 text-p3 font-semibold text-white/85 w-[25%]">
                      $79/mo
                    </th>
                    <th className="text-center py-4 px-4 text-p3 font-semibold text-white/55 w-[25%]">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((group) => (
                    <React.Fragment key={group.category}>
                      <tr>
                        <td
                          colSpan={3}
                          className="pt-8 pb-3 text-p3 font-semibold text-utility-300/90 uppercase tracking-widest"
                        >
                          {group.category}
                        </td>
                      </tr>
                      {group.features.map((feature, i) => (
                        <tr
                          key={`${group.category}-${i}`}
                          className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors"
                        >
                          <td className="py-3.5 pr-4 text-p2 text-white/55">
                            {feature.name}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <CellValue value={feature.pro} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <CellValue value={feature.enterprise} />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Related features */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <Sparkles className="w-3 h-3 text-utility-300" />
                <span className="text-p3 text-white/60 font-medium">
                  All included
                </span>
              </div>
              <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                Every feature on{" "}
                <GradientText tone="brand">every plan.</GradientText>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {relatedFeatures.map((feature) => {
                const FeatureIcon = feature.icon;
                const isUtility = feature.accent === "utility";
                const isSpecial = feature.accent === "special";
                return (
                  <motion.div
                    key={feature.slug}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    <Link
                      href={`/features/${feature.slug}`}
                      className="group relative block p-6 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] transition-colors"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                          isUtility
                            ? "from-utility-400/50 via-utility-400/15 to-transparent"
                            : isSpecial
                              ? "from-special-500/50 via-special-500/15 to-transparent"
                              : "from-utility-400/40 via-special-500/30 to-transparent"
                        }`}
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${
                            isUtility
                              ? "bg-utility-400/[0.08] border-utility-400/25"
                              : isSpecial
                                ? "bg-special-500/[0.08] border-special-500/30"
                                : "bg-white/[0.04] border-white/[0.10]"
                          }`}
                        >
                          <FeatureIcon
                            className={`w-4 h-4 ${
                              isUtility
                                ? "text-utility-300"
                                : isSpecial
                                  ? "text-special-300"
                                  : "text-white"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-p1 font-semibold text-white/90 mb-1">
                            {feature.shortLabel}
                          </h3>
                          <p className="text-p2 text-white/45 leading-relaxed">
                            {feature.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="mb-14 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">FAQ</span>
              </div>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08]">
                Common{" "}
                <GradientText tone="brand">questions.</GradientText>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="relative rounded-xl card-hairline overflow-hidden hover:border-white/[0.12] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left min-h-[48px]"
                  >
                    <span className="text-p2 font-semibold text-white/85 pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/35 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openFaq === i ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    <p className="px-5 pb-5 text-p2 text-white/45 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
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
                Try free for 7 days, cancel anytime
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Start your{" "}
              <GradientText tone="brand">free week.</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/45 max-w-xl mx-auto mb-8">
              Full access for 7 days. Cancel anytime. See what AI content looks
              like with your face and voice.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleSubscribe(mainPlan.planId)}
                disabled={isLoading}
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Start free trial
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                Try the free demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, HeartPulse, Quote } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FadeIn from "@/components/motion/FadeIn";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import StatCard from "@/components/marketing/StatCard";

const results = [
  { value: "20/mo", label: "Videos per month" },
  { value: "15/mo", label: "New patient inquiries" },
  { value: "30 min", label: "Weekly time investment" },
  { value: "$79", label: "Per month" },
];

const contentTypes = [
  "Health tips",
  "Procedure explainers",
  "Myth-busting videos",
  "Wellness advice",
  "Seasonal health content",
  "Patient FAQ answers",
  "Prevention & screening",
];

const testimonial = {
  name: "Dr. Priya Patel",
  title: "Board-Certified Dermatologist",
  quote:
    "My patients constantly tell me they watched my videos before booking. I review the scripts for accuracy, approve them, and they post automatically. It takes me 20 minutes a week.",
};

export default function ForDoctorsClient() {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Built for medical professionals"
        eyebrowIcon={HeartPulse}
        eyebrowVariant="special"
        spacing="pt-32 pb-20"
        headline={
          <>
            Your AI content team.{" "}
            <GradientText tone="brand">Built for doctors.</GradientText>
          </>
        }
        description="Generate patient education videos, health tips, and procedure explainers — using your face and voice. Review every script for medical accuracy before it goes live."
        actions={
          <>
            <Link
              href="/auth/signup"
              className="btn-cta-glow group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] rounded-xl bg-white text-[#050508] text-p2 font-semibold hover:bg-white/95 transition-all"
            >
              Start your free week
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/use-cases#medical"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-xl border border-white/[0.10] bg-white/[0.04] text-p2 text-white/70 hover:text-white hover:border-white/[0.20] transition-all"
            >
              See medical examples
            </Link>
          </>
        }
        belowActions={
          <p className="text-p3 text-white/35">
            Try free for 7 days. Cancel anytime.
          </p>
        }
      />

      {/* Results */}
      <section className="relative px-6 -mt-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {results.map((stat, i) => (
                <StatCard
                  key={i}
                  value={stat.value}
                  label={stat.label}
                  accent={i % 2 === 0 ? "special" : "utility"}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content types */}
      <FadeIn>
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-14">
              <p className="text-p3 font-medium text-rose-400/70 uppercase tracking-widest mb-3">
                Medical content library
              </p>
              <h2 className="text-h2 sm:text-h1 font-bold tracking-tight text-white leading-tight">
                7 template categories.
                <br />
                <span className="text-white/40">Medically reviewable.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentTypes.map((type, i) => (
                <div key={i} className="p-5 rounded-xl card-hairline">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mb-3" />
                  <h3 className="text-p2 font-medium text-white/70">
                    {type}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Testimonial */}
      <FadeIn>
        <section className="py-20 px-6 border-t border-white/[0.04]">
          <div className="max-w-2xl mx-auto text-center">
            <Quote className="w-8 h-8 text-rose-400/20 mx-auto mb-6" />
            <p className="text-title text-white/50 leading-relaxed mb-8">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div>
              <div className="text-p2 font-medium text-white/70">
                {testimonial.name}
              </div>
              <div className="text-p3 text-white/30">
                {testimonial.title}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <CTASection
        heading="Patient education. Automated."
        description="Generate medical content videos using your face and voice. Review every script for accuracy. Approve before it goes live."
        badge="Built specifically for doctors"
      />
    </MarketingLayout>
  );
}

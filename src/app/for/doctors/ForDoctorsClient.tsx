"use client";

import Link from "next/link";
import { ArrowRight, HeartPulse, Quote } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FadeIn from "@/components/motion/FadeIn";
import CTASection from "@/components/marketing/CTASection";

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
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-rose-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn delay={0} duration={0.6}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/[0.08] border border-rose-500/[0.12] mb-8">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[12px] text-rose-400/80 font-medium">
                Built for medical professionals
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} duration={0.7}>
            <h1 className="text-[46px] sm:text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-white mb-6">
              Your AI content team.
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-blue-400 to-rose-400 bg-clip-text text-transparent">
                Built for doctors.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} duration={0.7}>
            <p className="text-[17px] sm:text-[19px] text-white/35 max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Generate patient education videos, health tips, and procedure
              explainers -- using your face and voice. Review every script for
              medical accuracy before it goes live.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} duration={0.7}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/auth/signup"
                className="btn-cta-glow group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl bg-white text-[#050508] text-[15px] font-semibold hover:bg-white/90 active:bg-white/80 transition-all"
              >
                Start your free week
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/use-cases#medical"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] w-full sm:w-auto rounded-xl text-[15px] text-white/40 hover:text-white/60 active:text-white/70 transition-all"
              >
                See medical examples
              </Link>
            </div>
            <p className="text-[13px] text-white/15">
              Try free for 7 days. Cancel anytime.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Results */}
      <FadeIn>
        <section className="border-y border-white/[0.04] py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {results.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-[32px] font-bold tracking-tight text-white">
                  {stat.value}
                </div>
                <div className="text-[13px] text-white/25">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Content types */}
      <FadeIn>
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-14">
              <p className="text-[13px] font-medium text-rose-400/70 uppercase tracking-widest mb-3">
                Medical content library
              </p>
              <h2 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-white leading-tight">
                7 template categories.
                <br />
                <span className="text-white/40">Medically reviewable.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentTypes.map((type, i) => (
                <div key={i} className="p-5 rounded-xl card-hairline">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mb-3" />
                  <h3 className="text-[14px] font-medium text-white/70">
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
            <p className="text-[17px] text-white/50 leading-relaxed mb-8">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div>
              <div className="text-[14px] font-medium text-white/70">
                {testimonial.name}
              </div>
              <div className="text-[12px] text-white/30">
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

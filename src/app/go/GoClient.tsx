"use client";

import Link from "next/link";
import { ArrowRight, Zap, Check } from "lucide-react";

const features = [
  "Unlimited AI video generation",
  "Your face, your voice -- not a generic avatar",
  "Auto-post to Instagram, TikTok, LinkedIn, YouTube",
  "AI writes the scripts, you just approve",
  "Content calendar and scheduling built in",
  "Cancel anytime, no contracts",
];

export default function GoClient() {
  return (
    <div className="min-h-screen bg-[#060911] text-white">
      {/* Full-bleed landing page -- no navbar, no footer */}
      <div className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px]">
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-[150px]" />
            <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.05] rounded-full blur-[120px]" />
          </div>
        </div>

        {/* Content */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-white/[0.08] mb-10">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-[13px] text-white/60 font-medium">
                Limited time offer
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[48px] sm:text-[72px] font-bold tracking-[-0.04em] leading-[1] text-white mb-6">
              Unlimited
              <br />
              AI Videos.
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                $29/mo.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-[18px] sm:text-[20px] text-white/40 max-w-lg mx-auto mb-12 leading-relaxed">
              Your face. Your voice. AI does the rest. Stop paying thousands for
              video production. Start posting daily in 5 minutes.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-12 text-left">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5"
                >
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-[14px] text-white/50">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/auth/signup?ref=go"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white text-[#050508] text-[17px] font-bold hover:bg-white/90 active:bg-white/80 transition-all shadow-[0_0_60px_rgba(255,255,255,0.1)]"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-[13px] text-white/20 mt-6">
              7-day free trial. Cancel anytime. No commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

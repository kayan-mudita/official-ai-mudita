"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";

export default function AIUGCFutureClient() {
  return (
    <MarketingLayout>
      {/* Article header */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[13px] text-white/30 hover:text-white/50 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to blog
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border text-purple-400/70 bg-purple-500/10 border-purple-500/20">
              Industry
            </span>
            <span className="text-[12px] text-white/20">March 12, 2026</span>
            <span className="inline-flex items-center gap-1 text-[12px] text-white/20">
              <Clock className="w-3 h-3" />
              5 min read
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.02em] leading-[1.1] text-white mb-6">
            Why AI-Generated UGC Is the Future of Professional Content
          </h1>

          <p className="text-[17px] text-white/35 leading-relaxed">
            Raw face-to-camera UGC outperforms polished corporate video. Here is
            how AI makes authentic content accessible to every professional.
          </p>
        </div>
      </section>

      {/* Article body */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <article className="space-y-8">
            {/* Section 1 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                The authenticity premium
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Scroll through any successful LinkedIn feed or Instagram and you
                  will notice a pattern: the content that performs best is rarely
                  the most polished. It is the raw, face-to-camera content that
                  feels like a real person talking to you. Not a production crew.
                  Not a corporate studio. Just someone with a point of view.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  This is the UGC advantage — User Generated Content that looks
                  like it was filmed on an iPhone in someone is kitchen. The
                  lighting is imperfect. The background is messy. And somehow,
                  that makes it more compelling than the $50,000 brand video.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 2 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                Why most professionals cannot keep up
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Here is the problem: the content that works requires consistent,
                  personal presence. You need to be on camera. You need to film
                  regularly. You need to sound natural, not like you are reading a
                  script. For busy professionals — attorneys, real estate agents,
                  financial advisors, consultants — this is not sustainable.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Most professionals know they should be creating content. They
                  understand the business value. But between client meetings,
                  casework, and actually running their business, there is no time
                  to film, edit, and post daily. The gap between knowing what to
                  do and actually doing it is massive.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 3 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                AI closes the authenticity gap
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  This is where AI changes everything. The next generation of AI
                  video tools can generate face-to-camera content that is
                  indistinguishable from someone actually filming in their office.
                  Not the obviously fake AI avatar that makes people scroll past.
                  Realistic video with natural movement, authentic expressions,
                  and the kind of imperfection that makes content feel human.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Using your own photos and voice, AI can create content that
                  looks and sounds like you — but without requiring you to be
                  on camera every single day. You script it once, and the AI
                  generates weeks worth of authentic content.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 4 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                The Official AI approach
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  We built Official AI specifically for professionals who want the
                  authenticity of UGC without the time investment. Our system uses
                  your photos to generate realistic videos with natural speaking
                  patterns. The content looks like you filmed it yourself — because
                  the AI learns your expressions, your mannerisms, your face.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  The result is content that builds genuine connection with your
                  audience while respecting your time. Post daily without filming
                  daily. Build your personal brand without sacrificing your
                  actual work. That is the future of professional content.
                </p>
              </div>
            </div>
          </article>

          {/* Post footer */}
          <div className="mt-16 pt-8 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[13px] text-white/30 hover:text-white/50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All posts
              </Link>
              <Link
                href="/blog/real-estate-agents-ai"
                className="inline-flex items-center gap-2 text-[13px] text-purple-400/70 hover:text-purple-400 transition-colors"
              >
                Next article
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        heading="Start creating professional UGC."
        description="Upload your photos and generate authentic content in minutes. No filming required."
        badge="Free trial, no credit card"
      />
    </MarketingLayout>
  );
}
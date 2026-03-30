"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";

export default function RealEstateAgentsAIClient() {
  return (
    <MarketingLayout>
      {/* Article header */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
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
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border text-emerald-400/70 bg-emerald-500/10 border-emerald-500/20">
              Use Cases
            </span>
            <span className="text-[12px] text-white/20">March 6, 2026</span>
            <span className="inline-flex items-center gap-1 text-[12px] text-white/20">
              <Clock className="w-3 h-3" />
              7 min read
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.02em] leading-[1.1] text-white mb-6">
            How Real Estate Agents Are Using AI to Post Daily Without Filming
          </h1>

          <p className="text-[17px] text-white/35 leading-relaxed">
            Top agents post daily, most post monthly. AI closes that gap with
            specific workflows for listings, market updates, and client testimonials.
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
                The posting frequency gap
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  In real estate, there is a stark difference between top producers
                  and everyone else. The agents generating consistent leads post
                  content daily. They are on social media, in front of prospects,
                  building relationships every single day. Meanwhile, the majority
                  of agents post maybe once or twice a month — if that.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  The reason is not a lack of knowledge. Every agent knows they
                  should be posting more. The problem is time. Filming, editing,
                  and posting a single video takes an hour or more. When you are
                  showing properties, closing deals, and managing clients, that
                  hour simply does not exist.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 2 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                The AI workflow revolution
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  AI changes this equation entirely. Instead of spending an hour
                  on each piece of content, agents can now generate week is worth
                  of video content in about 20 minutes. The workflow is simple:
                  write your talking points, feed them to the AI, and it generates
                  professional videos that look like you filmed them.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  This is not about replacing authenticity. It is about scaling
                  it. You still provide the expertise, the insights, the personality.
                  AI just handles the production so you can post daily without
                  it becoming a second job.
                </p>
              </div>

              {/* Inline workflow diagram */}
              <div className="mt-6 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                <p className="text-[12px] font-medium text-white/30 uppercase tracking-wider mb-4">
                  The 20-minute content workflow
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: "1", title: "Write", desc: "Script your points in 5 minutes" },
                    { step: "2", title: "Generate", desc: "AI creates 7 videos in 10 minutes" },
                    { step: "3", title: "Post", desc: "Schedule for the week in 5 minutes" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border border-white/[0.04] bg-white/[0.02]">
                      <div className="text-[11px] text-emerald-400/60 font-mono mb-2">
                        Step {item.step}
                      </div>
                      <div className="text-[14px] font-medium text-white/60 mb-1">
                        {item.title}
                      </div>
                      <div className="text-[12px] text-white/20 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 3 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                Workflow 1: New listings
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  When a new listing hits the market, agents need to get the word
                  out fast. But filming a property tour takes time you may not
                  have. The AI workflow: capture a few photos of the property,
                  script a 30-second highlight reel, and generate multiple versions
                  — one for Instagram, one for TikTok, one for Facebook.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Each version highlights different features: the gourmet kitchen
                  for family buyers, the home office for remote workers, the
                  backyard for entertaining. Same property, multiple angles,
                  maximum reach.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 4 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                Workflow 2: Market updates
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Market updates are high-value content — they position you as the
                  local expert. But they require consistent presence to work. With
                  AI, you can record one comprehensive market update per month
                  and reformat it into weekly micro-updates.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  The monthly deep-dive becomes: a weekly inventory snapshot, a
                  "days on market" trend update, a mortgage rate check-in, and
                  a "new listings this week" roundup. One recording session
                  becomes five pieces of content.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 5 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                Workflow 3: Client testimonials
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Happy clients are your best marketing asset. But getting them
                  on camera is notoriously difficult. AI solves this by letting
                  you create testimonial-style content without needing the client
                  to film anything.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Use the key quote from your client is review, generate a video
                  that looks like they are saying it directly to camera. It is
                  social proof that feels authentic, requires zero coordination,
                  and can be created immediately after closing a deal.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-12 h-px bg-white/[0.06] mx-auto" />

            {/* Section 6 */}
            <div>
              <h2 className="text-[22px] font-bold text-white/90 mb-4">
                From monthly to daily
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  The agents seeing the best results are not posting more because
                  they have more time. They are posting more because AI removed
                  the production bottleneck. The content is still theirs — their
                  expertise, their personality, their market knowledge. The
                  machine just handles the rest.
                </p>
                <p className="text-[15px] text-white/35 leading-[1.8]">
                  Daily posting is no longer a luxury for agents with production
                  teams. It is available to anyone willing to spend 20 minutes
                  a week. That is the real power of AI for real estate: not
                  replacing the agent, but matching their ambition with the
                  content output they need to succeed.
                </p>
              </div>
            </div>
          </article>

          {/* Post footer */}
          <div className="mt-16 pt-8 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <Link
                href="/blog/ai-ugc-future"
                className="inline-flex items-center gap-2 text-[13px] text-white/30 hover:text-white/50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous article
              </Link>
              <Link
                href="/blog/five-content-formats"
                className="inline-flex items-center gap-2 text-[13px] text-emerald-400/70 hover:text-emerald-400 transition-colors"
              >
                Next article
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        heading="Start your content workflow."
        description="Generate a week of real estate content in 20 minutes. No filming, no editing."
        badge="Free trial, no credit card"
      />
    </MarketingLayout>
  );
}
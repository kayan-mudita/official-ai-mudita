"use client";

import Link from "next/link";
import {
  ArrowRight,
  Home,
  Scale,
  TrendingUp,
  HeartPulse,
  Megaphone,
  Play,
  Clock,
  BarChart3,
  Layers,
} from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import CTASection from "@/components/marketing/CTASection";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import StatCard from "@/components/marketing/StatCard";
import FadeIn from "@/components/motion/FadeIn";

const useCases = [
  {
    icon: Scale,
    industry: "Legal",
    headline: "Share legal tips that generate consultations, not liability.",
    scenario:
      'Marcus runs a personal injury firm in Miami. He sees attorneys on TikTok getting hundreds of thousands of views with "know your rights" content, but he never has time to film and is worried about saying something on camera that could come back to bite him.',
    solution:
      "Official AI generates scripts from proven legal content frameworks — educational, not advisory. Marcus reviews every script before generation, edits anything he wants, and approves the final video. His face, his voice, his expertise — without ever stepping in front of a camera.",
    results: [
      { label: "Views per month", value: "240K+" },
      { label: "Consultation calls", value: "8/mo" },
      { label: "Time creating", value: "20 min/wk" },
    ],
    contentTypes: [
      "Know-your-rights tips",
      "Case result highlights",
      "Legal myth-busting",
      "Process explainers",
      "FAQ answers",
      "Industry news reactions",
    ],
    accent: "violet",
  },
  {
    icon: HeartPulse,
    industry: "Medical",
    headline: "Share health education without the production overhead.",
    scenario:
      "Dr. Patel is a dermatologist in Chicago. She knows patient education content builds trust and drives appointments. But between patient consultations, procedures, and admin work, she has zero bandwidth to film and edit videos.",
    solution:
      "Dr. Patel uploads three photos and picks from medical education content templates. The AI generates short, educational videos about common skin conditions, treatment options, and prevention tips — all featuring her face and voice. Every script goes through her review queue so she can verify medical accuracy before anything goes live.",
    results: [
      { label: "Videos per month", value: "20" },
      { label: "New patient inquiries", value: "15/mo" },
      { label: "Time reviewing", value: "30 min/wk" },
    ],
    contentTypes: [
      "Health tips",
      "Procedure explainers",
      "Myth-busting",
      "Wellness advice",
      "Seasonal health content",
      "FAQ answers",
    ],
    accent: "rose",
  },
  {
    icon: Home,
    industry: "Real Estate",
    headline: "Post market updates daily without leaving a single showing.",
    scenario:
      "Sarah is a top-producing real estate agent in Austin. She knows she needs to post daily market updates, listing tours, and neighborhood guides to stay top-of-mind. But between showings, open houses, and client calls, she never has time to film.",
    solution:
      "With Official AI, Sarah uploaded three photos and recorded a 30-second voice sample on Sunday night. By Monday morning, she had a week of content queued up -- market update Monday, listing spotlight Tuesday, neighborhood guide Wednesday, home-buying tip Thursday, client testimonial Friday. All featuring her face, her voice, and her branding.",
    results: [
      { label: "Videos per week", value: "5" },
      { label: "Time filming", value: "0 min" },
      { label: "New leads from content", value: "12/mo" },
    ],
    contentTypes: [
      "Market updates",
      "Listing tours",
      "Neighborhood guides",
      "Home-buying tips",
      "Client testimonials",
      "Just-sold announcements",
    ],
    accent: "blue",
  },
  {
    icon: TrendingUp,
    industry: "Financial Services",
    headline: "Become the go-to advisor in your market with daily commentary.",
    scenario:
      "Rachel is a financial advisor managing $50M AUM in Denver. Her competitors are posting daily market commentary on LinkedIn and Instagram. She has the knowledge but posting content feels like a second job she does not have bandwidth for.",
    solution:
      "Rachel set up Official AI with her brand colors, headshot, and voice. Now the AI monitors market news and generates daily commentary videos in her voice. She reviews them over morning coffee, approves the ones she likes, and they auto-post to LinkedIn, Instagram, and YouTube by 8am.",
    results: [
      { label: "Posts per week", value: "7" },
      { label: "LinkedIn impressions", value: "45K/mo" },
      { label: "New AUM inquiries", value: "3/mo" },
    ],
    contentTypes: [
      "Market commentary",
      "Financial tips",
      "Retirement planning basics",
      "Economic news reactions",
      "Investment strategy explainers",
      "Tax planning tips",
    ],
    accent: "emerald",
  },
  {
    icon: Megaphone,
    industry: "Creators & Coaches",
    headline: "Scale your content output without scaling your workload.",
    scenario:
      "Jason is a business coach with 50K followers on Instagram. His audience expects daily content but he is burned out from filming. He has tried outsourcing to video editors but the back-and-forth takes longer than filming himself.",
    solution:
      "Jason uses Official AI to generate five videos a week using his existing content frameworks. He types in a topic or lets the AI pull from trending topics in his niche. Multi-cut composition means every video feels like he shot and edited it himself — because the AI learned his style.",
    results: [
      { label: "Content output", value: "5x more" },
      { label: "Engagement rate", value: "+40%" },
      { label: "Hours saved per week", value: "12" },
    ],
    contentTypes: [
      "Thought leadership",
      "Quick tips",
      "Story-based content",
      "Brand introductions",
      "Course promotion",
      "Daily motivation",
    ],
    accent: "amber",
  },
];

type AccentTone = "utility" | "special";

const accentMap: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    dot: string;
    line: string;
    tone: AccentTone;
  }
> = {
  blue: {
    bg: "bg-utility-400/[0.06]",
    border: "border-utility-400/25",
    text: "text-utility-300",
    dot: "bg-utility-400",
    line: "from-utility-400/40 via-utility-400/15 to-transparent",
    tone: "utility",
  },
  emerald: {
    bg: "bg-utility-400/[0.06]",
    border: "border-utility-400/25",
    text: "text-utility-300",
    dot: "bg-utility-400",
    line: "from-utility-400/40 via-utility-400/15 to-transparent",
    tone: "utility",
  },
  violet: {
    bg: "bg-special-500/[0.06]",
    border: "border-special-500/25",
    text: "text-special-300",
    dot: "bg-special-400",
    line: "from-special-500/40 via-special-500/15 to-transparent",
    tone: "special",
  },
  rose: {
    bg: "bg-special-500/[0.06]",
    border: "border-special-500/25",
    text: "text-special-300",
    dot: "bg-special-400",
    line: "from-special-500/40 via-special-500/15 to-transparent",
    tone: "special",
  },
  amber: {
    bg: "bg-special-500/[0.06]",
    border: "border-special-500/25",
    text: "text-special-300",
    dot: "bg-special-400",
    line: "from-special-500/40 via-special-500/15 to-transparent",
    tone: "special",
  },
};

export default function UseCasesClient() {
  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Use cases"
        eyebrowIcon={Layers}
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Built for people{" "}
            <GradientText tone="brand">who are too busy to film.</GradientText>
          </>
        }
        description="Professionals across every industry are using Official AI to post daily content without ever touching a camera. Here is how."
      />

      {/* Quick industry nav */}
      <section className="relative pb-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2">
          {useCases.map((uc) => {
            const colors = accentMap[uc.accent];
            return (
              <a
                key={uc.industry}
                href={`#${uc.industry.toLowerCase().replace(/\s+/g, "-")}`}
                className={`group inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${colors.border} ${colors.bg} transition-all hover:scale-[1.03]`}
              >
                <uc.icon
                  className={`w-3.5 h-3.5 ${colors.text} group-hover:opacity-100 opacity-80 transition-opacity`}
                />
                <span className={`text-p3 font-semibold ${colors.text}`}>
                  {uc.industry}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Use case deep dives */}
      {useCases.map((uc, index) => {
        const colors = accentMap[uc.accent];
        return (
          <section
            key={uc.industry}
            id={uc.industry.toLowerCase().replace(/\s+/g, "-")}
            className={`relative py-24 px-6 scroll-mt-20 ${
              index > 0 ? "border-t border-white/[0.04]" : ""
            }`}
          >
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <FadeIn>
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                    >
                      <uc.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <span
                      className={`text-p3 font-semibold uppercase tracking-wider ${colors.text}`}
                    >
                      {uc.industry}
                    </span>
                  </div>
                  <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] max-w-2xl">
                    {uc.headline}
                  </h2>
                </div>
              </FadeIn>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Story */}
                <div className="lg:col-span-7 space-y-5">
                  <FadeIn delay={0.05}>
                    <div className="relative overflow-hidden p-6 rounded-2xl card-hairline">
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                      />
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-p3 font-semibold text-white/45 uppercase tracking-wider">
                          The problem
                        </span>
                      </div>
                      <p className="text-p2 text-white/55 leading-relaxed">
                        {uc.scenario}
                      </p>
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.1}>
                    <div className="relative overflow-hidden p-6 rounded-2xl card-hairline">
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                      />
                      <div className="flex items-center gap-2 mb-3">
                        <Play className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-p3 font-semibold text-white/45 uppercase tracking-wider">
                          The solution
                        </span>
                      </div>
                      <p className="text-p2 text-white/55 leading-relaxed">
                        {uc.solution}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Results — StatCards */}
                  <FadeIn delay={0.15}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {uc.results.map((result, i) => (
                        <StatCard
                          key={i}
                          value={result.value}
                          label={result.label}
                          accent={colors.tone}
                        />
                      ))}
                    </div>
                  </FadeIn>
                </div>

                {/* Content types */}
                <div className="lg:col-span-5">
                  <FadeIn delay={0.2}>
                    <div className="relative overflow-hidden p-6 rounded-2xl card-hairline sticky top-24">
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line}`}
                      />
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-p3 font-semibold text-white/45 uppercase tracking-wider">
                          Content types
                        </span>
                      </div>
                      <ul className="space-y-2.5">
                        {uc.contentTypes.map((type, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 text-p2 text-white/55"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}
                            />
                            {type}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-5 border-t border-white/[0.06]">
                        <Link
                          href="/auth/signup"
                          className="btn-cta-glow block text-center text-p3 font-semibold py-3 min-h-[44px] flex items-center justify-center rounded-lg bg-white text-[#050508] hover:bg-white/95 transition-all"
                        >
                          Try it for {uc.industry.toLowerCase()}
                        </Link>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Cross-links */}
      <section className="relative py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <p className="text-p1 text-white/40">
            Same technology, same quality — regardless of your industry.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-2 text-p3 font-semibold text-utility-300 hover:text-utility-200 transition-colors"
            >
              See how it works
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/features"
              className="group inline-flex items-center gap-2 text-p3 font-semibold text-utility-300 hover:text-utility-200 transition-colors"
            >
              Explore features
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 text-p3 font-semibold text-utility-300 hover:text-utility-200 transition-colors"
            >
              View pricing
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        heading="Your industry. Your content. Automated."
        description="Upload your photos and get your first AI video in under five minutes."
        badge="Works for every professional industry"
      />
    </MarketingLayout>
  );
}

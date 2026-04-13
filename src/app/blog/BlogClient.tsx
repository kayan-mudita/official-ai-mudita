"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import StatCard from "@/components/marketing/StatCard";
import MeshMockup from "@/components/marketing/MeshMockup";
import FadeIn from "@/components/motion/FadeIn";
import { staggerChildren, fadeUp } from "@/lib/motion-variants";
import { blogPosts, type BlogCategory } from "@/data/blog-posts";

const categoryAccent: Record<
  BlogCategory,
  {
    border: string;
    bg: string;
    text: string;
    chip: string;
    line: string;
    tone: "utility" | "special";
  }
> = {
  "AI Video": {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.08]",
    text: "text-utility-300",
    chip: "bg-utility-400/[0.10] border-utility-400/25 text-utility-200",
    line: "from-utility-400/40 via-utility-400/15 to-transparent",
    tone: "utility",
  },
  "Content Strategy": {
    border: "border-special-500/30",
    bg: "bg-special-500/[0.08]",
    text: "text-special-300",
    chip: "bg-special-500/[0.10] border-special-500/25 text-special-200",
    line: "from-special-500/40 via-special-500/15 to-transparent",
    tone: "special",
  },
  "Social Media": {
    border: "border-utility-400/25",
    bg: "bg-utility-400/[0.08]",
    text: "text-utility-300",
    chip: "bg-utility-400/[0.10] border-utility-400/25 text-utility-200",
    line: "from-utility-400/40 via-special-500/15 to-transparent",
    tone: "utility",
  },
  "Industry Tips": {
    border: "border-special-500/30",
    bg: "bg-special-500/[0.08]",
    text: "text-special-300",
    chip: "bg-special-500/[0.10] border-special-500/25 text-special-200",
    line: "from-special-500/40 via-utility-400/15 to-transparent",
    tone: "special",
  },
  "Product Updates": {
    border: "border-white/[0.12]",
    bg: "bg-white/[0.04]",
    text: "text-white",
    chip: "bg-white/[0.06] border-white/[0.12] text-white/85",
    line: "from-utility-400/30 via-special-500/20 to-transparent",
    tone: "utility",
  },
};

const categories: BlogCategory[] = [
  "AI Video",
  "Content Strategy",
  "Social Media",
  "Industry Tips",
];

export default function BlogClient() {
  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];
  const rest = blogPosts.filter((p) => p.slug !== featured.slug);
  const featuredColors = categoryAccent[featured.category];

  return (
    <MarketingLayout>
      <PageBackdrop intensity={0.05} />

      <HeroAurora
        eyebrow="Blog"
        eyebrowVariant="utility"
        spacing="pt-32 pb-16"
        headline={
          <>
            Insights on AI content{" "}
            <GradientText tone="brand">and professional growth.</GradientText>
          </>
        }
        description="How AI is changing content creation for professionals. Strategy, technology, and real results."
        belowActions={
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            {categories.map((cat) => {
              const colors = categoryAccent[cat];
              return (
                <div
                  key={cat}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-p3 font-medium ${colors.chip}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-80`} />
                  {cat}
                </div>
              );
            })}
          </div>
        }
      />

      {/* Featured post — full bento hero card */}
      <section className="relative px-6 -mt-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <Link
              href={`/blog/${featured.slug}`}
              className="group relative block rounded-2xl card-hairline overflow-hidden hover:border-white/[0.12] transition-all"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${featuredColors.line} z-10`}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 relative">
                  <MeshMockup aspect="aspect-[16/10]" className="rounded-none border-0">
                    <Image
                      src={featured.featuredImage.src}
                      alt={featured.featuredImage.alt}
                      fill
                      sizes="(min-width: 1024px) 720px, 100vw"
                      className="object-cover"
                      priority
                    />
                  </MeshMockup>
                </div>
                <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-center">
                  <GlowBlob
                    color={featuredColors.tone}
                    size="md"
                    position="top-right"
                    intensity={0.06}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-p3 font-medium ${featuredColors.chip}`}
                      >
                        Featured · {featured.category}
                      </span>
                    </div>
                    <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mb-4">
                      {featured.title}
                    </h2>
                    <p className="text-p2 text-white/70 leading-relaxed mb-6">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-p3 text-white/70">
                        {featured.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-p3 text-white/70">
                        <Clock className="w-3 h-3" />
                        {featured.readTime}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-p3 font-semibold text-white/85 group-hover:text-white transition-colors">
                      Read article
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Stat strip */}
      <section className="relative px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <StatCard
                value={blogPosts.length}
                label="Articles"
                caption="Long-form pieces on AI video, content strategy, and growth."
                accent="utility"
              />
              <StatCard
                value="4"
                label="Categories"
                caption="AI Video, Content Strategy, Social Media, and Industry Tips."
                accent="mix"
              />
              <StatCard
                value="Weekly"
                label="New drops"
                caption="Fresh insights every week — practical, never theoretical."
                accent="special"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Post grid — bento with featured images */}
      <section className="relative px-6 pb-24 border-t border-white/[0.04] pt-20">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-5">
                <span className="text-p3 text-white/60 font-medium">
                  Latest articles
                </span>
              </div>
              <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1]">
                Read the rest.
              </h2>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {rest.map((post) => {
              const colors = categoryAccent[post.category];
              return (
                <motion.div
                  key={post.slug}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group relative block rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] transition-colors"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colors.line} z-10`}
                    />
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.featuredImage.src}
                        alt={post.featuredImage.alt}
                        fill
                        sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium backdrop-blur-md ${colors.chip}`}
                        >
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-p1 font-semibold text-white/90 leading-snug mb-2 group-hover:text-white transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-p3 text-white/70 leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-p3 text-white/70">
                          {post.date}
                        </span>
                        <span className="inline-flex items-center gap-1 text-p3 text-white/70">
                          <Clock className="w-2.5 h-2.5" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
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
                Free to try, no credit card required
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Stop reading about AI content.{" "}
              <GradientText tone="brand">Start creating it.</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              Your first video is free. Upload a photo and see AI create a video
              of you in 30 seconds.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/demo"
                className="btn-cta-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-p2 font-semibold hover:bg-white/90 transition-colors"
              >
                Try the free demo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                See pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

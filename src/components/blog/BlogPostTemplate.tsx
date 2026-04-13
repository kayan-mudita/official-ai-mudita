"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Sparkles, User } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import ShareButtons from "@/components/marketing/ShareButtons";
import FadeIn from "@/components/motion/FadeIn";
import HeroAurora from "@/components/marketing/HeroAurora";
import GradientText from "@/components/marketing/GradientText";
import PageBackdrop from "@/components/marketing/PageBackdrop";
import GlowBlob from "@/components/marketing/GlowBlob";
import Eyebrow from "@/components/marketing/Eyebrow";
import MeshMockup from "@/components/marketing/MeshMockup";
import { getRelatedPosts, type BlogCategory } from "@/data/blog-posts";
import { getFeaturesForCategory } from "@/data/blog-feature-map";
import { siteUrl } from "@/lib/site-config";

interface BlogPostProps {
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
  children: React.ReactNode;
  featuredImage?: { src: string; alt: string };
}

/** Brand-token tone per category — utility (cyan) or special (magenta). */
const categoryBrand: Record<
  string,
  { tone: "utility" | "special"; eyebrow: "utility" | "special" }
> = {
  "AI Video": { tone: "utility", eyebrow: "utility" },
  "Content Strategy": { tone: "special", eyebrow: "special" },
  "Social Media": { tone: "utility", eyebrow: "utility" },
  "Industry Tips": { tone: "special", eyebrow: "special" },
  "Product Updates": { tone: "special", eyebrow: "special" },
};

function splitHeadline(headline: string, n = 3) {
  const words = headline.trim().split(/\s+/);
  if (words.length <= n) return { lead: "", tail: headline };
  return {
    lead: words.slice(0, words.length - n).join(" "),
    tail: words.slice(words.length - n).join(" "),
  };
}

export default function BlogPostTemplate({
  title,
  description,
  author,
  date,
  readTime,
  category,
  slug,
  children,
  featuredImage,
}: BlogPostProps) {
  const postUrl = `${siteUrl}/blog/${slug}`;
  const brand = categoryBrand[category] ?? categoryBrand["AI Video"];
  const { lead, tail } = splitHeadline(title, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: "Official AI",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    datePublished: date,
    dateModified: date,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    image: featuredImage?.src
      ? `${siteUrl}${featuredImage.src}`
      : `${siteUrl}/og-image.png`,
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <PageBackdrop intensity={0.04} />

      {/* Hero — aurora + brand-tinted */}
      <HeroAurora
        spacing="pt-32 pb-12"
        align="left"
        eyebrow={category}
        eyebrowVariant={brand.eyebrow}
        aboveEyebrow={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: title },
            ]}
          />
        }
        headline={
          <>
            {lead && <span className="text-white">{lead} </span>}
            <GradientText tone={brand.tone}>{tail}</GradientText>
          </>
        }
        description={description}
        belowActions={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-p3 text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {readTime}
            </span>
            <span className="ml-0 sm:ml-2">
              <ShareButtons url={postUrl} title={title} />
            </span>
          </div>
        }
      />

      <article className="relative px-6 pt-12 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Featured image banner */}
          {featuredImage && (
            <FadeIn duration={0.6}>
              <div className="mb-12">
                <MeshMockup aspect="aspect-[16/9]">
                  <Image
                    src={featuredImage.src}
                    alt={featuredImage.alt}
                    fill
                    sizes="(min-width: 1024px) 768px, 100vw"
                    className="object-cover"
                    priority
                  />
                </MeshMockup>
              </div>
            </FadeIn>
          )}

          {/* Content */}
          <FadeIn delay={0.05} duration={0.6}>
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-[-0.02em] prose-p:text-white/70 prose-p:leading-relaxed prose-a:text-utility-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/85 prose-li:text-white/70 prose-code:text-utility-300 prose-blockquote:border-special-500/40 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-white/70 prose-h2:text-h3 prose-h2:mt-14 prose-h2:mb-4 prose-h3:text-title prose-h3:mt-10 prose-h3:mb-3 prose-figcaption:text-p3 prose-figcaption:text-white/70 prose-figcaption:text-center prose-figcaption:mt-2">
              {children}
            </div>
          </FadeIn>

          {/* Bottom share + back */}
          <FadeIn delay={0.15} duration={0.6}>
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-p3 font-medium text-white/70 hover:text-white/85 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to blog
              </Link>
              <ShareButtons url={postUrl} title={title} />
            </div>
          </FadeIn>
        </div>
      </article>

      {/* Related posts mini-bento */}
      {(() => {
        const related = getRelatedPosts(slug, 3);
        if (related.length === 0) return null;
        return (
          <section className="relative py-20 px-6 border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="mb-10">
                  <Eyebrow icon={BookOpen} variant={brand.eyebrow}>
                    Keep reading
                  </Eyebrow>
                  <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mt-4">
                    More from{" "}
                    <GradientText tone={brand.tone}>{category}</GradientText>.
                  </h2>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {related.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group relative block rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] hover:-translate-y-0.5 transition-all"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${
                          brand.tone === "utility"
                            ? "from-utility-400/40 via-utility-400/15 to-transparent"
                            : "from-special-500/40 via-special-500/15 to-transparent"
                        } z-10`}
                      />
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={post.featuredImage.src}
                          alt={post.featuredImage.alt}
                          fill
                          sizes="(min-width: 1024px) 320px, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-transparent" />
                      </div>
                      <div className="p-5">
                        <div className="text-p3 text-white/70 mb-2">
                          {post.date}
                        </div>
                        <h3 className="text-p1 font-semibold text-white/90 leading-snug mb-2 group-hover:text-white transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 text-p3 text-white/70 group-hover:text-white/85 transition-colors">
                          Read article
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </FadeIn>
            </div>
          </section>
        );
      })()}

      {/* Related features */}
      {(() => {
        const relatedFeatures = getFeaturesForCategory(category as BlogCategory);
        if (relatedFeatures.length === 0) return null;
        return (
          <section className="relative py-20 px-6 border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="mb-10">
                  <Eyebrow icon={Sparkles} variant={brand.eyebrow}>
                    Powered by
                  </Eyebrow>
                  <h2 className="text-h3 sm:text-h2 font-bold tracking-[-0.02em] text-white leading-[1.1] mt-4">
                    The features behind this.
                  </h2>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedFeatures.map((feature) => {
                    const FeatureIcon = feature.icon;
                    const isUtility = feature.accent === "utility";
                    const isSpecial = feature.accent === "special";
                    return (
                      <Link
                        key={feature.slug}
                        href={`/features/${feature.slug}`}
                        className="group relative block p-6 rounded-2xl card-hairline overflow-hidden h-full hover:border-white/[0.12] hover:-translate-y-0.5 transition-all"
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
                            <p className="text-p2 text-white/70 leading-relaxed">
                              {feature.subtitle}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </FadeIn>
            </div>
          </section>
        );
      })()}

      {/* CTA outro */}
      <section className="relative py-28 px-6 border-t border-white/[0.04] overflow-hidden">
        <GlowBlob color="special" size="xl" position="top" intensity={0.08} />
        <GlowBlob color="utility" size="lg" position="bottom" intensity={0.06} />

        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <Sparkles className="w-3 h-3 text-utility-300" />
              <span className="text-p3 text-white/60 font-medium">
                See it live
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h2 className="text-h2 sm:text-h1 font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Ready to{" "}
              <GradientText tone="brand">try it yourself?</GradientText>
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-p1 text-white/70 max-w-xl mx-auto mb-8">
              Upload a photo and see AI create a video of you in 30 seconds. No
              credit card needed.
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
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] text-white/80 text-p2 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                More articles
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}

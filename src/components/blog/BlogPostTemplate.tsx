"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Calendar, Clock, Sparkles, User } from "lucide-react";
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
  const siteUrl = "https://officialai.com";
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
      logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.png` },
    },
    datePublished: date,
    dateModified: date,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    image: `${siteUrl}/og-image.png`,
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-p3 text-white/45">
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
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-[-0.02em] prose-p:text-white/55 prose-p:leading-relaxed prose-a:text-utility-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/85 prose-li:text-white/55 prose-code:text-utility-300 prose-blockquote:border-special-500/40 prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-white/65 prose-h2:text-h3 prose-h2:mt-14 prose-h2:mb-4 prose-h3:text-title prose-h3:mt-10 prose-h3:mb-3 prose-figcaption:text-p3 prose-figcaption:text-white/35 prose-figcaption:text-center prose-figcaption:mt-2">
              {children}
            </div>
          </FadeIn>

          {/* Bottom share + back */}
          <FadeIn delay={0.15} duration={0.6}>
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/[0.06]">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-p3 font-medium text-white/45 hover:text-white/85 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to blog
              </Link>
              <ShareButtons url={postUrl} title={title} />
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.25} duration={0.6}>
            <div className="relative mt-16 overflow-hidden rounded-3xl card-hairline">
              <GlowBlob
                color={brand.tone}
                size="lg"
                position="center"
                intensity={0.10}
              />
              <div className="relative p-10 sm:p-14 text-center">
                <div className="flex justify-center mb-5">
                  <Eyebrow icon={Sparkles} variant={brand.eyebrow}>
                    Try Official AI
                  </Eyebrow>
                </div>
                <h3 className="text-h3 sm:text-h2 font-bold text-white tracking-[-0.02em] mb-3">
                  Ready to try it yourself?
                </h3>
                <p className="text-p1 text-white/45 mb-8 max-w-md mx-auto leading-relaxed">
                  Upload a photo and see AI create a video of you in 30 seconds.
                </p>
                <Link
                  href="/demo"
                  className="btn-cta-glow inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#050508] text-p2 font-semibold min-h-[48px] hover:bg-white/95 transition-all"
                >
                  Try the free demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </article>
    </MarketingLayout>
  );
}

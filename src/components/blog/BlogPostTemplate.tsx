"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import ShareButtons from "@/components/marketing/ShareButtons";
import FadeIn from "@/components/motion/FadeIn";

interface BlogPostProps {
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
  children: React.ReactNode;
}

const categoryColors: Record<string, string> = {
  "AI Video": "text-blue-400/80 bg-blue-500/[0.08] border-blue-500/[0.12]",
  "Content Strategy": "text-violet-400/80 bg-violet-500/[0.08] border-violet-500/[0.12]",
  "Social Media": "text-emerald-400/80 bg-emerald-500/[0.08] border-emerald-500/[0.12]",
  "Industry Tips": "text-amber-400/80 bg-amber-500/[0.08] border-amber-500/[0.12]",
  "Product Updates": "text-rose-400/80 bg-rose-500/[0.08] border-rose-500/[0.12]",
};

export default function BlogPostTemplate({
  title,
  description,
  author,
  date,
  readTime,
  category,
  slug,
  children,
}: BlogPostProps) {
  const siteUrl = "https://officialai.com";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const categoryStyle = categoryColors[category] || categoryColors["AI Video"];

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

      <article className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn duration={0.6}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: title },
              ]}
            />

            {/* Category badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full border text-[12px] font-medium mb-6 ${categoryStyle}`}>
              {category}
            </div>

            {/* Title */}
            <h1 className="text-[36px] sm:text-[46px] font-bold tracking-[-0.03em] leading-[1.08] text-white mb-6">
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/30 mb-8 pb-8 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {author}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {date}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readTime}
              </div>
              <div className="ml-auto">
                <ShareButtons url={postUrl} title={title} />
              </div>
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn delay={0.1} duration={0.6}>
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:tracking-tight prose-p:text-white/50 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white/70 prose-li:text-white/50 prose-code:text-blue-300 prose-blockquote:border-blue-500/30 prose-blockquote:text-white/40">
              {children}
            </div>
          </FadeIn>

          {/* Bottom share + back */}
          <FadeIn delay={0.2} duration={0.6}>
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/[0.06]">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[13px] text-white/30 hover:text-white/50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to blog
              </Link>
              <ShareButtons url={postUrl} title={title} />
            </div>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.3} duration={0.6}>
            <div className="mt-16 p-8 rounded-2xl card-hairline text-center">
              <h3 className="text-[20px] font-bold text-white mb-2">
                Ready to try it yourself?
              </h3>
              <p className="text-[14px] text-white/30 mb-6">
                Upload a photo and see AI create a video of you in 30 seconds.
              </p>
              <Link
                href="/demo"
                className="btn-cta-glow inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 transition-all"
              >
                Try the free demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </article>
    </MarketingLayout>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPillars, getPillarBySlug } from "@/data/topic-libraries";
import PillarPageTemplate from "@/components/pillar/PillarPageTemplate";

interface Props {
  params: { pillarSlug: string };
}

export function generateStaticParams() {
  return getAllPillars().map((p) => ({ pillarSlug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const pillar = getPillarBySlug(params.pillarSlug);
  if (!pillar) return {};
  return {
    title: pillar.headline,
    description: pillar.description,
    alternates: { canonical: `/learn/${pillar.slug}` },
  };
}

export default function PillarPage({ params }: Props) {
  const pillar = getPillarBySlug(params.pillarSlug);
  if (!pillar) notFound();

  // Placeholder content — will be replaced with real long-form content per pillar
  return (
    <PillarPageTemplate
      slug={params.pillarSlug}
      toc={[
        { id: "overview", label: "Overview" },
        { id: "why-it-matters", label: "Why It Matters" },
        { id: "how-it-works", label: "How It Works" },
        { id: "best-practices", label: "Best Practices" },
        { id: "getting-started", label: "Getting Started" },
      ]}
    >
      <h2 id="overview">Overview</h2>
      <p>
        {pillar.description}
      </p>
      <p>
        This guide covers everything you need to know about {pillar.title.toLowerCase()} — from
        foundational concepts to advanced strategies used by top-performing professionals.
      </p>

      <h2 id="why-it-matters">Why It Matters</h2>
      <p>
        Video content generates 1200% more shares than text and images combined. For professionals,
        video is no longer optional — it is the primary way clients discover, evaluate, and choose
        service providers. AI video generation makes it possible to maintain a consistent, high-quality
        presence without the traditional costs of production.
      </p>

      <h2 id="how-it-works">How It Works</h2>
      <p>
        Modern AI video platforms use a combination of facial modeling, voice synthesis, and intelligent
        editing to create videos that look and sound like you actually filmed them. The key innovation
        is the multi-cut composition method — instead of generating one long, obviously-AI clip, the
        system creates multiple short cuts that are stitched together like a professionally edited video.
      </p>

      <h2 id="best-practices">Best Practices</h2>
      <p>
        The most successful professionals using AI video follow a consistent cadence, review every
        script before generation, and optimize their content for each platform. Quality matters more
        than quantity — but AI enables you to have both.
      </p>

      <h2 id="getting-started">Getting Started</h2>
      <p>
        Start with 3-5 photos and a 30-second voice sample. From there, AI can generate your first
        video in under five minutes. The deep dives below cover each aspect in detail.
      </p>
    </PillarPageTemplate>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPillars, getPillarBySlug } from "@/data/topic-libraries";
import PillarPageTemplate from "@/components/pillar/PillarPageTemplate";
import { pillarContent } from "@/content";

interface Props {
  params: { pillarSlug: string };
}

// Strict — only the slugs returned by generateStaticParams resolve.
// Anything else 404s instead of being caught by this dynamic segment.
export const dynamicParams = false;

// Only emit pillar slugs that actually have a content module.
// A pillar without real content is treated as unpublished and 404s.
export function generateStaticParams() {
  return getAllPillars()
    .filter((p) => Boolean(pillarContent[p.slug]))
    .map((p) => ({ pillarSlug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const pillar = getPillarBySlug(params.pillarSlug);
  if (!pillar) return {};
  return {
    title: pillar.headline,
    description: pillar.description,
    alternates: { canonical: `/${pillar.slug}` },
  };
}

export default function PillarPage({ params }: Props) {
  const pillar = getPillarBySlug(params.pillarSlug);
  if (!pillar) notFound();

  const content = pillarContent[params.pillarSlug];
  if (!content) notFound();

  const ContentComponent = content.Content;

  return (
    <PillarPageTemplate slug={params.pillarSlug} toc={content.toc}>
      <ContentComponent />
    </PillarPageTemplate>
  );
}

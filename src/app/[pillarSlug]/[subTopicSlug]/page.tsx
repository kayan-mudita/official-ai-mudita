import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPillars, getSubTopic } from "@/data/topic-libraries";
import SubTopicPageTemplate from "@/components/pillar/SubTopicPageTemplate";
import { pillarContent, subTopicContentRegistry } from "@/content";

interface Props {
  params: { pillarSlug: string; subTopicSlug: string };
}

// Strict — only known pillar/subtopic combos resolve.
// Anything else 404s instead of being caught by this dynamic segment.
export const dynamicParams = false;

// Only emit pillar+subtopic combos that have both a pillar content module
// AND a subtopic content module. Missing content = unpublished = 404.
export function generateStaticParams() {
  return getAllPillars().flatMap((p) => {
    if (!pillarContent[p.slug]) return [];
    const subModules = subTopicContentRegistry[p.slug] ?? {};
    return p.subTopics
      .filter((st) => Boolean(subModules[st.slug]))
      .map((st) => ({
        pillarSlug: p.slug,
        subTopicSlug: st.slug,
      }));
  });
}

export function generateMetadata({ params }: Props): Metadata {
  const result = getSubTopic(params.pillarSlug, params.subTopicSlug);
  if (!result) return {};
  return {
    title: result.subTopic.title,
    description: result.subTopic.description,
    alternates: {
      canonical: `/${params.pillarSlug}/${params.subTopicSlug}`,
    },
  };
}

export default function SubTopicPage({ params }: Props) {
  const result = getSubTopic(params.pillarSlug, params.subTopicSlug);
  if (!result) notFound();

  const pillarSubTopics = subTopicContentRegistry[params.pillarSlug];
  const ContentComponent = pillarSubTopics?.[params.subTopicSlug];
  if (!ContentComponent) notFound();

  return (
    <SubTopicPageTemplate
      pillarSlug={params.pillarSlug}
      subTopicSlug={params.subTopicSlug}
    >
      <ContentComponent />
    </SubTopicPageTemplate>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPillars, getSubTopic } from "@/data/topic-libraries";
import SubTopicPageTemplate from "@/components/pillar/SubTopicPageTemplate";
import { subTopicContentRegistry } from "@/content";

interface Props {
  params: { pillarSlug: string; subTopicSlug: string };
}

export function generateStaticParams() {
  return getAllPillars().flatMap((p) =>
    p.subTopics.map((st) => ({
      pillarSlug: p.slug,
      subTopicSlug: st.slug,
    }))
  );
}

export function generateMetadata({ params }: Props): Metadata {
  const result = getSubTopic(params.pillarSlug, params.subTopicSlug);
  if (!result) return {};
  return {
    title: result.subTopic.title,
    description: result.subTopic.description,
    alternates: {
      canonical: `/learn/${params.pillarSlug}/${params.subTopicSlug}`,
    },
  };
}

function PlaceholderContent({ description }: { description: string }) {
  return (
    <>
      <h2>What You Need to Know</h2>
      <p>{description}</p>

      <h2>Why This Matters for Professionals</h2>
      <p>
        Understanding this topic is essential for any professional looking to build a consistent,
        high-quality video presence. Whether you are an attorney sharing legal tips, a doctor creating
        patient education content, or a real estate agent showcasing listings, this directly impacts
        your content quality and audience engagement.
      </p>

      <h2>How to Get Started</h2>
      <p>
        The fastest path to results is to start with a single platform and a consistent posting
        schedule. Focus on creating value for your specific audience rather than trying to optimize
        for every platform simultaneously.
      </p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Start with the fundamentals before optimizing</li>
        <li>Consistency beats perfection — post regularly</li>
        <li>Use AI to handle production so you can focus on strategy</li>
        <li>Measure what matters: leads and conversations, not just views</li>
      </ul>
    </>
  );
}

export default function SubTopicPage({ params }: Props) {
  const result = getSubTopic(params.pillarSlug, params.subTopicSlug);
  if (!result) notFound();

  const pillarSubTopics = subTopicContentRegistry[params.pillarSlug];
  const ContentComponent = pillarSubTopics?.[params.subTopicSlug];

  return (
    <SubTopicPageTemplate
      pillarSlug={params.pillarSlug}
      subTopicSlug={params.subTopicSlug}
    >
      {ContentComponent ? <ContentComponent /> : <PlaceholderContent description={result.subTopic.description} />}
    </SubTopicPageTemplate>
  );
}

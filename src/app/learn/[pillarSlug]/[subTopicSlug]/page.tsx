import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPillars, getSubTopic } from "@/data/topic-libraries";
import SubTopicPageTemplate from "@/components/pillar/SubTopicPageTemplate";

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

export default function SubTopicPage({ params }: Props) {
  const result = getSubTopic(params.pillarSlug, params.subTopicSlug);
  if (!result) notFound();

  const { subTopic } = result;

  // Placeholder content — will be replaced with real long-form content per subtopic
  return (
    <SubTopicPageTemplate
      pillarSlug={params.pillarSlug}
      subTopicSlug={params.subTopicSlug}
    >
      <h2>What You Need to Know</h2>
      <p>{subTopic.description}</p>

      <h2>Why This Matters for Professionals</h2>
      <p>
        Understanding {subTopic.title.toLowerCase()} is essential for any professional looking to
        build a consistent, high-quality video presence. Whether you are an attorney sharing legal
        tips, a doctor creating patient education content, or a real estate agent showcasing listings,
        this topic directly impacts your content quality and audience engagement.
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
    </SubTopicPageTemplate>
  );
}

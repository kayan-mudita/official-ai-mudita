import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompetitor, getAllCompetitorSlugs } from "@/data/competitors";
import CompetitorCompareClient from "./CompetitorCompareClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitor = getCompetitor(slug);
  if (!competitor) return { title: "Compare" };

  const title = `Official AI vs ${competitor.name}`;
  return {
    title,
    description: competitor.metaDescription,
    alternates: { canonical: `/compare/${competitor.slug}` },
    openGraph: {
      title,
      description: competitor.metaDescription,
      url: `/compare/${competitor.slug}`,
      type: "article",
    },
  };
}

export default async function CompetitorComparePage({ params }: PageProps) {
  const { slug } = await params;
  const competitor = getCompetitor(slug);
  if (!competitor) notFound();
  return <CompetitorCompareClient competitor={competitor} />;
}

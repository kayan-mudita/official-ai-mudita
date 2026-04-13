import { NextResponse } from "next/server";
import { siteUrl, siteEmail } from "@/lib/site-config";
import { blogPosts } from "@/data/blog-posts";
import { competitors } from "@/data/competitors";
import { features } from "@/data/features";
import { pillars } from "@/data/topic-libraries";

export async function GET() {
  const lines: string[] = [
    "# Official AI",
    "> AI-powered video content creation platform. Your face, your voice, no filming required.",
    "",
    "## Main Pages",
    `- [Home](${siteUrl}/)`,
    `- [Features](${siteUrl}/features)`,
    `- [Pricing](${siteUrl}/pricing)`,
    `- [How It Works](${siteUrl}/how-it-works)`,
    `- [About](${siteUrl}/about)`,
    `- [Demo](${siteUrl}/demo)`,
    `- [Compare](${siteUrl}/compare)`,
    `- [Use Cases](${siteUrl}/use-cases)`,
    "",
    "## Feature Detail Pages",
    ...features.map((f) => `- [${f.title}](${siteUrl}/features/${f.slug})`),
    "",
    "## Industry Pages",
    `- [For Realtors](${siteUrl}/for/realtors)`,
    `- [For Attorneys](${siteUrl}/for/attorneys)`,
    `- [For Doctors](${siteUrl}/for/doctors)`,
    `- [For Financial Advisors](${siteUrl}/for/advisors)`,
    "",
    "## Competitor Comparisons",
    ...competitors.map(
      (c) => `- [Official AI vs ${c.name}](${siteUrl}/compare/${c.slug})`,
    ),
    "",
    "## Guides (Pillars + Subtopics)",
    ...pillars.flatMap((p) => [
      `- [${p.title}](${siteUrl}/${p.slug})`,
      ...p.subTopics.map(
        (st) => `  - [${st.title}](${siteUrl}/${p.slug}/${st.slug})`,
      ),
    ]),
    "",
    "## Blog",
    `- [Blog](${siteUrl}/blog)`,
    ...blogPosts.map((p) => `- [${p.title}](${siteUrl}/blog/${p.slug})`),
    "",
    "## Free Tools",
    `- [Tools](${siteUrl}/tools)`,
    `- [Speaking Time Calculator](${siteUrl}/tools/speaking-time-calculator)`,
    `- [Video ROI Calculator](${siteUrl}/tools/video-roi-calculator)`,
    `- [Hook Generator](${siteUrl}/tools/hook-generator)`,
    "",
    "## Contact",
    `- Email: ${siteEmail}`,
    "- Twitter: @theofficialai",
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

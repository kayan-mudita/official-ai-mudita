import type { Metadata } from "next";
import RealEstateAgentsAiClient from "./RealEstateAgentsAiClient";

export const metadata: Metadata = {
  title: "How Real Estate Agents Are Using AI to Post Daily Without Filming",
  description:
    "Top-producing agents post content daily. Most post once a month. AI video is closing that gap for agents who know their market but hate being on camera.",
  alternates: { canonical: "/blog/real-estate-agents-ai" },
};

export default function RealEstateAgentsAiPage() {
  return <RealEstateAgentsAiClient />;
}

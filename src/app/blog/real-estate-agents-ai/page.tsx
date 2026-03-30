import type { Metadata } from "next";
import RealEstateAgentsAIClient from "./RealEstateAgentsAIClient";

export const metadata: Metadata = {
  title: "How Real Estate Agents Are Using AI to Post Daily Without Filming",
  description:
    "Top agents post daily, most post monthly. AI closes that gap with specific workflows for listings, market updates, and client testimonials.",
};

export default function RealEstateAgentsAIPage() {
  return <RealEstateAgentsAIClient />;
}
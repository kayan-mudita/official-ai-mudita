import type { Metadata } from "next";
import ScalingPersonalBrandAiClient from "./ScalingPersonalBrandAiClient";

export const metadata: Metadata = {
  title: "How Solo Professionals Scale a Personal Brand With AI",
  description:
    "Solo professionals cannot hire a content team. AI makes it possible to build a personal brand at scale without sacrificing quality or authenticity.",
  alternates: { canonical: "/blog/scaling-personal-brand-ai" },
};

export default function ScalingPersonalBrandAiPage() {
  return <ScalingPersonalBrandAiClient />;
}

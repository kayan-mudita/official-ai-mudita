import type { Metadata } from "next";
import AiUgcFutureClient from "./AiUgcFutureClient";

export const metadata: Metadata = {
  title: "Why AI-Generated UGC Is the Future of Professional Content",
  description:
    "The content that performs best is raw, face-to-camera UGC. AI is making that accessible to every professional without filming. Here is why AI UGC changes everything.",
  alternates: { canonical: "/blog/ai-ugc-future" },
};

export default function AiUgcFuturePage() {
  return <AiUgcFutureClient />;
}

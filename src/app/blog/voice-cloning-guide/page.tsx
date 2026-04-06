import type { Metadata } from "next";
import VoiceCloningGuideClient from "./VoiceCloningGuideClient";

export const metadata: Metadata = {
  title: "How Voice Cloning Works (And Why It Matters for Video)",
  description:
    "Voice cloning lets AI video speak in your actual voice. Here is how the technology works, what it sounds like, and why it matters for professional content.",
  alternates: { canonical: "/blog/voice-cloning-guide" },
};

export default function VoiceCloningGuidePage() {
  return <VoiceCloningGuideClient />;
}

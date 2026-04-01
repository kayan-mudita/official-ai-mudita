import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Upload 3 photos. AI builds your digital twin. Get multi-cut, studio-quality videos posted to every platform. See how Official AI works in three simple steps.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}

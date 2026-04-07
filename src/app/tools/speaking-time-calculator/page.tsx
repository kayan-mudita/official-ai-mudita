import type { Metadata } from "next";
import SpeakingTimeClient from "./SpeakingTimeClient";

export const metadata: Metadata = {
  title: "Speaking Time Calculator — Free Script Length Tool",
  description:
    "Paste any script and instantly see how long it will take to read aloud. Tuned for short-form video pacing on LinkedIn, TikTok, Reels, and Shorts.",
  alternates: { canonical: "/tools/speaking-time-calculator" },
};

export default function Page() {
  return <SpeakingTimeClient />;
}

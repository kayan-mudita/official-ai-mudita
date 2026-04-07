import type { Metadata } from "next";
import VideoRoiClient from "./VideoRoiClient";

export const metadata: Metadata = {
  title: "Video ROI Calculator — Free Tool for Marketers",
  description:
    "See exactly what you spend on video content and how much you'd save with an AI-powered workflow. Free, no signup required.",
  alternates: { canonical: "/tools/video-roi-calculator" },
};

export default function Page() {
  return <VideoRoiClient />;
}

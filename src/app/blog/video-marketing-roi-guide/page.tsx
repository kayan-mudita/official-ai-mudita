import type { Metadata } from "next";
import VideoMarketingRoiGuideClient from "./VideoMarketingRoiGuideClient";

export const metadata: Metadata = {
  title: "How to Measure Video Marketing ROI Without Expensive Tools",
  description:
    "Most professionals know video works but cannot prove it. Here is a simple framework for measuring video marketing ROI with tools you already have.",
  alternates: { canonical: "/blog/video-marketing-roi-guide" },
};

export default function VideoMarketingRoiGuidePage() {
  return <VideoMarketingRoiGuideClient />;
}

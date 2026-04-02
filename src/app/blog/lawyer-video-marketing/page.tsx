import type { Metadata } from "next";
import LawyerVideoMarketingClient from "./LawyerVideoMarketingClient";

export const metadata: Metadata = {
  title: "Video Marketing for Lawyers: A Compliance-Friendly Guide",
  description:
    "Video marketing works for law firms, but bar rules add complexity. Here is how to create compelling legal content that stays within ethical guidelines.",
  alternates: { canonical: "/blog/lawyer-video-marketing" },
};

export default function LawyerVideoMarketingPage() {
  return <LawyerVideoMarketingClient />;
}

import type { Metadata } from "next";
import LinkedinVideoTipsClient from "./LinkedinVideoTipsClient";

export const metadata: Metadata = {
  title: "7 LinkedIn Video Strategies That Actually Generate Leads",
  description:
    "Most LinkedIn videos get views but zero leads. These seven strategies turn LinkedIn video content into a consistent source of inbound business.",
  alternates: { canonical: "/blog/linkedin-video-tips" },
};

export default function LinkedinVideoTipsPage() {
  return <LinkedinVideoTipsClient />;
}

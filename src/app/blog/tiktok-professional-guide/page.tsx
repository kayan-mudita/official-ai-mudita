import type { Metadata } from "next";
import TiktokProfessionalGuideClient from "./TiktokProfessionalGuideClient";

export const metadata: Metadata = {
  title: "TikTok for Professionals: How to Build Authority Without Dancing",
  description:
    "TikTok is not just for teenagers. Professionals are using it to build authority, attract clients, and grow their practice. Here is how to do it without compromising your credibility.",
  alternates: { canonical: "/blog/tiktok-professional-guide" },
};

export default function TiktokProfessionalGuidePage() {
  return <TiktokProfessionalGuideClient />;
}

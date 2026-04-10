import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { siteUrl, siteName } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Official AI — Your AI Marketing Teammate",
  description:
    "Create AI-powered video content with your face and voice. No filming, no editing, no crew. Upload photos, get studio-quality social media videos posted automatically.",
  alternates: { canonical: "/" },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software`,
  name: siteName,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "VideoEditing",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "AI-powered video content creation platform. Upload photos, get studio-quality social media videos with your face and voice. No filming required.",
  featureList: [
    "AI Digital Twin creation",
    "Multi-cut video composition",
    "Voice cloning",
    "Auto-posting to social platforms",
    "Content calendar",
    "Analytics and ROI tracking",
  ],
  offers: {
    "@type": "Offer",
    price: "79.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/pricing`,
  },
  publisher: { "@id": `${siteUrl}/#organization` },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <HomeClient />
    </>
  );
}

import type { Metadata } from "next";
import ForAttorneysClient from "./ForAttorneysClient";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AI Video Content for Attorneys",
  description:
    "Generate know-your-rights content, case result videos, and legal tips that drive consultations. Using your face and voice. Built for legal professionals.",
  alternates: { canonical: "/for/attorneys" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Official AI for Legal Professionals",
  description: "AI-powered video content creation for attorneys. Generate know-your-rights tips, case result videos, and legal content that drives consultations.",
  provider: { "@id": `${siteUrl}/#organization` },
  serviceType: "AI Video Generation",
  areaServed: "US",
  audience: { "@type": "Audience", audienceType: "Attorneys" },
  offers: { "@type": "Offer", price: "79.00", priceCurrency: "USD" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <ForAttorneysClient />
    </>
  );
}

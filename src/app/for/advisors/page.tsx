import type { Metadata } from "next";
import ForAdvisorsClient from "./ForAdvisorsClient";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "AI Video Content for Financial Advisors",
  description:
    "Generate daily market commentary, financial tips, and thought leadership content using your face and voice. Built for financial advisors and wealth managers.",
  alternates: { canonical: "/for/advisors" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Official AI for Financial Advisors",
  description: "AI-powered video content creation for financial advisors. Generate market commentary, financial tips, and thought leadership content.",
  provider: { "@id": `${siteUrl}/#organization` },
  serviceType: "AI Video Generation",
  areaServed: "US",
  audience: { "@type": "Audience", audienceType: "Financial advisors" },
  offers: { "@type": "Offer", price: "79.00", priceCurrency: "USD" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <ForAdvisorsClient />
    </>
  );
}

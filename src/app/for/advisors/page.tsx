import type { Metadata } from "next";
import ForAdvisorsClient from "./ForAdvisorsClient";

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
  provider: { "@type": "Organization", name: "Official AI", url: "https://officialai.com" },
  serviceType: "AI Video Generation",
  areaServed: "US",
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

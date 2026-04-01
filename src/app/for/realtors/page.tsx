import type { Metadata } from "next";
import ForRealtorsClient from "./ForRealtorsClient";

export const metadata: Metadata = {
  title: "AI Video Content for Realtors",
  description:
    "Generate listing tours, market updates, and neighborhood guides using your face and voice. Post daily without ever touching a camera. Built for real estate professionals.",
  alternates: { canonical: "/for/realtors" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Official AI for Real Estate",
  description: "AI-powered video content creation for real estate professionals. Generate listing tours, market updates, and neighborhood guides.",
  provider: { "@type": "Organization", name: "Official AI", url: "https://officialai.com" },
  serviceType: "AI Video Generation",
  areaServed: "US",
  offers: { "@type": "Offer", price: "79.00", priceCurrency: "USD" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <ForRealtorsClient />
    </>
  );
}

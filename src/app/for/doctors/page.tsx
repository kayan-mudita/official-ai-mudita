import type { Metadata } from "next";
import ForDoctorsClient from "./ForDoctorsClient";

export const metadata: Metadata = {
  title: "AI Video Content for Doctors",
  description:
    "Generate patient education videos, health tips, and procedure explainers using your face and voice. Review every script for medical accuracy. Built for healthcare professionals.",
  alternates: { canonical: "/for/doctors" },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Official AI for Medical Professionals",
  description: "AI-powered video content creation for doctors. Generate patient education videos, health tips, and procedure explainers with medical accuracy review.",
  provider: { "@type": "Organization", name: "Official AI", url: "https://officialai.com" },
  serviceType: "AI Video Generation",
  areaServed: "US",
  offers: { "@type": "Offer", price: "79.00", priceCurrency: "USD" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <ForDoctorsClient />
    </>
  );
}

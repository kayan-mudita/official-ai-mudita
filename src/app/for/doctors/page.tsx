import type { Metadata } from "next";
import ForDoctorsClient from "./ForDoctorsClient";
import { siteUrl } from "@/lib/site-config";

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
  provider: { "@id": `${siteUrl}/#organization` },
  serviceType: "AI Video Generation",
  areaServed: "US",
  audience: { "@type": "Audience", audienceType: "Physicians" },
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

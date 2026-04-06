import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CookieConsent from "@/components/marketing/CookieConsent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://officialai.com";

export const metadata: Metadata = {
  title: {
    default: "Official AI — Your AI Marketing Teammate",
    template: "%s | Official AI",
  },
  description:
    "Create AI-powered video content with your face and voice using Kling 2.6 and Seedance 2.0. No filming required. Your AI twin, posting for you.",
  keywords: [
    "AI video generation",
    "social media automation",
    "AI marketing",
    "video content creation",
    "AI avatar",
    "voice cloning",
    "content automation",
    "Official AI",
  ],
  authors: [{ name: "Official AI" }],
  creator: "Official AI",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Official AI",
    title: "Official AI — Your AI Twin, Posting for You",
    description:
      "Upload a few photos. Get studio-quality social media videos featuring your face and voice. No filming. No editing. No crew.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Official AI - AI-powered video content creation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Official AI — Your AI Twin, Posting for You",
    description:
      "Upload a few photos. Get studio-quality social media videos featuring your face and voice. No filming. No editing. No crew.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@officialai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Official AI",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description:
    "AI-powered video content creation platform. Upload photos, get studio-quality social media videos with your face and voice.",
  url: siteUrl,
  offers: {
    "@type": "Offer",
    price: "79.00",
    priceCurrency: "USD",
    priceValidUntil: "2027-12-31",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "200",
    bestRating: "5",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Official AI",
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  foundingDate: "2025",
  email: "hello@officialai.com",
  sameAs: [
    "https://twitter.com/officialai",
    "https://linkedin.com/company/officialai",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@officialai.com",
    contactType: "customer service",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Official AI",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#050508" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#060911] text-white antialiased font-sans">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

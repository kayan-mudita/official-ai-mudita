import type { Metadata } from "next";
import CookieConsent from "@/components/marketing/CookieConsent";
import { siteUrl, siteEmail, siteName } from "@/lib/site-config";
import "./globals.css";

// System font stack — no external font downloads required.
// Prevents build failures when fonts.googleapis.com is unreachable.
// Inter is available on most modern systems; falls back gracefully.
const fontVariable = "--font-sans";
const inter = {
  variable: fontVariable,
  className: "",
};

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
  authors: [{ name: siteName }],
  creator: siteName,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
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
    creator: "@theofficialai",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/logo.png`,
  },
  foundingDate: "2025",
  email: siteEmail,
  sameAs: [
    "https://twitter.com/theofficialai",
    "https://linkedin.com/company/theofficialai",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: siteEmail,
    contactType: "customer service",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  url: siteUrl,
  publisher: { "@id": `${siteUrl}/#organization` },
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

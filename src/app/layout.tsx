import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Official AI — Transform Your Social Media with AI Video Content",
  description:
    "Create and publish high-quality AI video content every month using Kling 2.6 and Seedance 2.0. No filming or editing required.",
  keywords: [
    "AI video",
    "social media",
    "content creation",
    "Kling 2.6",
    "Seedance 2.0",
    "personal branding",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950 text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

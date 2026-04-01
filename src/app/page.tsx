import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Official AI — Your AI Marketing Teammate",
  description:
    "Create AI-powered video content with your face and voice. No filming, no editing, no crew. Upload photos, get studio-quality social media videos posted automatically.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}

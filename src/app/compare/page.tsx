import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Compare Official AI to doing it yourself or hiring an agency. See why 200+ professionals chose AI-powered video content creation.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return <CompareClient />;
}

import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One plan, everything included. $79/mo for 30 videos, all platforms, voice cloning, analytics, and auto-posting. Start free, no credit card required.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingClient />;
}

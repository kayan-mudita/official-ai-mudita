import type { Metadata } from "next";
import GoClient from "./GoClient";

export const metadata: Metadata = {
  title: "Unlimited AI Videos — $29/mo",
  description:
    "Your face. Your voice. AI does the rest. Unlimited AI video generation, auto-posting to all platforms. 7-day free trial, cancel anytime.",
  alternates: { canonical: "/go" },
};

export default function Page() {
  return <GoClient />;
}

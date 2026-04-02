import type { Metadata } from "next";
import FinancialAdvisorVideoClient from "./FinancialAdvisorVideoClient";

export const metadata: Metadata = {
  title: "How Financial Advisors Use Video to Build AUM",
  description:
    "Financial advisors who use video consistently grow AUM faster. Here is how to create compliant, trust-building video content that attracts high-net-worth clients.",
  alternates: { canonical: "/blog/financial-advisor-video" },
};

export default function FinancialAdvisorVideoPage() {
  return <FinancialAdvisorVideoClient />;
}

import type { Metadata } from "next";
import UseCasesClient from "./UseCasesClient";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "See how real estate agents, attorneys, financial advisors, medical professionals, and creators use Official AI to post daily content without filming.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesPage() {
  return <UseCasesClient />;
}

import type { Metadata } from "next";
import FiveContentFormatsClient from "./FiveContentFormatsClient";

export const metadata: Metadata = {
  title: "5 Content Formats That Work for Every Industry",
  description:
    "Not all content formats work for all professionals. But these five formats consistently drive engagement regardless of industry, audience, or platform.",
};

export default function FiveContentFormatsPage() {
  return <FiveContentFormatsClient />;
}

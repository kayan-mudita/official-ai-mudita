import type { Metadata } from "next";
import ToolsIndexClient from "./ToolsIndexClient";

export const metadata: Metadata = {
  title: "Free Tools for Video Marketers",
  description:
    "Free tools for solo professionals creating short-form video. Speaking time calculator, video ROI calculator, hook generator, and more.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return <ToolsIndexClient />;
}

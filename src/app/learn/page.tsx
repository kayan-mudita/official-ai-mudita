import type { Metadata } from "next";
import GuidesIndexClient from "./GuidesIndexClient";

export const metadata: Metadata = {
  title: "Guides — AI Video Marketing for Professionals",
  description:
    "In-depth guides on AI video creation, video marketing strategy, social media video, and scaling content for professionals. Learn how to use AI to build your brand.",
  alternates: { canonical: "/learn" },
};

export default function Page() {
  return <GuidesIndexClient />;
}

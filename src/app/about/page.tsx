import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Official AI exists to make every professional a content creator. We build AI that creates content indistinguishable from self-shot iPhone videos.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}

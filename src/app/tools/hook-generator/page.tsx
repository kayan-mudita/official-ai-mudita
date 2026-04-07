import type { Metadata } from "next";
import HookGeneratorClient from "./HookGeneratorClient";

export const metadata: Metadata = {
  title: "Hook Generator — 100+ Free Video Hooks",
  description:
    "Get scroll-stopping first lines for your short-form videos. Filter by industry — realtor, lawyer, advisor, doctor, or general. Free, no signup.",
  alternates: { canonical: "/tools/hook-generator" },
};

export default function Page() {
  return <HookGeneratorClient />;
}

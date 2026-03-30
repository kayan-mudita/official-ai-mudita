import type { Metadata } from "next";
import AIUGCFutureClient from "./AIUGCFutureClient";

export const metadata: Metadata = {
  title: "Why AI-Generated UGC Is the Future of Professional Content",
  description:
    "Raw face-to-camera UGC outperforms polished corporate video. Here is how AI makes authentic content accessible to every professional.",
};

export default function AIUGCFuturePage() {
  return <AIUGCFutureClient />;
}
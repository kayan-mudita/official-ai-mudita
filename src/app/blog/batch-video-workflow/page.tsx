import type { Metadata } from "next";
import BatchVideoWorkflowClient from "./BatchVideoWorkflowClient";

export const metadata: Metadata = {
  title: "How to Create 30 Videos in One Sitting",
  description:
    "Batch video creation is how top creators maintain a daily posting schedule without burning out. Here is the exact workflow for producing 30 videos in a single session.",
  alternates: { canonical: "/blog/batch-video-workflow" },
};

export default function BatchVideoWorkflowPage() {
  return <BatchVideoWorkflowClient />;
}

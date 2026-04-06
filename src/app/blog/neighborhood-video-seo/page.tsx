import type { Metadata } from "next";
import NeighborhoodVideoSeoClient from "./NeighborhoodVideoSeoClient";

export const metadata: Metadata = {
  title: "How Neighborhood Spotlight Videos Win Listings Before the Pitch",
  description:
    "Neighborhood spotlight videos position you as the local expert before a seller even calls. Here is how to create them with AI and use them to win listings.",
  alternates: { canonical: "/blog/neighborhood-video-seo" },
};

export default function NeighborhoodVideoSeoPage() {
  return <NeighborhoodVideoSeoClient />;
}

import React from "react";
import GlowBlob from "@/components/marketing/GlowBlob";

interface PageBackdropProps {
  /** Visual intensity. Default: 0.05 (very subtle). */
  intensity?: number;
}

/**
 * Site-wide ambient backdrop — fixed position behind page content.
 * Two GlowBlobs + faint mesh gradient. Drop near the top of any page that
 * currently sits on flat black.
 */
export default function PageBackdrop({ intensity = 0.05 }: PageBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      <GlowBlob
        color="special"
        size="xl"
        position="top-left"
        intensity={intensity}
      />
      <GlowBlob
        color="utility"
        size="xl"
        position="bottom-right"
        intensity={intensity}
      />
    </div>
  );
}

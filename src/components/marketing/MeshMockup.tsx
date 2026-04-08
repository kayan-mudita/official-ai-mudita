import React from "react";

interface MeshMockupProps {
  children: React.ReactNode;
  /** Aspect ratio class. Default: aspect-video. */
  aspect?: string;
  className?: string;
}

/**
 * Glass card + mesh-grid overlay used as the visual mockup container on the
 * homepage "How it works" section. Wrap an image, video, or any visual.
 */
export default function MeshMockup({
  children,
  aspect = "aspect-video",
  className = "",
}: MeshMockupProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl card-hairline ${aspect} ${className}`}
    >
      {/* Mesh grid overlay — subtle 40px/30px lattice */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "40px 30px",
        }}
      />

      {/* Mesh gradient ambient wash */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />

      {/* Content */}
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
}

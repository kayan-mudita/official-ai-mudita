"use client";

import { Suspense } from "react";
import SessionProvider from "@/components/SessionProvider";
import UnifiedOnboarding from "@/components/onboarding/UnifiedOnboarding";

export default function DemoInteractive() {
  return (
    <SessionProvider>
      <Suspense fallback={<div className="min-h-[60vh] bg-[#060610]" />}>
        <UnifiedOnboarding demoMode />
      </Suspense>
    </SessionProvider>
  );
}

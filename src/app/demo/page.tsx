"use client";

import { Suspense } from "react";
import SessionProvider from "@/components/SessionProvider";
import UnifiedOnboarding from "@/components/onboarding/UnifiedOnboarding";

function DemoContent() {
  return <UnifiedOnboarding demoMode />;
}

export default function DemoPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#060610]" />}>
        <DemoContent />
      </Suspense>
    </SessionProvider>
  );
}

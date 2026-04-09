"use client";

import { Suspense } from "react";
import SessionProvider from "@/components/SessionProvider";
import UnifiedOnboarding from "@/components/onboarding/UnifiedOnboarding";

function OnboardingContent() {
  return <UnifiedOnboarding />;
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#060610]" />}>
        <OnboardingContent />
      </Suspense>
    </SessionProvider>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import SessionProvider from "@/components/SessionProvider";
import UnifiedOnboarding from "@/components/onboarding/UnifiedOnboarding";

// Gate: ensures a guest session exists before rendering the real flow.
// On production, /demo users have no account — this signs them in with the
// "demo" NextAuth credentials provider (auto-creates a throwaway user) so that
// API routes like /api/upload and /api/character-sheet don't return 401.
function DemoSessionGate() {
  const { status } = useSession();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !attempted) {
      setAttempted(true);
      signIn("demo", { redirect: false });
    }
  }, [status, attempted]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-[60vh] bg-[#060610] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-10 h-10 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[13px] text-white/45 font-medium">Setting up your demo...</p>
          <p className="text-[11px] text-white/25">No signup required</p>
        </div>
      </div>
    );
  }

  return <UnifiedOnboarding demoMode />;
}

export default function DemoInteractive() {
  return (
    <SessionProvider>
      <Suspense fallback={<div className="min-h-[60vh] bg-[#060610]" />}>
        <DemoSessionGate />
      </Suspense>
    </SessionProvider>
  );
}

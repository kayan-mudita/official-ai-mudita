"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function OnboardingBanner() {
  const { data: session } = useSession();
  const onboarded = (session?.user as any)?.onboarded;

  // Only show when user exists but has not completed onboarding
  if (!session?.user || onboarded) return null;

  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-xl border border-blue-500/10 bg-gradient-to-r from-blue-500/[0.04] to-purple-500/[0.04] px-4 sm:px-5 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-white/85">
              Complete your setup to get your first AI video
            </p>
            <p className="text-[12px] text-white/70 mt-0.5 hidden sm:block">
              Finish onboarding to unlock personalized video generation
            </p>
          </div>
        </div>
        <Link
          href="/auth/onboarding"
          className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/[0.08] text-[13px] font-medium text-white/70 hover:bg-white/[0.12] hover:text-white/90 active:bg-white/[0.15] transition-all flex-shrink-0"
        >
          Continue setup <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

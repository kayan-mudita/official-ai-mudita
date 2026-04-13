"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-5xl">😬</div>
        <h1 className="text-[24px] font-extrabold text-white tracking-tight">
          Something went wrong
        </h1>
        <p className="text-[14px] text-white/70">
          We hit an unexpected error. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)",
            boxShadow: "0 0 20px rgba(99,102,241,0.3)",
          }}
        >
          Try again
        </button>
        <p className="text-[11px] text-white/70">
          Error ID: {error.digest || "unknown"}
        </p>
      </div>
    </div>
  );
}

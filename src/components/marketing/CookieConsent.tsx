"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "officialai-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#060911]/95 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-white/40 text-center sm:text-left">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <a href="/privacy" className="text-blue-400/70 hover:text-blue-400 underline">
            privacy policy
          </a>
          .
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white/40 hover:text-white/60 border border-white/[0.08] hover:border-white/[0.12] transition-all"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-white text-[#050508] hover:bg-white/90 transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

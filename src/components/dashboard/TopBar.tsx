"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, Sparkles } from "lucide-react";
import Link from "next/link";

export default function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="h-14 sm:h-16 border-b border-white/5 bg-[#060911]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      {/* Mobile logo (visible only on mobile) */}
      <Link href="/dashboard/generate" className="flex lg:hidden items-center gap-2 mr-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-bold whitespace-nowrap">
          Official <span className="gradient-text">AI</span>
        </span>
      </Link>

      {/* Search */}
      <div className="relative max-w-md flex-1 hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search videos, content..."
          className="input-field pl-10 !py-2 !text-sm !rounded-lg max-w-sm"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile search button */}
        <button className="sm:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors">
          <Search className="w-5 h-5 text-white/50" />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-white/50" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Plan badge */}
        <div className="hidden md:block px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <span className="text-xs font-semibold text-blue-400 uppercase">
            {(session?.user as any)?.plan || "Free"} Plan
          </span>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white leading-none">
              {session?.user?.name || "User"}
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              {session?.user?.email || ""}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

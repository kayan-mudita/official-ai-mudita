"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Scale,
  HeartPulse,
  TrendingUp,
  Sparkles,
  BarChart3,
  FileText,
  ArrowRightLeft,
} from "lucide-react";

const mainLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
];

const industryLinks = [
  { label: "Real Estate", href: "/for/realtors", icon: Home, desc: "Listing tours, market updates" },
  { label: "Legal", href: "/for/attorneys", icon: Scale, desc: "Know-your-rights, case results" },
  { label: "Medical", href: "/for/doctors", icon: HeartPulse, desc: "Health tips, patient education" },
  { label: "Financial Advisors", href: "/for/advisors", icon: TrendingUp, desc: "Market commentary, tips" },
];

const learnLinks = [
  { label: "Use Cases", href: "/use-cases", icon: Sparkles, desc: "How professionals use Official AI" },
  { label: "Compare", href: "/compare", icon: ArrowRightLeft, desc: "Official AI vs alternatives" },
  { label: "Blog", href: "/blog", icon: FileText, desc: "AI video & content strategy" },
  { label: "About", href: "/about", icon: BarChart3, desc: "Our mission and team" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setMobileAccordion(null);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#050508]/90 backdrop-blur-xl shadow-lg shadow-black/20"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        {/* Scroll progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-violet-400 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="text-[15px] font-semibold tracking-tight z-10">
            Official <span className="text-blue-400">AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                  pathname === link.href
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Industries dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("industries")}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "industries" || pathname.startsWith("/for/")
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Industries
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "industries" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "industries" && (
                <div className="absolute top-full left-0 mt-2 w-[280px] p-2 rounded-xl border border-white/[0.08] bg-[#0a0e17]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.1] transition-colors mt-0.5">
                        <link.icon className="w-4 h-4 text-white/40 group-hover:text-blue-400/70 transition-colors" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-white/70 group-hover:text-white/90 transition-colors">
                          {link.label}
                        </div>
                        <div className="text-[11px] text-white/25 mt-0.5">
                          {link.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Learn dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("learn")}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "learn"
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Learn
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "learn" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "learn" && (
                <div className="absolute top-full right-0 mt-2 w-[280px] p-2 rounded-xl border border-white/[0.08] bg-[#0a0e17]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  {learnLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.1] transition-colors mt-0.5">
                        <link.icon className="w-4 h-4 text-white/40 group-hover:text-blue-400/70 transition-colors" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-white/70 group-hover:text-white/90 transition-colors">
                          {link.label}
                        </div>
                        <div className="text-[11px] text-white/25 mt-0.5">
                          {link.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 z-10">
            <Link
              href="/auth/login"
              className="text-[13px] text-white/40 hover:text-white/70 transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="text-[13px] px-4 py-2 rounded-lg bg-white text-[#050508] font-medium hover:bg-white/90 transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative z-10 p-2.5 -mr-2 rounded-lg hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-white/70" />
            ) : (
              <Menu className="w-5 h-5 text-white/70" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-[#050508]/95 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`relative h-full overflow-y-auto pt-20 pb-8 px-6 transition-all duration-300 ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="max-w-sm mx-auto space-y-1">
            {/* Main links */}
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-[16px] py-3 px-4 rounded-lg transition-colors ${
                  pathname === link.href
                    ? "text-white/90 bg-white/[0.04]"
                    : "text-white/50 active:text-white/90 active:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Industries accordion */}
            <div>
              <button
                onClick={() => setMobileAccordion(mobileAccordion === "industries" ? null : "industries")}
                className="w-full flex items-center justify-between text-[16px] py-3 px-4 rounded-lg text-white/50 active:text-white/90 transition-colors"
              >
                Industries
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAccordion === "industries" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordion === "industries" && (
                <div className="pl-4 space-y-1 mt-1">
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 text-[15px] py-2.5 px-4 rounded-lg transition-colors ${
                        pathname === link.href
                          ? "text-white/90 bg-white/[0.04]"
                          : "text-white/40 active:text-white/70"
                      }`}
                    >
                      <link.icon className="w-4 h-4 text-white/30 flex-shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Learn accordion */}
            <div>
              <button
                onClick={() => setMobileAccordion(mobileAccordion === "learn" ? null : "learn")}
                className="w-full flex items-center justify-between text-[16px] py-3 px-4 rounded-lg text-white/50 active:text-white/90 transition-colors"
              >
                Learn
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAccordion === "learn" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordion === "learn" && (
                <div className="pl-4 space-y-1 mt-1">
                  {learnLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 text-[15px] py-2.5 px-4 rounded-lg transition-colors ${
                        pathname === link.href
                          ? "text-white/90 bg-white/[0.04]"
                          : "text-white/40 active:text-white/70"
                      }`}
                    >
                      <link.icon className="w-4 h-4 text-white/30 flex-shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Divider + auth */}
            <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
              <Link
                href="/auth/login"
                className="block text-center text-[15px] text-white/40 active:text-white/70 transition-colors py-3 px-4 rounded-lg"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="block text-center text-[15px] px-6 py-3.5 rounded-xl bg-white text-[#050508] font-semibold active:bg-white/80 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

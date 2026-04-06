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
  BookOpen,
  FileText,
  ArrowRightLeft,
  ArrowRight,
  Play,
  Clapperboard,
  Zap,
  Video,
  BarChart3,
  Share2,
  Briefcase,
  Layers,
} from "lucide-react";

const productLinks = [
  { label: "How it works", href: "/how-it-works", icon: Clapperboard, desc: "See the AI video pipeline" },
  { label: "Features", href: "/features", icon: Zap, desc: "Everything Official AI does" },
  { label: "Demo", href: "/demo", icon: Play, desc: "Try it free — no signup" },
  { label: "Compare", href: "/compare", icon: ArrowRightLeft, desc: "Official AI vs alternatives" },
];

const solutionLinks = [
  { label: "For Real Estate", href: "/for/realtors", icon: Home, desc: "Listing tours, market updates" },
  { label: "For Legal", href: "/for/attorneys", icon: Scale, desc: "Know-your-rights, case results" },
  { label: "For Medical", href: "/for/doctors", icon: HeartPulse, desc: "Health tips, patient education" },
  { label: "For Financial Advisors", href: "/for/advisors", icon: TrendingUp, desc: "Market commentary, tips" },
];

const resourceLearnLinks = [
  { label: "Blog", href: "/blog", icon: FileText, desc: "AI video & content strategy" },
  { label: "Guides", href: "/learn", icon: BookOpen, desc: "In-depth marketing guides" },
  { label: "Use Cases", href: "/use-cases", icon: Sparkles, desc: "How professionals use Official AI" },
];

const topicGuideLinks = [
  { label: "AI Video Creation", href: "/learn/ai-video-creation", icon: Video, hoverColor: "group-hover:text-blue-400/70" },
  { label: "Video Marketing", href: "/learn/video-marketing-professionals", icon: BarChart3, hoverColor: "group-hover:text-violet-400/70" },
  { label: "Social Media Video", href: "/learn/social-media-video-strategy", icon: Share2, hoverColor: "group-hover:text-emerald-400/70" },
  { label: "AI Video for Real Estate", href: "/learn/ai-video-real-estate", icon: Home, hoverColor: "group-hover:text-amber-400/70" },
  { label: "Professional Services", href: "/learn/ai-video-professional-services", icon: Briefcase, hoverColor: "group-hover:text-cyan-400/70" },
  { label: "AI Content at Scale", href: "/learn/ai-content-at-scale", icon: Layers, hoverColor: "group-hover:text-rose-400/70" },
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

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
    setMobileAccordion(null);
  }, [pathname]);

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

  const DropdownLink = ({ link }: { link: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; desc: string } }) => (
    <Link
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
  );

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
            {/* Products dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("products")}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "products" || pathname === "/how-it-works" || pathname === "/features" || pathname === "/demo" || pathname === "/compare"
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Product
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "products" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "products" && (
                <div className="absolute top-full left-0 mt-2 w-[280px] p-2 rounded-xl border border-white/[0.08] bg-[#0a0e17]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  {productLinks.map((link) => (
                    <DropdownLink key={link.href} link={link} />
                  ))}
                </div>
              )}
            </div>

            {/* Solutions dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("solutions")}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "solutions" || pathname.startsWith("/for/")
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Solutions
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "solutions" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "solutions" && (
                <div className="absolute top-full left-0 mt-2 w-[280px] p-2 rounded-xl border border-white/[0.08] bg-[#0a0e17]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  {solutionLinks.map((link) => (
                    <DropdownLink key={link.href} link={link} />
                  ))}
                  <div className="mt-1 pt-2 border-t border-white/[0.06]">
                    <Link
                      href="/use-cases"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
                    >
                      <span className="text-[12px] text-white/30 group-hover:text-white/50 transition-colors">
                        View all use cases
                      </span>
                      <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Resources mega-menu */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("resources")}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "resources" || pathname.startsWith("/learn") || pathname.startsWith("/blog") || pathname === "/use-cases"
                    ? "text-white/70"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Resources
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "resources" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[580px] rounded-xl border border-white/[0.08] bg-[#0a0e17]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
                    {/* Left column: Learn */}
                    <div className="p-4">
                      <h3 className="text-[11px] font-medium text-white/25 uppercase tracking-wider px-3 mb-2">
                        Learn
                      </h3>
                      {resourceLearnLinks.map((link) => (
                        <DropdownLink key={link.href} link={link} />
                      ))}
                    </div>

                    {/* Right column: Topic Guides */}
                    <div className="p-4">
                      <h3 className="text-[11px] font-medium text-white/25 uppercase tracking-wider px-3 mb-2">
                        Topic Guides
                      </h3>
                      <div className="space-y-0.5">
                        {topicGuideLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                          >
                            <link.icon className={`w-3.5 h-3.5 text-white/40 ${link.hoverColor} transition-colors`} />
                            <span className="text-[13px] text-white/50 group-hover:text-white/80 transition-colors">
                              {link.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <Link
                          href="/learn"
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        >
                          <span className="text-[12px] text-white/30 group-hover:text-white/50 transition-colors">
                            View all guides
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing — standalone */}
            <Link
              href="/pricing"
              className={`px-4 py-2 text-[13px] transition-colors rounded-lg hover:bg-white/[0.03] ${
                pathname === "/pricing"
                  ? "text-white/70"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 z-10">
            <Link
              href="/auth/login"
              className="text-[13px] text-white/40 hover:text-white/70 transition-colors px-3 py-2"
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
            {/* Product accordion */}
            <div>
              <button
                onClick={() => setMobileAccordion(mobileAccordion === "products" ? null : "products")}
                className="w-full flex items-center justify-between text-[16px] py-3 px-4 rounded-lg text-white/50 active:text-white/90 transition-colors"
              >
                Product
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAccordion === "products" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordion === "products" && (
                <div className="pl-4 space-y-1 mt-1">
                  {productLinks.map((link) => (
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

            {/* Solutions accordion */}
            <div>
              <button
                onClick={() => setMobileAccordion(mobileAccordion === "solutions" ? null : "solutions")}
                className="w-full flex items-center justify-between text-[16px] py-3 px-4 rounded-lg text-white/50 active:text-white/90 transition-colors"
              >
                Solutions
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAccordion === "solutions" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordion === "solutions" && (
                <div className="pl-4 space-y-1 mt-1">
                  {solutionLinks.map((link) => (
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

            {/* Resources accordion */}
            <div>
              <button
                onClick={() => setMobileAccordion(mobileAccordion === "resources" ? null : "resources")}
                className="w-full flex items-center justify-between text-[16px] py-3 px-4 rounded-lg text-white/50 active:text-white/90 transition-colors"
              >
                Resources
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAccordion === "resources" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordion === "resources" && (
                <div className="pl-4 space-y-1 mt-1">
                  <div className="px-4 py-2">
                    <span className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Learn</span>
                  </div>
                  {resourceLearnLinks.map((link) => (
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
                  <div className="px-4 py-2 mt-2">
                    <span className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Topic Guides</span>
                  </div>
                  {topicGuideLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 text-[15px] py-2.5 px-4 rounded-lg transition-colors ${
                        pathname === link.href
                          ? "text-white/90 bg-white/[0.04]"
                          : "text-white/40 active:text-white/70"
                      }`}
                    >
                      <link.icon className="w-4 h-4 flex-shrink-0 text-white/30" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing — standalone */}
            <Link
              href="/pricing"
              className={`block text-[16px] py-3 px-4 rounded-lg transition-colors ${
                pathname === "/pricing"
                  ? "text-white/90 bg-white/[0.04]"
                  : "text-white/50 active:text-white/90 active:bg-white/[0.04]"
              }`}
            >
              Pricing
            </Link>

            {/* About — standalone */}
            <Link
              href="/about"
              className={`block text-[16px] py-3 px-4 rounded-lg transition-colors ${
                pathname === "/about"
                  ? "text-white/90 bg-white/[0.04]"
                  : "text-white/50 active:text-white/90 active:bg-white/[0.04]"
              }`}
            >
              About
            </Link>

            {/* Divider + dual CTA */}
            <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 text-[15px] px-6 py-3.5 rounded-xl bg-white text-[#050508] font-semibold active:bg-white/80 transition-colors"
              >
                <Play className="w-4 h-4" />
                Try the demo — no signup
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center text-[14px] text-white/40 active:text-white/70 transition-colors py-3 px-4 rounded-lg border border-white/[0.06]"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 text-center text-[14px] text-white/60 active:text-white/90 transition-colors py-3 px-4 rounded-lg border border-white/[0.08] bg-white/[0.04]"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

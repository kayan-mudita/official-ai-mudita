"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Logo from "@/components/brand/Logo";
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
  ArrowRight,
  Play,
  Clapperboard,
  Zap,
  Video,
  BarChart3,
  Share2,
  Camera,
  Mic,
  Calendar,
  Briefcase,
  Layers,
  Calculator,
  Clock,
  Wand2,
  Users,
  Quote,
  GitCompareArrows,
} from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
  iconColor?: string;
  iconBg?: string;
  iconBorder?: string;
}

// ─── Product mega-menu ─────────────────────────────────────────────
const productCoreLinks: NavLink[] = [
  {
    label: "How it works",
    href: "/how-it-works",
    icon: Clapperboard,
    desc: "See the AI video pipeline end-to-end",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
  },
  {
    label: "Features",
    href: "/features",
    icon: Zap,
    desc: "AI twin, scripts, captions, auto-post",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/20",
  },
  {
    label: "Live Demo",
    href: "/demo",
    icon: Play,
    desc: "Try it free — no signup",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
  },
];

const productFeatureLinks: NavLink[] = [
  { label: "AI Video Studio", href: "/features/ai-video-studio", icon: Camera },
  { label: "AI Twin & Voice", href: "/features/ai-twin-voice", icon: Mic },
  { label: "Script Engine", href: "/features/script-engine", icon: Wand2 },
  { label: "Auto-Posting", href: "/features/auto-posting", icon: Calendar },
  { label: "Analytics", href: "/features/analytics", icon: BarChart3 },
];

const productSolutionsLinks: NavLink[] = [
  { label: "For Real Estate", href: "/for/realtors", icon: Home, desc: "Listing tours, market updates" },
  { label: "For Legal", href: "/for/attorneys", icon: Scale, desc: "Know-your-rights, case results" },
  { label: "For Medical", href: "/for/doctors", icon: HeartPulse, desc: "Health tips, patient education" },
  { label: "For Financial Advisors", href: "/for/advisors", icon: TrendingUp, desc: "Market commentary, tips" },
];

// ─── Why Official AI mega-menu ─────────────────────────────────────
const whyLinks: NavLink[] = [
  {
    label: "Customer Stories",
    href: "/use-cases",
    icon: Quote,
    desc: "How professionals use Official AI",
  },
  {
    label: "Save with Official AI",
    href: "/tools/video-roi-calculator",
    icon: Calculator,
    desc: "Calculate your annual savings",
  },
  {
    label: "Popular Use Cases",
    href: "/use-cases",
    icon: Users,
    desc: "Most common workflows",
  },
];

const compareLinks: NavLink[] = [
  { label: "Official AI vs HeyGen", href: "/compare/vs-heygen", icon: GitCompareArrows },
  { label: "Official AI vs Synthesia", href: "/compare/vs-synthesia", icon: GitCompareArrows },
  { label: "Official AI vs Captions", href: "/compare/vs-captions", icon: GitCompareArrows },
  { label: "Official AI vs Descript", href: "/compare/vs-descript", icon: GitCompareArrows },
  { label: "Official AI vs Hour One", href: "/compare/vs-hourone", icon: GitCompareArrows },
  { label: "Official AI vs D-ID", href: "/compare/vs-d-id", icon: GitCompareArrows },
];

// ─── Resources mega-menu ───────────────────────────────────────────
const freeToolLinks: NavLink[] = [
  {
    label: "Speaking Time Calculator",
    href: "/tools/speaking-time-calculator",
    icon: Clock,
    desc: "Script length → exact runtime",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
  },
  {
    label: "Video ROI Calculator",
    href: "/tools/video-roi-calculator",
    icon: Calculator,
    desc: "See what AI video saves you",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
  },
  {
    label: "Hook Generator",
    href: "/tools/hook-generator",
    icon: Wand2,
    desc: "100+ proven first-line hooks",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/20",
  },
];

const learnLinks: NavLink[] = [
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Guides", href: "/learn", icon: BookOpen },
  { label: "Use Cases", href: "/use-cases", icon: Sparkles },
];

const topicLinks: NavLink[] = [
  { label: "AI Video Creation", href: "/ai-video-creation", icon: Video },
  { label: "Video Marketing", href: "/video-marketing-professionals", icon: BarChart3 },
  { label: "Social Media Video", href: "/social-media-video-strategy", icon: Share2 },
  { label: "Real Estate Video", href: "/ai-video-real-estate", icon: Home },
  { label: "Professional Services", href: "/ai-video-professional-services", icon: Briefcase },
  { label: "Content at Scale", href: "/ai-content-at-scale", icon: Layers },
];

// ─── Helpers ───────────────────────────────────────────────────────
function FeaturedItem({ link }: { link: NavLink }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
    >
      <div
        className={`w-9 h-9 rounded-lg ${link.iconBg ?? "bg-white/[0.04]"} border ${
          link.iconBorder ?? "border-white/[0.06]"
        } flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <Icon className={`w-4 h-4 ${link.iconColor ?? "text-white/70"}`} />
      </div>
      <div>
        <div className="text-p2 font-semibold text-white/80 group-hover:text-white transition-colors">
          {link.label}
        </div>
        {link.desc && (
          <div className="text-p3 text-white/70 mt-0.5 leading-snug">{link.desc}</div>
        )}
      </div>
    </Link>
  );
}

function CompactItem({ link }: { link: NavLink }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
    >
      <Icon className="w-3.5 h-3.5 text-white/70 group-hover:text-blue-400/70 transition-colors" />
      <span className="text-p2 text-white/70 group-hover:text-white/90 transition-colors">
        {link.label}
      </span>
    </Link>
  );
}

function ColumnHeader({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 mb-2">
      <h3 className="text-p3 font-medium text-white/70 uppercase tracking-wider">{children}</h3>
      {badge && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
  );
}

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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
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

  const isProductActive =
    pathname === "/how-it-works" ||
    pathname === "/features" ||
    pathname.startsWith("/features/") ||
    pathname === "/demo" ||
    pathname.startsWith("/for/");

  const isWhyActive =
    pathname === "/use-cases" ||
    pathname === "/compare" ||
    pathname.startsWith("/compare/") ||
    pathname === "/tools/video-roi-calculator";

  const isResourcesActive =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/learn" ||
    pathname.startsWith("/learn/") ||
    pathname === "/tools" ||
    pathname.startsWith("/tools/");

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#0c0f11]/90 backdrop-blur-xl shadow-lg shadow-black/20"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-violet-400 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="z-10">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* PRODUCT mega-menu */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("product")}
                className={`flex items-center gap-1 px-4 py-2 text-p2 transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "product" || isProductActive
                    ? "text-white/80"
                    : "text-white/60 hover:text-white/70"
                }`}
              >
                Product
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "product" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "product" && (
                <div className="absolute top-full left-0 mt-2 w-[820px] rounded-xl border border-white/[0.08] bg-[#0c0f11]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
                    <div className="p-4">
                      <ColumnHeader>Core Product</ColumnHeader>
                      {productCoreLinks.map((link) => (
                        <FeaturedItem key={link.href} link={link} />
                      ))}
                    </div>
                    <div className="p-4">
                      <ColumnHeader>Features</ColumnHeader>
                      <div className="space-y-0.5">
                        {productFeatureLinks.map((link) => (
                          <CompactItem key={link.label} link={link} />
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <Link
                          href="/features"
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        >
                          <span className="text-p3 text-white/70 group-hover:text-white/70 transition-colors">
                            All features
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/70 group-hover:text-white/60 transition-colors" />
                        </Link>
                      </div>
                    </div>
                    <div className="p-4">
                      <ColumnHeader>By Industry</ColumnHeader>
                      <div className="space-y-0.5">
                        {productSolutionsLinks.map((link) => (
                          <CompactItem key={link.href} link={link} />
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <Link
                          href="/use-cases"
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        >
                          <span className="text-p3 text-white/70 group-hover:text-white/70 transition-colors">
                            View all use cases
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/70 group-hover:text-white/60 transition-colors" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* WHY OFFICIAL AI mega-menu */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("why")}
                className={`flex items-center gap-1 px-4 py-2 text-p2 transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "why" || isWhyActive
                    ? "text-white/80"
                    : "text-white/60 hover:text-white/70"
                }`}
              >
                Why Official AI
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "why" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "why" && (
                <div className="absolute top-full left-0 mt-2 w-[640px] rounded-xl border border-white/[0.08] bg-[#0c0f11]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
                    <div className="p-4">
                      <ColumnHeader>Why Switch</ColumnHeader>
                      {whyLinks.map((link) => (
                        <FeaturedItem key={link.href + link.label} link={link} />
                      ))}
                    </div>
                    <div className="p-4">
                      <ColumnHeader>Compare Official AI</ColumnHeader>
                      <div className="space-y-0.5">
                        {compareLinks.map((link) => (
                          <CompactItem key={link.href} link={link} />
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <Link
                          href="/compare"
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        >
                          <span className="text-p3 text-white/70 group-hover:text-white/70 transition-colors">
                            All comparisons
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/70 group-hover:text-white/60 transition-colors" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RESOURCES mega-menu */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("resources")}
                className={`flex items-center gap-1 px-4 py-2 text-p2 transition-colors rounded-lg hover:bg-white/[0.03] ${
                  activeDropdown === "resources" || isResourcesActive
                    ? "text-white/80"
                    : "text-white/60 hover:text-white/70"
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[820px] rounded-xl border border-white/[0.08] bg-[#0c0f11]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
                  <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
                    {/* Featured: Free Tools */}
                    <div className="p-4">
                      <ColumnHeader badge="Free">Tools</ColumnHeader>
                      {freeToolLinks.map((link) => (
                        <FeaturedItem key={link.href} link={link} />
                      ))}
                      <div className="mt-1 pt-2 border-t border-white/[0.06]">
                        <Link
                          href="/tools"
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        >
                          <span className="text-p3 text-white/70 group-hover:text-white/70 transition-colors">
                            All free tools
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/70 group-hover:text-white/60 transition-colors" />
                        </Link>
                      </div>
                    </div>

                    {/* Learn */}
                    <div className="p-4">
                      <ColumnHeader>Learn</ColumnHeader>
                      <div className="space-y-0.5">
                        {learnLinks.map((link) => (
                          <CompactItem key={link.href} link={link} />
                        ))}
                      </div>
                    </div>

                    {/* Topic Libraries */}
                    <div className="p-4">
                      <ColumnHeader>Topic Libraries</ColumnHeader>
                      <div className="space-y-0.5">
                        {topicLinks.map((link) => (
                          <CompactItem key={link.href} link={link} />
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <Link
                          href="/learn"
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        >
                          <span className="text-p3 text-white/70 group-hover:text-white/70 transition-colors">
                            All guides
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/70 group-hover:text-white/60 transition-colors" />
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
              className={`px-4 py-2 text-p2 transition-colors rounded-lg hover:bg-white/[0.03] ${
                pathname === "/pricing"
                  ? "text-white/80"
                  : "text-white/60 hover:text-white/70"
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 z-10">
            <Link
              href="/auth/login"
              className="text-p2 text-white/60 hover:text-white/70 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="text-p2 px-4 py-2 rounded-lg bg-white text-[#050508] font-medium hover:bg-white/90 transition-colors"
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
            {mobileOpen ? <X className="w-5 h-5 text-white/70" /> : <Menu className="w-5 h-5 text-white/70" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-[#050508]/95 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
        <div
          className={`relative h-full overflow-y-auto pt-20 pb-8 px-6 transition-all duration-300 ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="max-w-sm mx-auto space-y-1">
            {/* PRODUCT */}
            <MobileAccordion
              name="product"
              label="Product"
              open={mobileAccordion}
              setOpen={setMobileAccordion}
            >
              <MobileSection title="Core Product" links={productCoreLinks} pathname={pathname} />
              <MobileSection title="Features" links={productFeatureLinks} pathname={pathname} />
              <MobileSection title="By Industry" links={productSolutionsLinks} pathname={pathname} />
            </MobileAccordion>

            {/* WHY OFFICIAL AI */}
            <MobileAccordion
              name="why"
              label="Why Official AI"
              open={mobileAccordion}
              setOpen={setMobileAccordion}
            >
              <MobileSection title="Why Switch" links={whyLinks} pathname={pathname} />
              <MobileSection title="Compare" links={compareLinks} pathname={pathname} />
            </MobileAccordion>

            {/* RESOURCES */}
            <MobileAccordion
              name="resources"
              label="Resources"
              open={mobileAccordion}
              setOpen={setMobileAccordion}
            >
              <MobileSection title="Free Tools" badge="FREE" links={freeToolLinks} pathname={pathname} />
              <MobileSection title="Learn" links={learnLinks} pathname={pathname} />
              <MobileSection title="Topic Libraries" links={topicLinks} pathname={pathname} />
            </MobileAccordion>

            <Link
              href="/pricing"
              className={`block text-p1 py-3 px-4 rounded-lg transition-colors ${
                pathname === "/pricing"
                  ? "text-white/90 bg-white/[0.04]"
                  : "text-white/70 active:text-white/90 active:bg-white/[0.04]"
              }`}
            >
              Pricing
            </Link>

            <Link
              href="/about"
              className={`block text-p1 py-3 px-4 rounded-lg transition-colors ${
                pathname === "/about"
                  ? "text-white/90 bg-white/[0.04]"
                  : "text-white/70 active:text-white/90 active:bg-white/[0.04]"
              }`}
            >
              About
            </Link>

            {/* Divider + dual CTA */}
            <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 text-p2 px-6 py-3.5 rounded-xl bg-white text-[#050508] font-semibold active:bg-white/80 transition-colors"
              >
                <Play className="w-4 h-4" />
                Try the demo — no signup
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center text-p2 text-white/60 active:text-white/70 transition-colors py-3 px-4 rounded-lg border border-white/[0.06]"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 text-center text-p2 text-white/60 active:text-white/90 transition-colors py-3 px-4 rounded-lg border border-white/[0.08] bg-white/[0.04]"
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

// ─── Mobile sub-components ─────────────────────────────────────────
function MobileAccordion({
  name,
  label,
  open,
  setOpen,
  children,
}: {
  name: string;
  label: string;
  open: string | null;
  setOpen: (v: string | null) => void;
  children: React.ReactNode;
}) {
  const isOpen = open === name;
  return (
    <div>
      <button
        onClick={() => setOpen(isOpen ? null : name)}
        className="w-full flex items-center justify-between text-p1 py-3 px-4 rounded-lg text-white/70 active:text-white/90 transition-colors"
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="pl-4 space-y-3 mt-1 mb-2">{children}</div>}
    </div>
  );
}

function MobileSection({
  title,
  badge,
  links,
  pathname,
}: {
  title: string;
  badge?: string;
  links: NavLink[];
  pathname: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-p3 font-medium text-white/70 uppercase tracking-wider">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`flex items-center gap-3 text-p2 py-2.5 px-4 rounded-lg transition-colors ${
                pathname === link.href
                  ? "text-white/90 bg-white/[0.04]"
                  : "text-white/60 active:text-white/70"
              }`}
            >
              <Icon className="w-4 h-4 text-white/70 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

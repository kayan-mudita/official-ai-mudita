import Link from "next/link";
import {
  ArrowRight,
  Play,
  Camera,
  Wand2,
  Mic,
  Calendar,
  BarChart3,
  Sparkles,
  Clock,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "@/components/brand/Logo";

interface FooterLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

const productLinks: FooterLink[] = [
  { label: "AI Video Studio", href: "/features", icon: Camera, iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
  { label: "AI Twin & Voice", href: "/features", icon: Mic, iconColor: "text-violet-400", iconBg: "bg-violet-500/10" },
  { label: "Auto-Posting", href: "/features", icon: Calendar, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { label: "Script Engine", href: "/features", icon: Wand2, iconColor: "text-orange-400", iconBg: "bg-orange-500/10" },
  { label: "Analytics", href: "/features", icon: BarChart3, iconColor: "text-pink-400", iconBg: "bg-pink-500/10" },
];

const whyLinks: FooterLink[] = [
  { label: "Customer Stories", href: "/use-cases" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Video ROI Calculator", href: "/tools/video-roi-calculator" },
  { label: "Pricing", href: "/pricing" },
];

const compareLinks: FooterLink[] = [
  { label: "Official AI vs HeyGen", href: "/compare/vs-heygen" },
  { label: "Official AI vs Synthesia", href: "/compare/vs-synthesia" },
  { label: "Official AI vs Captions", href: "/compare/vs-captions" },
  { label: "Official AI vs Descript", href: "/compare/vs-descript" },
  { label: "Official AI vs Hour One", href: "/compare/vs-hourone" },
  { label: "Official AI vs D-ID", href: "/compare/vs-d-id" },
  { label: "All comparisons", href: "/compare" },
];

const solutionsLinks: FooterLink[] = [
  { label: "For Real Estate", href: "/for/realtors" },
  { label: "For Legal", href: "/for/attorneys" },
  { label: "For Medical", href: "/for/doctors" },
  { label: "For Financial Advisors", href: "/for/advisors" },
  { label: "All Use Cases", href: "/use-cases" },
];

const resourceLinks: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/learn" },
  { label: "Demo", href: "/demo" },
  { label: "Free Tools", href: "/tools" },
];

const topicLinks: FooterLink[] = [
  { label: "AI Video Creation", href: "/ai-video-creation" },
  { label: "Video Marketing", href: "/video-marketing-professionals" },
  { label: "Social Media Video", href: "/social-media-video-strategy" },
  { label: "Real Estate Video", href: "/ai-video-real-estate" },
  { label: "Professional Services", href: "/ai-video-professional-services" },
  { label: "Content at Scale", href: "/ai-content-at-scale" },
];

const toolLinks: FooterLink[] = [
  { label: "Speaking Time Calculator", href: "/tools/speaking-time-calculator", icon: Clock, iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
  { label: "Video ROI Calculator", href: "/tools/video-roi-calculator", icon: Calculator, iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { label: "Hook Generator", href: "/tools/hook-generator", icon: Sparkles, iconColor: "text-violet-400", iconBg: "bg-violet-500/10" },
];

const companyLinks: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const linkColumns: { title: string; links: FooterLink[] }[] = [
  { title: "Product", links: productLinks },
  { title: "Why Official AI", links: whyLinks },
  { title: "Compare", links: compareLinks },
  { title: "Solutions", links: solutionsLinks },
  { title: "Resources", links: resourceLinks },
  { title: "Topic Libraries", links: topicLinks },
  { title: "Free Tools", links: toolLinks },
  { title: "Company", links: companyLinks },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="text-p3 font-medium text-white/30 uppercase tracking-wider mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                className="group flex items-center gap-2 text-p3 text-white/20 hover:text-white/60 transition-colors"
              >
                {Icon && (
                  <span
                    className={`w-4 h-4 rounded-md ${link.iconBg ?? "bg-white/[0.04]"} border border-white/[0.06] flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-2.5 h-2.5 ${link.iconColor ?? "text-white/40"}`} />
                  </span>
                )}
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      {/* Footer CTA banner */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="relative p-8 sm:p-10 rounded-display card-hairline overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none">
            <div className="absolute inset-0 bg-blue-500/[0.04] rounded-full blur-[80px]" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-h4 sm:text-h3 font-bold text-white mb-2">
                See your AI twin in 30 seconds
              </h3>
              <p className="text-p2 text-white/30 max-w-md">
                Upload one photo, no signup required. See what AI video looks like with your face.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-p2 font-semibold hover:bg-white/90 transition-all"
              >
                <Play className="w-4 h-4" />
                Try the demo
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] text-white/50 text-p2 font-medium hover:text-white/70 hover:border-white/[0.15] transition-all"
              >
                Sign up
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer columns */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-5 xl:col-span-1">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <p className="text-p3 text-white/20 mt-3 leading-relaxed max-w-[220px]">
              Your AI twin, posting for you. Studio-quality video without filming.
            </p>

            {/* Account actions */}
            <div className="mt-5 space-y-1.5">
              <Link
                href="/auth/signup"
                className="block text-p3 text-white/40 hover:text-white/80 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/demo"
                className="block text-p3 text-white/40 hover:text-white/80 transition-colors"
              >
                Request a Demo
              </Link>
              <Link
                href="/auth/login"
                className="block text-p3 text-white/40 hover:text-white/80 transition-colors"
              >
                Sign In
              </Link>
            </div>

            <a
              href="mailto:hello@theofficial.ai"
              className="block text-p3 text-white/25 hover:text-white/50 transition-colors mt-5"
            >
              hello@theofficial.ai
            </a>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <a
                href="https://twitter.com/theofficialai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.1] transition-all"
                aria-label="Follow us on X (Twitter)"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/officialai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.1] transition-all"
                aria-label="Follow us on LinkedIn"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@officialai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.1] transition-all"
                aria-label="Subscribe on YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/officialai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.1] transition-all"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@officialai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.1] transition-all"
                aria-label="Follow us on TikTok"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1.84-.39z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-p3 text-white/15">
            &copy; {new Date().getFullYear()} Official AI. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-p3 text-white/15 hover:text-white/40 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-p3 text-white/15 hover:text-white/40 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

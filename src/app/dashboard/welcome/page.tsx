"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  Briefcase,
  Building2,
  Globe,
  Search,
  TrendingUp,
  Users,
  CalendarDays,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import SessionProvider from "@/components/SessionProvider";
import SocialConnect from "@/components/onboarding/SocialConnect";
import TemplateSelector from "@/components/TemplateSelector";

// ─── Types ────────────────────────────────────────────────────────

interface BusinessResult {
  companyName: string;
  industry: string;
  services: string[];
  targetAudience: string;
  geography: string;
  toneOfVoice: string;
  differentiators: string[];
  summary: string;
}

interface TrendsResult {
  trending: { topic: string; whyNow: string }[];
  evergreen: { topic: string; angle: string }[];
  seasonal: { topic: string; timing: string }[];
  platformAngles: { platform: string; format: string; tip: string }[];
}

interface CompetitorResult {
  competitors: { name: string; platforms: string[]; frequency: string; topTopics: string[] }[];
  gaps: string[];
  opportunities: string[];
}

interface CalendarDay {
  day: number;
  date: string;
  topic: string;
  hook: string;
  script?: string;
  scriptOutline?: string;
  caption?: string;
  hashtags?: string[];
  platform: string;
  contentType: string;
  category: string;
  whyThisWorks: string;
  bestPostingTime?: string;
  /** Video format recipe (default: talking_head_15) */
  format?: string;
  /** Video model (default: kling_2.6) */
  model?: string;
  /** Reference template ID */
  templateId?: string;
  /** Post-processing options */
  postProcess?: { upscale: boolean; captions: boolean; speedCorrect: boolean };
}

interface AgentStatus<T> {
  status: "queued" | "processing" | "complete" | "failed";
  result: T | null;
}

interface ResearchStatus {
  id: string;
  status: string;
  business: AgentStatus<BusinessResult>;
  trends: AgentStatus<TrendsResult>;
  competitors: AgentStatus<CompetitorResult>;
  calendar: AgentStatus<CalendarDay[]>;
}

type Phase = "input" | "researching" | "calendar" | "social_connect";

interface IntakeFormData {
  industry: string;
  companyName: string;
  websiteUrl: string;
  geography: string;
  idealClient: string;
  keyServices: string[];
  differentiator: string;
  postingFrequency: string;
  platforms: string[];
  tone: string;
  socialHandles: { platform: string; handle: string }[];
}

// ─── Constants ────────────────────────────────────────────────────

const INDUSTRIES = [
  { value: "real_estate", label: "Real Estate", emoji: "🏠" },
  { value: "legal", label: "Legal", emoji: "⚖️" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "medical", label: "Healthcare", emoji: "🏥" },
  { value: "creator", label: "Creator", emoji: "🎬" },
  { value: "saas", label: "SaaS / Tech", emoji: "💻" },
  { value: "consulting", label: "Consulting", emoji: "📊" },
  { value: "ecommerce", label: "E-Commerce", emoji: "🛒" },
  { value: "other", label: "Other", emoji: "✨" },
];

const platformColors: Record<string, { bg: string; text: string; label: string }> = {
  instagram: { bg: "bg-pink-500/15", text: "text-pink-400", label: "Instagram" },
  linkedin: { bg: "bg-blue-500/15", text: "text-blue-400", label: "LinkedIn" },
  tiktok: { bg: "bg-white/10", text: "text-white/70", label: "TikTok" },
  youtube: { bg: "bg-red-500/15", text: "text-red-400", label: "YouTube" },
};

const categoryColors: Record<string, string> = {
  Education: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Tips: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Personal Brand": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Social Proof": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Trending: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const contentTypeLabels: Record<string, string> = {
  quick_tip_8: "Quick Tip (8s)",
  talking_head_15: "Talking Head (15s)",
  educational_30: "Explainer (30s)",
  testimonial_15: "Story (15s)",
};

function trackEvent(event: string, metadata?: Record<string, unknown>) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, metadata }),
  }).catch(() => {});
}

// ─── Shared input styling ─────────────────────────────────────────

const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-white/70 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all";

const PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", emoji: "\uD83D\uDCF7" },
  { id: "tiktok", label: "TikTok", emoji: "\uD83C\uDFB5" },
  { id: "linkedin", label: "LinkedIn", emoji: "\uD83D\uDCBC" },
  { id: "youtube", label: "YouTube", emoji: "\u25B6\uFE0F" },
  { id: "facebook", label: "Facebook", emoji: "\uD83D\uDC4D" },
];

const FREQUENCY_OPTIONS = [
  { value: "3x_week", label: "3x / week" },
  { value: "5x_week", label: "5x / week" },
  { value: "daily", label: "Daily" },
];

// ─── Phase 1: Multi-Screen Intake ─────────────────────────────────

function InputPhase({
  onLaunch,
}: {
  onLaunch: (data: IntakeFormData) => void;
}) {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [launching, setLaunching] = useState(false);

  // Screen A: Business
  const [industry, setIndustry] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [geography, setGeography] = useState("");

  // Screen B: Audience
  const [idealClient, setIdealClient] = useState("");
  const [keyServices, setKeyServices] = useState("");
  const [differentiator, setDifferentiator] = useState("");

  // Screen C: Goals
  const [postingFrequency, setPostingFrequency] = useState("daily");
  const [platforms, setPlatforms] = useState<string[]>(["instagram", "linkedin"]);
  const [tone, setTone] = useState(50); // 0=formal, 100=casual
  const [igHandle, setIgHandle] = useState("");
  const [liHandle, setLiHandle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const canNextA = industry && companyName.trim().length > 0;
  const canLaunch = canNextA;

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLaunch = async () => {
    if (!canLaunch || launching) return;
    setLaunching(true);

    // Save user's name to profile
    if (fullName.trim()) {
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      }).catch(() => {});
    }

    const socialHandles: { platform: string; handle: string }[] = [];
    if (igHandle.trim()) socialHandles.push({ platform: "instagram", handle: igHandle.trim() });
    if (liHandle.trim()) socialHandles.push({ platform: "linkedin", handle: liHandle.trim() });

    onLaunch({
      industry: industry!,
      companyName: companyName.trim(),
      websiteUrl: websiteUrl.trim(),
      geography: geography.trim(),
      idealClient: idealClient.trim(),
      keyServices: keyServices.trim() ? keyServices.split(",").map((s) => s.trim()).filter(Boolean) : [],
      differentiator: differentiator.trim(),
      postingFrequency,
      platforms,
      tone: tone < 33 ? "formal" : tone < 66 ? "professional" : "casual",
      socialHandles,
    });
  };

  const screenTitles = {
    1: { emoji: "\uD83C\uDFE2", title: "Your Business", sub: "Tell us who you are so our AI can research you." },
    2: { emoji: "\uD83C\uDFAF", title: "Your Audience", sub: "Help us understand who you serve." },
    3: { emoji: "\uD83D\uDE80", title: "Your Content Goals", sub: "How do you want to show up on social?" },
  };

  const { emoji, title, sub } = screenTitles[screen];

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center px-4">
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg space-y-7"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === screen ? "w-8 bg-indigo-500" : s < screen ? "w-4 bg-indigo-500/40" : "w-4 bg-white/[0.08]"
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-3xl">{emoji}</span>
          <h1 className="text-[24px] font-extrabold text-white tracking-tight">{title}</h1>
          <p className="text-[14px] text-white/70 font-medium">{sub}</p>
        </div>

        {/* ── Screen A: Business ── */}
        {screen === 1 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
                <Briefcase className="w-3.5 h-3.5" /> Industry
              </label>
              <div className="grid grid-cols-3 gap-2">
                {INDUSTRIES.map((ind) => (
                  <motion.button key={ind.value} onClick={() => setIndustry(ind.value)} whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-center transition-all ${
                      industry === ind.value
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]"
                    }`}>
                    <span className="text-[16px]">{ind.emoji}</span>
                    <span className={`text-[10px] font-semibold ${industry === ind.value ? "text-indigo-300" : "text-white/70"}`}>{ind.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white/70">Your name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Sarah Chen" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-white/70"><Building2 className="w-3.5 h-3.5" /> Business name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Smith & Associates" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-white/70"><Globe className="w-3.5 h-3.5" /> Website <span className="text-white/70 font-normal">(helps AI research you)</span></label>
              <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white/70">Geographic market</label>
              <input type="text" value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="e.g. Beverly Hills, CA" className={inputClass} />
            </div>

            <motion.button onClick={() => setScreen(2)} disabled={!canNextA} whileHover={canNextA ? { scale: 1.02 } : {}} whileTap={canNextA ? { scale: 0.97 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white disabled:opacity-30 transition-all"
              style={canNextA ? { background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" } : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Next <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {/* ── Screen B: Audience ── */}
        {screen === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white/70">Who is your ideal client?</label>
              <input type="text" value={idealClient} onChange={(e) => setIdealClient(e.target.value)} placeholder="e.g. First-time homebuyers in their 30s" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white/70">Key services <span className="text-white/70 font-normal">(comma-separated)</span></label>
              <input type="text" value={keyServices} onChange={(e) => setKeyServices(e.target.value)} placeholder="e.g. Luxury residential, investment properties, relocation" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white/70">What makes you different?</label>
              <textarea value={differentiator} onChange={(e) => setDifferentiator(e.target.value)} placeholder="e.g. 15 years in Beverly Hills, known for off-market deals and white-glove service" rows={3}
                className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setScreen(1)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] text-white/70 hover:text-white/60 border border-white/[0.06] transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <motion.button onClick={() => setScreen(3)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
                Next <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Screen C: Goals ── */}
        {screen === 3 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-white/70">Posting frequency</label>
              <div className="flex gap-2">
                {FREQUENCY_OPTIONS.map((f) => (
                  <button key={f.value} onClick={() => setPostingFrequency(f.value)}
                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border transition-all ${
                      postingFrequency === f.value ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" : "border-white/[0.06] text-white/70 hover:border-white/[0.12]"
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-white/70">Platforms to post on</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((p) => (
                  <button key={p.id} onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                      platforms.includes(p.id) ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" : "border-white/[0.06] text-white/70 hover:border-white/[0.12]"
                    }`}>
                    <span>{p.emoji}</span> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white/70">Tone</label>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/60">Formal</span>
                <input type="range" min={0} max={100} value={tone} onChange={(e) => setTone(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-white/[0.08] accent-indigo-500" />
                <span className="text-[11px] text-white/60">Casual</span>
              </div>
            </div>

            <div className="space-y-2">
              {/* Reference video template */}
              <TemplateSelector
                onSelect={(id) => setSelectedTemplateId(id)}
                selectedId={selectedTemplateId}
                compact
              />

              <label className="text-[13px] font-semibold text-white/70">Social handles <span className="text-white/70 font-normal">(optional — helps analyze your existing content)</span></label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={igHandle} onChange={(e) => setIgHandle(e.target.value)} placeholder="@instagram" className={inputClass} />
                <input type="text" value={liHandle} onChange={(e) => setLiHandle(e.target.value)} placeholder="linkedin.com/in/..." className={inputClass} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setScreen(2)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] text-white/70 hover:text-white/60 border border-white/[0.06] transition-all">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <motion.button onClick={handleLaunch} disabled={launching} whileHover={!launching ? { scale: 1.02 } : {}} whileTap={!launching ? { scale: 0.97 } : {}}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)", boxShadow: "0 0 25px rgba(99,102,241,0.35)" }}>
                {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Build my content strategy</>}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Phase 2: Research Loading ────────────────────────────────────

function ResearchPhase({
  research,
  onComplete,
  onBack,
}: {
  research: ResearchStatus;
  onComplete: () => void;
  onBack: () => void;
}) {
  const agents = [
    {
      key: "business",
      icon: Search,
      label: "Researching your business",
      doneLabel: "Business profile built",
      status: research.business.status,
      result: research.business.result,
    },
    {
      key: "trends",
      icon: TrendingUp,
      label: "Analyzing industry trends",
      doneLabel: "Trends loaded",
      status: research.trends.status,
      result: research.trends.result,
    },
    {
      key: "competitors",
      icon: Users,
      label: "Scanning competitor content",
      doneLabel: "Competitor gaps identified",
      status: research.competitors.status,
      result: research.competitors.result,
    },
    {
      key: "calendar",
      icon: CalendarDays,
      label: "Building your 30-day calendar",
      doneLabel: "Content calendar ready",
      status: research.calendar.status,
      result: research.calendar.result,
    },
  ];

  const allDone = research.status === "complete";
  const hasFailed = research.status === "failed";

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-8"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to edit
        </button>

        <div className="text-center space-y-3">
          <h1 className="text-[24px] font-extrabold text-white tracking-tight">
            {hasFailed ? "Something went wrong" : "Building your content strategy..."}
          </h1>
          <p className="text-[14px] text-white/70">
            {hasFailed
              ? "One of our research agents hit an issue. You can try again."
              : "Our AI agents are researching your market and building your plan."}
          </p>
        </div>

        <div className="space-y-4">
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            const isActive = agent.status === "processing";
            const isDone = agent.status === "complete";
            const isQueued = agent.status === "queued";

            return (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  isDone
                    ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                    : isActive
                    ? "border-indigo-500/30 bg-indigo-500/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isDone ? "bg-emerald-500/15" : isActive ? "bg-indigo-500/15" : "bg-white/[0.05]"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-white/70" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-semibold ${
                    isDone ? "text-emerald-300" : isActive ? "text-white" : "text-white/70"
                  }`}>
                    {isDone ? agent.doneLabel : agent.label}
                  </p>

                  {/* Show summary when done */}
                  <AnimatePresence>
                    {isDone && agent.key === "business" && research.business.result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 space-y-1"
                      >
                        <p className="text-[12px] text-white/70">{research.business.result.summary}</p>
                        <p className="text-[11px] text-white/60">
                          {research.business.result.services.slice(0, 3).join(" · ")} · {research.business.result.geography}
                        </p>
                      </motion.div>
                    )}
                    {isDone && agent.key === "trends" && research.trends.result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2"
                      >
                        <p className="text-[12px] text-white/70">
                          {research.trends.result.trending.length} trending · {research.trends.result.evergreen.length} evergreen · {research.trends.result.seasonal.length} seasonal
                        </p>
                      </motion.div>
                    )}
                    {isDone && agent.key === "competitors" && research.competitors.result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2"
                      >
                        <p className="text-[12px] text-white/70">
                          {research.competitors.result.gaps.length} gaps found · {research.competitors.result.opportunities.length} opportunities
                        </p>
                      </motion.div>
                    )}
                    {isDone && agent.key === "calendar" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2"
                      >
                        <p className="text-[12px] text-white/70">30 videos planned · Week 1 scripted</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Error state */}
        <AnimatePresence>
          {hasFailed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
                <AlertCircle className="w-4 h-4" />
                Research failed — some agents could not complete
              </div>
              <div>
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.08] text-white text-[14px] font-medium hover:bg-white/[0.12] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transition to calendar */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <motion.button
                onClick={onComplete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[15px] font-bold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)",
                  boxShadow: "0 0 25px rgba(99,102,241,0.35)",
                }}
              >
                <CalendarDays className="w-4 h-4" />
                Review your content calendar
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Phase 3: Calendar Reveal ─────────────────────────────────────

function CalendarPhase({
  calendar: initialCalendar,
  business,
  sessionId,
  onLaunch,
}: {
  calendar: CalendarDay[];
  business: BusinessResult | null;
  sessionId: string | null;
  onLaunch: () => void;
}) {
  const router = useRouter();
  const [calendar, setCalendar] = useState<CalendarDay[]>(initialCalendar);
  const [approvedDays, setApprovedDays] = useState<Set<number>>(() => new Set(calendar.map((_, i) => i)));
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ hook: string; script: string }>({ hook: "", script: "" });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced save of approved days to API (saves 1s after last toggle)
  const saveApprovals = useCallback((days: Set<number>) => {
    if (!sessionId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/research/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, approvedDays: Array.from(days) }),
      }).catch(() => {});
    }, 1000);
  }, [sessionId]);

  const toggleApprove = (index: number) => {
    setApprovedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      saveApprovals(next);
      return next;
    });
  };

  const approveAll = () => {
    const all = new Set(calendar.map((_, i) => i));
    setApprovedDays(all);
    saveApprovals(all);
  };

  const rejectAll = () => {
    const none = new Set<number>();
    setApprovedDays(none);
    saveApprovals(none);
  };

  const handleRegenerate = async (dayIndex: number) => {
    if (!sessionId || regeneratingDay !== null) return;
    setRegeneratingDay(dayIndex);
    try {
      const res = await fetch("/api/research/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, dayIndex }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const { day } = await res.json();
      setCalendar((prev) => {
        const next = [...prev];
        next[dayIndex] = day;
        return next;
      });
    } catch (e) {
      console.error("Failed to regenerate day:", e);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const startEdit = (dayIndex: number) => {
    const day = calendar[dayIndex];
    setEditDraft({ hook: day.hook, script: day.script || day.scriptOutline || "" });
    setEditingDay(dayIndex);
  };

  const saveEdit = () => {
    if (editingDay === null) return;
    setCalendar((prev) => {
      const next = [...prev];
      next[editingDay] = { ...next[editingDay], hook: editDraft.hook, script: editDraft.script, scriptOutline: editDraft.script };
      return next;
    });
    // Persist to DB if session exists
    if (sessionId) {
      const updated = [...calendar];
      updated[editingDay] = { ...updated[editingDay], hook: editDraft.hook, script: editDraft.script, scriptOutline: editDraft.script };
      fetch("/api/research/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, approvedDays: Array.from(approvedDays), calendarUpdate: updated }),
      }).catch(() => {});
    }
    setEditingDay(null);
  };

  const cancelEdit = () => {
    setEditingDay(null);
  };

  const updateDaySetting = (dayIndex: number, field: string, value: unknown) => {
    setCalendar((prev) => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], [field]: value };
      return next;
    });
  };

  // Format and model options for selectors
  const FORMAT_OPTIONS = [
    { id: "hook_only_15", label: "Hook Only (15s)", cuts: 1, cost: 3 },
    { id: "discovery_hook", label: "Discovery Hook (15s)", cuts: 1, cost: 3 },
    { id: "censored_hook", label: "Censored Hook (15s)", cuts: 1, cost: 3 },
    { id: "quick_tip_8", label: "Quick Tip (8s)", cuts: 3, cost: 6 },
    { id: "talking_head_15", label: "Talking Head (15s)", cuts: 4, cost: 8 },
    { id: "testimonial_15", label: "Testimonial (15s)", cuts: 5, cost: 10 },
    { id: "podcast_clip", label: "Podcast (15s)", cuts: 2, cost: 6 },
    { id: "testimonial_20", label: "Testimonial Long (20s)", cuts: 4, cost: 10 },
    { id: "behind_scenes_20", label: "Behind Scenes (20s)", cuts: 5, cost: 12 },
    { id: "founders_method", label: "Founders (30s)", cuts: 4, cost: 12 },
    { id: "educational_30", label: "Educational (30s)", cuts: 8, cost: 16 },
    { id: "property_tour_30", label: "Property Tour (30s)", cuts: 4, cost: 10 },
  ];

  const MODEL_OPTIONS = [
    { id: "kling_2.6", label: "Kling 2.6", audio: false },
    { id: "kling_v3", label: "Kling 3.0", audio: false },
    { id: "kling_v3_audio", label: "Kling 3.0 + Audio", audio: true },
    { id: "veo_3", label: "Veo 3 + Audio", audio: true },
    { id: "seedance_2.0", label: "Seedance 2.0 + Audio", audio: true },
    { id: "heygen_avatar_v", label: "HeyGen Avatar V", audio: true },
  ];

  const handleLaunch = async () => {
    setLaunching(true);
    trackEvent("onboarding_strategy_approved", {
      totalDays: calendar.length,
      approvedDays: approvedDays.size,
    });

    // Save final approval state
    if (sessionId) {
      await fetch("/api/research/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, approvedDays: Array.from(approvedDays) }),
      }).catch(() => {});
    }

    // Fire batch video generation in background
    if (sessionId) {
      fetch("/api/generate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, approvedDays: Array.from(approvedDays) }),
      }).catch(() => {}); // Non-blocking — videos generate while user connects socials
    }

    // Go to social connect phase
    onLaunch();
  };

  // Group by week
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }
  const currentWeek = weeks[weekOffset] || [];
  const weekLabel = `Week ${weekOffset + 1}`;

  const approvedCount = approvedDays.size;
  const totalCount = calendar.length;

  // Stats
  const platformCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  calendar.forEach((d) => {
    platformCounts[d.platform] = (platformCounts[d.platform] || 0) + 1;
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#060610]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[24px] font-extrabold text-white"
            >
              Your 30-Day Content Calendar
            </motion.h1>
            <p className="text-[14px] text-white/70 mt-1">
              {business ? `Built for ${business.companyName}` : "Personalized for your business"} · Review, edit, and approve your strategy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-white/70">
              {approvedCount}/{totalCount} approved
            </span>
            <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(approvedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strategy summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(platformCounts).map(([platform, count]) => {
            const p = platformColors[platform] || { bg: "bg-white/[0.06]", text: "text-white/70", label: platform };
            return (
              <div key={platform} className={`px-4 py-3 rounded-xl border border-white/[0.06] ${p.bg}`}>
                <p className={`text-[20px] font-bold ${p.text}`}>{count}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{p.label} posts</p>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                viewMode === "list" ? "bg-white/[0.08] text-white" : "text-white/70 hover:text-white/70"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                viewMode === "calendar" ? "bg-white/[0.08] text-white" : "text-white/70 hover:text-white/70"
              }`}
            >
              Calendar View
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={approveAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all">
              <Check className="w-3 h-3" /> Approve All
            </button>
            <button onClick={rejectAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white/70 hover:text-white/70 hover:bg-white/[0.04] transition-all">
              <X className="w-3 h-3" /> Clear All
            </button>
          </div>
        </div>

        {/* Week navigation (for list view) */}
        {viewMode === "list" && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
              disabled={weekOffset === 0}
              className="p-2 rounded-lg border border-white/[0.06] text-white/70 hover:text-white/60 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[15px] font-medium text-white/80">{weekLabel}</span>
            <button
              onClick={() => setWeekOffset(Math.min(weeks.length - 1, weekOffset + 1))}
              disabled={weekOffset >= weeks.length - 1}
              className="p-2 rounded-lg border border-white/[0.06] text-white/70 hover:text-white/60 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {currentWeek.map((day, localIdx) => {
                const globalIndex = weekOffset * 7 + localIdx;
                const isApproved = approvedDays.has(globalIndex);
                const isExpanded = expandedDay === globalIndex;
                const plat = platformColors[day.platform] || { bg: "bg-white/[0.06]", text: "text-white/70", label: day.platform };
                const catColor = categoryColors[day.category] || "bg-white/[0.06] text-white/70 border-white/[0.08]";
                const dateObj = new Date(day.date + "T12:00:00");
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                return (
                  <motion.div
                    key={day.date}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border transition-all ${
                      isApproved
                        ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                        : "border-white/[0.06] bg-white/[0.015]"
                    }`}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                      onClick={() => setExpandedDay(isExpanded ? null : globalIndex)}
                    >
                      {/* Date */}
                      <div className="w-14 flex-shrink-0 text-center">
                        <div className="text-[11px] text-white/60 uppercase">{dayName}</div>
                        <div className="text-[15px] font-bold text-white/70">{dateLabel}</div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-10 bg-white/[0.06]" />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-white truncate">{day.topic}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${catColor}`}>
                            {day.category}
                          </span>
                        </div>
                        <p className="text-[12px] text-white/70 mt-0.5 truncate">{day.hook}</p>
                      </div>

                      {/* Platform + Type */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${plat.bg} ${plat.text}`}>
                          {plat.label}
                        </span>
                        <span className="text-[10px] text-white/70">
                          {contentTypeLabels[day.contentType] || day.contentType}
                        </span>
                      </div>

                      {/* Approve toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleApprove(globalIndex); }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/[0.04] text-white/70 hover:text-white/70"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-white/[0.04]">
                            {editingDay === globalIndex ? (
                              <>
                                {/* Editable Hook */}
                                <div>
                                  <div className="text-[11px] text-white/60 uppercase tracking-wider mb-1.5">Opening Hook</div>
                                  <input
                                    type="text"
                                    value={editDraft.hook}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, hook: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-indigo-500/[0.08] border border-indigo-500/20 text-[14px] text-indigo-300 font-medium focus:outline-none focus:border-indigo-500/40 transition-all"
                                  />
                                </div>

                                {/* Editable Script */}
                                <div>
                                  <div className="text-[11px] text-white/60 uppercase tracking-wider mb-1.5">Script Outline</div>
                                  <textarea
                                    value={editDraft.script}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, script: e.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white/60 leading-relaxed resize-none focus:outline-none focus:border-indigo-500/30 transition-all"
                                  />
                                </div>

                                {/* Save / Cancel */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={saveEdit}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-all"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-white/[0.04] text-white/70 hover:bg-white/[0.06] transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Hook (read-only) */}
                                <div>
                                  <div className="text-[11px] text-white/60 uppercase tracking-wider mb-1.5">Opening Hook</div>
                                  <p className="text-[14px] text-indigo-300 font-medium leading-relaxed">
                                    &ldquo;{day.hook}&rdquo;
                                  </p>
                                </div>

                                {/* Script outline (read-only) */}
                                <div>
                                  <div className="text-[11px] text-white/60 uppercase tracking-wider mb-1.5">Script</div>
                                  <p className="text-[13px] text-white/60 leading-relaxed">{day.script || day.scriptOutline}</p>
                                </div>

                                {/* Why this works */}
                                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/10">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-[12px] text-purple-300/80">{day.whyThisWorks}</p>
                                </div>

                                {/* Format + Model + Post-Process selectors */}
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Format selector */}
                                  <div>
                                    <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Format</div>
                                    <select
                                      value={day.format || "talking_head_15"}
                                      onChange={(e) => updateDaySetting(globalIndex, "format", e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/60 focus:outline-none focus:border-indigo-500/30 appearance-none cursor-pointer"
                                    >
                                      {FORMAT_OPTIONS.map((f) => (
                                        <option key={f.id} value={f.id}>
                                          {f.label} ({f.cuts} cuts, ~${f.cost})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Model selector */}
                                  <div>
                                    <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Model</div>
                                    <select
                                      value={day.model || "kling_2.6"}
                                      onChange={(e) => updateDaySetting(globalIndex, "model", e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/60 focus:outline-none focus:border-indigo-500/30 appearance-none cursor-pointer"
                                    >
                                      {MODEL_OPTIONS.map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.label}{m.audio ? " *" : ""}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Format preview — visual cut timeline */}
                                {(() => {
                                  const fmt = FORMAT_OPTIONS.find((f) => f.id === (day.format || "talking_head_15"));
                                  if (!fmt) return null;
                                  return (
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: fmt.cuts }).map((_, i) => (
                                        <div
                                          key={i}
                                          className="h-1.5 rounded-full bg-indigo-500/30"
                                          style={{ flex: 1 }}
                                        />
                                      ))}
                                      <span className="text-[9px] text-white/70 ml-2">
                                        {fmt.cuts} cut{fmt.cuts > 1 ? "s" : ""} ~${fmt.cost}
                                      </span>
                                    </div>
                                  );
                                })()}

                                {/* Post-processing toggles */}
                                <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-1.5 text-[10px] text-white/70 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={day.postProcess?.upscale ?? false}
                                      onChange={(e) => updateDaySetting(globalIndex, "postProcess", {
                                        ...day.postProcess,
                                        upscale: e.target.checked,
                                        captions: day.postProcess?.captions ?? false,
                                        speedCorrect: day.postProcess?.speedCorrect ?? false,
                                      })}
                                      className="rounded border-white/[0.15] bg-white/[0.04] text-indigo-500 focus:ring-0 w-3 h-3"
                                    />
                                    Upscale 2x
                                  </label>
                                  <label className="flex items-center gap-1.5 text-[10px] text-white/70 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={day.postProcess?.captions ?? false}
                                      onChange={(e) => updateDaySetting(globalIndex, "postProcess", {
                                        ...day.postProcess,
                                        upscale: day.postProcess?.upscale ?? false,
                                        captions: e.target.checked,
                                        speedCorrect: day.postProcess?.speedCorrect ?? false,
                                      })}
                                      className="rounded border-white/[0.15] bg-white/[0.04] text-indigo-500 focus:ring-0 w-3 h-3"
                                    />
                                    Auto captions
                                  </label>
                                  <label className="flex items-center gap-1.5 text-[10px] text-white/70 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={day.postProcess?.speedCorrect ?? false}
                                      onChange={(e) => updateDaySetting(globalIndex, "postProcess", {
                                        ...day.postProcess,
                                        upscale: day.postProcess?.upscale ?? false,
                                        captions: day.postProcess?.captions ?? false,
                                        speedCorrect: e.target.checked,
                                      })}
                                      className="rounded border-white/[0.15] bg-white/[0.04] text-indigo-500 focus:ring-0 w-3 h-3"
                                    />
                                    Speed correct
                                  </label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleApprove(globalIndex)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                                      isApproved
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-white/[0.04] text-white/70 hover:bg-white/[0.06]"
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    {isApproved ? "Approved" : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => startEdit(globalIndex)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-white/[0.04] text-white/70 hover:bg-white/[0.06] transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleRegenerate(globalIndex)}
                                    disabled={regeneratingDay !== null}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-white/[0.04] text-white/70 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
                                  >
                                    {regeneratingDay === globalIndex ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="w-3.5 h-3.5" />
                                    )}
                                    {regeneratingDay === globalIndex ? "Regenerating..." : "Regenerate"}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Calendar Grid View */}
        {viewMode === "calendar" && (
          <CalendarGrid calendar={calendar} approvedDays={approvedDays} toggleApprove={toggleApprove} expandedDay={expandedDay} setExpandedDay={setExpandedDay} />
        )}

        {/* Category breakdown */}
        <div className="px-5 py-4 rounded-xl border border-white/[0.04] bg-white/[0.015]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[13px] font-medium text-white/60">Content Mix</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <span key={cat} className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium ${categoryColors[cat] || "bg-white/[0.04] text-white/70 border-white/[0.06]"}`}>
                {cat}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Launch CTA */}
        <div className="sticky bottom-0 pt-4 pb-8 bg-gradient-to-t from-[#060610] via-[#060610] to-transparent">
          <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.06] bg-[#0a0a1a]/90 backdrop-blur-xl">
            <div>
              <p className="text-[15px] font-semibold text-white">
                {approvedCount} of {totalCount} posts approved
              </p>
              <p className="text-[12px] text-white/70 mt-0.5">
                You can always edit your calendar later from the dashboard.
              </p>
            </div>
            <motion.button
              onClick={handleLaunch}
              disabled={launching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-[14px] font-bold text-white disabled:opacity-50 transition-all flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)",
                boxShadow: "0 0 25px rgba(99,102,241,0.35)",
              }}
            >
              {launching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Launch my content team
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Grid Sub-Component ──────────────────────────────────

function CalendarGrid({
  calendar,
  approvedDays,
  toggleApprove,
  expandedDay,
  setExpandedDay,
}: {
  calendar: CalendarDay[];
  approvedDays: Set<number>;
  toggleApprove: (i: number) => void;
  expandedDay: number | null;
  setExpandedDay: (i: number | null) => void;
}) {
  // Build a proper month grid from the calendar dates
  const firstDate = new Date(calendar[0].date + "T12:00:00");
  const startDow = firstDate.getDay();

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Map dates to calendar items for quick lookup
  const dateMap = new Map<string, { item: CalendarDay; index: number }>();
  calendar.forEach((item, i) => dateMap.set(item.date, { item, index: i }));

  // Build grid cells
  const totalCells = startDow + calendar.length;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-white/[0.04]">
        {DAYS.map((d) => (
          <div key={d} className="px-2 py-2.5 text-[11px] text-white/60 uppercase tracking-wider text-center">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {/* Empty leading cells */}
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`e-${i}`} className="min-h-[100px] border-b border-r border-white/[0.02] bg-white/[0.005]" />
        ))}

        {calendar.map((day, i) => {
          const isApproved = approvedDays.has(i);
          const dateObj = new Date(day.date + "T12:00:00");
          const dayNum = dateObj.getDate();
          const plat = platformColors[day.platform] || { bg: "bg-white/[0.06]", text: "text-white/70", label: day.platform };
          const catColor = categoryColors[day.category] || "bg-white/[0.06] text-white/70 border-white/[0.06]";

          return (
            <div
              key={day.date}
              onClick={() => setExpandedDay(expandedDay === i ? null : i)}
              className={`min-h-[100px] border-b border-r border-white/[0.02] p-2 cursor-pointer transition-all hover:bg-white/[0.02] ${
                isApproved ? "bg-emerald-500/[0.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-white/70">{dayNum}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleApprove(i); }}
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    isApproved ? "bg-emerald-500/30 text-emerald-400" : "bg-white/[0.04] text-transparent hover:text-white/70"
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className={`px-1.5 py-1 rounded text-[9px] truncate border ${catColor}`}>
                {day.topic}
              </div>
              <div className={`mt-1 px-1.5 py-0.5 rounded text-[8px] inline-block ${plat.bg} ${plat.text}`}>
                {plat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Orchestrator ────────────────────────────────────────────

function WelcomeFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Cleanup polling on unmount or phase change
  useEffect(() => {
    return () => stopPolling();
  }, [phase, stopPolling]);

  // Recover session from localStorage on mount (survives page refresh)
  useEffect(() => {
    const savedId = typeof window !== "undefined"
      ? localStorage.getItem("oai_research_session")
      : null;
    if (savedId && phase === "input") {
      setSessionId(savedId);
      setPhase("researching");
      pollStatus(savedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollStatus = useCallback((id: string) => {
    stopPolling();

    const poll = async () => {
      try {
        const res = await fetch(`/api/research/status?id=${id}`);
        if (res.ok) {
          const data: ResearchStatus = await res.json();
          setResearch(data);
          if (data.status === "complete" || data.status === "failed") {
            stopPolling();
            // Clear localStorage when done
            localStorage.removeItem("oai_research_session");
          }
        }
      } catch {
        // Network hiccup, keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);
  }, [stopPolling]);

  const handleLaunch = async (data: IntakeFormData) => {
    trackEvent("onboarding_research_launched", { industry: data.industry });
    setPhase("researching");

    try {
      const res = await fetch("/api/research/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Launch failed: ${res.status}`);
      const { sessionId: sid } = await res.json();
      setSessionId(sid);
      localStorage.setItem("oai_research_session", sid);
      pollStatus(sid);
    } catch (e) {
      console.error("Failed to launch research:", e);
      setPhase("input");
    }
  };

  const handleResearchComplete = () => {
    trackEvent("onboarding_strategy_reviewed");
    setPhase("calendar");
  };

  const handleCalendarLaunch = () => {
    setPhase("social_connect");
  };

  const handleSocialComplete = async () => {
    await fetch("/api/onboarding/complete", { method: "POST" }).catch(() => {});
    router.push("/dashboard");
  };

  const handleBack = () => {
    stopPolling();
    localStorage.removeItem("oai_research_session");
    setResearch(null);
    setSessionId(null);
    setPhase("input");
  };

  if (phase === "input") {
    return <InputPhase onLaunch={handleLaunch} />;
  }

  if (phase === "researching" && research) {
    return <ResearchPhase research={research} onComplete={handleResearchComplete} onBack={handleBack} />;
  }

  if (phase === "researching" && !research) {
    return (
      <div className="min-h-screen bg-[#060610] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/70 animate-spin" />
      </div>
    );
  }

  if (phase === "calendar" && research?.calendar.result && research.calendar.result.length > 0) {
    return (
      <CalendarPhase
        calendar={research.calendar.result}
        business={research.business.result}
        sessionId={sessionId}
        onLaunch={handleCalendarLaunch}
      />
    );
  }

  if (phase === "social_connect") {
    return (
      <div className="min-h-screen bg-[#060610] flex items-center justify-center px-4">
        <SocialConnect onComplete={handleSocialComplete} />
      </div>
    );
  }

  // Fallback: empty calendar or unexpected state
  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-white/70 mx-auto" />
        <p className="text-[14px] text-white/70">Something went wrong loading your calendar.</p>
        <button
          onClick={handleBack}
          className="text-[13px] text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <SessionProvider>
      <WelcomeFlow />
    </SessionProvider>
  );
}

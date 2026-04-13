"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  platform: string;
  scheduledAt: string;
  publishedAt: string | null;
  status: string;
  video: { id: string; title: string; model: string };
}

interface Suggestion {
  date: string;
  dayOfWeek: string;
  topic: string;
  category: string;
  description: string;
  suggestedFormat: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const platformColors: Record<string, string> = {
  instagram: "bg-pink-500/15 text-pink-400",
  linkedin: "bg-blue-500/15 text-blue-400",
  tiktok: "bg-white/10 text-white/70",
  youtube: "bg-red-500/15 text-red-400",
  facebook: "bg-blue-600/15 text-blue-300",
  twitter: "bg-sky-500/15 text-sky-400",
};

const categoryColors: Record<string, string> = {
  Education: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Tips: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Personal Brand": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Listings: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Social Proof": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function CalendarClient() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [generatingDay, setGeneratingDay] = useState<string | null>(null);

  useEffect(() => { fetchSchedules(); fetchSuggestions(); }, []);

  async function fetchSchedules() {
    setLoading(true);
    try {
      const res = await fetch("/api/schedule");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSchedules(data);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuggestions() {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/calendar/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions) setSuggestions(data.suggestions);
      }
    } catch {
      // Network error
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleGenerateFromSuggestion(suggestion: Suggestion) {
    setGeneratingDay(suggestion.date);
    try {
      // Navigate to generate page with pre-filled prompt
      const params = new URLSearchParams({
        prompt: suggestion.description,
        format: suggestion.suggestedFormat,
        topic: suggestion.topic,
      });
      router.push(`/dashboard/generate?${params.toString()}`);
    } catch {
      setGeneratingDay(null);
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

  function getSchedulesForDay(day: number): ScheduleItem[] {
    return schedules.filter((s) => {
      const d = new Date(s.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function getSuggestionForDay(day: number): Suggestion | undefined {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return suggestions.find((s) => s.date === dateStr);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="w-5 h-5 text-white/70 animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-white/70 mt-1">{schedules.length} scheduled post{schedules.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle AI Suggestions */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              showSuggestions
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-white/70 hover:text-white/60 border border-white/[0.06]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Suggestions
          </button>

          <button onClick={prevMonth} className="p-2 rounded-lg border border-white/[0.06] text-white/70 hover:text-white/60 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[15px] font-medium text-white/80 min-w-[160px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-white/[0.06] text-white/70 hover:text-white/60 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-white/[0.04] overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.04]">
          {DAYS.map((day) => (
            <div key={day} className="px-3 py-2.5 text-[11px] text-white/60 uppercase tracking-wider text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-white/[0.02] bg-white/[0.005]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const daySchedules = getSchedulesForDay(day);
            const suggestion = showSuggestions ? getSuggestionForDay(day) : undefined;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <div key={day} className={`min-h-[120px] border-b border-r border-white/[0.02] p-2 ${isToday ? "bg-blue-500/[0.03]" : ""}`}>
                <div className={`text-[13px] mb-1.5 ${isToday ? "text-blue-400 font-semibold" : "text-white/70"}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {/* Scheduled videos */}
                  {daySchedules.map((s) => (
                    <div key={s.id} className={`px-1.5 py-1 rounded text-[10px] truncate ${platformColors[s.platform] || "bg-white/[0.06] text-white/70"}`}>
                      {s.video.title}
                    </div>
                  ))}

                  {/* AI Suggestion */}
                  {suggestion && !isPast && daySchedules.length === 0 && (
                    <div className="group/suggest relative">
                      <div className={`px-1.5 py-1 rounded text-[10px] truncate border border-dashed ${categoryColors[suggestion.category] || "bg-white/[0.03] text-white/70 border-white/[0.06]"}`}>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
                          {suggestion.topic}
                        </span>
                      </div>
                      {/* Generate button on hover */}
                      <button
                        onClick={() => handleGenerateFromSuggestion(suggestion)}
                        disabled={generatingDay === suggestion.date}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded opacity-0 group-hover/suggest:opacity-100 transition-opacity text-[9px] text-white font-medium gap-1"
                      >
                        {generatingDay === suggestion.date ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <Zap className="w-2.5 h-2.5" />
                        )}
                        Generate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions Legend */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-6 px-5 py-4 rounded-xl border border-purple-500/10 bg-purple-500/[0.03]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400/80">AI-Suggested Content Plan</span>
            </div>
            <button
              onClick={fetchSuggestions}
              disabled={loadingSuggestions}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white/70 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${loadingSuggestions ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(categoryColors).map(([category, colors]) => (
              <div key={category} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] ${colors}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                {category}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/70 mt-3">
            Dashed cards are AI suggestions. Hover and click Generate to create a video from any suggestion.
          </p>
        </div>
      )}

      {/* Upcoming list */}
      {schedules.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-white/80 mb-4">Upcoming Posts</h2>
          <div className="space-y-2">
            {schedules
              .filter((s) => s.status === "scheduled" && new Date(s.scheduledAt) > new Date())
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .slice(0, 8)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3 rounded-xl border border-white/[0.04] bg-white/[0.015]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-white/80 truncate">{s.video.title}</div>
                    <div className="text-[12px] text-white/60 mt-0.5">
                      {new Date(s.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {formatTime(s.scheduledAt)}
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${platformColors[s.platform] || "bg-white/[0.06] text-white/70"}`}>
                    {s.platform}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {schedules.length === 0 && !showSuggestions && (
        <div className="text-center py-8 mt-4">
          <CalendarDays className="w-6 h-6 text-white/10 mx-auto mb-3" />
          <p className="text-[14px] text-white/60">No posts scheduled yet.</p>
        </div>
      )}
    </div>
  );
}

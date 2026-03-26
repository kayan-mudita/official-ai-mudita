"use client";

import { useState } from "react";
import { TrendingUp, Loader2, Music } from "lucide-react";

export interface TrendVideoData {
  topic: string;
  visualStyle: "modern" | "luxury" | "cozy";
  musicStyle: "upbeat" | "chill" | "dramatic" | "trending";
}

interface TrendVideoFormProps {
  onSubmit: (data: TrendVideoData) => void;
  isGenerating: boolean;
}

const visualStyles = [
  { value: "modern", label: "Modern", description: "Clean lines, minimal, contemporary" },
  { value: "luxury", label: "Luxury", description: "High-end, elegant, sophisticated" },
  { value: "cozy", label: "Cozy", description: "Warm, inviting, comfortable" },
] as const;

const musicStyles = [
  { value: "upbeat", label: "Upbeat", icon: "^" },
  { value: "chill", label: "Chill", icon: "~" },
  { value: "dramatic", label: "Dramatic", icon: "!" },
  { value: "trending", label: "Trending", icon: "#" },
] as const;

export function TrendVideoForm({ onSubmit, isGenerating }: TrendVideoFormProps) {
  const [topic, setTopic] = useState("");
  const [visualStyle, setVisualStyle] = useState<TrendVideoData["visualStyle"]>("modern");
  const [musicStyle, setMusicStyle] = useState<TrendVideoData["musicStyle"]>("trending");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!topic.trim()) newErrors.topic = "Topic or theme is required";
    if (topic.length > 500) newErrors.topic = "Topic must be 500 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isGenerating) return;
    onSubmit({ topic: topic.trim(), visualStyle, musicStyle });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Topic */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Topic / Theme
        </label>
        <textarea
          value={topic}
          onChange={(e) => { setTopic(e.target.value); if (errors.topic) setErrors({}); }}
          placeholder="Luxury downtown condos with rooftop views..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[80px]"
          rows={3}
        />
        {errors.topic && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.topic}</p>
        )}
      </div>

      {/* Visual Style */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Visual Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {visualStyles.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisualStyle(opt.value)}
              className={`px-3 py-3 rounded-xl border text-left transition-all ${
                visualStyle === opt.value
                  ? "border-white/[0.15] bg-white/[0.06]"
                  : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
              }`}
            >
              <div className={`text-[13px] font-medium ${visualStyle === opt.value ? "text-white/80" : "text-white/50"}`}>
                {opt.label}
              </div>
              <div className="text-[10px] text-white/20 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Music Style */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          <span className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" /> Music Vibe
          </span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {musicStyles.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMusicStyle(opt.value)}
              className={`px-3 py-3 rounded-xl border text-center transition-all ${
                musicStyle === opt.value
                  ? "border-white/[0.15] bg-white/[0.06]"
                  : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
              }`}
            >
              <div className={`text-[16px] mb-1 ${musicStyle === opt.value ? "text-white/60" : "text-white/20"}`}>
                {opt.icon}
              </div>
              <div className={`text-[12px] font-medium ${musicStyle === opt.value ? "text-white/80" : "text-white/50"}`}>
                {opt.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!topic.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><TrendingUp className="w-4 h-4" /> Generate Trend Video</>
        )}
      </button>
    </div>
  );
}

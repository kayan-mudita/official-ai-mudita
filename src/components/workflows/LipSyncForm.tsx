"use client";

import { useState } from "react";
import { Mic, Loader2, ChevronDown } from "lucide-react";

export interface LipSyncData {
  script: string;
  tone: "professional" | "casual" | "bold";
  duration: "15" | "30" | "60";
}

interface LipSyncFormProps {
  onSubmit: (data: LipSyncData) => void;
  isGenerating: boolean;
}

const toneOptions = [
  { value: "professional", label: "Professional", description: "Polished and confident" },
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  { value: "bold", label: "Bold", description: "High energy and attention-grabbing" },
] as const;

const durationOptions = [
  { value: "15", label: "15s", description: "Quick hit" },
  { value: "30", label: "30s", description: "Standard" },
  { value: "60", label: "60s", description: "In-depth" },
] as const;

export function LipSyncForm({ onSubmit, isGenerating }: LipSyncFormProps) {
  const [script, setScript] = useState("");
  const [tone, setTone] = useState<LipSyncData["tone"]>("professional");
  const [duration, setDuration] = useState<LipSyncData["duration"]>("15");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!script.trim()) newErrors.script = "Topic or script is required";
    if (script.length > 5000) newErrors.script = "Script must be 5000 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isGenerating) return;
    onSubmit({ script: script.trim(), tone, duration });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Script / Topic */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Topic or Script
        </label>
        <textarea
          value={script}
          onChange={(e) => { setScript(e.target.value); if (errors.script) setErrors({}); }}
          placeholder="Write your script or describe the topic you want to talk about..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[100px]"
          rows={4}
        />
        {errors.script && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.script}</p>
        )}
        <p className="text-[11px] text-white/20 mt-1.5">
          {script.length}/5000 characters
        </p>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Tone
        </label>
        <div className="grid grid-cols-3 gap-2">
          {toneOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTone(opt.value)}
              className={`px-3 py-3 rounded-xl border text-left transition-all ${
                tone === opt.value
                  ? "border-white/[0.15] bg-white/[0.06]"
                  : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
              }`}
            >
              <div className={`text-[13px] font-medium ${tone === opt.value ? "text-white/80" : "text-white/50"}`}>
                {opt.label}
              </div>
              <div className="text-[10px] text-white/20 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selector */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Duration
        </label>
        <div className="grid grid-cols-3 gap-2">
          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={`px-3 py-3 rounded-xl border text-center transition-all ${
                duration === opt.value
                  ? "border-white/[0.15] bg-white/[0.06]"
                  : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
              }`}
            >
              <div className={`text-[15px] font-semibold ${duration === opt.value ? "text-white/80" : "text-white/50"}`}>
                {opt.label}
              </div>
              <div className="text-[10px] text-white/20 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!script.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Mic className="w-4 h-4" /> Generate Lip Sync Video</>
        )}
      </button>
    </div>
  );
}

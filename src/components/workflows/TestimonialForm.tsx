"use client";

import { useState } from "react";
import { Quote, Loader2 } from "lucide-react";

export interface TestimonialData {
  customerName: string;
  testimonialText: string;
}

interface TestimonialFormProps {
  onSubmit: (data: TestimonialData) => void;
  isGenerating: boolean;
}

export function TestimonialForm({ onSubmit, isGenerating }: TestimonialFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!testimonialText.trim()) newErrors.testimonialText = "Review text is required";
    if (testimonialText.length > 5000) newErrors.testimonialText = "Review must be 5000 characters or less";
    if (customerName.length > 100) newErrors.customerName = "Name must be 100 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isGenerating) return;
    onSubmit({ customerName: customerName.trim(), testimonialText: testimonialText.trim() });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Customer Name */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Customer Name <span className="text-white/70">(optional)</span>
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => { setCustomerName(e.target.value); if (errors.customerName) setErrors((prev) => { const next = {...prev}; delete next.customerName; return next; }); }}
          placeholder="Jane D."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/70 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
        {errors.customerName && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.customerName}</p>
        )}
      </div>

      {/* Testimonial Text */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Review / Testimonial Text
        </label>
        <textarea
          value={testimonialText}
          onChange={(e) => { setTestimonialText(e.target.value); if (errors.testimonialText) setErrors((prev) => { const next = {...prev}; delete next.testimonialText; return next; }); }}
          placeholder="Paste or type the customer review here..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/70 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[140px]"
          rows={6}
        />
        {errors.testimonialText && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.testimonialText}</p>
        )}
        <p className="text-[11px] text-white/70 mt-1.5">
          {testimonialText.length}/5000 characters
        </p>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <Quote className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
        <p className="text-[12px] text-white/70 leading-relaxed">
          Paste the exact review text. We will generate a video with your AI avatar reading it in a natural, testimonial style.
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!testimonialText.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Quote className="w-4 h-4" /> Generate Testimonial Video</>
        )}
      </button>
    </div>
  );
}

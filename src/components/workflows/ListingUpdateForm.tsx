"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";

export interface ListingUpdateData {
  eventType: "new_listing" | "open_house" | "price_change" | "just_sold";
  address: string;
  eventDetails: string;
}

interface ListingUpdateFormProps {
  onSubmit: (data: ListingUpdateData) => void;
  isGenerating: boolean;
}

const eventTypeOptions = [
  { value: "new_listing", label: "New Listing", emoji: "NEW" },
  { value: "open_house", label: "Open House", emoji: "OPEN" },
  { value: "price_change", label: "Price Change", emoji: "$" },
  { value: "just_sold", label: "Just Sold", emoji: "SOLD" },
] as const;

const detailPlaceholders: Record<string, string> = {
  new_listing: "3 bed / 2 bath, $425K, stunning backyard with pool...",
  open_house: "Saturday 1-4 PM, refreshments served, no appointment needed...",
  price_change: "Price reduced from $525K to $475K, motivated seller...",
  just_sold: "Sold for $510K, 5 offers in 3 days, above asking price...",
};

export function ListingUpdateForm({ onSubmit, isGenerating }: ListingUpdateFormProps) {
  const [eventType, setEventType] = useState<ListingUpdateData["eventType"]>("new_listing");
  const [address, setAddress] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = "Property address is required";
    if (!eventDetails.trim()) newErrors.eventDetails = "Event details are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isGenerating) return;
    onSubmit({ eventType, address: address.trim(), eventDetails: eventDetails.trim() });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Event Type */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Event Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {eventTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEventType(opt.value)}
              className={`px-3 py-3 rounded-xl border text-center transition-all ${
                eventType === opt.value
                  ? "border-white/[0.15] bg-white/[0.06]"
                  : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
              }`}
            >
              <div className={`text-[10px] font-bold tracking-wider mb-1 ${
                eventType === opt.value ? "text-white/70" : "text-white/70"
              }`}>
                {opt.emoji}
              </div>
              <div className={`text-[12px] font-medium ${eventType === opt.value ? "text-white/80" : "text-white/70"}`}>
                {opt.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Property Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors((prev) => { const next = {...prev}; delete next.address; return next; }); }}
          placeholder="123 Main St, Austin, TX 78701"
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/70 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
        {errors.address && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.address}</p>
        )}
      </div>

      {/* Event Details */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Event Details
        </label>
        <textarea
          value={eventDetails}
          onChange={(e) => { setEventDetails(e.target.value); if (errors.eventDetails) setErrors((prev) => { const next = {...prev}; delete next.eventDetails; return next; }); }}
          placeholder={detailPlaceholders[eventType]}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/70 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[100px]"
          rows={4}
        />
        {errors.eventDetails && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.eventDetails}</p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!address.trim() || !eventDetails.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Bell className="w-4 h-4" /> Generate Listing Update</>
        )}
      </button>
    </div>
  );
}

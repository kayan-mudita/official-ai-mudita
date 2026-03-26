"use client";

import { useState } from "react";
import { Home, Loader2, Plus, X } from "lucide-react";

export interface PropertyTourData {
  address: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  price: string;
  keyFeatures: string;
}

interface PropertyTourFormProps {
  onSubmit: (data: PropertyTourData) => void;
  isGenerating: boolean;
}

export function PropertyTourForm({ onSubmit, isGenerating }: PropertyTourFormProps) {
  const [address, setAddress] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqft, setSqft] = useState("");
  const [price, setPrice] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = "Property address is required";
    if (address.length > 300) newErrors.address = "Address must be 300 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || isGenerating) return;
    onSubmit({
      address: address.trim(),
      bedrooms: bedrooms.trim(),
      bathrooms: bathrooms.trim(),
      sqft: sqft.trim(),
      price: price.trim(),
      keyFeatures: keyFeatures.trim(),
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Address */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Property Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors({}); }}
          placeholder="123 Main St, Austin, TX 78701"
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors"
        />
        {errors.address && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.address}</p>
        )}
      </div>

      {/* Property Details Grid */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Property Details
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <input
              type="text"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="Beds"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors text-center"
            />
            <p className="text-[10px] text-white/15 text-center mt-1">Bedrooms</p>
          </div>
          <div>
            <input
              type="text"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              placeholder="Baths"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors text-center"
            />
            <p className="text-[10px] text-white/15 text-center mt-1">Bathrooms</p>
          </div>
          <div>
            <input
              type="text"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="Sq Ft"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors text-center"
            />
            <p className="text-[10px] text-white/15 text-center mt-1">Square Feet</p>
          </div>
          <div>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="$499K"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/[0.12] transition-colors text-center"
            />
            <p className="text-[10px] text-white/15 text-center mt-1">Price</p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Key Features <span className="text-white/20">(optional)</span>
        </label>
        <textarea
          value={keyFeatures}
          onChange={(e) => setKeyFeatures(e.target.value)}
          placeholder="Updated kitchen, pool, large backyard, walk to downtown..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!address.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><Home className="w-4 h-4" /> Generate Property Tour</>
        )}
      </button>
    </div>
  );
}

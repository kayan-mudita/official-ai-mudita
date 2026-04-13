"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Mic,
  Palette,
  Upload,
  Loader2,
  Trash2,
  Star,
  Image as ImageIcon,
  Paintbrush,
  CheckCircle2,
  AudioWaveform,
  Download,
  Database,
  Film,
  CalendarDays,
  Layers,
  Fingerprint,
} from "lucide-react";

type Tab = "photos" | "voices" | "brand" | "brand-kit" | "voice-training" | "your-data";

interface Photo { id: string; filename: string; url: string; isPrimary: boolean; createdAt: string; }
interface Voice { id: string; filename: string; url: string; duration: number; isDefault: boolean; createdAt: string; }
interface Brand { brandName?: string; tagline?: string; toneOfVoice?: string; targetAudience?: string; competitors?: string; brandColors?: string; guidelines?: string; }
interface BrandKit { logoUrl?: string | null; primaryColor: string; secondaryColor: string; introStyle: string; outroTemplate: string; }

export default function VaultPage() {
  const [tab, setTab] = useState<Tab>("photos");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [brand, setBrand] = useState<Brand>({});
  const [brandKit, setBrandKit] = useState<BrandKit>({ primaryColor: "#00749e", secondaryColor: "#81009e", introStyle: "professional", outroTemplate: "standard" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKit, setSavingKit] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [dataStats, setDataStats] = useState({ photos: 0, videos: 0, voices: 0, characterSheets: 0, schedules: 0 });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [pRes, vRes, bRes, bkRes, vidRes] = await Promise.all([
        fetch("/api/photos"), fetch("/api/voices"), fetch("/api/brand-profile"), fetch("/api/brand-kit"), fetch("/api/videos"),
      ]);
      let pData: Photo[] = [];
      let vData: Voice[] = [];
      let vidCount = 0;
      if (pRes.ok) { pData = await pRes.json(); setPhotos(pData); }
      if (vRes.ok) { vData = await vRes.json(); setVoices(vData); }
      if (bRes.ok) { const d = await bRes.json(); if (d && !d.error) setBrand(d); }
      if (bkRes.ok) { const d = await bkRes.json(); if (d && !d.error) setBrandKit(d); }
      if (vidRes.ok) { const vids = await vidRes.json(); vidCount = Array.isArray(vids) ? vids.length : 0; }
      setDataStats({ photos: pData.length, videos: vidCount, voices: vData.length, characterSheets: 0, schedules: 0 });
    } catch {} finally { setLoading(false); }
  }

  async function saveBrand() {
    setSaving(true);
    try {
      const res = await fetch("/api/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      if (res.ok) showToast("Brand profile saved");
    } catch {} finally { setSaving(false); }
  }

  async function saveBrandKit() {
    setSavingKit(true);
    try {
      const res = await fetch("/api/brand-kit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandKit),
      });
      if (res.ok) {
        const updated = await res.json();
        setBrandKit(updated);
        showToast("Brand kit saved");
      }
    } catch {} finally { setSavingKit(false); }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "photo");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        const kitRes = await fetch("/api/brand-kit", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...brandKit, logoUrl: data.url }),
        });
        if (kitRes.ok) {
          const updated = await kitRes.json();
          setBrandKit(updated);
          showToast("Logo uploaded");
        }
      }
    } catch {} finally { setUploadingLogo(false); }
  }

  async function handleVoiceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file type
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"];
    const validExtensions = [".mp3", ".wav", ".m4a"];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!validTypes.includes(file.type) && !hasValidExt) {
      showToast("Please upload an .mp3, .wav, or .m4a file");
      return;
    }
    setUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "voice");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        showToast("Voice sample uploaded");
        // Reload voices
        const vRes = await fetch("/api/voices");
        if (vRes.ok) setVoices(await vRes.json());
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "Upload failed");
      }
    } catch {} finally { setUploadingVoice(false); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `official-ai-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Data exported successfully");
      } else {
        showToast("Failed to export data");
      }
    } catch {
      showToast("Failed to export data");
    } finally {
      setExporting(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2000); }

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "photos", label: "Photos", icon: Camera, count: photos.length },
    { id: "voices", label: "Voice Samples", icon: Mic, count: voices.length },
    { id: "brand", label: "Brand Profile", icon: Palette },
    { id: "brand-kit", label: "Brand Kit", icon: Paintbrush },
    { id: "voice-training", label: "Voice", icon: AudioWaveform },
    { id: "your-data", label: "Your Data", icon: Database },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="w-5 h-5 text-white/70 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Vault</h1>
        <p className="text-sm text-white/70 mt-1">Your photos, voice samples, and brand profile</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/[0.04]">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-[14px] border-b-2 transition-all ${tab === t.id ? "border-white/60 text-white/90" : "border-transparent text-white/70 hover:text-white/70"}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== undefined && <span className="text-[11px] text-white/70 ml-1">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Photos */}
      {tab === "photos" && (
        <div>
          {photos.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] mb-5">
                <ImageIcon className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-[17px] font-semibold text-white/80 mb-1">No photos uploaded</h3>
              <p className="text-[14px] text-white/70">Upload photos during onboarding or here to improve your AI avatar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden border border-white/[0.04] bg-white/[0.02]">
                    {photo.url && !photo.url.startsWith("/uploads/") ? (
                      <img src={photo.url} alt={photo.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/[0.06]" />
                      </div>
                    )}
                  </div>
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] text-yellow-400">
                      <Star className="w-2.5 h-2.5" /> Primary
                    </div>
                  )}
                  <p className="text-[12px] text-white/60 mt-2 truncate">{photo.filename}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Voices */}
      {tab === "voices" && (
        <div>
          {voices.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] mb-5">
                <Mic className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-[17px] font-semibold text-white/80 mb-1">No voice samples</h3>
              <p className="text-[14px] text-white/70">Record a voice sample to give your AI avatar your voice.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {voices.map((voice) => (
                <div key={voice.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.04] bg-white/[0.015]">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-white/80 truncate">{voice.filename}</div>
                    <div className="text-[12px] text-white/60">{voice.duration}s</div>
                  </div>
                  {voice.isDefault && (
                    <span className="text-[11px] text-blue-400/70 px-2 py-0.5 rounded-full bg-blue-500/10">Default</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brand Profile */}
      {tab === "brand" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/70 mb-1.5">Brand Name</label>
              <input type="text" value={brand.brandName || ""} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} placeholder="Your business name" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-[12px] text-white/70 mb-1.5">Tagline</label>
              <input type="text" value={brand.tagline || ""} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} placeholder="Your tagline or slogan" className="input-field text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/70 mb-1.5">Tone of Voice</label>
              <select value={brand.toneOfVoice || ""} onChange={(e) => setBrand({ ...brand, toneOfVoice: e.target.value })} className="input-field text-sm">
                <option value="">Select tone</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="playful">Playful</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-white/70 mb-1.5">Target Audience</label>
              <input type="text" value={brand.targetAudience || ""} onChange={(e) => setBrand({ ...brand, targetAudience: e.target.value })} placeholder="Who are you trying to reach?" className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-white/70 mb-1.5">Brand Guidelines</label>
            <textarea value={brand.guidelines || ""} onChange={(e) => setBrand({ ...brand, guidelines: e.target.value })} placeholder="Any specific guidelines for AI-generated content..." className="input-field text-sm min-h-[100px] resize-y" />
          </div>
          <button onClick={saveBrand} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-medium hover:bg-white/90 disabled:opacity-40 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Brand Profile
          </button>
        </div>
      )}

      {/* Brand Kit */}
      {tab === "brand-kit" && (
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <label className="block text-[13px] font-medium text-white/60 mb-3">Logo</label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center overflow-hidden">
                {brandKit.logoUrl ? (
                  <img src={brandKit.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/10" />
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] text-[13px] text-white/60 hover:bg-white/[0.1] cursor-pointer transition-all">
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {brandKit.logoUrl ? "Change Logo" : "Upload Logo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-white/70 mt-1.5">JPG, PNG, or WebP. Max 10MB.</p>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <label className="block text-[13px] font-medium text-white/60 mb-4">Brand Colors</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-white/70 mb-1.5">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandKit.primaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                    className="input-field text-sm flex-1"
                    placeholder="#00749e"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-white/70 mb-1.5">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandKit.secondaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandKit.secondaryColor}
                    onChange={(e) => setBrandKit({ ...brandKit, secondaryColor: e.target.value })}
                    className="input-field text-sm flex-1"
                    placeholder="#81009e"
                  />
                </div>
              </div>
            </div>
            {/* Color preview */}
            <div className="flex items-center gap-3 mt-4">
              <div className="h-8 flex-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${brandKit.primaryColor}, ${brandKit.secondaryColor})` }} />
              <span className="text-[11px] text-white/70">Preview</span>
            </div>
          </div>

          {/* Intro Style */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <label className="block text-[13px] font-medium text-white/60 mb-3">Preferred Intro Style</label>
            <div className="grid grid-cols-3 gap-3">
              {(["professional", "casual", "bold"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setBrandKit({ ...brandKit, introStyle: style })}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-medium capitalize transition-all ${
                    brandKit.introStyle === style
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Outro Template */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5">
            <label className="block text-[13px] font-medium text-white/60 mb-3">Outro Card Template</label>
            <div className="grid grid-cols-3 gap-3">
              {(["standard", "minimal", "animated"] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setBrandKit({ ...brandKit, outroTemplate: tmpl })}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-medium capitalize transition-all ${
                    brandKit.outroTemplate === tmpl
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveBrandKit} disabled={savingKit} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#050508] text-[14px] font-medium hover:bg-white/90 disabled:opacity-40 transition-all">
            {savingKit ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Brand Kit
          </button>
        </div>
      )}

      {/* Voice Training */}
      {tab === "voice-training" && (
        <div className="space-y-6">
          {/* Train Your Voice Card */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-white/90 mb-1">Train Your Voice</h3>
                <p className="text-[13px] text-white/70 leading-relaxed mb-4">
                  Upload a 30-second audio sample of your voice. We will use it to generate videos that sound like you.
                  Supported formats: .mp3, .wav, .m4a
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[14px] font-medium text-purple-400 hover:bg-purple-500/20 cursor-pointer transition-all">
                  {uploadingVoice ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Voice Sample
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
                    onChange={handleVoiceUpload}
                    className="hidden"
                    disabled={uploadingVoice}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Uploaded Voices */}
          {voices.length > 0 && (
            <div>
              <h3 className="text-[14px] font-medium text-white/70 mb-3">Your Voice Samples</h3>
              <div className="space-y-2">
                {voices.map((voice) => (
                  <div key={voice.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.04] bg-white/[0.015]">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-purple-400/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-white/80 truncate">{voice.filename}</div>
                      <div className="text-[12px] text-white/60">{voice.duration}s</div>
                    </div>
                    {voice.isDefault && (
                      <div className="flex items-center gap-1.5 text-[11px] text-green-400/70 px-2 py-0.5 rounded-full bg-green-500/10">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 px-4 py-3 rounded-xl bg-green-500/[0.05] border border-green-500/10">
                <p className="text-[13px] text-green-400/80 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Voice sample uploaded -- Your future videos will use your voice
                </p>
              </div>
            </div>
          )}

          {voices.length === 0 && (
            <div className="text-center py-10">
              <p className="text-[13px] text-white/60">No voice samples yet. Upload your first sample above.</p>
            </div>
          )}
        </div>
      )}

      {/* Your Data */}
      {tab === "your-data" && (
        <div className="space-y-6">
          {/* Identity message */}
          <div className="bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-white mb-1">
                  All your content lives here. Your AI twin knows you.
                </h3>
                <p className="text-[14px] text-white/70 leading-relaxed">
                  {(dataStats.photos + dataStats.videos + dataStats.voices) > 0
                    ? `You've created ${dataStats.videos} video${dataStats.videos !== 1 ? "s" : ""}, uploaded ${dataStats.photos} photo${dataStats.photos !== 1 ? "s" : ""}, and trained ${dataStats.voices} voice sample${dataStats.voices !== 1 ? "s" : ""}. Your digital twin lives here.`
                    : "Start uploading photos and creating videos to build your digital twin."}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-[#0f1420] border border-white/[0.04] rounded-xl p-4 text-center">
              <Camera className="w-5 h-5 text-blue-400/50 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dataStats.photos}</p>
              <p className="text-[11px] text-white/60 mt-0.5">Photos Uploaded</p>
            </div>
            <div className="bg-[#0f1420] border border-white/[0.04] rounded-xl p-4 text-center">
              <Film className="w-5 h-5 text-purple-400/50 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dataStats.videos}</p>
              <p className="text-[11px] text-white/60 mt-0.5">Videos Created</p>
            </div>
            <div className="bg-[#0f1420] border border-white/[0.04] rounded-xl p-4 text-center">
              <Mic className="w-5 h-5 text-emerald-400/50 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dataStats.voices}</p>
              <p className="text-[11px] text-white/60 mt-0.5">Voice Samples</p>
            </div>
            <div className="bg-[#0f1420] border border-white/[0.04] rounded-xl p-4 text-center">
              <Layers className="w-5 h-5 text-amber-400/50 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dataStats.characterSheets}</p>
              <p className="text-[11px] text-white/60 mt-0.5">Character Sheets</p>
            </div>
            <div className="bg-[#0f1420] border border-white/[0.04] rounded-xl p-4 text-center">
              <CalendarDays className="w-5 h-5 text-pink-400/50 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dataStats.schedules}</p>
              <p className="text-[11px] text-white/60 mt-0.5">Schedules Created</p>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-[#0f1420] border border-white/[0.04] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Export Your Data</h3>
                <p className="text-[13px] text-white/70 leading-relaxed max-w-md">
                  Download a complete JSON export of all your data including photos, videos, voice samples, character sheets, and brand settings. GDPR compliant.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[13px] font-medium hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 flex-shrink-0"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl z-50">{toast}</div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Mic,
  Palette,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Sparkles,
  ImageIcon,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import SessionProvider from "@/components/SessionProvider";

type OnboardingStep = "photos" | "voice" | "brand" | "complete";

interface UploadedPhoto {
  id: string;
  filename: string;
  url: string;
}

interface VoiceSampleData {
  id: string;
  filename: string;
  url: string;
  duration: number;
}

function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("photos");

  // Photo state
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice state
  const [voiceSample, setVoiceSample] = useState<VoiceSampleData | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Brand state
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);

  // Completing state
  const [completing, setCompleting] = useState(false);

  const steps = [
    { key: "photos", label: "Upload Photos", icon: Camera },
    { key: "voice", label: "Record Voice", icon: Mic },
    { key: "brand", label: "Brand Profile", icon: Palette },
    { key: "complete", label: "Ready!", icon: Sparkles },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  // --- Photo Upload Logic ---
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoError(null);
    setPhotoUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setPhotoError(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setPhotoError(`${file.name} exceeds 10MB limit`);
          continue;
        }

        // Generate a placeholder URL for the photo reference
        // The actual S3 upload is handled by another system; we store the reference
        const filename = `${Date.now()}-${file.name}`;
        const url = `/uploads/photos/${filename}`;

        // Save photo metadata to the database
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            url,
            isPrimary: uploadedPhotos.length === 0 && i === 0,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save photo");
        }

        const savedPhoto = await res.json();
        setUploadedPhotos((prev) => [...prev, savedPhoto]);
      }
    } catch (err: any) {
      setPhotoError(err.message || "Failed to upload photos");
    } finally {
      setPhotoUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [uploadedPhotos.length]);

  // --- Voice Recording Logic ---
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setRecording(false);
  }, []);

  const uploadVoiceSample = useCallback(async (audioBlob: Blob, duration: number) => {
    setVoiceUploading(true);
    setVoiceError(null);

    try {
      const extension = audioBlob.type.includes("webm") ? "webm" : "mp4";
      const filename = `voice-${Date.now()}.${extension}`;
      const url = `/uploads/voices/${filename}`;

      // Save voice sample metadata to the database
      const res = await fetch("/api/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          url,
          duration,
          isDefault: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save voice sample");
      }

      const savedVoice = await res.json();
      setVoiceSample(savedVoice);
    } catch (err: any) {
      setVoiceError(err.message || "Failed to upload voice sample");
    } finally {
      setVoiceUploading(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      let currentDuration = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks from the stream
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Upload the voice sample
        await uploadVoiceSample(audioBlob, currentDuration);
      };

      mediaRecorder.start(1000); // Collect data every second
      setRecording(true);
      setRecordTime(0);

      // Timer to track recording duration
      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => {
          const next = t + 1;
          currentDuration = next;
          if (next >= 60) {
            // Auto-stop at 60 seconds
            stopRecording();
            return 60;
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setVoiceError("Microphone access denied. Please allow microphone access and try again.");
      } else {
        setVoiceError("Failed to access microphone. Please check your browser settings.");
      }
    }
  }, [stopRecording, uploadVoiceSample]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // --- Brand Profile Logic ---
  const saveBrandProfile = async () => {
    setBrandSaving(true);
    setBrandError(null);

    try {
      const res = await fetch("/api/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName || null,
          tagline: brandDescription || null,
          toneOfVoice: selectedTone || null,
          targetAudience: targetAudience || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save brand profile");
      }

      // Move to complete step
      setStep("complete");
    } catch (err: any) {
      setBrandError(err.message || "Failed to save brand profile");
    } finally {
      setBrandSaving(false);
    }
  };

  // --- Complete Onboarding ---
  const completeOnboarding = async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
      });

      if (!res.ok) {
        console.error("Failed to mark onboarding complete");
      }

      router.push("/dashboard/overview");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Still redirect even if the flag update fails
      router.push("/dashboard/overview");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 mesh-gradient" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i < currentIndex ? "bg-green-500 text-white" :
                i === currentIndex ? "bg-blue-500 text-white" :
                "bg-white/10 text-white/30"
              }`}>
                {i < currentIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 ${i < currentIndex ? "bg-green-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {/* Photos step */}
          {step === "photos" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Upload your photos</h2>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Upload 5-10 photos of yourself. These will be used to generate video content featuring your likeness. Phone photos work great!
                </p>
              </div>

              {/* Photo error */}
              {photoError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {photoError}
                  <button onClick={() => setPhotoError(null)} className="ml-auto">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-md mx-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                      i < uploadedPhotos.length
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-white/10"
                    }`}
                  >
                    {i < uploadedPhotos.length ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-white/20" />
                    )}
                  </div>
                ))}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                className="btn-secondary gap-2 mx-auto disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
              >
                {photoUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Upload from Device
                  </>
                )}
              </button>

              <p className="text-xs text-white/20">{uploadedPhotos.length}/5 photos uploaded (minimum)</p>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep("voice")}
                  disabled={uploadedPhotos.length < 1}
                  className="btn-primary gap-2 disabled:opacity-30"
                >
                  Next: Record Voice <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Voice step */}
          {step === "voice" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 flex items-center justify-center mx-auto">
                <Mic className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Record your voice</h2>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Record a 30-60 second voice sample. Speak naturally — the AI will learn your unique tone and style.
                </p>
              </div>

              {/* Voice error */}
              {voiceError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {voiceError}
                  <button onClick={() => setVoiceError(null)} className="ml-auto">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Recording UI */}
              <div className="max-w-sm mx-auto">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center cursor-pointer transition-all ${
                  recording
                    ? "bg-red-500/20 ring-4 ring-red-500/10 animate-pulse"
                    : voiceUploading
                    ? "bg-blue-500/20"
                    : voiceSample
                    ? "bg-green-500/20"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                  onClick={() => {
                    if (voiceSample || voiceUploading) return;
                    if (recording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                >
                  {voiceUploading ? (
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  ) : voiceSample ? (
                    <Check className="w-10 h-10 text-green-400" />
                  ) : (
                    <Mic className={`w-10 h-10 ${recording ? "text-red-400" : "text-white/40"}`} />
                  )}
                </div>
                <div className="mt-3 text-sm text-white/40">
                  {voiceUploading
                    ? "Saving voice sample..."
                    : recording
                    ? `Recording... ${recordTime}s`
                    : voiceSample
                    ? `Voice sample recorded! (${voiceSample.duration}s)`
                    : "Tap to start recording"
                  }
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep("photos")} className="btn-secondary gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep("brand")}
                  disabled={!voiceSample}
                  className="btn-primary gap-2 disabled:opacity-30"
                >
                  Next: Brand Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Brand step */}
          {step === "brand" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Tell us about your brand</h2>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Help the AI understand your business so it creates on-brand content.
                </p>
              </div>

              {/* Brand error */}
              {brandError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {brandError}
                  <button onClick={() => setBrandError(null)} className="ml-auto">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Business / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Rockwell Realty Group"
                    className="input-field text-sm"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">What do you do?</label>
                  <textarea
                    placeholder="Brief description of your business and what makes you unique..."
                    className="input-field min-h-[80px] resize-none text-sm"
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Who is your target audience?</label>
                  <input
                    type="text"
                    placeholder="e.g., First-time homebuyers in Seattle"
                    className="input-field text-sm"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Preferred tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Professional", "Friendly", "Educational", "Casual"].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`p-3 rounded-xl bg-white/[0.03] border text-sm transition-all ${
                          selectedTone === tone
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                            : "border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep("voice")} className="btn-secondary gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={saveBrandProfile}
                  disabled={brandSaving}
                  className="btn-primary gap-2 disabled:opacity-50"
                >
                  {brandSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Complete step */}
          {step === "complete" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">You&apos;re all set!</h2>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Your AI marketing teammate is ready. We&apos;ll start generating your first batch of content using Kling 2.6 and Seedance 2.0.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg font-bold gradient-text">{uploadedPhotos.length}</div>
                  <div className="text-[10px] text-white/30">Photos</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg font-bold gradient-text">{voiceSample ? "1" : "0"}</div>
                  <div className="text-[10px] text-white/30">Voice Sample</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg font-bold gradient-text">
                    <Check className="w-5 h-5 mx-auto" />
                  </div>
                  <div className="text-[10px] text-white/30">Brand Profile</div>
                </div>
              </div>

              <button
                onClick={completeOnboarding}
                disabled={completing}
                className="btn-primary gap-2 text-lg disabled:opacity-50"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <OnboardingFlow />
    </SessionProvider>
  );
}

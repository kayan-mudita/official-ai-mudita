"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Sparkles,
  Cpu,
  Zap,
  Check,
  RefreshCw,
  ChevronDown,
  X,
  Loader2,
  Film,
  ChevronRight,
} from "lucide-react";
import { useGenerationProgress } from "@/hooks/use-generation-progress";
import { GenerationProgressBar } from "@/components/GenerationProgress";
import {
  WorkflowSelector,
  type WorkflowSubmitData,
} from "@/components/workflows/WorkflowSelector";

// ─── Chat Types ───────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  videoData?: {
    videoId: string;
    title: string;
    model: string;
    status: string;
    videoUrl: string | null;
    error?: string;
  };
  showProgress?: boolean;
}

const modelLabels: Record<string, string> = {
  "kling_2.6": "Kling 2.6",
  "seedance_2.0": "Seedance 2.0",
};

const formatLabels: Record<string, string> = {
  talking_head_15: "Talking Head (15s, 4 cuts)",
  testimonial_15: "Testimonial (15s, 5 cuts)",
  testimonial_20: "Testimonial (20s, 4 cuts)",
  educational_30: "Educational (30s, 8 cuts)",
  quick_tip_8: "Quick Tip (8s, 3 cuts)",
  property_tour_30: "Property Tour (30s, 4 cuts)",
  behind_scenes_20: "Montage (20s, 5 cuts)",
};

// ─── Main Component ──────────────────────────────────────────────

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"kling_2.6" | "seedance_2.0">("kling_2.6");
  const [selectedFormat, setSelectedFormat] = useState("talking_head_15");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [industry] = useState("other");
  const [showWorkflows, setShowWorkflows] = useState(true);
  const [showManualMode, setShowManualMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const activeStatusMsgIdRef = useRef<string | null>(null);

  const { progress, stepLabel } = useGenerationProgress({
    videoId: activeVideoId,
    enabled: isGenerating && !!activeVideoId,
    interval: 3000,
    onComplete: useCallback((video: { videoUrl: string | null }) => {
      const msgId = activeStatusMsgIdRef.current;
      if (msgId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  content: "Your video is ready! Review it below.",
                  showProgress: false,
                  videoData: m.videoData
                    ? { ...m.videoData, status: "review", videoUrl: video.videoUrl }
                    : undefined,
                }
              : m
          )
        );
      }
      setIsGenerating(false);
      setActiveVideoId(null);
    }, []),
    onError: useCallback((errorMsg: string) => {
      const msgId = activeStatusMsgIdRef.current;
      if (msgId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  content: `Generation failed: ${errorMsg}. Saved as a draft -- retry from the content library.`,
                  showProgress: false,
                  videoData: m.videoData
                    ? { ...m.videoData, status: "failed", error: errorMsg }
                    : undefined,
                }
              : m
          )
        );
      }
      setIsGenerating(false);
      setActiveVideoId(null);
    }, []),
  });

  // Handle URL params (for deep-linking from templates)
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    const format = searchParams.get("format");
    if (prompt) setInput(prompt);
    if (format) setSelectedFormat(format);
    if (prompt) {
      setShowWorkflows(false);
      setShowManualMode(true);
    }
  }, [searchParams]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0 && !searchParams.get("prompt")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "What would you like to create today? Pick a workflow below or switch to manual mode for full control.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [industry, messages.length, searchParams]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg = { ...msg, id: `msg-${Date.now()}-${Math.random()}`, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // ─── Core Generation Logic ──────────────────────────────────────

  const triggerGeneration = async (
    script: string,
    model: string,
    format: string,
    workflow?: string,
    workflowData?: Record<string, unknown>
  ) => {
    setIsGenerating(true);
    setShowWorkflows(false);
    setShowManualMode(false);

    const statusMsg = addMessage({
      role: "assistant",
      content: `Building a **${formatLabels[format] || format}** with **${modelLabels[model] || model}**...`,
      showProgress: true,
    });
    activeStatusMsgIdRef.current = statusMsg.id;

    try {
      // Step 1: Create video record
      const createRes = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: script.length > 100 ? script.substring(0, 100) + "..." : script,
          description: script,
          script,
          model,
          contentType: format,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to create video");
      const video = await createRes.json();

      // Step 2: Generate
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          model,
          script,
          format,
          workflow,
          workflowData,
        }),
      });
      const genData = genRes.ok ? await genRes.json() : null;
      const videoId = genData?.video?.id || video.id;

      updateMessage(statusMsg.id, {
        videoData: {
          videoId,
          title: genData?.video?.title || video.title,
          model,
          status: "generating",
          videoUrl: null,
        },
      });
      setActiveVideoId(videoId);
    } catch (err: any) {
      updateMessage(statusMsg.id, {
        content: `Something went wrong: ${err.message}. Saved as a draft -- retry from the content library.`,
        showProgress: false,
      });
      setIsGenerating(false);
      setActiveVideoId(null);
    }
  };

  // ─── Workflow Submit Handler ────────────────────────────────────

  const handleWorkflowSubmit = (data: WorkflowSubmitData) => {
    if (isGenerating) return;

    addMessage({
      role: "user",
      content: `[${data.workflow.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}] ${data.prompt.substring(0, 200)}${data.prompt.length > 200 ? "..." : ""}`,
    });

    triggerGeneration(
      data.prompt,
      data.model,
      data.format,
      data.workflow,
      data.workflowData
    );
  };

  // ─── Manual Mode Handler ────────────────────────────────────────

  const handleManualSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userMsg = input.trim();
    setInput("");

    addMessage({ role: "user", content: userMsg });
    triggerGeneration(userMsg, selectedModel, selectedFormat, "manual");
  };

  // ─── Video Action Handlers ─────────────────────────────────────

  const handleApprove = async (msgId: string, videoId: string) => {
    try {
      await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.videoData ? { ...m, videoData: { ...m.videoData, status: "approved" } } : m
        )
      );
      addMessage({
        role: "assistant",
        content: "Approved! The video is ready to publish. You can schedule it from the calendar or publish now.",
      });
    } catch {
      // silently fail
    }
  };

  const handleRegenerate = async (msgId: string, videoId: string) => {
    setIsGenerating(true);
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, model: selectedModel }),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.videoData
            ? {
                ...m,
                showProgress: true,
                content: "Regenerating your video...",
                videoData: { ...m.videoData, status: "generating", videoUrl: null },
              }
            : m
        )
      );
      activeStatusMsgIdRef.current = msgId;
      setActiveVideoId(videoId);
    } catch {
      setIsGenerating(false);
    }
  };

  const handleRetry = async (msgId: string, videoId: string) => {
    setIsGenerating(true);
    try {
      const retryRes = await fetch("/api/generate/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({}));
        throw new Error(errData.error || "Retry failed");
      }
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, model: selectedModel, format: selectedFormat }),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.videoData
            ? {
                ...m,
                content: "Retrying generation...",
                showProgress: true,
                videoData: { ...m.videoData, status: "generating", videoUrl: null, error: undefined },
              }
            : m
        )
      );
      activeStatusMsgIdRef.current = msgId;
      setActiveVideoId(videoId);
    } catch (err: any) {
      addMessage({ role: "assistant", content: `Retry failed: ${err.message}` });
      setIsGenerating(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div
      className="max-w-3xl mx-auto flex flex-col"
      style={{ height: "calc(100vh - 7rem - env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Create Video</h1>
          <p className="text-xs text-white/30 mt-0.5">
            {showWorkflows && !showManualMode
              ? "Choose a workflow to get started"
              : "Describe what you want and we will generate it"}
          </p>
        </div>
        {/* Show format/model pickers only in manual mode */}
        {showManualMode && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2.5 min-h-[44px] rounded-xl border border-white/[0.06] bg-transparent text-[13px] text-white/60 hover:border-white/10 transition-all appearance-none cursor-pointer flex-1 sm:flex-none"
            >
              <option value="quick_tip_8" className="bg-[#0c1018]">Quick Tip (8s)</option>
              <option value="talking_head_15" className="bg-[#0c1018]">Talking Head (15s)</option>
              <option value="testimonial_15" className="bg-[#0c1018]">Testimonial (15s)</option>
              <option value="testimonial_20" className="bg-[#0c1018]">Testimonial (20s)</option>
              <option value="educational_30" className="bg-[#0c1018]">Educational (30s)</option>
              <option value="property_tour_30" className="bg-[#0c1018]">Property Tour (30s)</option>
              <option value="behind_scenes_20" className="bg-[#0c1018]">Montage (20s)</option>
            </select>
            <div className="relative">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl border border-white/[0.06] text-[13px] text-white/60 hover:border-white/10 active:bg-white/[0.03] transition-all"
              >
                {selectedModel === "kling_2.6" ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Kling 2.6</span>
                    <span className="sm:hidden">Kling</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Seedance 2.0</span>
                    <span className="sm:hidden">Seedance</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-white/20" />
              </button>
              {showModelPicker && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-white/[0.06] bg-[#0c1018] p-1.5 z-50 shadow-2xl">
                  {(["kling_2.6", "seedance_2.0"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedModel(m);
                        setShowModelPicker(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all min-h-[48px] ${
                        selectedModel === m ? "bg-white/[0.06]" : "hover:bg-white/[0.03] active:bg-white/[0.06]"
                      }`}
                    >
                      {m === "kling_2.6" ? (
                        <Cpu className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Zap className="w-4 h-4 text-purple-400" />
                      )}
                      <div>
                        <div className="text-[13px] font-medium text-white/80">{modelLabels[m]}</div>
                        <div className="text-[11px] text-white/25">
                          {m === "kling_2.6" ? "Hyper-realistic" : "Creative & dynamic"}
                        </div>
                      </div>
                      {selectedModel === m && <Check className="w-3.5 h-3.5 text-white/40 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Workflow Selector */}
      {showWorkflows && !showManualMode && (
        <div className="flex-shrink-0 mb-4 max-h-[60vh] overflow-y-auto pr-1">
          <WorkflowSelector
            industry={industry}
            isGenerating={isGenerating}
            onSelectManual={() => {
              setShowManualMode(true);
              setShowWorkflows(false);
              inputRef.current?.focus();
            }}
            onSubmitWorkflow={handleWorkflowSubmit}
          />
        </div>
      )}

      {/* Re-show workflows link */}
      {!showWorkflows && messages.length <= 1 && !showManualMode && (
        <button
          onClick={() => setShowWorkflows(true)}
          className="flex items-center gap-2 text-xs text-white/25 hover:text-white/40 transition-colors mb-3 flex-shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          Show workflows
        </button>
      )}

      {/* Switch between workflows and manual */}
      {showManualMode && messages.length <= 1 && (
        <button
          onClick={() => {
            setShowManualMode(false);
            setShowWorkflows(true);
          }}
          className="flex items-center gap-2 text-xs text-white/25 hover:text-white/40 transition-colors mb-3 flex-shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          Back to workflows
        </button>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[90%]">
              <div className="flex items-start gap-3">
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white/40" />
                  </div>
                )}
                <div className="flex-1">
                  <div
                    className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white/[0.06] border border-white/[0.04] rounded-br-md"
                        : "bg-transparent"
                    }`}
                  >
                    {msg.content.split("**").map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="text-white font-medium">
                          {part}
                        </strong>
                      ) : (
                        <span key={i} className="text-white/70">
                          {part}
                        </span>
                      )
                    )}
                  </div>

                  {/* Progress */}
                  {msg.showProgress && msg.videoData?.status === "generating" && (
                    <div className="mt-3 px-4">
                      <GenerationProgressBar
                        progress={msg.id === activeStatusMsgIdRef.current ? progress : null}
                        compact
                      />
                    </div>
                  )}

                  {/* Video Preview */}
                  {msg.videoData && (
                    <div className="mt-3">
                      <div className="rounded-xl border border-white/[0.04] overflow-hidden">
                        <div className="aspect-video bg-white/[0.02] relative flex items-center justify-center">
                          {msg.videoData.videoUrl ? (
                            <video
                              src={msg.videoData.videoUrl}
                              controls
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : msg.videoData.status === "generating" ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                              <span className="text-[11px] text-white/20">
                                {msg.id === activeStatusMsgIdRef.current ? stepLabel : "Generating..."}
                              </span>
                            </div>
                          ) : (
                            <Film className="w-8 h-8 text-white/[0.06]" />
                          )}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur rounded-full">
                            {msg.videoData.model === "kling_2.6" ? (
                              <Cpu className="w-3 h-3 text-white/60" />
                            ) : (
                              <Zap className="w-3 h-3 text-white/60" />
                            )}
                            <span className="text-[10px] font-medium text-white/60">
                              {modelLabels[msg.videoData.model] || msg.videoData.model}
                            </span>
                          </div>
                          {msg.videoData.status === "approved" && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-500/80 backdrop-blur rounded-full">
                              <Check className="w-3 h-3 text-white" />
                              <span className="text-[10px] font-semibold text-white">Approved</span>
                            </div>
                          )}
                          {msg.videoData.status === "failed" && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-red-500/80 backdrop-blur rounded-full">
                              <X className="w-3 h-3 text-white" />
                              <span className="text-[10px] font-semibold text-white">Failed</span>
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-3">
                          <div className="text-[13px] font-medium text-white/80 truncate">
                            {msg.videoData.title}
                          </div>
                        </div>
                      </div>

                      {/* Review Actions */}
                      {msg.videoData.status === "review" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleApprove(msg.id, msg.videoData!.videoId)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#050508] text-[13px] font-medium hover:bg-white/90 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleRegenerate(msg.id, msg.videoData!.videoId)}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.06] text-[13px] text-white/50 hover:bg-white/[0.03] transition-all"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />{" "}
                            Regenerate
                          </button>
                        </div>
                      )}

                      {/* Failed Actions */}
                      {msg.videoData.status === "failed" && (
                        <div className="mt-3 space-y-2">
                          {msg.videoData.error && (
                            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400/80">
                              {msg.videoData.error}
                            </div>
                          )}
                          <button
                            onClick={() => handleRetry(msg.id, msg.videoData!.videoId)}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />{" "}
                            Retry Generation
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Manual Input (always visible when in manual mode, or after workflow has submitted) */}
      {(showManualMode || (!showWorkflows && messages.length > 1)) && (
        <div className="flex-shrink-0 pt-4 border-t border-white/[0.04]">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleManualSend();
                  }
                }}
                placeholder="Describe what you want to create..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 pr-14 text-[14px] text-white/80 placeholder:text-white/15 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[48px] max-h-[120px]"
                rows={1}
                enterKeyHint="send"
              />
              <button
                onClick={handleManualSend}
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 bottom-2 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-10 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/15">
            <span className="flex items-center gap-1">
              {selectedModel === "kling_2.6" ? <Cpu className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              {modelLabels[selectedModel]}
            </span>
            <span>·</span>
            <span>Enter to send</span>
          </div>
        </div>
      )}

      {/* After workflow generation, show option to create another */}
      {!showWorkflows && !showManualMode && messages.length > 1 && !isGenerating && (
        <div className="flex-shrink-0 pt-4 border-t border-white/[0.04]">
          <button
            onClick={() => {
              setShowWorkflows(true);
              setShowManualMode(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.06] text-[13px] text-white/40 hover:text-white/60 hover:bg-white/[0.02] hover:border-white/[0.10] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Create another video
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page Wrapper ────────────────────────────────────────────────

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        </div>
      }
    >
      <GeneratePageInner />
    </Suspense>
  );
}

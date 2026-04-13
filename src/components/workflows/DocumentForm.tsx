"use client";

import { useState, useRef } from "react";
import { FileText, Upload, X, Loader2 } from "lucide-react";

export interface DocumentData {
  documentText: string;
  fileName: string;
  presentationStyle: "educational" | "pitch" | "summary";
}

interface DocumentFormProps {
  onSubmit: (data: DocumentData) => void;
  isGenerating: boolean;
}

const styleOptions = [
  { value: "educational", label: "Educational", description: "Teach and explain key points" },
  { value: "pitch", label: "Pitch", description: "Persuade and sell the content" },
  { value: "summary", label: "Summary", description: "Quick overview of highlights" },
] as const;

export function DocumentForm({ onSubmit, isGenerating }: DocumentFormProps) {
  const [documentText, setDocumentText] = useState("");
  const [fileName, setFileName] = useState("");
  const [presentationStyle, setPresentationStyle] = useState<DocumentData["presentationStyle"]>("educational");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!documentText.trim()) newErrors.documentText = "Document text is required. Upload a file or paste text manually.";
    if (documentText.length > 5000) newErrors.documentText = "Text must be 5000 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|pptx|txt)$/i)) {
      setErrors({ documentText: "Please upload a PDF, PPTX, or TXT file" });
      return;
    }

    setIsExtracting(true);
    setFileName(file.name);
    setErrors({});

    try {
      // For MVP: extract text from file
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        setDocumentText(text.substring(0, 5000));
      } else {
        // For PDF/PPTX, we set a placeholder prompt for now
        // In production, this would use a server-side extraction endpoint
        const text = await file.text().catch(() => "");
        if (text && text.length > 10) {
          setDocumentText(text.substring(0, 5000));
        } else {
          setDocumentText(
            `[Uploaded: ${file.name}] Please generate a presentation video based on this ${
              file.name.endsWith(".pdf") ? "PDF document" : "slide deck"
            }. Extract the key points and present them in a clear, engaging format.`
          );
        }
      }
    } catch {
      setErrors({ documentText: "Failed to read file. Try pasting the text manually." });
    } finally {
      setIsExtracting(false);
    }
  };

  const clearFile = () => {
    setFileName("");
    setDocumentText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!validate() || isGenerating) return;
    onSubmit({ documentText: documentText.trim(), fileName, presentationStyle });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* File Upload */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Upload Document
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        {!fileName ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="w-full flex flex-col items-center gap-3 px-5 py-8 rounded-xl border border-dashed border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all cursor-pointer"
          >
            {isExtracting ? (
              <Loader2 className="w-6 h-6 text-white/70 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white/70" />
            )}
            <div className="text-center">
              <p className="text-[13px] text-white/70">
                {isExtracting ? "Extracting text..." : "Click to upload"}
              </p>
              <p className="text-[11px] text-white/70 mt-1">PDF, PPTX, or TXT</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-white/70" />
              <span className="text-[13px] text-white/60 truncate max-w-[200px]">{fileName}</span>
            </div>
            <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
              <X className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        )}
      </div>

      {/* Document Text / Manual Paste */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Document Text {fileName ? "(extracted)" : "(or paste manually)"}
        </label>
        <textarea
          value={documentText}
          onChange={(e) => { setDocumentText(e.target.value); if (errors.documentText) setErrors({}); }}
          placeholder="Paste your document text, key points, or slides content here..."
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-white/80 placeholder:text-white/70 resize-none focus:outline-none focus:border-white/[0.12] transition-colors min-h-[120px]"
          rows={5}
        />
        {errors.documentText && (
          <p className="text-[11px] text-red-400/80 mt-1.5">{errors.documentText}</p>
        )}
        <p className="text-[11px] text-white/70 mt-1.5">
          {documentText.length}/5000 characters
        </p>
      </div>

      {/* Presentation Style */}
      <div>
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          Presentation Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {styleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPresentationStyle(opt.value)}
              className={`px-3 py-3 rounded-xl border text-left transition-all ${
                presentationStyle === opt.value
                  ? "border-white/[0.15] bg-white/[0.06]"
                  : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
              }`}
            >
              <div className={`text-[13px] font-medium ${presentationStyle === opt.value ? "text-white/80" : "text-white/70"}`}>
                {opt.label}
              </div>
              <div className="text-[10px] text-white/70 mt-0.5">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!documentText.trim() || isGenerating || isExtracting}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-[#050508] text-[14px] font-semibold hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
        ) : (
          <><FileText className="w-4 h-4" /> Generate Presentation Video</>
        )}
      </button>
    </div>
  );
}

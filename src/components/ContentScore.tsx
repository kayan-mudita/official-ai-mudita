"use client";

import { useMemo } from "react";
import {
  Zap,
  Eye as EyeIcon,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  script: string | null;
  model: string;
  status: string;
  contentType: string;
}

interface ContentScoreProps {
  video: VideoItem;
}

interface ScoreBreakdown {
  hookStrength: number;
  visualQuality: number;
  scriptClarity: number;
  trendAlignment: number;
  overall: number;
  recommendation: string;
}

// Content types that are considered higher trend alignment for real estate
const trendingFormats = ["market_update", "testimonial", "educational", "talking_head_15"];

// Industry-relevant keywords that boost scores
const engagingKeywords = [
  "secret", "mistake", "truth", "never", "always", "stop", "why",
  "how", "tip", "hack", "free", "new", "just listed", "sold",
  "market", "interest rate", "buyer", "seller", "investment",
];

function calculateScores(video: VideoItem): ScoreBreakdown {
  const script = video.script || "";
  const title = video.title || "";
  const description = video.description || "";
  const fullText = `${title} ${description} ${script}`.toLowerCase();

  // 1. Hook Strength (1-10)
  // Based on: title length, presence of power words, question marks, numbers
  let hookStrength = 5;
  if (title.length >= 10 && title.length <= 60) hookStrength += 1;
  if (title.includes("?") || title.includes("!")) hookStrength += 1;
  if (/\d/.test(title)) hookStrength += 1;
  const powerWordCount = engagingKeywords.filter((w) => fullText.includes(w)).length;
  hookStrength += Math.min(powerWordCount, 2);
  hookStrength = Math.min(Math.max(hookStrength, 1), 10);

  // 2. Visual Quality (1-10)
  // Based on: model choice, content type format
  let visualQuality = 6;
  if (video.model === "kling_2.6" || video.model === "kling_2_6") visualQuality += 2;
  if (video.model === "seedance_2.0" || video.model === "seedance_2_0") visualQuality += 1;
  if (video.contentType.includes("talking_head")) visualQuality += 1;
  if (video.contentType.includes("testimonial")) visualQuality += 1;
  visualQuality = Math.min(Math.max(visualQuality, 1), 10);

  // 3. Script Clarity (1-10)
  // Based on: script length, sentence structure, readability
  let scriptClarity = 4;
  if (script.length > 50) scriptClarity += 1;
  if (script.length > 150) scriptClarity += 1;
  if (script.length > 300) scriptClarity += 1;
  if (script.length < 2000) scriptClarity += 1; // Not too long
  const sentences = script.split(/[.!?]+/).filter(Boolean);
  if (sentences.length >= 3 && sentences.length <= 15) scriptClarity += 1;
  const avgSentenceLength = script.length / Math.max(sentences.length, 1);
  if (avgSentenceLength > 10 && avgSentenceLength < 80) scriptClarity += 1;
  scriptClarity = Math.min(Math.max(scriptClarity, 1), 10);

  // 4. Trend Alignment (1-10)
  // Based on: content type popularity, keyword relevance
  let trendAlignment = 5;
  if (trendingFormats.includes(video.contentType)) trendAlignment += 2;
  if (fullText.includes("market") || fullText.includes("rate")) trendAlignment += 1;
  if (fullText.includes("2024") || fullText.includes("2025") || fullText.includes("2026")) trendAlignment += 1;
  if (powerWordCount >= 3) trendAlignment += 1;
  trendAlignment = Math.min(Math.max(trendAlignment, 1), 10);

  // Overall Score
  const overall = Math.round(
    (hookStrength * 0.3 + visualQuality * 0.2 + scriptClarity * 0.3 + trendAlignment * 0.2) * 10
  ) / 10;

  // Recommendation
  let recommendation: string;
  if (overall >= 8) {
    recommendation = `Score: ${overall}/10 -- Post it! This content is strong and ready to publish.`;
  } else if (overall >= 6) {
    recommendation = `Score: ${overall}/10 -- Good to go. Consider tweaking the hook for even better results.`;
  } else if (overall >= 5) {
    recommendation = `Score: ${overall}/10 -- Decent, but could improve. Try adding power words to the title or expanding the script.`;
  } else {
    recommendation = `Score: ${overall}/10 -- Consider regenerating. The content may need a stronger hook and more detailed script.`;
  }

  return { hookStrength, visualQuality, scriptClarity, trendAlignment, overall, recommendation };
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 5) return "text-yellow-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 8) return "bg-green-500/10 border-green-500/20";
  if (score >= 5) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-red-500/10 border-red-500/20";
}

function getBarColor(score: number): string {
  if (score >= 8) return "bg-green-400";
  if (score >= 5) return "bg-yellow-400";
  return "bg-red-400";
}

function getOverallIcon(score: number) {
  if (score >= 8) return <CheckCircle2 className="w-5 h-5 text-green-400" />;
  if (score >= 5) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  return <XCircle className="w-5 h-5 text-red-400" />;
}

const scoreCategories = [
  { key: "hookStrength" as const, label: "Hook Strength", icon: Zap, description: "Power words, curiosity, stopping power" },
  { key: "visualQuality" as const, label: "Visual Quality", icon: EyeIcon, description: "Model choice, format optimization" },
  { key: "scriptClarity" as const, label: "Script Clarity", icon: FileText, description: "Length, structure, readability" },
  { key: "trendAlignment" as const, label: "Trend Alignment", icon: TrendingUp, description: "Format popularity, topic relevance" },
];

export default function ContentScore({ video }: ContentScoreProps) {
  const scores = useMemo(() => calculateScores(video), [video]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-white/60" />
        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
          Content Score
        </span>
      </div>

      {/* Overall Score Card */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${getScoreBg(scores.overall)}`}>
        {getOverallIcon(scores.overall)}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>
              {scores.overall}
            </span>
            <span className="text-sm text-white/60">/10</span>
          </div>
          <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
            {scores.recommendation}
          </p>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 gap-3">
        {scoreCategories.map((cat) => {
          const score = scores[cat.key];
          return (
            <div
              key={cat.key}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="flex items-center gap-2 mb-2">
                <cat.icon className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs font-medium text-white/70">{cat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <p className="text-[10px] text-white/70 mt-1.5">{cat.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

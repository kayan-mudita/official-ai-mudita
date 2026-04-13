"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  Eye,
  Clock,
  Flame,
  ArrowUpRight,
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  status: string;
  contentType: string;
  createdAt: string;
}

interface HourlyDataPoint {
  hour: number;
  views: number;
  likes: number;
  comments: number;
}

interface LiveTrackerProps {
  video: VideoItem;
  averageViews?: number;
}

// Simulated hourly performance data based on time since publishing
function generateSimulatedData(hoursElapsed: number): HourlyDataPoint[] {
  const points: HourlyDataPoint[] = [];
  const maxHours = Math.min(Math.floor(hoursElapsed), 24);

  for (let h = 1; h <= maxHours; h++) {
    // Realistic growth curve: fast initial growth, gradual plateau
    const growthFactor = 1 - Math.exp(-h * 0.3);
    const baseViews = Math.round(800 * growthFactor + Math.random() * 40);
    points.push({
      hour: h,
      views: baseViews,
      likes: Math.round(baseViews * 0.08 + Math.random() * 5),
      comments: Math.round(baseViews * 0.02 + Math.random() * 3),
    });
  }

  return points;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function LiveTracker({ video, averageViews = 350 }: LiveTrackerProps) {
  const [data, setData] = useState<HourlyDataPoint[]>([]);
  const [currentViews, setCurrentViews] = useState(0);
  const [isTrending, setIsTrending] = useState(false);

  useEffect(() => {
    const publishedAt = new Date(video.createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

    const simulated = generateSimulatedData(hoursElapsed);
    setData(simulated);

    if (simulated.length > 0) {
      const totalViews = simulated.reduce((sum, d) => sum + d.views, 0);
      setCurrentViews(totalViews);
      setIsTrending(totalViews > averageViews * 1.4);
    }
  }, [video.createdAt, averageViews]);

  const publishedAt = new Date(video.createdAt);
  const hoursAgo = Math.round((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60));
  const trendPercent = averageViews > 0
    ? Math.round(((currentViews - averageViews) / averageViews) * 100)
    : 0;

  // Build a simple sparkline bar chart
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-[15px] font-semibold text-white/90">Live Performance</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/70">
          <Clock className="w-3 h-3" />
          <span>{hoursAgo < 1 ? "Just now" : `${hoursAgo}h ago`}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Trending Alert */}
        {isTrending && trendPercent > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/[0.06] border border-orange-500/[0.12]">
            <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-300">
                This video is outperforming your average by {trendPercent}%
              </p>
              <p className="text-xs text-orange-300/50 mt-0.5">
                Trending above your typical engagement rate
              </p>
            </div>
          </div>
        )}

        {/* Video Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/85 truncate">{video.title}</p>
            <p className="text-xs text-white/70 capitalize">{video.contentType.replace(/_/g, " ")}</p>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <div className="text-lg font-bold text-white">{formatNumber(currentViews)}</div>
            <div className="text-[11px] text-white/70 mt-0.5">Views</div>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <div className="text-lg font-bold text-white">
              {formatNumber(data.reduce((s, d) => s + d.likes, 0))}
            </div>
            <div className="text-[11px] text-white/70 mt-0.5">Likes</div>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <div className="text-lg font-bold text-white">
              {formatNumber(data.reduce((s, d) => s + d.comments, 0))}
            </div>
            <div className="text-[11px] text-white/70 mt-0.5">Comments</div>
          </div>
        </div>

        {/* Hourly Breakdown Sparkline */}
        {data.length > 0 && (
          <div>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-3">
              Hourly Views
            </p>
            <div className="flex items-end gap-1 h-16">
              {data.slice(-12).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-blue-500/30 hover:bg-blue-500/50 transition-colors min-h-[2px]"
                    style={{ height: `${(d.views / maxViews) * 100}%` }}
                    title={`Hour ${d.hour}: ${d.views} views`}
                  />
                  <span className="text-[9px] text-white/70">{d.hour}h</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Summary */}
        {data.length >= 3 && (
          <div className="flex items-center gap-2 flex-wrap">
            {[data[0], data[Math.min(2, data.length - 1)], data[Math.min(5, data.length - 1)]].filter(Boolean).map((point, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.04]"
              >
                <Eye className="w-3 h-3 text-white/60" />
                <span className="text-[11px] text-white/70">
                  Hour {point.hour}: {formatNumber(point.views)} views
                </span>
                {i < 2 && <ArrowUpRight className="w-2.5 h-2.5 text-green-400/50" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

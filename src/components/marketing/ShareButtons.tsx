"use client";

import { Linkedin, Twitter } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-white/30 uppercase tracking-wider">Share</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-blue-400 hover:border-blue-400/20 transition-all"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-blue-400 hover:border-blue-400/20 transition-all"
        aria-label="Share on X"
      >
        <Twitter className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

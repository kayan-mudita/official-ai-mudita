"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  src: string;
  title?: string;
  audioSrc?: string;
  onClose: () => void;
}

export default function VideoModal({
  src,
  title,
  audioSrc,
  onClose,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) {
      handleClose();
    }
  }

  function handlePlay() {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
      audioRef.current.play().catch(() => {});
    }
  }

  function handlePause() {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }

  function handleSeeked() {
    if (audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center max-h-[90vh] max-w-[90vw]">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4 px-1">
          {title ? (
            <h2 className="text-sm font-medium text-white/70 truncate mr-4">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Video container -- 9:16 aspect ratio */}
        <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "9/16", maxHeight: "75vh" }}>
          <video
            ref={videoRef}
            src={src}
            controls
            autoPlay
            playsInline
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeeked}
            className="w-full h-full object-contain"
          />
        </div>

        {audioSrc && (
          <audio ref={audioRef} src={audioSrc} preload="auto" />
        )}
      </div>
    </div>
  );
}

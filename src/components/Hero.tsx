"use client";

import Link from "next/link";
import { Play, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="hero-glow bg-blue-500 top-1/4 -left-40" />
      <div className="hero-glow bg-purple-600 bottom-1/4 -right-40" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">
              Powered by Kling 2.6 &amp; Seedance 2.0
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          >
            Transform your{" "}
            <span className="gradient-text">social media</span> with AI video
            content
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Official AI creates weekly content using your face and voice,
            powered by{" "}
            <span className="text-white font-medium">Kling 2.6</span> and{" "}
            <span className="text-white font-medium">Seedance 2.0</span> — no
            filming or editing required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/signup" className="btn-primary gap-2 text-lg">
              Start your free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/demo" className="btn-secondary gap-2 text-lg">
              <Play className="w-5 h-5" />
              Watch the demo
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Consent-based content</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Videos in minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>No filming required</span>
            </div>
          </motion.div>
        </div>

        {/* Hero visual - Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden glass-card glow-effect p-1">
            <div className="rounded-xl bg-dark-900 overflow-hidden">
              {/* Mock dashboard header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="ml-4 flex-1 h-8 rounded-lg bg-white/5 max-w-md" />
              </div>
              {/* Mock dashboard content */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video preview cards */}
                {[
                  { title: "Weekly Market Update", model: "Kling 2.6", status: "Published", color: "from-blue-500/20 to-cyan-500/20" },
                  { title: "Client Testimonial", model: "Seedance 2.0", status: "Processing", color: "from-purple-500/20 to-pink-500/20" },
                  { title: "Property Showcase", model: "Kling 2.6", status: "Draft", color: "from-green-500/20 to-emerald-500/20" },
                ].map((video, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-white/5"
                  >
                    <div
                      className={`aspect-video bg-gradient-to-br ${video.color} flex items-center justify-center`}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="p-4 bg-dark-900">
                      <h4 className="font-semibold text-sm text-white">
                        {video.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {video.model}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            video.status === "Published"
                              ? "bg-green-500/10 text-green-400"
                              : video.status === "Processing"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {video.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Mail,
  User,
  Building2,
  Phone,
  Video,
} from "lucide-react";

const demoFeatures = [
  "See Kling 2.6 generate a video using your photo in real-time",
  "Watch Seedance 2.0 create dynamic social content",
  "Explore the full dashboard and content workflow",
  "Get a personalized content strategy for your industry",
  "Learn about pricing and plans",
];

const sampleVideos = [
  {
    title: "Real Estate Agent — Market Update",
    model: "Kling 2.6",
    duration: "0:45",
    color: "from-blue-500/30 to-cyan-500/30",
  },
  {
    title: "Attorney — Legal Tips Series",
    model: "Seedance 2.0",
    duration: "1:15",
    color: "from-purple-500/30 to-pink-500/30",
  },
  {
    title: "Doctor — Health Education",
    model: "Kling 2.6",
    duration: "0:55",
    color: "from-green-500/30 to-emerald-500/30",
  },
];

export default function DemoPage() {
  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Video className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              See it in action
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight mb-6"
          >
            Watch the <span className="gradient-text">demo</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            See how Official AI uses Kling 2.6 and Seedance 2.0 to create
            stunning video content from just a photo and voice recording.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Video showcase */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Main demo video */}
            <div className="glass-card overflow-hidden mb-8 glow-effect">
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-dark-950/30" />
                <button className="relative w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform group">
                  <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </button>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-medium text-white">
                    Full Platform Demo — 3:24
                  </span>
                </div>
              </div>
            </div>

            {/* Sample videos */}
            <h3 className="text-lg font-bold mb-4">Sample Generated Videos</h3>
            <div className="grid grid-cols-3 gap-3">
              {sampleVideos.map((video, i) => (
                <div
                  key={i}
                  className="glass-card overflow-hidden cursor-pointer group"
                >
                  <div
                    className={`aspect-video bg-gradient-to-br ${video.color} flex items-center justify-center relative`}
                  >
                    <Play className="w-6 h-6 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] font-medium text-white bg-black/60 px-1.5 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-semibold text-white truncate">
                      {video.title}
                    </div>
                    <div className="text-[10px] text-gray-500">{video.model}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* What you'll see */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">
                What you&apos;ll see in the demo
              </h3>
              <ul className="space-y-3">
                {demoFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right - Booking form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass-card p-8 sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-2xl font-bold">Book a live demo</h2>
              </div>
              <p className="text-gray-400 mb-8">
                Get a personalized walkthrough of Official AI with one of our
                team members. We&apos;ll show you exactly how it works for your
                industry.
              </p>

              <form
                className="space-y-5"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company / Practice
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Your company name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors text-sm appearance-none">
                    <option value="" className="bg-dark-900">
                      Select your industry
                    </option>
                    <option value="real-estate" className="bg-dark-900">
                      Real Estate
                    </option>
                    <option value="legal" className="bg-dark-900">
                      Legal / Attorney
                    </option>
                    <option value="medical" className="bg-dark-900">
                      Medical / Healthcare
                    </option>
                    <option value="creator" className="bg-dark-900">
                      Content Creator
                    </option>
                    <option value="other" className="bg-dark-900">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    What are you most interested in?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your content goals..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary w-full gap-2">
                  Book my demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-4">
                Free 30-minute session &middot; No commitment required
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

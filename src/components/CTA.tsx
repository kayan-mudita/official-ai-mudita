"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute inset-0 glass-card" />

          {/* Glow effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[150px] opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[150px] opacity-10" />

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">
                Start creating today
              </span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
              Ready to scale{" "}
              <span className="gradient-text">your brand?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join thousands of professionals who are transforming their social
              media presence with AI-powered video content. Start your free
              trial today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary gap-2 text-lg">
                Start your free trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="btn-secondary gap-2 text-lg">
                Book a demo
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required &middot; Free 14-day trial &middot; Cancel
              anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  "AI video content powered by Kling 2.6 & Seedance 2.0",
  "Weekly personalized video content",
  "Automated social media scheduling",
  "Consent-based content control",
  "14-day free trial, no credit card required",
];

export default function SignupPage() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="absolute inset-0 mesh-gradient" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12">
        {/* Left - Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              Official <span className="gradient-text">AI</span>
            </span>
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Start creating{" "}
            <span className="gradient-text">amazing content</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Join thousands of professionals using AI to transform their social
            media presence. Get started with a free 14-day trial.
          </p>

          <ul className="space-y-4">
            {features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right - Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">Create your account</h2>

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
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry
                </label>
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors appearance-none">
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
                    Other Professional
                  </option>
                </select>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-1 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button type="submit" className="btn-primary w-full gap-2">
                Start your free trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-4">
              No credit card required &middot; Cancel anytime
            </p>
          </div>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

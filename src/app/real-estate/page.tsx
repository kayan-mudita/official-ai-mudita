"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ArrowRight,
  Play,
  TrendingUp,
  Users,
  Clock,
  Star,
  MapPin,
  Camera,
  BarChart3,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    title: "Property Showcase Videos",
    description:
      "Turn static listings into engaging walkthrough-style videos featuring your voice and face, generated automatically by Kling 2.6.",
  },
  {
    icon: BarChart3,
    title: "Market Update Content",
    description:
      "Weekly hyper-local market reports delivered as professional video content. Stay top-of-mind as the neighborhood expert.",
  },
  {
    icon: MessageSquare,
    title: "Google Review Videos",
    description:
      "Transform your best client reviews into compelling video testimonials powered by Seedance 2.0's dynamic visuals.",
  },
  {
    icon: Camera,
    title: "Personal Brand Videos",
    description:
      "Introduce yourself, share tips, and build trust with authentic video content — all without picking up a camera.",
  },
];

const stats = [
  { value: "3x", label: "More listing inquiries" },
  { value: "67%", label: "More profile views" },
  { value: "5x", label: "Social engagement increase" },
  { value: "15hrs", label: "Saved per week" },
];

const testimonials = [
  {
    name: "Ryan Rockwell",
    role: "Broker, Rockwell Realty Group",
    quote: "Official AI has completely changed how I market my listings. I went from posting once a month to having professional video content every single week. My engagement is through the roof.",
    initials: "RR",
  },
  {
    name: "Amanda Peters",
    role: "Agent, Keller Williams",
    quote: "The AI-generated property videos look incredibly professional. Clients are shocked when I tell them these were made with AI. It's like having my own production studio.",
    initials: "AP",
  },
];

export default function RealEstatePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="hero-glow bg-blue-500 top-1/4 -left-40" />
        <div className="hero-glow bg-cyan-600 bottom-1/4 -right-40" />

        <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
            >
              <Home className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                For Real Estate Professionals
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8"
            >
              Become the{" "}
              <span className="gradient-text">go-to agent</span> in your
              market
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            >
              AI-powered video content featuring your face and voice. Showcase
              listings, share market insights, and build your personal brand —
              without filming a single video.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup" className="btn-primary gap-2 text-lg">
                Start your free trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="btn-secondary gap-2 text-lg">
                <Play className="w-5 h-5" />
                Watch showreel
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              Everything a top agent{" "}
              <span className="gradient-text">needs</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              From property showcases to personal branding, we handle your
              entire video content strategy.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 hover:border-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5">
                  <benefit.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for agents */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              How it works for{" "}
              <span className="gradient-text">agents</span>
            </motion.h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { step: "1", title: "Upload your headshot and record a voice sample", desc: "Takes less than 5 minutes to set up your profile" },
              { step: "2", title: "Tell us about your market and specialties", desc: "We tailor content to your local area and expertise" },
              { step: "3", title: "Review and approve weekly content", desc: "Kling 2.6 & Seedance 2.0 generate professional videos" },
              { step: "4", title: "Content auto-publishes to your channels", desc: "Automated scheduling across all your social platforms" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start glass-card p-6"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed text-lg mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[150px] opacity-10" />
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 relative z-10">
              Ready to dominate <span className="gradient-text">your market?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 relative z-10">
              Join hundreds of real estate professionals already using Official AI
              to grow their brand and close more deals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/signup" className="btn-primary gap-2">
                Start your free trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="btn-secondary gap-2">
                Book a demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

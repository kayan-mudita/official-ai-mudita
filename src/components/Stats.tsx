"use client";

import { motion } from "framer-motion";
import { TrendingUp, Eye, Heart, Share2 } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "90%",
    label: "Faster video production",
    description: "Compared to traditional filming",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Eye,
    value: "60x",
    label: "Increase in views",
    description: "Average across all clients",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Heart,
    value: "10x",
    label: "Increase in likes",
    description: "Engagement growth metric",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Share2,
    value: "8x",
    label: "Increase in shares",
    description: "Viral content multiplier",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
];

export default function Stats() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

      <div className="container-max relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4 block"
          >
            Case Studies
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Results that{" "}
            <span className="gradient-text">speak volumes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Real numbers from real professionals who transformed their social
            presence with Official AI.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 text-center hover:border-white/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mx-auto mb-5`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-4xl sm:text-5xl font-bold mb-2 gradient-text">
                {stat.value}
              </div>
              <div className="text-white font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

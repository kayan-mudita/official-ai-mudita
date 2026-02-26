"use client";

import { motion } from "framer-motion";
import {
  User,
  CalendarDays,
  MessageSquare,
  Shield,
  Brain,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: User,
    title: "Authentic Personal Presence",
    description:
      "Every video features your actual face, voice, and personality. Viewers connect with the real you — not a generic avatar.",
  },
  {
    icon: CalendarDays,
    title: "Weekly Social Media Content",
    description:
      "Fresh video content delivered every week, optimized for each platform. Stay consistently visible without the daily grind.",
  },
  {
    icon: MessageSquare,
    title: "Google Review Videos",
    description:
      "Automatically transform your best Google reviews into compelling video testimonials. Let your satisfied clients sell for you.",
  },
  {
    icon: Shield,
    title: "Consent-Based Control",
    description:
      "Nothing publishes without your explicit approval. Review every piece of content before it goes live — you always have the final say.",
  },
  {
    icon: Brain,
    title: "Brand Voice Learning",
    description:
      "Our AI learns your unique communication style over time. The more you use it, the more your content sounds authentically you.",
  },
  {
    icon: Clock,
    title: "Automated Scheduling",
    description:
      "Set it and forget it. Content is automatically scheduled and posted at optimal times across all your connected social channels.",
  },
];

export default function Features() {
  return (
    <section className="section-padding relative" id="features">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-green-400 mb-4 block"
          >
            Why Official AI Is Different
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Everything you need to{" "}
            <span className="gradient-text">scale your brand</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Official AI plans, creates, and schedules on-brand content using
            your real voice and likeness, so you stay visible without turning
            content into a second job.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-7 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors">
                <feature.icon className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

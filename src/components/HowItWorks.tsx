"use client";

import { Camera, Mic, Video, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Camera,
    number: "01",
    title: "Choose a photo",
    description:
      "Upload a professional photo of yourself. Our AI uses this as the foundation to create lifelike video content that looks exactly like you.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Mic,
    number: "02",
    title: "Record your voice",
    description:
      "Record a short voice sample narrating your content. Our AI learns your unique vocal patterns, tone, and speaking style for authentic delivery.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Video,
    number: "03",
    title: "Turn it into video",
    description:
      "Kling 2.6 and Seedance 2.0 combine your photo and voice to generate stunning, natural-looking video content ready for social media.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding relative" id="how-it-works">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-4 block"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Create content{" "}
            <span className="gradient-text">in seconds</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 leading-relaxed"
          >
            Three simple steps to transform your personal brand. No cameras, no
            editing software, no production team needed.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-white/10 to-transparent" />
                  <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-white/10" />
                </div>
              )}

              <div className="glass-card p-8 h-full hover:border-white/10 transition-all duration-300 group-hover:-translate-y-1">
                {/* Step number */}
                <span className="text-6xl font-black text-white/[0.03] absolute top-4 right-6">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${step.bgColor} flex items-center justify-center mb-6`}
                >
                  <step.icon
                    className={`w-7 h-7 bg-gradient-to-r ${step.color} bg-clip-text`}
                    style={{ color: "rgb(96, 165, 250)" }}
                  />
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

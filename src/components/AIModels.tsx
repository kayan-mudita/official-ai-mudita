"use client";

import { motion } from "framer-motion";
import { Cpu, Wand2, Layers, Sparkles, Film, Palette } from "lucide-react";

const models = [
  {
    name: "Kling 2.6",
    tagline: "Hyper-Realistic Video Generation",
    description:
      "Industry-leading AI model for generating photorealistic video content. Creates natural human movements, accurate lip-sync, and lifelike facial expressions that are virtually indistinguishable from real footage.",
    features: [
      {
        icon: Film,
        title: "Photorealistic Output",
        text: "4K resolution with natural lighting and skin tones",
      },
      {
        icon: Cpu,
        title: "Advanced Lip-Sync",
        text: "Frame-perfect synchronization with voice recordings",
      },
      {
        icon: Layers,
        title: "Motion Fidelity",
        text: "Natural gestures, expressions, and body language",
      },
    ],
    color: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500",
  },
  {
    name: "Seedance 2.0",
    tagline: "Creative & Dynamic Content",
    description:
      "Next-generation model for producing dynamic, stylized video content. Excels at creating engaging social media videos with creative transitions, effects, and compelling visual storytelling.",
    features: [
      {
        icon: Wand2,
        title: "Creative Styles",
        text: "Multiple visual styles from cinematic to social-native",
      },
      {
        icon: Sparkles,
        title: "Dynamic Effects",
        text: "AI-powered transitions, text overlays, and effects",
      },
      {
        icon: Palette,
        title: "Brand Consistency",
        text: "Maintains your visual identity across all content",
      },
    ],
    color: "from-purple-500 to-pink-500",
    bgGlow: "bg-purple-500",
  },
];

export default function AIModels() {
  return (
    <section className="section-padding relative overflow-hidden" id="models">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />

      <div className="container-max relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-4 block"
          >
            Our Technology
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Powered by{" "}
            <span className="gradient-text">cutting-edge AI</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            We combine two state-of-the-art AI models to deliver unmatched video
            quality and creative versatility.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {models.map((model, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              {/* Glow */}
              <div
                className={`absolute -inset-1 ${model.bgGlow} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`}
              />

              <div className="relative glass-card p-8 lg:p-10 h-full hover:border-white/10 transition-all duration-300">
                {/* Model badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${model.color} bg-opacity-10 mb-6`}
                  style={{
                    background: `linear-gradient(135deg, rgba(${
                      index === 0 ? "59,130,246" : "168,85,247"
                    }, 0.15), rgba(${
                      index === 0 ? "6,182,212" : "236,72,153"
                    }, 0.15))`,
                  }}
                >
                  <Cpu className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {model.name}
                  </span>
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold mb-3">
                  {model.tagline}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-8">
                  {model.description}
                </p>

                {/* Features */}
                <div className="space-y-5">
                  {model.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-500">{feature.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

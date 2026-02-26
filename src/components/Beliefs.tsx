"use client";

import { motion } from "framer-motion";
import { Heart, Shield, Lightbulb, Users } from "lucide-react";

const beliefs = [
  {
    icon: Heart,
    title: "Authenticity First",
    description:
      "Your content should look, sound, and feel like you. We never create generic or template-based content — every video is uniquely yours.",
  },
  {
    icon: Shield,
    title: "Ethical AI Always",
    description:
      "We believe AI should empower, not deceive. All content is consent-based, clearly identified, and used only as you authorize.",
  },
  {
    icon: Lightbulb,
    title: "Accessibility for All",
    description:
      "Professional video content shouldn't require a production team or five-figure budget. We make high-quality content creation accessible to everyone.",
  },
  {
    icon: Users,
    title: "Relationships Matter",
    description:
      "Social media is about building real connections. Our AI helps you show up consistently so you can focus on what matters — serving your clients.",
  },
];

export default function Beliefs() {
  return (
    <section className="section-padding relative">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold tracking-widest uppercase text-emerald-400 mb-4 block"
            >
              Our Philosophy
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            >
              What we <span className="gradient-text">believe</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 leading-relaxed"
            >
              Official AI was built on the principle that everyone deserves a
              powerful personal brand. We combine cutting-edge AI technology
              with a deep commitment to authenticity, ethics, and your success.
            </motion.p>
          </div>

          {/* Right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {beliefs.map((belief, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-white/10 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <belief.icon className="w-5 h-5 text-gray-300" />
                </div>
                <h3 className="font-bold mb-2">{belief.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {belief.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

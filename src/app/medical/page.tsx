"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  ArrowRight,
  Play,
  Star,
  Heart,
  Brain,
  ClipboardList,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Health Education Videos",
    description:
      "Create engaging, medically-accurate educational content that helps patients understand conditions, treatments, and preventive care.",
  },
  {
    icon: Brain,
    title: "Procedure Explainers",
    description:
      "Walk patients through what to expect with AI-generated videos featuring your reassuring face and voice, powered by Kling 2.6.",
  },
  {
    icon: ClipboardList,
    title: "Wellness Tips Series",
    description:
      "Automated weekly health tips tailored to your specialty. Seedance 2.0 creates visually engaging content that patients love to share.",
  },
  {
    icon: Users,
    title: "Patient Testimonials",
    description:
      "Transform positive reviews into compelling video testimonials that build trust and attract new patients to your practice.",
  },
];

const stats = [
  { value: "4x", label: "More patient engagement" },
  { value: "85%", label: "Patient satisfaction increase" },
  { value: "3x", label: "New patient inquiries" },
  { value: "10hrs", label: "Saved per week" },
];

export default function MedicalPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="hero-glow bg-green-500 top-1/4 -left-40" />
        <div className="hero-glow bg-emerald-600 bottom-1/4 -right-40" />

        <div className="container-max relative z-10 px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-8"
            >
              <Stethoscope className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                For Medical Professionals
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8"
            >
              Educate patients,{" "}
              <span className="gradient-text">grow your practice</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            >
              Professional health education videos featuring your expertise.
              Build patient trust and grow your practice with AI-powered content.
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
                Watch demo
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
              Healthcare content that{" "}
              <span className="gradient-text">heals</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400"
            >
              Educate, inform, and build trust with professional video content
              tailored for healthcare.
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
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-5">
                  <benefit.icon className="w-6 h-6 text-green-400" />
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

      {/* CTA */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full filter blur-[150px] opacity-10" />
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 relative z-10">
              Ready to grow your{" "}
              <span className="gradient-text">practice?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 relative z-10">
              Join medical professionals who are using AI to educate patients and
              build their practice.
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

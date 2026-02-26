"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Scale,
  Stethoscope,
  Users,
  ArrowRight,
} from "lucide-react";

const industries = [
  {
    icon: Home,
    title: "Real Estate Agents",
    description:
      "Showcase properties, share market updates, and build trust with personalized video content that positions you as the local expert.",
    link: "/real-estate",
    stats: "3x more listing inquiries",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Scale,
    title: "Attorneys",
    description:
      "Educate potential clients, demonstrate expertise, and build your reputation with professional legal content that converts viewers into consultations.",
    link: "/attorneys",
    stats: "5x more consultations",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Stethoscope,
    title: "Medical Professionals",
    description:
      "Share health tips, explain procedures, and establish thought leadership with educational video content that patients trust and share.",
    link: "/medical",
    stats: "4x more patient engagement",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Users,
    title: "Professionals & Creators",
    description:
      "Scale your personal brand across every platform. From coaches to consultants, create authentic content that grows your audience and authority.",
    link: "/signup",
    stats: "10x social media growth",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function Industries() {
  return (
    <section className="section-padding relative" id="industries">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-orange-400 mb-4 block"
          >
            Industries
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Who is Official AI{" "}
            <span className="gradient-text">for?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Purpose-built for professionals who need to stay visible but
            don&apos;t have time for content creation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={industry.link} className="block group">
                <div className="glass-card p-8 h-full hover:border-white/10 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${industry.bgColor} flex items-center justify-center`}
                    >
                      <industry.icon className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{industry.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    {industry.description}
                  </p>
                  <span
                    className={`inline-block text-sm font-semibold bg-gradient-to-r ${industry.color} bg-clip-text text-transparent`}
                  >
                    {industry.stats}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

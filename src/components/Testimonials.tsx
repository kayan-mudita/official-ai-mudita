"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ryan Rockwell",
    role: "Real Estate Agent",
    company: "Rockwell Realty Group",
    quote:
      "It's like having a marketing team in my pocket. Official AI saves me thousands of dollars and hours every week. The Kling 2.6 generated videos are indistinguishable from real footage.",
    rating: 5,
    initials: "RR",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sarah Chen",
    role: "Attorney",
    company: "Chen & Associates",
    quote:
      "I was skeptical at first, but the video quality from Seedance 2.0 is remarkable. My social media engagement has increased 10x and I'm getting new clients directly from my content.",
    rating: 5,
    initials: "SC",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Dr. Marcus Williams",
    role: "Medical Professional",
    company: "Williams Health Clinic",
    quote:
      "As a doctor, I never had time for content creation. Now Official AI produces professional educational videos using my voice and likeness. My patients love it.",
    rating: 5,
    initials: "MW",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Jessica Torres",
    role: "Content Creator",
    company: "Torres Digital",
    quote:
      "The combination of Kling 2.6 for realistic motion and Seedance 2.0 for creative styles gives me versatility no other platform can match. Absolute game changer.",
    rating: 5,
    initials: "JT",
    color: "from-orange-500 to-red-500",
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding relative" id="testimonials">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-cyan-400 mb-4 block"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            What our <span className="gradient-text">clients say</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Hear from professionals who have transformed their social media
            presence with Official AI.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 hover:border-white/10 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-white/10 mb-4" />
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role} &middot; {testimonial.company}
                  </div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
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

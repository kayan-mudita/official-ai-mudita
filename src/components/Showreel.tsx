"use client";

import { motion } from "framer-motion";
import { Play, Video } from "lucide-react";

const showcase = [
  {
    title: "Real Estate Market Update",
    category: "Real Estate",
    model: "Kling 2.6",
    duration: "0:45",
    color: "from-blue-600/30 to-cyan-600/30",
  },
  {
    title: "Legal Rights Explained",
    category: "Attorney",
    model: "Seedance 2.0",
    duration: "1:20",
    color: "from-purple-600/30 to-pink-600/30",
  },
  {
    title: "Health Tips Weekly",
    category: "Medical",
    model: "Kling 2.6",
    duration: "0:58",
    color: "from-green-600/30 to-emerald-600/30",
  },
  {
    title: "Client Success Story",
    category: "Testimonial",
    model: "Seedance 2.0",
    duration: "1:05",
    color: "from-orange-600/30 to-red-600/30",
  },
  {
    title: "Property Virtual Tour",
    category: "Real Estate",
    model: "Kling 2.6",
    duration: "2:15",
    color: "from-indigo-600/30 to-blue-600/30",
  },
  {
    title: "Brand Introduction",
    category: "Creator",
    model: "Seedance 2.0",
    duration: "0:30",
    color: "from-pink-600/30 to-rose-600/30",
  },
];

export default function Showreel() {
  return (
    <section className="section-padding relative" id="showreel">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-pink-400 mb-4 block"
          >
            Showreel
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            What our clients have{" "}
            <span className="gradient-text">created</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Real examples of AI-generated video content created by professionals
            using Official AI.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcase.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group cursor-pointer"
            >
              <div className="glass-card overflow-hidden hover:border-white/10 transition-all duration-300 group-hover:-translate-y-1">
                {/* Video thumbnail */}
                <div
                  className={`aspect-video bg-gradient-to-br ${item.color} relative flex items-center justify-center`}
                >
                  <div className="absolute inset-0 bg-dark-950/20" />
                  <div className="relative w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white">
                    {item.duration}
                  </div>

                  {/* Model badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                    <Video className="w-3 h-3 text-white" />
                    <span className="text-xs font-medium text-white">
                      {item.model}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <span className="text-sm text-gray-500">{item.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

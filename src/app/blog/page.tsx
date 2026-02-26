"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Tag } from "lucide-react";

const posts = [
  {
    title: "How Kling 2.6 Is Revolutionizing AI Video Generation",
    excerpt:
      "Explore the breakthrough capabilities of Kling 2.6, the AI model delivering photorealistic video content that's transforming personal branding.",
    category: "Technology",
    date: "Feb 20, 2026",
    readTime: "5 min read",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Seedance 2.0: The Future of Creative AI Video",
    excerpt:
      "Discover how Seedance 2.0 combines dynamic effects, creative styles, and brand consistency to produce scroll-stopping social media content.",
    category: "Technology",
    date: "Feb 15, 2026",
    readTime: "7 min read",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Why Real Estate Agents Are Switching to AI Video Marketing",
    excerpt:
      "A deep dive into how top-performing agents are using AI-generated video content to dominate their local markets and close more deals.",
    category: "Real Estate",
    date: "Feb 10, 2026",
    readTime: "6 min read",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "The Ethics of AI Video: Our Consent-First Approach",
    excerpt:
      "How Official AI ensures ethical AI use with consent-based content creation, user ownership, and transparent AI practices.",
    category: "Ethics",
    date: "Feb 5, 2026",
    readTime: "4 min read",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    title: "5 Ways Attorneys Can Leverage Video Content for Client Acquisition",
    excerpt:
      "Practical strategies for legal professionals looking to use AI video content to attract more clients and build their practice.",
    category: "Attorneys",
    date: "Jan 30, 2026",
    readTime: "8 min read",
    color: "from-indigo-500/20 to-blue-500/20",
  },
  {
    title: "From 0 to 60x Views: A Real Estate Case Study",
    excerpt:
      "How one real estate agent transformed their social media presence using Official AI, going from zero video content to viral engagement.",
    category: "Case Study",
    date: "Jan 25, 2026",
    readTime: "6 min read",
    color: "from-pink-500/20 to-rose-500/20",
  },
];

export default function BlogPage() {
  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight mb-6"
          >
            The Official AI <span className="gradient-text">Blog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Insights, tutorials, and case studies on AI video generation,
            personal branding, and growing your business.
          </motion.p>
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group cursor-pointer"
            >
              <div className="glass-card overflow-hidden hover:border-white/10 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">
                {/* Thumbnail */}
                <div
                  className={`aspect-[16/9] bg-gradient-to-br ${post.color}`}
                />

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-300">
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-card p-12 text-center max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-3">Stay in the loop</h3>
          <p className="text-gray-400 mb-6">
            Get the latest AI video insights delivered to your inbox weekly.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button type="submit" className="btn-primary !py-3 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

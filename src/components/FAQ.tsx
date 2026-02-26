"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does Official AI keep my data and content safe?",
    answer:
      "Your data is encrypted end-to-end and stored securely. We never share your photos, voice recordings, or generated content with third parties. You retain full ownership of all content created on the platform, and we comply with GDPR, CCPA, and other data protection regulations.",
  },
  {
    question: "Is this ethical? How do you ensure responsible AI use?",
    answer:
      "Absolutely. Official AI operates on a strict consent-based model. Nothing is ever published without your explicit approval. We use your likeness and voice only as authorized, and all generated content is watermarked for transparency. Our AI models (Kling 2.6 and Seedance 2.0) are deployed with comprehensive safeguards against misuse.",
  },
  {
    question: "How quickly will I see ROI from using Official AI?",
    answer:
      "Most clients see measurable engagement increases within the first 2-4 weeks. On average, our users experience a 60x increase in video views, 10x increase in likes, and 8x increase in shares. The time you save alone — typically 10-15 hours per week — delivers immediate value.",
  },
  {
    question: "What does Official AI cost?",
    answer:
      "We offer flexible plans starting with a free trial so you can experience the platform risk-free. Our pricing scales based on the volume of content and features you need. Book a demo to get a personalized quote based on your specific requirements.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "You can have your first AI-generated video within minutes of signing up. Meaningful audience growth typically begins within 2-3 weeks of consistent posting. Our automated scheduling ensures your content goes out at optimal times for maximum reach.",
  },
  {
    question: "What are the technical requirements?",
    answer:
      "All you need is a smartphone or computer with a camera and microphone. Upload a high-quality photo and record a short voice sample — our AI handles everything else. No special equipment, software, or technical skills required.",
  },
  {
    question: "How does this help build real relationships with clients?",
    answer:
      "By consistently showing up on social media with authentic video content featuring your real face and voice, you build trust and familiarity with your audience. People feel like they know you before they ever meet you, leading to warmer leads and stronger client relationships.",
  },
  {
    question: "Will the AI voice actually sound like me?",
    answer:
      "Yes. Our AI models are specifically trained to replicate your unique vocal characteristics — your tone, pacing, inflection, and speaking style. The more voice samples you provide, the more authentic the output becomes. Most viewers cannot distinguish AI-generated audio from real recordings.",
  },
  {
    question: "How much time do I need to invest?",
    answer:
      "The initial setup takes about 15 minutes — upload a photo and record a few voice samples. After that, you'll spend approximately 5 minutes per week reviewing and approving content. Compare that to the 10-15+ hours traditional content creation requires.",
  },
  {
    question: "Can I approve content before it's published?",
    answer:
      "Absolutely. Official AI is built on a consent-first model. Every piece of content goes through your approval queue before it can be published or scheduled. You have full editorial control and can request adjustments to any video before it goes live.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding relative" id="faq">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-4 block"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Everything you need to know about Official AI and how it can
            transform your content strategy.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-white/5"
            >
              <button
                className="w-full flex items-center justify-between py-6 text-left group"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <span className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-400 leading-relaxed pb-6">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

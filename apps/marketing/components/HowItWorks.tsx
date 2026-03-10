"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    emoji: "🌿",
    title: "Tell us about your family",
    body: "A quick 2-minute setup. Children's ages, what they love, your outdoor space. That's it — The Hedge does the rest.",
    color: "#C8DFC9",
    accent: "#2C4A2E",
  },
  {
    number: "02",
    emoji: "⛅",
    title: "We check the weather for you",
    body: "Every morning, The Hedge looks at your local forecast and picks activities that actually make sense. Sunny? Outdoor adventures. Raining? Kitchen science and cosy crafts.",
    color: "#EDE8DD",
    accent: "#8B6B4A",
  },
  {
    number: "03",
    emoji: "✨",
    title: "Get your today's spraoi",
    body: "Three to five personalised activity cards, ready before you've had your tea. Each one has full instructions, a materials list (mostly household stuff), and how long it takes.",
    color: "#C8DFC9",
    accent: "#4A7C4E",
  },
  {
    number: "04",
    emoji: "📸",
    title: "Log it, treasure it",
    body: "One tap when you're done. Add a photo if you like. It builds your family timeline — and for homeschool families, it's building your Tusla portfolio automatically.",
    color: "#EDE8DD",
    accent: "#5C7A3E",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-28 bg-[#F9F5EE] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8DFC9] to-transparent" />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-[#4A7C4E] text-sm uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "var(--font-dm)" }}>
            As easy as it gets
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2C4A2E] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            How The Hedge works
          </h2>
          <p className="text-lg text-[#5C4A35] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-lora)" }}>
            From your first morning to your hundredth adventure — it gets better the more you use it.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="relative card-hover"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 h-px bg-[#C8DFC9] z-10" style={{ left: "calc(100% + 0px)", width: "24px" }} />
              )}

              <div
                className="rounded-3xl p-7 h-full"
                style={{ backgroundColor: step.color }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{step.emoji}</span>
                  <span
                    className="text-5xl font-bold opacity-15 leading-none"
                    style={{ fontFamily: "var(--font-playfair)", color: step.accent }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold mb-3 leading-snug"
                  style={{ fontFamily: "var(--font-playfair)", color: step.accent }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5C4A35]" style={{ fontFamily: "var(--font-dm)" }}>
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-[#2C4A2E] text-[#F9F5EE] px-8 py-4 rounded-full font-semibold hover:bg-[#4A7C4E] transition-colors shadow-lg"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Get started — it's free
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

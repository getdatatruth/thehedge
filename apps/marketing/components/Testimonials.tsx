"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote: "I used to spend 20 minutes every Saturday morning on Pinterest looking for ideas. Now The Hedge just tells me what to do and I actually enjoy the weekend.",
    name: "Sarah M.",
    role: "Mam of two, Cork",
    emoji: "👩",
    stars: 5,
    tag: "Family plan",
    color: "#C8DFC9",
  },
  {
    quote: "We've been homeschooling for 3 years and this is the first tool that actually understands what we need. The Tusla portfolio alone is worth every cent of the Educator plan.",
    name: "Fionnuala O'B.",
    role: "Homeschooling mam of 3, Galway",
    emoji: "👩‍👧‍👦",
    stars: 5,
    tag: "Educator plan",
    color: "#EDE8DD",
  },
  {
    quote: "My 7-year-old now asks me every morning what The Hedge has for us today. That's the best review I can give.",
    name: "Declan F.",
    role: "Dad of one, Dublin",
    emoji: "👨",
    stars: 5,
    tag: "Family plan",
    color: "#C8DFC9",
  },
  {
    quote: "The Irish language games are brilliant. My kids think they're playing. I know they're actually learning Irish. Grand.",
    name: "Áine C.",
    role: "Mam of two, Waterford",
    emoji: "👩",
    stars: 5,
    tag: "Free plan",
    color: "#EDE8DD",
  },
  {
    quote: "I pulled my son from school in January. By March, The Hedge had us on a proper rhythm. I can't imagine doing this without it.",
    name: "Orla K.",
    role: "Homeschooling mam, Limerick",
    emoji: "👩‍💼",
    stars: 5,
    tag: "Educator plan",
    color: "#C8DFC9",
  },
  {
    quote: "The weekend planner feature is class. Thursday evening, I know exactly what we're doing Saturday and Sunday. The weather is already factored in.",
    name: "Páraic B.",
    role: "Dad of three, Tipperary",
    emoji: "👨‍👧‍👦",
    stars: 5,
    tag: "Family plan",
    color: "#EDE8DD",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 bg-[#F9F5EE] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8DFC9] to-transparent" />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-[#4A7C4E] text-sm uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "var(--font-dm)" }}>
            What Irish families are saying
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2C4A2E] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            They said it better than we could
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-2xl p-6 card-hover"
              style={{ backgroundColor: t.color }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array(t.stars).fill(0).map((_, j) => (
                  <span key={j} className="text-[#C8962A] text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#3D2B1F] text-[15px] leading-relaxed mb-6 italic" style={{ fontFamily: "var(--font-lora)" }}>
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
                    {t.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C4A2E] text-sm" style={{ fontFamily: "var(--font-dm)" }}>{t.name}</p>
                    <p className="text-xs text-[#5C4A35]" style={{ fontFamily: "var(--font-dm)" }}>{t.role}</p>
                  </div>
                </div>
                <span className="text-xs bg-[#2C4A2E]/10 text-[#2C4A2E] px-3 py-1 rounded-full" style={{ fontFamily: "var(--font-dm)" }}>
                  {t.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

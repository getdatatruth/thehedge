"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const categories = [
  { emoji: "🌿", name: "Nature & Outdoor", count: 48, desc: "Seasonal walks, wildlife, den-building, stargazing" },
  { emoji: "🔬", name: "Science & Discovery", count: 36, desc: "Kitchen chemistry, engineering, biology experiments" },
  { emoji: "🎨", name: "Art & Creativity", count: 42, desc: "Drawing, painting, storytelling, music and drama" },
  { emoji: "🍳", name: "Kitchen & Food", count: 29, desc: "Cooking with maths, food science, seasonal recipes" },
  { emoji: "📖", name: "Literacy & Language", count: 33, desc: "Reading, writing, phonics, Irish language games" },
  { emoji: "🔢", name: "Maths in Real Life", count: 27, desc: "Shopping, patterns, measurement, geometry in nature" },
  { emoji: "🏃", name: "Movement & Play", count: 31, desc: "Obstacle courses, yoga, dance, family fitness" },
  { emoji: "🧘", name: "Calm & Mindful", count: 22, desc: "Breathing, gratitude, nature journaling, sensory play" },
  { emoji: "🏡", name: "Life Skills", count: 19, desc: "Tying laces, first aid, map reading, sewing" },
  { emoji: "☘️", name: "Irish Heritage", count: 24, desc: "Ogham, Celtic art, mythology, music and dance" },
];

const filters = [
  { label: "15 minutes", emoji: "⚡" },
  { label: "Raining", emoji: "🌧️" },
  { label: "No mess", emoji: "✨" },
  { label: "Active", emoji: "🏃" },
  { label: "Calm", emoji: "🧘" },
  { label: "In the car", emoji: "🚗" },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <section id="features" className="py-28 bg-[#2C4A2E] relative overflow-hidden">
      {/* Texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Organic shapes */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#4A7C4E] opacity-20 blob-1" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#5C7A3E] opacity-15 blob-2" />

      <div className="max-w-7xl mx-auto px-6 relative" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-[#7BAE7F] text-sm uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "var(--font-dm)" }}>
            200+ activities at launch
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#F9F5EE] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Something for every mood,
            <br />
            <em className="text-[#7BAE7F]">every weather</em>
          </h2>
          <p className="text-[#C8DFC9] text-lg max-w-2xl mx-auto" style={{ fontFamily: "var(--font-lora)" }}>
            Every activity is tagged by age, duration, energy level, mess level, indoor/outdoor, and season. The Hedge always knows what fits right now.
          </p>
        </motion.div>

        {/* Quick filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f.label
                  ? "bg-[#7BAE7F] text-[#2C4A2E]"
                  : "bg-[#F9F5EE]/10 text-[#C8DFC9] hover:bg-[#F9F5EE]/20"
              }`}
              style={{ fontFamily: "var(--font-dm)" }}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-20">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="bg-[#F9F5EE]/8 hover:bg-[#F9F5EE]/15 border border-[#F9F5EE]/10 hover:border-[#7BAE7F]/40 rounded-2xl p-5 cursor-default transition-all duration-300"
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <div className="text-[#F9F5EE] text-sm font-semibold mb-1 leading-snug" style={{ fontFamily: "var(--font-dm)" }}>
                {cat.name}
              </div>
              <div className="text-[#7BAE7F] text-xs mb-2" style={{ fontFamily: "var(--font-dm)" }}>
                {cat.count} activities
              </div>
              <div className="text-[#C8DFC9]/60 text-xs leading-relaxed hidden md:block" style={{ fontFamily: "var(--font-dm)" }}>
                {cat.desc}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🗓️",
              title: "Weekend Planner",
              body: "Every Thursday, you get a weather-based plan for Saturday and Sunday. Editable, shareable, grand.",
            },
            {
              icon: "📱",
              title: "Works Offline",
              body: "Today's activities are cached. No signal at the beach? You've still got your ideas. Go.",
            },
            {
              icon: "🤖",
              title: "AI Chat Built In",
              body: '"We\'re stuck in Dublin airport with a 4-year-old." Instant ideas. Powered by Claude.',
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
              className="bg-[#F9F5EE]/8 rounded-2xl p-7 border border-[#F9F5EE]/10"
            >
              <div className="text-4xl mb-4">{feat.icon}</div>
              <h3 className="text-[#F9F5EE] text-xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                {feat.title}
              </h3>
              <p className="text-[#C8DFC9] text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm)" }}>
                {feat.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

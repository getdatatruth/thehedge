"use client";
import { motion } from "framer-motion";

const LeafSVG = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
    viewBox="0 0 60 80"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M30 75 C30 75 5 55 5 30 C5 12 17 2 30 5 C43 2 55 12 55 30 C55 55 30 75 30 75Z"
      fill="currentColor"
      opacity="0.85"
    />
    <path d="M30 75 L30 5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <path d="M30 30 Q18 22 12 18" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
    <path d="M30 45 Q42 37 48 33" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
  </motion.svg>
);

const ActivityCard = ({
  emoji,
  title,
  time,
  age,
  color,
  delay,
  rotate,
}: {
  emoji: string;
  title: string;
  time: string;
  age: string;
  color: string;
  delay: number;
  rotate: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotate: 0 }}
    animate={{ opacity: 1, y: 0, rotate: rotate }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    whileHover={{ scale: 1.04, rotate: "0deg", zIndex: 10 }}
    className={`absolute bg-white rounded-2xl shadow-xl p-4 w-44 cursor-default ${color} border border-opacity-20`}
    style={{ fontFamily: "var(--font-dm)" }}
  >
    <div className="text-2xl mb-2">{emoji}</div>
    <div className="text-[13px] font-semibold text-[#2C4A2E] leading-tight mb-2">{title}</div>
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[#4A7C4E] bg-[#C8DFC9] px-2 py-0.5 rounded-full">{time}</span>
      <span className="text-[11px] text-[#8B6B4A]">{age}</span>
    </div>
  </motion.div>
);

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F9F5EE]">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative organic blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C8DFC9] opacity-30 blob-1 translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C4A882] opacity-20 blob-2 -translate-x-1/4 translate-y-1/4" />

      {/* Scattered leaves background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <LeafSVG
          className="absolute top-16 right-24 w-16 h-20 text-[#4A7C4E] opacity-20 animate-float"
          delay={0.2}
        />
        <LeafSVG
          className="absolute top-40 right-64 w-10 h-12 text-[#7BAE7F] opacity-30 animate-float"
          delay={0.5}
        />
        <LeafSVG
          className="absolute bottom-32 left-16 w-20 h-24 text-[#2C4A2E] opacity-15 animate-float"
          delay={0.8}
        />
        <LeafSVG
          className="absolute bottom-48 left-64 w-12 h-14 text-[#5C7A3E] opacity-25 animate-float"
          delay={0.3}
        />
        <LeafSVG
          className="absolute top-28 left-32 w-8 h-10 text-[#4A7C4E] opacity-20 animate-float"
          delay={1.0}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left: Copy */}
        <div>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#2C4A2E]/10 text-[#2C4A2E] rounded-full px-4 py-2 text-sm font-medium mb-8"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            <span className="w-2 h-2 bg-[#4A7C4E] rounded-full animate-pulse" />
            Inspired by Ireland's hedge schools
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl lg:text-6xl xl:text-7xl font-bold text-[#2C4A2E] leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            What will your
            <br />
            family do
            <br />
            <span className="italic text-[#4A7C4E] relative">
              today?
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 1.0, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M4 8 C40 2, 80 12, 120 6 C160 0, 196 8 196 8"
                  stroke="#C8962A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  style={{ strokeDasharray: 300, strokeDashoffset: 300 }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-[#5C4A35] leading-relaxed mb-4 max-w-xl"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            The Hedge gives Irish families personalised activities every single day — based on your children's ages, today's weather, and what you did yesterday.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base text-[#5C4A35]/70 leading-relaxed mb-10 max-w-xl"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            For homeschool families, it's the complete education system Ireland has been missing. <span className="text-[#2C4A2E] font-medium">Tusla-ready. Curriculum-mapped. Built with love.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <a
              href="#"
              className="group bg-[#2C4A2E] hover:bg-[#4A7C4E] text-[#F9F5EE] px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              Start free today
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="#how-it-works"
              className="bg-[#F9F5EE] border-2 border-[#2C4A2E]/30 hover:border-[#2C4A2E] text-[#2C4A2E] px-8 py-4 rounded-full font-semibold text-base transition-all duration-300"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              See how it works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {["🧑", "👩", "👨", "🧕", "👱"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-[#C8DFC9] rounded-full border-2 border-[#F9F5EE] flex items-center justify-center text-lg"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-[#C8962A] text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-[#5C4A35]" style={{ fontFamily: "var(--font-dm)" }}>
                <strong>Join 2,000+</strong> Irish families already using The Hedge
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right: App mockup with floating activity cards */}
        <div className="hidden lg:flex items-center justify-center relative h-[580px]">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative z-10"
          >
            <div
              className="w-[280px] h-[560px] bg-[#2C4A2E] rounded-[44px] shadow-2xl overflow-hidden border-4 border-[#2C4A2E]"
              style={{ boxShadow: "0 40px 80px rgba(44,74,46,0.35), 0 0 0 1px rgba(44,74,46,0.2)" }}
            >
              {/* Phone screen */}
              <div className="bg-[#F9F5EE] h-full overflow-hidden">
                {/* Status bar */}
                <div className="bg-[#2C4A2E] text-[#F9F5EE] text-[10px] px-6 py-2 flex justify-between items-center">
                  <span>9:41</span>
                  <div className="w-24 h-4 bg-[#2C4A2E] rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
                  <span>●●●</span>
                </div>

                <div className="px-5 pt-4 pb-6">
                  {/* App header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-[#5C4A35] uppercase tracking-widest" style={{ fontFamily: "var(--font-dm)" }}>Good morning</p>
                      <h3 className="text-lg font-bold text-[#2C4A2E]" style={{ fontFamily: "var(--font-playfair)" }}>Sarah's family</h3>
                    </div>
                    <div className="w-9 h-9 bg-[#C8DFC9] rounded-full flex items-center justify-center text-base">🌿</div>
                  </div>

                  {/* Weather card */}
                  <div className="bg-[#2C4A2E] rounded-2xl p-3 mb-4 flex items-center gap-3">
                    <span className="text-2xl">⛅</span>
                    <div>
                      <p className="text-[#C8DFC9] text-[10px] uppercase tracking-wide" style={{ fontFamily: "var(--font-dm)" }}>Cork today</p>
                      <p className="text-[#F9F5EE] text-sm font-semibold" style={{ fontFamily: "var(--font-dm)" }}>14°C · Dry afternoon</p>
                    </div>
                  </div>

                  {/* Today's spraoi */}
                  <p className="text-[11px] font-semibold text-[#4A7C4E] uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-dm)" }}>
                    Today's spraoi ✨
                  </p>

                  {/* Activity cards */}
                  {[
                    { emoji: "🧚", title: "Fairy house in the garden", time: "30 min", tag: "Age 3–7", bg: "bg-[#C8DFC9]" },
                    { emoji: "🥄", title: "Kitchen measurement challenge", time: "20 min", tag: "Age 7+", bg: "bg-[#EDE8DD]" },
                    { emoji: "🔭", title: "Shadow tracking science", time: "45 min", tag: "All ages", bg: "bg-[#C4A882]/30" },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      className={`${card.bg} rounded-xl p-3 mb-2 flex items-center gap-3`}
                    >
                      <span className="text-xl">{card.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#2C4A2E] truncate" style={{ fontFamily: "var(--font-dm)" }}>
                          {card.title}
                        </p>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[9px] text-[#4A7C4E]">{card.time}</span>
                          <span className="text-[9px] text-[#8B6B4A]">{card.tag}</span>
                        </div>
                      </div>
                      <span className="text-[#2C4A2E] opacity-40 text-xs">›</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating cards */}
          <ActivityCard
            emoji="🌊"
            title="Rock pool science expedition"
            time="1 hr"
            age="Age 5–12"
            color="border-[#8BBDD9]"
            delay={1.2}
            rotate="-4deg"
            // positioning
          />
          <ActivityCard
            emoji="🍞"
            title="Sourdough maths with Mam"
            time="45 min"
            age="Age 6+"
            color="border-[#C4A882]"
            delay={1.4}
            rotate="3deg"
          />

          {/* Absolute positioned cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute top-8 right-0 bg-white rounded-2xl shadow-xl p-4 w-44 border border-[#C8DFC9]"
            style={{ transform: "rotate(-3deg)" }}
          >
            <div className="text-2xl mb-2">🌊</div>
            <div className="text-[13px] font-semibold text-[#2C4A2E] leading-tight mb-2">Rock pool science</div>
            <div className="flex gap-2">
              <span className="text-[11px] text-[#4A7C4E] bg-[#C8DFC9] px-2 py-0.5 rounded-full">1 hr</span>
              <span className="text-[11px] text-[#8B6B4A]">5–12</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute bottom-20 left-0 bg-white rounded-2xl shadow-xl p-4 w-44 border border-[#C4A882]"
            style={{ transform: "rotate(3deg)" }}
          >
            <div className="text-2xl mb-2">🍞</div>
            <div className="text-[13px] font-semibold text-[#2C4A2E] leading-tight mb-2">Sourdough maths with Mam</div>
            <div className="flex gap-2">
              <span className="text-[11px] text-[#4A7C4E] bg-[#C8DFC9] px-2 py-0.5 rounded-full">45 min</span>
              <span className="text-[11px] text-[#8B6B4A]">6+</span>
            </div>
          </motion.div>

          {/* Weather badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="absolute top-36 left-4 bg-[#2C4A2E] text-[#F9F5EE] rounded-xl px-3 py-2 text-sm shadow-lg"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            ⛅ 14°C Cork — <strong>go outside!</strong>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-[#2C4A2E]/30 rounded-full flex items-start justify-center pt-1"
        >
          <div className="w-1.5 h-3 bg-[#4A7C4E] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

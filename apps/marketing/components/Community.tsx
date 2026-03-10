"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const counties = [
  "Dublin", "Cork", "Galway", "Limerick", "Waterford",
  "Clare", "Kerry", "Tipperary", "Kilkenny", "Wexford",
  "Wicklow", "Kildare", "Meath", "Louth", "Sligo"
];

const posts = [
  {
    avatar: "🧑",
    name: "Máire, Dublin",
    time: "2h ago",
    content: "Does anyone know of a good foraging walk near Dublin 15 this weekend? Looking for something the kids (5 & 8) can do.",
    replies: 7,
    tag: "Nature",
  },
  {
    avatar: "👩",
    name: "Sinéad, Galway",
    time: "4h ago",
    content: "Just finished our first Tusla assessment using The Hedge portfolio. She was brilliant. Highly recommend the 3-week prep kit.",
    replies: 12,
    tag: "Homeschool",
  },
  {
    avatar: "👨",
    name: "Ciarán, Cork",
    time: "Yesterday",
    content: "Fairy house build was a massive hit yesterday. Three hours, no screens, no complaints. Only The Hedge gets it.",
    replies: 4,
    tag: "Activities",
  },
];

export default function Community() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="community" className="py-28 bg-[#2C4A2E] relative overflow-hidden">
      {/* Texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[#7BAE7F] text-sm uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "var(--font-dm)" }}>
              You're not alone
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#F9F5EE] mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
              A community of<br />
              <em className="text-[#7BAE7F]">curious Irish families</em>
            </h2>
            <p className="text-[#C8DFC9] text-lg leading-relaxed mb-8" style={{ fontFamily: "var(--font-lora)" }}>
              County groups, local events, curriculum swaps, co-ops, and mentors. The Hedge community is where families find each other — and where homeschool parents find they're not doing this alone.
            </p>

            {/* County grid */}
            <div className="flex flex-wrap gap-2 mb-8">
              {counties.map((county, i) => (
                <motion.span
                  key={county}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.03 }}
                  className="bg-[#F9F5EE]/10 text-[#C8DFC9] text-xs px-3 py-1.5 rounded-full hover:bg-[#F9F5EE]/20 transition-colors cursor-default"
                  style={{ fontFamily: "var(--font-dm)" }}
                >
                  {county}
                </motion.span>
              ))}
              <span className="bg-[#7BAE7F]/20 text-[#7BAE7F] text-xs px-3 py-1.5 rounded-full" style={{ fontFamily: "var(--font-dm)" }}>
                + all 32 counties
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { num: "32", label: "County groups" },
                { num: "2k+", label: "Families" },
                { num: "Monthly", label: "Local events" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-[#F9F5EE]" style={{ fontFamily: "var(--font-playfair)" }}>{stat.num}</div>
                  <div className="text-xs text-[#C8DFC9]" style={{ fontFamily: "var(--font-dm)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Community feed preview */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-4">
              {posts.map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.12 }}
                  className="bg-[#F9F5EE]/8 hover:bg-[#F9F5EE]/12 border border-[#F9F5EE]/10 rounded-2xl p-5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#C8DFC9]/20 rounded-full flex items-center justify-center text-lg">
                        {post.avatar}
                      </div>
                      <div>
                        <p className="text-[#F9F5EE] text-sm font-semibold" style={{ fontFamily: "var(--font-dm)" }}>{post.name}</p>
                        <p className="text-[#7BAE7F] text-xs" style={{ fontFamily: "var(--font-dm)" }}>{post.time}</p>
                      </div>
                    </div>
                    <span className="bg-[#7BAE7F]/20 text-[#7BAE7F] text-xs px-3 py-1 rounded-full" style={{ fontFamily: "var(--font-dm)" }}>
                      {post.tag}
                    </span>
                  </div>
                  <p className="text-[#C8DFC9] text-sm leading-relaxed mb-3" style={{ fontFamily: "var(--font-dm)" }}>
                    {post.content}
                  </p>
                  <p className="text-[#7BAE7F] text-xs" style={{ fontFamily: "var(--font-dm)" }}>
                    💬 {post.replies} replies
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const tuslaFeatures = [
  { icon: "📋", title: "Application Guidance", body: "Step-by-step walkthrough of the AEARS form. No more guessing what to write." },
  { icon: "📄", title: "Education Plan PDF", body: "Auto-generated from your setup. Curriculum-mapped, professionally formatted." },
  { icon: "📁", title: "Portfolio Builder", body: "Photos, work samples, and progress notes collected automatically as you go." },
  { icon: "🟢", title: "Coverage Dashboard", body: "Traffic-light view of every curriculum area. Green means you're covered." },
  { icon: "📊", title: "Progress Reports", body: "Termly and annual reports generated in one tap. Assessors are impressed." },
  { icon: "🗓️", title: "Attendance Record", body: "Logged automatically from your daily plan completions. Done for you." },
];

export default function HomeschoolSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="homeschool" className="py-28 bg-[#EDE8DD] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2C4A2E]/20 to-transparent" />

      {/* Irish knotwork inspired decoration */}
      <div className="absolute top-16 right-16 opacity-5">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="#2C4A2E" strokeWidth="2" fill="none" />
          <circle cx="100" cy="100" r="60" stroke="#2C4A2E" strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="100" r="40" stroke="#2C4A2E" strokeWidth="1" fill="none" />
          <path d="M100 20 L100 180 M20 100 L180 100 M37 37 L163 163 M163 37 L37 163" stroke="#2C4A2E" strokeWidth="1" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-[#2C4A2E]/10 text-[#2C4A2E] rounded-full px-4 py-2 text-sm font-medium mb-6" style={{ fontFamily: "var(--font-dm)" }}>
            <span>☘️</span> For homeschool families
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-[#2C4A2E] mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                The complete education system{" "}
                <em className="text-[#4A7C4E]">Ireland's been missing</em>
              </h2>
            </div>
            <div>
              <p className="text-lg text-[#5C4A35] leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
                Ireland has 3,500+ registered homeschool families — and that number is growing 20% every year. Until now, there's been no dedicated tool. The Hedge was built for you.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left: Daily planning mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#C8DFC9]">
              {/* Header */}
              <div className="bg-[#2C4A2E] px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[#F9F5EE] font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
                    Monday's Plan
                  </h3>
                  <span className="text-[#7BAE7F] text-sm" style={{ fontFamily: "var(--font-dm)" }}>2 children</span>
                </div>
                <p className="text-[#C8DFC9] text-xs" style={{ fontFamily: "var(--font-dm)" }}>Oisín (9) · Aoife (6)</p>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs font-semibold text-[#4A7C4E] uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-dm)" }}>Oisín — age 9</p>
                {[
                  { subject: "Maths", activity: "Fractions with pizza slices", time: "30 min", color: "#C8DFC9", outcome: "N3.2" },
                  { subject: "English", activity: "Creative writing — a day in a castle", time: "30 min", color: "#EDE8DD", outcome: "L2.4" },
                  { subject: "Nature", activity: "Bird identification walk", time: "45 min", color: "#C8DFC9", outcome: "S1.3" },
                ].map((block, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: block.color }}>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C4A2E] uppercase tracking-wide" style={{ fontFamily: "var(--font-dm)" }}>{block.subject}</span>
                        <span className="text-[10px] text-[#4A7C4E] bg-white/60 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-dm)" }}>
                          {block.outcome}
                        </span>
                      </div>
                      <p className="text-sm text-[#3D2B1F] mt-0.5" style={{ fontFamily: "var(--font-dm)" }}>{block.activity}</p>
                    </div>
                    <span className="text-xs text-[#5C4A35] whitespace-nowrap" style={{ fontFamily: "var(--font-dm)" }}>{block.time}</span>
                    <div className="w-5 h-5 rounded-full border-2 border-[#4A7C4E]/40" />
                  </div>
                ))}

                <div className="border-t border-[#EDE8DD] pt-4 mt-4">
                  <p className="text-xs font-semibold text-[#4A7C4E] uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-dm)" }}>Together</p>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-[#2C4A2E]/8">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#2C4A2E] uppercase tracking-wide" style={{ fontFamily: "var(--font-dm)" }}>Irish</span>
                      <p className="text-sm text-[#3D2B1F] mt-0.5" style={{ fontFamily: "var(--font-dm)" }}>Vocabulary game — colours and animals</p>
                    </div>
                    <span className="text-xs text-[#5C4A35]" style={{ fontFamily: "var(--font-dm)" }}>15 min</span>
                    <div className="w-5 h-5 rounded-full border-2 border-[#4A7C4E]/40" />
                  </div>
                </div>
              </div>

              {/* Tusla bar */}
              <div className="mx-6 mb-6 bg-[#C8DFC9] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#2C4A2E] uppercase tracking-wide" style={{ fontFamily: "var(--font-dm)" }}>Tusla coverage today</p>
                  <p className="text-xs text-[#4A7C4E] mt-0.5" style={{ fontFamily: "var(--font-dm)" }}>All 5 curriculum areas covered ✓</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#2C4A2E] flex items-center justify-center text-[#F9F5EE] font-bold text-sm">
                  87%
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Tusla features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-[#2C4A2E] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Tusla AEARS compliance — handled
            </h3>
            <p className="text-[#5C4A35] mb-8 leading-relaxed" style={{ fontFamily: "var(--font-lora)" }}>
              Three weeks before your assessment, tap "Prepare for Assessment." The Hedge generates your complete portfolio — curriculum coverage, sample work, progress notes, attendance record. Walk in confident.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {tuslaFeatures.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.07 }}
                  className="bg-white rounded-2xl p-4 border border-[#C8DFC9] card-hover"
                >
                  <div className="text-2xl mb-2">{feat.icon}</div>
                  <h4 className="text-sm font-bold text-[#2C4A2E] mb-1" style={{ fontFamily: "var(--font-dm)" }}>{feat.title}</h4>
                  <p className="text-xs text-[#5C4A35] leading-relaxed" style={{ fontFamily: "var(--font-dm)" }}>{feat.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="mt-8 bg-[#2C4A2E] text-[#F9F5EE] rounded-2xl p-6"
            >
              <p className="text-sm italic mb-3" style={{ fontFamily: "var(--font-lora)" }}>
                "I walked into our Tusla assessment with a 47-page portfolio generated by The Hedge. The assessor said it was the most thorough she'd seen."
              </p>
              <p className="text-xs text-[#7BAE7F]" style={{ fontFamily: "var(--font-dm)" }}>
                — Emma, homeschooling mam of 2, County Clare
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* NCCA curriculum coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="bg-[#2C4A2E] rounded-3xl p-8 lg:p-12 text-center"
        >
          <h3 className="text-3xl font-bold text-[#F9F5EE] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Mapped to the NCCA Primary Curriculum
          </h3>
          <p className="text-[#C8DFC9] mb-10 max-w-2xl mx-auto" style={{ fontFamily: "var(--font-lora)" }}>
            Every activity is tagged to curriculum outcomes. Language · Mathematics · Science & Technology · Social & Environmental Education · Arts · PE · SPHE/Wellbeing
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["Stage 1 — Junior/Senior Infants", "Stage 2 — 1st & 2nd Class", "Stage 3 — 3rd & 4th Class", "Stage 4 — 5th & 6th Class"].map((stage, i) => (
              <span
                key={i}
                className="bg-[#F9F5EE]/10 text-[#C8DFC9] px-4 py-2 rounded-full text-sm"
                style={{ fontFamily: "var(--font-dm)" }}
              >
                {stage}
              </span>
            ))}
          </div>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#7BAE7F] hover:bg-[#4A7C4E] text-[#2C4A2E] hover:text-[#F9F5EE] px-8 py-4 rounded-full font-semibold transition-all"
            style={{ fontFamily: "var(--font-dm)" }}
          >
            Start the Educator plan
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

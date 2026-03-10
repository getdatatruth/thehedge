"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: { monthly: "€0", annual: "€0" },
    tagline: "Get started today",
    color: "bg-[#EDE8DD]",
    textColor: "text-[#2C4A2E]",
    buttonClass: "bg-[#2C4A2E]/20 text-[#2C4A2E] hover:bg-[#2C4A2E]/30",
    features: [
      "1–2 activity ideas per day",
      "Limited content library",
      "Basic AI suggestions (5/week)",
      "Community — read only",
      "Basic SEN support",
      "One child profile",
    ],
    notIncluded: [
      "Weekend & holiday planner",
      "iPad child app",
      "Curriculum engine",
      "Tusla compliance tools",
    ],
  },
  {
    name: "Family",
    price: { monthly: "€6.99", annual: "€59.99" },
    annualLabel: "€5/mo billed annually",
    tagline: "For everyday family life",
    color: "bg-[#2C4A2E]",
    textColor: "text-[#F9F5EE]",
    buttonClass: "bg-[#7BAE7F] text-[#2C4A2E] hover:bg-[#4A7C4E] hover:text-[#F9F5EE]",
    badge: "Most popular",
    features: [
      "5+ personalised ideas per day",
      "Full content library (200+ activities)",
      "Weekend & holiday planner",
      "AI assistant (30/week)",
      "iPad child app",
      "Full community access",
      "Adapted SEN activities",
      "Unlimited children",
      "Family photo timeline",
      "Calendar sync",
      "Offline mode",
    ],
    notIncluded: [
      "Curriculum engine",
      "Tusla compliance tools",
      "Mentor access",
    ],
  },
  {
    name: "Educator",
    price: { monthly: "€14.99", annual: "€134.99" },
    annualLabel: "€11.25/mo billed annually",
    tagline: "The complete homeschool system",
    color: "bg-[#EDE8DD]",
    textColor: "text-[#2C4A2E]",
    buttonClass: "bg-[#2C4A2E] text-[#F9F5EE] hover:bg-[#4A7C4E]",
    features: [
      "Everything in Family",
      "NCCA curriculum engine",
      "Daily/weekly/termly plans",
      "Tusla AEARS compliance suite",
      "Portfolio auto-builder",
      "Coverage dashboard",
      "Progress & attendance reports",
      "Full SEN support + IEP tools",
      "Community mentor access",
      "Unlimited AI assistant",
      "Assessment prep kit",
    ],
    notIncluded: [],
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-28 bg-[#F9F5EE] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8DFC9] to-transparent" />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-[#4A7C4E] text-sm uppercase tracking-widest font-medium mb-4" style={{ fontFamily: "var(--font-dm)" }}>
            Simple pricing
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2C4A2E] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Start free. Upgrade when you're ready.
          </h2>
          <p className="text-[#5C4A35] text-lg mb-8" style={{ fontFamily: "var(--font-lora)" }}>
            All plans cover unlimited children. No hidden fees. Cancel any time.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-[#EDE8DD] rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-[#2C4A2E] text-[#F9F5EE] shadow" : "text-[#5C4A35]"}`}
              style={{ fontFamily: "var(--font-dm)" }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-[#2C4A2E] text-[#F9F5EE] shadow" : "text-[#5C4A35]"}`}
              style={{ fontFamily: "var(--font-dm)" }}
            >
              Annual
              <span className="bg-[#C8962A] text-white text-[10px] px-2 py-0.5 rounded-full">Save 30%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`${plan.color} rounded-3xl p-8 relative ${i === 1 ? "ring-4 ring-[#7BAE7F] shadow-2xl" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7BAE7F] text-[#2C4A2E] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide" style={{ fontFamily: "var(--font-dm)" }}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-1 ${plan.textColor}`} style={{ fontFamily: "var(--font-playfair)" }}>
                  {plan.name}
                </h3>
                <p className={`text-sm opacity-70 ${plan.textColor}`} style={{ fontFamily: "var(--font-dm)" }}>{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-2">
                  <span className={`text-5xl font-bold ${plan.textColor}`} style={{ fontFamily: "var(--font-playfair)" }}>
                    {annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly !== "€0" && (
                    <span className={`text-sm opacity-60 mb-2 ${plan.textColor}`} style={{ fontFamily: "var(--font-dm)" }}>
                      {annual ? "/yr" : "/mo"}
                    </span>
                  )}
                </div>
                {annual && plan.annualLabel && (
                  <p className={`text-xs opacity-60 mt-1 ${plan.textColor}`} style={{ fontFamily: "var(--font-dm)" }}>
                    {plan.annualLabel}
                  </p>
                )}
              </div>

              {/* CTA */}
              <a
                href="#"
                className={`block text-center py-3 rounded-full font-semibold text-sm transition-all mb-8 ${plan.buttonClass}`}
                style={{ fontFamily: "var(--font-dm)" }}
              >
                {plan.name === "Free" ? "Get started free" : `Start ${plan.name} plan`}
              </a>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check size={15} className={`mt-0.5 flex-shrink-0 ${i === 1 ? "text-[#7BAE7F]" : "text-[#4A7C4E]"}`} />
                    <span className={`text-sm ${plan.textColor} opacity-80`} style={{ fontFamily: "var(--font-dm)" }}>{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <div key={j} className="flex items-start gap-3 opacity-40">
                    <span className={`text-sm mt-0.5 flex-shrink-0 ${plan.textColor}`}>✕</span>
                    <span className={`text-sm ${plan.textColor}`} style={{ fontFamily: "var(--font-dm)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-[#5C4A35] mt-10"
          style={{ fontFamily: "var(--font-dm)" }}
        >
          🔒 Secure payments via Stripe. GDPR compliant. EU data residency. Cancel any time — no questions asked.
        </motion.p>
      </div>
    </section>
  );
}

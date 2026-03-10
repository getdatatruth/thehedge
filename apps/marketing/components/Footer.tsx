"use client";
import { motion } from "framer-motion";

export default function Footer() {
  const links = {
    Product: ["How it works", "Features", "Homeschool", "Pricing", "Download app"],
    Families: ["Activity ideas", "Weekend planner", "Holiday planner", "Community", "Blog"],
    Homeschool: ["Tusla guide", "Curriculum map", "Portfolio builder", "Assessment prep", "SEN support"],
    Company: ["About The Hedge", "Our story", "Privacy policy", "Terms of use", "Contact"],
  };

  return (
    <footer className="bg-[#1A2E1C] text-[#C8DFC9] relative overflow-hidden">
      {/* Top wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" className="w-full">
          <path d="M0 60 L0 20 Q360 60 720 20 Q1080 -20 1440 20 L1440 60 Z" fill="#2C4A2E" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10">
                <svg viewBox="0 0 40 40" fill="none">
                  <ellipse cx="20" cy="20" rx="18" ry="18" fill="#4A7C4E" />
                  <path d="M20 28 C20 28 12 22 12 16 C12 12 16 10 20 13 C24 10 28 12 28 16 C28 22 20 28 20 28Z" fill="#7BAE7F" />
                  <path d="M20 28 C20 28 14 20 16 14 C17 11 20 13 20 13" fill="#4A7C4E" />
                  <path d="M20 13 C20 13 23 11 24 14 C26 20 20 28 20 28" fill="#5C7A3E" />
                  <path d="M20 28 L20 33" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="font-display text-[#F9F5EE] font-bold text-lg block" style={{ fontFamily: "var(--font-playfair)" }}>
                  The Hedge
                </span>
                <span className="text-[#7BAE7F] text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-dm)" }}>
                  thehedge.ie
                </span>
              </div>
            </div>
            <p className="text-sm text-[#7BAE7F] leading-relaxed mb-6" style={{ fontFamily: "var(--font-dm)" }}>
              Where curious families learn. Inspired by Ireland's hedge schools.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {["📘", "📸", "🐦"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-[#F9F5EE]/8 hover:bg-[#F9F5EE]/15 rounded-full flex items-center justify-center transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-[#F9F5EE] font-semibold text-sm uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-dm)" }}>
                {section}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#7BAE7F] hover:text-[#C8DFC9] transition-colors"
                      style={{ fontFamily: "var(--font-dm)" }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-[#2C4A2E] rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[#F9F5EE] font-bold text-xl mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
              Get weekly family ideas, free
            </h3>
            <p className="text-[#7BAE7F] text-sm" style={{ fontFamily: "var(--font-dm)" }}>
              Seasonal activities, Irish heritage moments, and Hedge updates. No spam. Ever.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.ie"
              className="bg-[#F9F5EE]/10 border border-[#F9F5EE]/20 text-[#F9F5EE] placeholder-[#7BAE7F]/60 rounded-full px-5 py-3 text-sm flex-1 md:w-64 focus:outline-none focus:border-[#7BAE7F]"
              style={{ fontFamily: "var(--font-dm)" }}
            />
            <button
              className="bg-[#7BAE7F] hover:bg-[#4A7C4E] text-[#2C4A2E] font-semibold px-6 py-3 rounded-full text-sm transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#F9F5EE]/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4A7C4E]" style={{ fontFamily: "var(--font-dm)" }}>
            © 2025 The Hedge. Made with love in Ireland. 🇮🇪
          </p>
          <p className="text-xs text-[#4A7C4E]" style={{ fontFamily: "var(--font-dm)" }}>
            GDPR compliant · EU data residency · Children First Act aligned
          </p>
        </div>
      </div>
    </footer>
  );
}

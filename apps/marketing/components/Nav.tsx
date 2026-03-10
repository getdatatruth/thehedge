"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#homeschool", label: "Homeschool" },
    { href: "#pricing", label: "Pricing" },
    { href: "#community", label: "Community" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#F9F5EE]/95 backdrop-blur-md shadow-[0_2px_24px_rgba(44,74,46,0.12)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="20" rx="18" ry="18" fill="#2C4A2E" />
                {/* Hedge school leaf cluster */}
                <path d="M20 28 C20 28 12 22 12 16 C12 12 16 10 20 13 C24 10 28 12 28 16 C28 22 20 28 20 28Z" fill="#7BAE7F" />
                <path d="M20 28 C20 28 14 20 16 14 C17 11 20 13 20 13" fill="#4A7C4E" />
                <path d="M20 13 C20 13 23 11 24 14 C26 20 20 28 20 28" fill="#5C7A3E" />
                <path d="M20 28 L20 33" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <span
                className="font-display text-[#2C4A2E] font-bold text-xl leading-none block"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                The Hedge
              </span>
              <span
                className="text-[#4A7C4E] text-[10px] tracking-widest uppercase font-body"
                style={{ fontFamily: "var(--font-dm)" }}
              >
                thehedge.ie
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[#3D2B1F] hover:text-[#2C4A2E] transition-colors text-sm font-medium font-body"
                style={{ fontFamily: "var(--font-dm)" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-sm text-[#2C4A2E] font-medium hover:text-[#4A7C4E] transition-colors"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              Sign in
            </a>
            <a
              href="#"
              className="bg-[#2C4A2E] text-[#F9F5EE] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#4A7C4E] transition-colors shadow-lg hover:shadow-xl"
              style={{ fontFamily: "var(--font-dm)" }}
            >
              Start free today
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-[#2C4A2E]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-[#F9F5EE] pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 pt-8">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-display text-[#2C4A2E]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#"
                className="mt-4 bg-[#2C4A2E] text-[#F9F5EE] px-6 py-4 rounded-full text-center text-lg font-semibold"
              >
                Start free today
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

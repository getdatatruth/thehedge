"use client";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import HomeschoolSection from "@/components/HomeschoolSection";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Community from "@/components/Community";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <main className="bg-[#F9F5EE] overflow-x-hidden">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <HomeschoolSection />
      <Testimonials />
      <Pricing />
      <Community />
      <Footer />
    </main>
  );
}

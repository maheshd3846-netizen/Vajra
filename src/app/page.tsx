import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustBanner from "@/components/landing/TrustBanner";
import BentoGrid from "@/components/landing/BentoGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import MentorTeaser from "@/components/landing/MentorTeaser";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.14),transparent_26%),linear-gradient(to_bottom,transparent,rgba(255,255,255,0.015))]" />
      <Navbar />
      <HeroSection />
      <TrustBanner />
      <BentoGrid />
      <HowItWorks />
      <MentorTeaser />
      <FaqSection />
      <Footer />
    </div>
  );
}

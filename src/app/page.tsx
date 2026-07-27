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
    <div className="min-h-screen bg-slate-950 text-foreground overflow-x-hidden">
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

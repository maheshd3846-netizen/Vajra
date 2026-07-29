"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Sliders, Award } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Uncap Your Career DNA",
      description:
        "Connect your coding workspaces or answer a brief 2-minute onboarding sequence to automatically map out your initial technical readiness profile.",
      icon: UserCheck,
      color: "from-blue-500 to-indigo-500",
    },
    {
      number: "02",
      title: "Bridge Skill Gaps",
      description:
        "Access dynamic AI roadmaps configured specifically to target requirements at top-tier startups, paired with active industry mentor evaluations.",
      icon: Sliders,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "03",
      title: "Get Matched & Verified",
      description:
        "Apply to 100% verified positions with single-click submissions. Secure QR/blockchain-backed credentials upon successfully completing roles.",
      icon: Award,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24">
      {/* Background radial soft light */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="mb-4 text-3xl font-bold tracking-tight font-heading text-foreground md:text-5xl">
            How VAJRA Works
          </h2>
          <p className="text-muted-foreground font-sans">
            A verified sequence engineered to transition high-potential students directly into engineering roles.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* Connector Line (hidden on mobile, visible on lg screens) */}
          <div className="hidden lg:block absolute top-1/4 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/20 via-violet-500/20 to-emerald-500/20 -z-10" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center px-4 group"
              >
                {/* Step badge */}
                <div className="relative mb-6">
                  {/* Glowing background ring */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-foreground shadow-xl backdrop-blur-md">
                    <Icon className="w-6 h-6 text-primary transition-colors" />
                    
                    {/* Floating Step Number */}
                    <span className="absolute -top-3 -right-3 rounded-md border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="mb-3 text-xl font-bold text-foreground font-heading transition-colors group-hover:text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-sm">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

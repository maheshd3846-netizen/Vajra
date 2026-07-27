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
    <section id="how-it-works" className="py-24 bg-slate-950/40 relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-heading text-white mb-4">
            How VAJRA Works
          </h2>
          <p className="text-muted-foreground font-sans">
            A verified sequence engineered to transition high-potential students directly into engineering roles.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* Connector Line (hidden on mobile, visible on lg screens) */}
          <div className="hidden lg:block absolute top-1/4 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 -z-10" />

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
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative h-16 w-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white shadow-xl">
                    <Icon className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                    
                    {/* Floating Step Number */}
                    <span className="absolute -top-3 -right-3 px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-[10px] font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-bold text-white font-heading mb-3 group-hover:text-blue-400 transition-colors">
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

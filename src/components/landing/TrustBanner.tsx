"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, Landmark, Workflow } from "lucide-react";

export default function TrustBanner() {
  const networks = [
    { name: "GitHub Education", icon: ShieldCheck },
    { name: "Vercel Academic", icon: Workflow },
    { name: "Stanford CS Lab", icon: GraduationCap },
    { name: "AWS Academy", icon: Landmark },
    { name: "NextGen Colleges", icon: GraduationCap },
    { name: "Y Combinator Incubator", icon: ShieldCheck },
  ];

  // Double the list to make a seamless loop
  const loopList = [...networks, ...networks];

  return (
    <section className="relative py-12 bg-slate-950/40 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 font-sans">
          Engineered for Colleges, Faculty & Enterprise Partners
        </p>
      </div>

      {/* Marquee Loop */}
      <div className="flex overflow-hidden relative w-full select-none gap-6">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
          className="flex flex-shrink-0 gap-8 whitespace-nowrap items-center"
        >
          {loopList.map((network, index) => {
            const Icon = network.icon;
            return (
              <div
                key={`${network.name}-${index}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/50 border border-white/5 shadow-inner"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-slate-300 font-sans">{network.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

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
    <section className="relative overflow-hidden border-y border-border/70 bg-background/60 py-12">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
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
                className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-6 py-3 shadow-sm backdrop-blur-md"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground/80 font-sans">{network.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

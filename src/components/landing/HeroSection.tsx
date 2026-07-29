"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import CareerDnaCard from "./CareerDnaCard";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20 flex items-center">
      {/* Dynamic Background Mesh Gradients */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Block */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
          >
            {/* Launch Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur-md transition-colors hover:border-border"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Introducing VAJRA AI 2.0 — Career Intelligence OS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-bold tracking-tight font-heading leading-tight text-foreground"
            >
              Build Your Career. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Not Just Your Resume.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground max-w-xl font-sans leading-relaxed"
            >
              AI-driven career roadmaps, real-time readiness scoring, verified internship matching, and automated portfolio generation for the next generation of engineers.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-6 py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30 group"
              >
                Start Your Career DNA
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/70 px-6 py-3.5 font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground hover:border-border backdrop-blur-md"
              >
                Explore Opportunities
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="grid w-full max-w-xl grid-cols-3 gap-3 pt-4 sm:gap-4">
              {[
                { value: "18k+", label: "Profiles analyzed" },
                { value: "96%", label: "Match accuracy" },
                { value: "24/7", label: "Realtime signals" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl border-border/70 p-4 text-left">
                  <div className="text-lg font-bold text-foreground sm:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center w-full"
          >
            <CareerDnaCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

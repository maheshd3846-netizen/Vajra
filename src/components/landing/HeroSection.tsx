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
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 shadow-lg text-xs text-muted-foreground hover:border-white/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Introducing VAJRA AI 2.0 — Career Intelligence OS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-bold tracking-tight font-heading leading-tight text-white"
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
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all gap-2 group"
              >
                Start Your Career DNA
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-muted-foreground hover:text-white font-medium transition-all gap-2"
              >
                Explore Opportunities
              </a>
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

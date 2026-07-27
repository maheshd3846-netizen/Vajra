"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Briefcase, Mic, QrCode, Globe, CheckCircle2 } from "lucide-react";

export default function BentoGrid() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section id="features" className="py-24 bg-slate-950/20 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-heading text-white mb-4">
            AI-Powered Career Intelligence
          </h2>
          <p className="text-muted-foreground font-sans">
            VAJRA integrates five core modules into a single, unified developer OS to build, verify, and launch your career.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: AI Career DNA Engine (Col span 2) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-between h-[360px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded">
                Live Tracking
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-xl font-bold text-white font-heading">AI Career DNA Engine</h3>
              <p className="text-sm text-muted-foreground font-sans max-w-md">
                Continuous skills indexing through parsing of repositories, code structures, and credentials. Measures technical readiness, matches capabilities, and maps out learning paths.
              </p>
            </div>

            {/* Visual simulation inside card */}
            <div className="mt-6 flex gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Next.js parsed
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Tailwind CSS verified
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Supabase active
              </div>
            </div>
          </motion.div>

          {/* Card 2: Smart Internship Matcher (Col span 1) */}
          <motion.div
            variants={cardVariants}
            className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-between h-[360px]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
            
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 bg-purple-500/5 border border-purple-500/20 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-xl font-bold text-white font-heading">Smart Internship Matcher</h3>
              <p className="text-sm text-muted-foreground font-sans">
                100% verified employer positions mapped directly to your live skills metrics. Skip resume scanning and match based on validated competence.
              </p>
            </div>

            {/* Visual simulation */}
            <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">V</div>
                <div>
                  <p className="text-xs font-semibold text-white">Frontend Dev Intern</p>
                  <p className="text-[10px] text-muted-foreground">Vercel Network</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-success">96% Match</span>
            </div>
          </motion.div>

          {/* Card 3: AI Mock Interviewer (Col span 1) */}
          <motion.div
            variants={cardVariants}
            className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-between h-[360px]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Mic className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
                Interactive
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-xl font-bold text-white font-heading">AI Mock Interviewer</h3>
              <p className="text-sm text-muted-foreground font-sans">
                Practice context-aware technical interviews with speech-to-text analysis and instant visual scoring metrics.
              </p>
            </div>

            {/* Simulated audio lines */}
            <div className="mt-6 flex items-center justify-center gap-1.5 h-8 bg-slate-950 border border-white/5 rounded-xl px-4">
              {[1, 2, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h * 4}px` }}
                  className="w-[2px] bg-emerald-500/70 rounded-full animate-pulse"
                />
              ))}
            </div>
          </motion.div>

          {/* Card 4: QR-Verified Certifications (Col span 1) */}
          <motion.div
            variants={cardVariants}
            className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-between h-[360px]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <QrCode className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded">
                Tamper-proof
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-xl font-bold text-white font-heading">QR-Verified Certifications</h3>
              <p className="text-sm text-muted-foreground font-sans">
                Tamper-proof skill passports with QR codes for instant verification by corporate recruiters and hiring managers.
              </p>
            </div>

            {/* Simulated QR Code card */}
            <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
              <span className="text-xs text-slate-300 font-sans">Readiness Passport</span>
              <QrCode className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Card 5: 1-Click Portfolio Generator (Col span 2) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 relative group overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col justify-between h-[360px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Globe className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 px-2 py-0.5 rounded">
                Static Hosting
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="text-xl font-bold text-white font-heading">1-Click Portfolio Generator</h3>
              <p className="text-sm text-muted-foreground font-sans max-w-md">
                Transforms verified coding milestones, AI internship matching certificates, and mentor recommendations into a hosted, performant web portfolio.
              </p>
            </div>

            {/* Mock browser card */}
            <div className="mt-6 flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-white/5">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-[9px] font-mono text-muted-foreground ml-2">alexsterling.vajra.app</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

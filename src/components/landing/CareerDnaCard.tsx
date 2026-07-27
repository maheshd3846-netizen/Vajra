"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Cpu, TrendingUp } from "lucide-react";

export default function CareerDnaCard() {
  const stats = [
    {
      name: "Technical Score",
      value: 88,
      icon: Cpu,
      color: "from-blue-500 to-indigo-500",
    },
    {
      name: "Communication",
      value: 76,
      icon: Brain,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Portfolio Index",
      value: 92,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full max-w-sm mx-auto bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden group"
    >
      {/* AI Computing Hover Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Career DNA Card</h3>
            <p className="text-[11px] text-muted-foreground font-mono">ID: VAJRA-9481</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
          Ready to Match
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5 relative z-10">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
          AS
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Alex Sterling</h4>
          <p className="text-xs text-muted-foreground">Computer Science Student</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-4 mb-6 relative z-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-sans">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {stat.name}
                </span>
                <span className="font-semibold text-white">{stat.value}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${stat.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Level Info */}
      <div className="flex items-center justify-between bg-slate-950/50 border border-white/5 rounded-xl p-3 relative z-10">
        <span className="text-xs text-muted-foreground">Overall Rank</span>
        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-1">
          Explorer 🚀
        </span>
      </div>
    </motion.div>
  );
}

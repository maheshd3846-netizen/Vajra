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
      className="glass-card relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border-border/70 p-6 shadow-2xl group"
    >
      {/* AI Computing Hover Shimmer Overlay */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-colors group-hover:bg-primary/20" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl transition-colors group-hover:bg-violet-500/20" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Career DNA Card</h3>
            <p className="text-[11px] text-muted-foreground font-mono">ID: VAJRA-9481</p>
          </div>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Ready to Match
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative z-10 mb-6 flex items-center gap-4 border-b border-border/70 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 font-bold text-primary-foreground shadow-inner">
          AS
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Alex Sterling</h4>
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
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {stat.name}
                </span>
                <span className="font-semibold text-foreground">{stat.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-border/70 bg-background/70">
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
      <div className="relative z-10 flex items-center justify-between rounded-xl border border-border/70 bg-background/70 p-3">
        <span className="text-xs text-muted-foreground">Overall Rank</span>
        <span className="flex items-center gap-1 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-xs font-bold text-transparent">
          Explorer 🚀
        </span>
      </div>
    </motion.div>
  );
}

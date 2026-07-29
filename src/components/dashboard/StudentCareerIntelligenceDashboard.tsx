"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Bell,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Flame,
  BarChart3,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import type { CompleteCareerIntelligenceData } from "@/lib/ai-career-intelligence-service";

interface DashboardProps {
  initialData: CompleteCareerIntelligenceData;
  profileName: string;
  userEmail?: string;
}

export default function StudentCareerIntelligenceDashboard({
  initialData,
  profileName,
  userEmail,
}: DashboardProps) {
  const [data] = useState<CompleteCareerIntelligenceData>(initialData);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vajra-career-intelligence-${profileName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported Career Intelligence JSON report!");
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/career`;
    navigator.clipboard.writeText(url);
    toast.success("Shareable Career Intelligence URL copied!");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-foreground font-sans">
      {/* ─── TOP BAR & SMART NOTIFICATIONS ─── */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Career Intelligence Operating System
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold font-heading tracking-tight">
              Welcome back, {profileName.split(" ")[0]}
            </h1>
            {userEmail && (
              <span className="text-xs font-mono px-3 py-1 bg-background/70 border border-border/70 text-muted-foreground rounded-full">
                {userEmail}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl font-sans">
            Logged in as <strong className="text-foreground">{profileName}</strong> ({userEmail || "Authenticated User"}). Real-time Career DNA metrics & predictions.
          </p>
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative cursor-pointer rounded-2xl border border-border/70 bg-background/70 p-3 text-muted-foreground transition-all hover:text-foreground"
              title="Smart Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 z-50 mt-2 w-80 space-y-3 rounded-3xl border border-border/70 bg-card/95 p-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/70 pb-2">
                    <span className="text-xs font-bold font-mono uppercase text-foreground">Smart Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-xs text-muted-foreground hover:text-foreground">
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.notifications.map((n) => (
                      <a
                        key={n.id}
                        href={n.actionUrl}
                        className="block space-y-1 rounded-2xl border border-border/70 bg-background/70 p-3 transition-all hover:border-border"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-primary">{n.title}</span>
                          <span className="text-muted-foreground">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] leading-tight text-muted-foreground">{n.message}</p>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={handleShareLink}
            variant="outline"
            className="border-border/70 bg-background/70 text-xs py-5 rounded-2xl cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" /> Share
          </Button>

          <Button
            onClick={handleExportJSON}
            className="bg-gradient-to-r from-primary to-violet-500 text-xs font-semibold py-5 rounded-2xl text-primary-foreground shadow-lg cursor-pointer hover:shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export Report
          </Button>
        </div>
      </div>

      {/* ─── SECTION 1: ✨ TODAY'S AI DAILY INSIGHT ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-sky-500/10 to-cyan-500/10 p-6 space-y-4 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-bold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              ✨ Today&apos;s AI Daily Insight
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">{data.dailyInsight.greeting}</h2>
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed font-sans">{data.dailyInsight.summaryText}</p>
          </div>

          {/* Next Opportunity Pill */}
          <div className="shrink-0 space-y-1.5 rounded-2xl border border-border/70 bg-background/80 p-4 md:max-w-xs">
            <span className="text-[10px] uppercase font-mono font-bold block text-emerald-500">
              Top Opportunity (+{data.dailyInsight.expectedGainPercent}% Readiness)
            </span>
            <p className="text-xs leading-normal text-muted-foreground">{data.dailyInsight.topOpportunity}</p>
          </div>
        </div>
      </motion.div>

      {/* ─── HERO KPI CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Career DNA */}
        <div className="glass-card relative overflow-hidden rounded-3xl border-border/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Career DNA Index</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-mono text-primary">
              <CountUp end={data.careerDnaScore} />
            </span>
            <span className="text-xs font-mono text-muted-foreground">/100</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +5 pts this week
          </p>
        </div>

        {/* Readiness */}
        <div className="glass-card relative overflow-hidden rounded-3xl border-border/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Internship Readiness</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-mono text-emerald-400">
              <CountUp end={data.readinessScore} suffix="%" />
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans">Calculated for target role</p>
        </div>

        {/* Recruiter Score */}
        <div className="glass-card relative overflow-hidden rounded-3xl border-border/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Recruiter Impression</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-mono text-purple-400">
              <CountUp end={data.recruiterView.overallRecruiterScore} suffix="%" />
            </span>
          </div>
          <p className="text-[11px] text-purple-300 font-mono">Hiring Confidence: {data.recruiterView.hiringConfidence}%</p>
        </div>

        {/* Career Momentum */}
        <div className="glass-card relative overflow-hidden rounded-3xl border-border/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Career Momentum</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-mono text-amber-400">
              <CountUp end={data.weeklyReport.momentumScore} suffix="%" />
            </span>
          </div>
          <p className="text-[11px] text-amber-300 font-mono">Status: {data.weeklyReport.momentumStatus}</p>
        </div>
      </div>

      {/* ─── SECTION 2: CAREER PROGRESS TIMELINE ─── */}
      <div className="glass-card rounded-3xl border-border/70 p-6 space-y-6 md:p-8">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <Calendar className="w-4 h-4" /> 4-Week Career Velocity Timeline
            </div>
            <h3 className="text-lg font-bold font-heading text-foreground">Historical Progress & Milestone Audit</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-background/70 px-3 py-1.5 rounded-xl border border-border/70">
            Avg Velocity: +7.2 pts/week
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {data.progressTimeline.map((pt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-primary">{pt.week}</span>
                <span className="px-2 py-0.5 rounded border border-primary/20 bg-primary/10 font-bold text-primary">
                  {pt.score} pts
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">{pt.milestone}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">{pt.explanation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 3 & 10: GROWTH INSIGHTS & RECRUITER VIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recruiter Impression Box */}
        <div className="glass-card lg:col-span-5 rounded-3xl border-border/70 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <Users className="w-4 h-4" /> AI Recruiter Impression
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full font-bold">
              Recruiter Score: {data.recruiterView.overallRecruiterScore}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground italic">
                &ldquo;{data.recruiterView.recruiterImpressionText}&rdquo;
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              {data.recruiterView.explanation}
            </p>

            <a
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:text-primary/80"
            >
              Generate AI Recruiter Portfolio Website →
            </a>
          </div>
        </div>

        {/* 4 AI Growth Insights Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 rounded-3xl border border-border/70 bg-background/70 p-5">
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase block">Largest Improvement</span>
            <h4 className="text-base font-bold text-foreground">{data.growthInsights.largestImprovement.dimension}</h4>
            <span className="text-xs font-mono font-bold text-emerald-500 block">+{data.growthInsights.largestImprovement.changePercent}% Gain</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">{data.growthInsights.largestImprovement.explanation}</p>
          </div>

          <div className="space-y-2 rounded-3xl border border-border/70 bg-background/70 p-5">
            <span className="text-[10px] font-mono font-bold text-primary uppercase block">Most Improved Skill</span>
            <h4 className="text-base font-bold text-foreground">{data.growthInsights.mostImprovedSkill.skill}</h4>
            <span className="text-xs font-mono font-bold text-primary block">Proficiency: {data.growthInsights.mostImprovedSkill.proficiency}</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">{data.growthInsights.mostImprovedSkill.explanation}</p>
          </div>

          <div className="space-y-2 rounded-3xl border border-border/70 bg-background/70 p-5">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase block">Primary Improvement Area</span>
            <h4 className="text-base font-bold text-foreground">{data.growthInsights.biggestWeakness.dimension}</h4>
            <span className="text-xs font-mono font-bold text-amber-500 block">Impact: {data.growthInsights.biggestWeakness.impactScore} pts</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">{data.growthInsights.biggestWeakness.explanation}</p>
          </div>

          <div className="space-y-2 rounded-3xl border border-border/70 bg-background/70 p-5">
            <span className="text-[10px] font-mono font-bold text-primary uppercase block">Fastest Growing Area</span>
            <h4 className="text-base font-bold text-foreground">{data.growthInsights.fastestGrowingArea.area}</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans pt-3">{data.growthInsights.fastestGrowingArea.explanation}</p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 6: AI PREDICTIONS ─── */}
      <div className="glass-card rounded-3xl border-border/70 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <TrendingUp className="w-4 h-4" /> AI Predictive Performance Model
            </div>
            <h3 className="text-lg font-bold font-heading text-foreground">30-Day Predictive Career Trajectory</h3>
          </div>
          <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
            {data.predictions.confidenceLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase block text-muted-foreground">Next Month DNA</span>
            <span className="text-3xl font-black font-mono text-primary">{data.predictions.nextMonthDnaScore}</span>
            <span className="text-[10px] font-mono block text-emerald-500">+{data.predictions.nextMonthDnaScore - data.careerDnaScore} Expected</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase block text-muted-foreground">Readiness Forecast</span>
            <span className="text-3xl font-black font-mono text-emerald-500">{data.predictions.expectedInternshipReadiness}%</span>
            <span className="text-[10px] font-mono block text-emerald-500">High Match Pool</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase block text-muted-foreground">Portfolio Strength</span>
            <span className="text-3xl font-black font-mono text-primary">{data.predictions.expectedPortfolioStrength}%</span>
            <span className="text-[10px] font-mono block text-primary">Tier-1 Standard</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/70 p-5 text-center space-y-1">
            <span className="text-[10px] font-mono uppercase block text-muted-foreground">Interview Readiness</span>
            <span className="text-3xl font-black font-mono text-cyan-500">{data.predictions.expectedInterviewScore}%</span>
            <span className="text-[10px] font-mono block text-cyan-500">Tech Round Ready</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 8 & 9: PERSONALIZED GOALS & BADGES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Smart AI Goals */}
        <div className="glass-card lg:col-span-7 rounded-3xl border-border/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <Target className="w-4 h-4" /> AI Actionable Career Goals
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{data.goals.length} Goals Active</span>
          </div>

          <div className="space-y-3">
            {data.goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{g.title}</h4>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${g.priority === "High" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/10 border-primary/20 text-primary"}`}>
                      {g.priority} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Category: {g.category} • Est. Time: {g.estimatedTime}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-500 block">+{g.expectedDnaGain} DNA Pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="glass-card lg:col-span-5 rounded-3xl border-border/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <Award className="w-4 h-4" /> Achievement Badges
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {data.badges.filter((b) => b.isUnlocked).length}/{data.badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {data.badges.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  b.isUnlocked ? "border-border/70 bg-background/70" : "border-border/50 bg-background/40 opacity-50"
                }`}
              >
                <span className="text-2xl shrink-0">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{b.title}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{b.description}</p>
                </div>
                {b.isUnlocked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SECTION 11: INDUSTRY BENCHMARK COMPARISON ─── */}
      <div className="glass-card rounded-3xl border-border/70 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <BarChart3 className="w-4 h-4" /> Industry Benchmark Index
            </div>
            <h3 className="text-lg font-bold font-heading text-foreground">You vs. Candidate Industry Average</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.benchmarks.map((bm, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-border/70 bg-background/70 p-5">
              <h4 className="text-sm font-bold text-foreground">{bm.metric}</h4>

              {/* Progress Comparison */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>You</span>
                    <span className="font-bold text-primary">{bm.yourScore}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/70">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${bm.yourScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground/80">
                    <span>Industry Avg</span>
                    <span>{bm.industryAvg}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/70">
                    <div className="h-full rounded-full bg-sky-400" style={{ width: `${bm.industryAvg}%` }} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">{bm.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

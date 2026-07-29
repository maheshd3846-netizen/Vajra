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
    <div className="space-y-8 max-w-7xl mx-auto text-white font-sans">
      {/* ─── TOP BAR & SMART NOTIFICATIONS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI Career Intelligence Operating System
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold font-heading tracking-tight">
              Welcome back, {profileName.split(" ")[0]}
            </h1>
            {userEmail && (
              <span className="text-xs font-mono px-3 py-1 bg-slate-900 border border-white/10 text-slate-300 rounded-full">
                {userEmail}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 max-w-2xl font-sans">
            Logged in as <strong className="text-white">{profileName}</strong> ({userEmail || "Authenticated User"}). Real-time Career DNA metrics & predictions.
          </p>
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 bg-slate-900 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer relative"
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
                  className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-3xl p-4 shadow-2xl z-50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold font-mono text-white uppercase">Smart Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white text-xs">
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.notifications.map((n) => (
                      <a
                        key={n.id}
                        href={n.actionUrl}
                        className="block p-3 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-blue-400 font-bold">{n.title}</span>
                          <span className="text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">{n.message}</p>
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
            className="bg-slate-900 border-white/10 text-slate-300 hover:text-white text-xs py-5 rounded-2xl cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" /> Share
          </Button>

          <Button
            onClick={handleExportJSON}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-5 rounded-2xl shadow-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export Report
          </Button>
        </div>
      </div>

      {/* ─── SECTION 1: ✨ TODAY'S AI DAILY INSIGHT ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              ✨ Today&apos;s AI Daily Insight
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-heading text-white">{data.dailyInsight.greeting}</h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">{data.dailyInsight.summaryText}</p>
          </div>

          {/* Next Opportunity Pill */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 md:max-w-xs shrink-0">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
              Top Opportunity (+{data.dailyInsight.expectedGainPercent}% Readiness)
            </span>
            <p className="text-xs text-slate-300 leading-normal">{data.dailyInsight.topOpportunity}</p>
          </div>
        </div>
      </motion.div>

      {/* ─── HERO KPI CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Career DNA */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Career DNA Index</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-mono text-blue-400">
              <CountUp end={data.careerDnaScore} />
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +5 pts this week
          </p>
        </div>

        {/* Readiness */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Internship Readiness</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-mono text-emerald-400">
              <CountUp end={data.readinessScore} suffix="%" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">Calculated for target role</p>
        </div>

        {/* Recruiter Score */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Recruiter Impression</span>
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
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Career Momentum</span>
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
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase">
              <Calendar className="w-4 h-4" /> 4-Week Career Velocity Timeline
            </div>
            <h3 className="text-lg font-bold font-heading text-white">Historical Progress & Milestone Audit</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
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
              className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold">{pt.week}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold">
                  {pt.score} pts
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{pt.milestone}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{pt.explanation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 3 & 10: GROWTH INSIGHTS & RECRUITER VIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recruiter Impression Box */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
              <Users className="w-4 h-4" /> AI Recruiter Impression
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full font-bold">
              Recruiter Score: {data.recruiterView.overallRecruiterScore}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &ldquo;{data.recruiterView.recruiterImpressionText}&rdquo;
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {data.recruiterView.explanation}
            </p>

            <a
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold font-mono"
            >
              Generate AI Recruiter Portfolio Website →
            </a>
          </div>
        </div>

        {/* 4 AI Growth Insights Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">Largest Improvement</span>
            <h4 className="text-base font-bold text-white">{data.growthInsights.largestImprovement.dimension}</h4>
            <span className="text-xs font-mono font-bold text-emerald-400 block">+{data.growthInsights.largestImprovement.changePercent}% Gain</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{data.growthInsights.largestImprovement.explanation}</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase block">Most Improved Skill</span>
            <h4 className="text-base font-bold text-white">{data.growthInsights.mostImprovedSkill.skill}</h4>
            <span className="text-xs font-mono font-bold text-blue-400 block">Proficiency: {data.growthInsights.mostImprovedSkill.proficiency}</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{data.growthInsights.mostImprovedSkill.explanation}</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Primary Improvement Area</span>
            <h4 className="text-base font-bold text-white">{data.growthInsights.biggestWeakness.dimension}</h4>
            <span className="text-xs font-mono font-bold text-amber-400 block">Impact: {data.growthInsights.biggestWeakness.impactScore} pts</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{data.growthInsights.biggestWeakness.explanation}</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase block">Fastest Growing Area</span>
            <h4 className="text-base font-bold text-white">{data.growthInsights.fastestGrowingArea.area}</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-3">{data.growthInsights.fastestGrowingArea.explanation}</p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 6: AI PREDICTIONS ─── */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
              <TrendingUp className="w-4 h-4" /> AI Predictive Performance Model
            </div>
            <h3 className="text-lg font-bold font-heading text-white">30-Day Predictive Career Trajectory</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            {data.predictions.confidenceLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Next Month DNA</span>
            <span className="text-3xl font-black font-mono text-blue-400">{data.predictions.nextMonthDnaScore}</span>
            <span className="text-[10px] text-emerald-400 font-mono block">+{data.predictions.nextMonthDnaScore - data.careerDnaScore} Expected</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Readiness Forecast</span>
            <span className="text-3xl font-black font-mono text-emerald-400">{data.predictions.expectedInternshipReadiness}%</span>
            <span className="text-[10px] text-emerald-400 font-mono block">High Match Pool</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Portfolio Strength</span>
            <span className="text-3xl font-black font-mono text-purple-400">{data.predictions.expectedPortfolioStrength}%</span>
            <span className="text-[10px] text-purple-300 font-mono block">Tier-1 Standard</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 text-center space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Interview Readiness</span>
            <span className="text-3xl font-black font-mono text-amber-400">{data.predictions.expectedInterviewScore}%</span>
            <span className="text-[10px] text-amber-300 font-mono block">Tech Round Ready</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 8 & 9: PERSONALIZED GOALS & BADGES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Smart AI Goals */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase">
              <Target className="w-4 h-4" /> AI Actionable Career Goals
            </div>
            <span className="text-[10px] font-mono text-slate-400">{data.goals.length} Goals Active</span>
          </div>

          <div className="space-y-3">
            {data.goals.map((g) => (
              <div key={g.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{g.title}</h4>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${g.priority === "High" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"}`}>
                      {g.priority} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Category: {g.category} • Est. Time: {g.estimatedTime}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">+{g.expectedDnaGain} DNA Pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
              <Award className="w-4 h-4" /> Achievement Badges
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {data.badges.filter((b) => b.isUnlocked).length}/{data.badges.length} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {data.badges.map((b) => (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  b.isUnlocked ? "bg-slate-950 border-white/10" : "bg-slate-950/40 border-white/5 opacity-50"
                }`}
              >
                <span className="text-2xl shrink-0">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{b.description}</p>
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
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase">
              <BarChart3 className="w-4 h-4" /> Industry Benchmark Index
            </div>
            <h3 className="text-lg font-bold font-heading text-white">You vs. Candidate Industry Average</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.benchmarks.map((bm, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white">{bm.metric}</h4>

              {/* Progress Comparison */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>You</span>
                    <span className="font-bold text-blue-400">{bm.yourScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${bm.yourScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>Industry Avg</span>
                    <span>{bm.industryAvg}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full" style={{ width: `${bm.industryAvg}%` }} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{bm.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

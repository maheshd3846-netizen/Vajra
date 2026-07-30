"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  ProgressReportItem,
  SubmitDailyProgressPayload,
  submitDailyProgressAction,
  ProgressAttachment,
} from "@/app/actions/progress";
import {
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
  Link as LinkIcon,
  Github,
  Figma,
  ExternalLink,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Smile,
  Meh,
  Frown,
  X,
  Zap,
} from "lucide-react";

interface StudentProgressClientProps {
  initialReports: ProgressReportItem[];
  initialTodaysReport: ProgressReportItem | null;
  initialStats: {
    streakDays: number;
    totalHoursWorked: number;
    tasksCompletedCount: number;
    avgProductivity: number;
    readinessScore: number;
    submissionRatePct: number;
  };
  initialWeeklySummary: Record<string, unknown>;
}

export default function StudentProgressClient({
  initialReports,
  initialTodaysReport,
  initialStats,
  initialWeeklySummary,
}: StudentProgressClientProps) {
  const [reports, setReports] = useState<ProgressReportItem[]>(initialReports);
  const [todaysReport, setTodaysReport] = useState<ProgressReportItem | null>(initialTodaysReport);
  const [stats, setStats] = useState(initialStats);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "analytics" | "achievements">("overview");
  const [selectedReport, setSelectedReport] = useState<ProgressReportItem | null>(null);

  // Form State
  const [todaysTasks, setTodaysTasks] = useState(todaysReport?.todays_tasks || "");
  const [tasksCompleted, setTasksCompleted] = useState(todaysReport?.tasks_completed || "");
  const [hoursWorked, setHoursWorked] = useState(todaysReport?.hours_worked || 8);
  const [skillsInput, setSkillsInput] = useState((todaysReport?.skills_used || ["TypeScript", "Next.js"]).join(", "));
  const [techInput, setTechInput] = useState((todaysReport?.technologies_used || ["React", "Supabase"]).join(", "));
  const [challengesFaced, setChallengesFaced] = useState(todaysReport?.challenges_faced || "");
  const [solutionsImplemented, setSolutionsImplemented] = useState(todaysReport?.solutions_implemented || "");
  const [learningOutcome, setLearningOutcome] = useState(todaysReport?.learning_outcome || "");
  const [tomorrowsPlan, setTomorrowsPlan] = useState(todaysReport?.tomorrows_plan || "");
  const [mood, setMood] = useState<"great" | "neutral" | "bad">(todaysReport?.mood || "great");
  const [productivityRating, setProductivityRating] = useState(todaysReport?.productivity_rating || 4);
  const [workStatus, setWorkStatus] = useState<"not_started" | "in_progress" | "completed" | "blocked">(
    todaysReport?.work_status || "completed"
  );

  // Link Attachments
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todaysTasks.trim() || !tasksCompleted.trim()) {
      toast.error("Please fill in today's planned tasks and completed tasks.");
      return;
    }

    setIsSubmitting(true);
    try {
      const attachments: ProgressAttachment[] = [];
      if (githubUrl.trim()) attachments.push({ type: "github", title: "GitHub Commit / PR", url: githubUrl.trim() });
      if (demoUrl.trim()) attachments.push({ type: "demo", title: "Live Demo Link", url: demoUrl.trim() });
      if (figmaUrl.trim()) attachments.push({ type: "figma", title: "Figma Prototype", url: figmaUrl.trim() });

      const payload: SubmitDailyProgressPayload = {
        todaysTasks: todaysTasks.trim(),
        tasksCompleted: tasksCompleted.trim(),
        hoursWorked: Number(hoursWorked),
        skillsUsed: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        technologiesUsed: techInput.split(",").map((t) => t.trim()).filter(Boolean),
        challengesFaced: challengesFaced.trim() || undefined,
        solutionsImplemented: solutionsImplemented.trim() || undefined,
        learningOutcome: learningOutcome.trim() || undefined,
        tomorrowsPlan: tomorrowsPlan.trim() || undefined,
        mood,
        productivityRating: Number(productivityRating),
        workStatus,
        attachments,
      };

      const res = await submitDailyProgressAction(payload);
      if (res.success) {
        toast.success("Daily progress report submitted successfully! AI review generated.");
        setIsModalOpen(false);
        // Refresh local view state
        const todayStr = new Date().toISOString().split("T")[0];
        const newReport: ProgressReportItem = {
          id: res.reportId || `rep-${Date.now()}`,
          student_id: "self",
          company_id: "comp-1",
          internship_id: null,
          report_date: todayStr,
          todays_tasks: payload.todaysTasks,
          tasks_completed: payload.tasksCompleted,
          hours_worked: payload.hoursWorked,
          skills_used: payload.skillsUsed,
          technologies_used: payload.technologiesUsed,
          challenges_faced: payload.challengesFaced || null,
          solutions_implemented: payload.solutionsImplemented || null,
          learning_outcome: payload.learningOutcome || null,
          tomorrows_plan: payload.tomorrowsPlan || null,
          mood: payload.mood,
          productivity_rating: payload.productivityRating,
          work_status: payload.workStatus,
          attachments: payload.attachments || [],
          ai_feedback: {
            summary: "Excellent structured report! Demonstrated consistent execution and problem solving.",
            productivityScore: Math.min(100, payload.productivityRating * 20 + 10),
            strengths: ["Task breakdown accuracy", "Proactive link documentation"],
            suggestedImprovements: ["Keep documenting edge cases in learning outcomes"],
            skillGrowthPoints: 35,
            encouragement: "Fantastic job! Your daily streak is expanding your Career DNA score.",
          },
          created_at: new Date().toISOString(),
          company: { name: "Vajra Partner Enterprise", logo_url: null },
        };

        setTodaysReport(newReport);
        setReports((prev) => [newReport, ...prev.filter((r) => r.report_date !== todayStr)]);
        setStats((prev) => ({
          ...prev,
          streakDays: prev.streakDays + 1,
          totalHoursWorked: prev.totalHoursWorked + payload.hoursWorked,
        }));
      } else {
        toast.error(res.error || "Submission failed.");
      }
    } catch {
      toast.error("Failed to submit progress update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono">
                <Flame className="w-3.5 h-3.5 text-orange-400 mr-1 animate-pulse" />
                {stats.streakDays} Day Streak Active
              </Badge>

              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-2.5 py-0.5 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                {stats.submissionRatePct}% Submission Rate
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
              Daily Internship Progress Tracker
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Track daily work output, log technical challenges, generate AI performance feedback, and build a verified engineering track record for recruiters and mentors.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
          >
            {todaysReport ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Update Today&apos;s Progress Log</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Submit Today&apos;s Progress Update</span>
              </>
            )}
          </button>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-500/20">
          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Streak Master</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <Flame className="w-4 h-4 text-orange-400" />
              {stats.streakDays} Days
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Total Working Hours</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-indigo-300" />
              {stats.totalHoursWorked} hrs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Avg Productivity</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {stats.avgProductivity} / 5
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">AI Readiness Score</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <BrainCircuit className="w-4 h-4 text-purple-300" />
              {stats.readinessScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5" />
          Overview & Today&apos;s Log
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "history"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 inline-block mr-1.5" />
          History Timeline ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 inline-block mr-1.5" />
          Productivity Analytics
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "achievements"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Award className="w-3.5 h-3.5 inline-block mr-1.5" />
          Milestones & Badges
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today&apos;s Status Card */}
          <div className="lg:col-span-2 space-y-6">
            {todaysReport ? (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Today&apos;s Report Submitted ({todaysReport.report_date})
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-mono text-xs">
                    {todaysReport.mood === "great" ? "😊 Great Mood" : todaysReport.mood === "neutral" ? "😐 Steady" : "😞 Challenging"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Hours Worked</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                      {todaysReport.hours_worked} Hours
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Productivity Rating</span>
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                      {todaysReport.productivity_rating} / 5 Stars
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Work Status</span>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase">
                      {todaysReport.work_status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase font-mono text-slate-500">Tasks Completed</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-background/80 p-3 rounded-xl border border-border leading-relaxed whitespace-pre-line">
                    {todaysReport.tasks_completed}
                  </p>
                </div>

                {todaysReport.ai_feedback?.summary && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-semibold font-mono text-indigo-900 dark:text-indigo-200">
                        AI Code Review & Throughput Feedback
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {todaysReport.ai_feedback.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {todaysReport.ai_feedback.strengths?.map((str, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200">
                          ✓ {str}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Today&apos;s Progress Report Pending
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Submit today&apos;s progress report before midnight to extend your {stats.streakDays}-day streak!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Fill Today&apos;s Log Now
                </button>
              </div>
            )}

            {/* Recent Daily Logs Stream */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono flex items-center justify-between">
                <span>Recent Submissions Stream</span>
                <span className="text-xs font-normal text-slate-500">{reports.length} Reports Logged</span>
              </h3>

              <div className="space-y-3">
                {reports.slice(0, 5).map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className="p-4 rounded-xl border border-border bg-card hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {rep.report_date}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {rep.hours_worked} hrs
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{rep.productivity_rating}/5 ⭐</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {rep.tasks_completed}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {rep.technologies_used.map((tech, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right AI Weekly Summary Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-900 dark:text-slate-100">
                    AI Weekly Progress Summary
                  </h3>
                  <span className="text-[10px] text-slate-500">Auto-Generated Performance Insights</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {(initialWeeklySummary as unknown as { weeklySummary: string })?.weeklySummary ||
                  "Consistently logging productive internship updates. High technical throughput across primary engineering tasks."}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold font-mono uppercase text-slate-500 block">
                  Key Achievements This Week
                </span>
                <ul className="space-y-1.5">
                  {((initialWeeklySummary as unknown as { topAchievements: string[] })?.topAchievements || [
                    "Logged 40+ engineering hours",
                    "Applied TypeScript and Supabase core patterns",
                    "Achieved 100% daily update compliance",
                  ]).map((ach, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Attachment Upload Info */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h4 className="text-xs font-semibold font-mono uppercase text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-500" />
                Proof of Work Links
              </h4>
              <p className="text-xs text-slate-500">
                Attach GitHub commits, Figma designs, or Live Demo links to your updates for recruiter verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY TIMELINE */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">
              Complete Submission Timeline
            </h3>
            <Badge variant="outline" className="font-mono text-xs">{reports.length} Total Logs</Badge>
          </div>

          <div className="space-y-4">
            {reports.map((rep) => (
              <div key={rep.id} className="p-5 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {rep.report_date.split("-")[2]}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        {rep.report_date}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {rep.company?.name || "Company Partner"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {rep.hours_worked} Hours
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {rep.productivity_rating}/5 Rating
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500 uppercase font-mono text-[10px]">Today&apos;s Planned Tasks</span>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-border">
                      {rep.todays_tasks}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500 uppercase font-mono text-[10px]">Tasks Completed</span>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-border">
                      {rep.tasks_completed}
                    </p>
                  </div>
                </div>

                {rep.attachments && rep.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {rep.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-xs font-mono text-indigo-700 dark:text-indigo-300 hover:underline"
                      >
                        {att.type === "github" ? <Github className="w-3.5 h-3.5" /> : att.type === "figma" ? <Figma className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        <span>{att.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTIVITY ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Daily Hours Worked Graph
            </h3>
            
            <div className="space-y-3 pt-2">
              {reports.slice(0, 7).map((rep) => (
                <div key={rep.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-400">{rep.report_date}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{rep.hours_worked} hrs</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (rep.hours_worked / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h3 className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Skills Applied Matrix
            </h3>

            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from(new Set(reports.flatMap((r) => r.skills_used))).map((skill, i) => (
                <Badge key={i} variant="outline" className="px-3 py-1.5 text-xs font-mono bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200">
                  ⚡ {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACHIEVEMENTS & BADGES */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">7-Day Streak Master</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Submitted 7 consecutive daily updates without missing a day.</p>
            <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300">UNLOCKED</Badge>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">50-Hour Milestone</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Completed 50+ total productive engineering hours in internship placement.</p>
            <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300">UNLOCKED</Badge>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">AI Readiness Elite</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Maintained Career DNA readiness score above 85/100.</p>
            <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300">UNLOCKED</Badge>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    Submit Today&apos;s Daily Progress Log
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Today&apos;s Planned Tasks *
                    </label>
                    <textarea
                      value={todaysTasks}
                      onChange={(e) => setTodaysTasks(e.target.value)}
                      placeholder="e.g. Implement authentication middleware and optimize database indexes"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Tasks Completed *
                    </label>
                    <textarea
                      value={tasksCompleted}
                      onChange={(e) => setTasksCompleted(e.target.value)}
                      placeholder="e.g. Created SQL migration 00007, updated RLS policies, and passed build verification"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Hours Worked ({hoursWorked} hrs)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      step="0.5"
                      value={hoursWorked}
                      onChange={(e) => setHoursWorked(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Productivity ({productivityRating}/5)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={productivityRating}
                      onChange={(e) => setProductivityRating(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Work Status
                    </label>
                    <select
                      value={workStatus}
                      onChange={(e) => setWorkStatus(e.target.value as "not_started" | "in_progress" | "completed" | "blocked")}
                      className="w-full text-xs p-2 rounded-xl border border-border bg-background text-slate-700 dark:text-slate-300 outline-none"
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="blocked">Blocked</option>
                      <option value="not_started">Not Started</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Overall Mood
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMood("great")}
                        className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          mood === "great" ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300" : "border-border"
                        }`}
                      >
                        <Smile className="w-3.5 h-3.5" /> Great
                      </button>

                      <button
                        type="button"
                        onClick={() => setMood("neutral")}
                        className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          mood === "neutral" ? "bg-amber-50 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300" : "border-border"
                        }`}
                      >
                        <Meh className="w-3.5 h-3.5" /> Steady
                      </button>

                      <button
                        type="button"
                        onClick={() => setMood("bad")}
                        className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          mood === "bad" ? "bg-red-50 dark:bg-red-950 border-red-400 text-red-700 dark:text-red-300" : "border-border"
                        }`}
                      >
                        <Frown className="w-3.5 h-3.5" /> Tough
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Skills Used (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. TypeScript, RLS Security, API Design"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Tech Stack Used
                    </label>
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="e.g. Next.js, Supabase, Tailwind"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Challenges Faced
                    </label>
                    <textarea
                      value={challengesFaced}
                      onChange={(e) => setChallengesFaced(e.target.value)}
                      placeholder="Briefly describe any blockers..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none h-16"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Solutions Implemented
                    </label>
                    <textarea
                      value={solutionsImplemented}
                      onChange={(e) => setSolutionsImplemented(e.target.value)}
                      placeholder="Describe solutions implemented..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none h-16"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Learning Outcome
                    </label>
                    <textarea
                      value={learningOutcome}
                      onChange={(e) => setLearningOutcome(e.target.value)}
                      placeholder="Key takeaways or skills learned today..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none h-16"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Tomorrow&apos;s Plan
                    </label>
                    <textarea
                      value={tomorrowsPlan}
                      onChange={(e) => setTomorrowsPlan(e.target.value)}
                      placeholder="What are your key objectives for tomorrow?"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none h-16"
                    />
                  </div>
                </div>

                {/* Proof Links */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 block">
                    Proof of Work Links (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="GitHub PR/Commit URL"
                      className="text-xs p-2.5 rounded-xl border border-border bg-background outline-none"
                    />
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="Live Demo URL"
                      className="text-xs p-2.5 rounded-xl border border-border bg-background outline-none"
                    />
                    <input
                      type="url"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      placeholder="Figma / Drive URL"
                      className="text-xs p-2.5 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Generating AI Review..." : "Submit Log"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT DETAILS MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    Report Details ({selectedReport.report_date})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase font-mono block">Tasks Completed</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line bg-muted/30 p-2.5 rounded-xl border border-border">
                    {selectedReport.tasks_completed}
                  </p>
                </div>

                {selectedReport.challenges_faced && (
                  <div>
                    <span className="font-semibold text-slate-500 uppercase font-mono block">Challenges Faced</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line bg-muted/30 p-2.5 rounded-xl border border-border">
                      {selectedReport.challenges_faced}
                    </p>
                  </div>
                )}

                {selectedReport.solutions_implemented && (
                  <div>
                    <span className="font-semibold text-slate-500 uppercase font-mono block">Solutions Implemented</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line bg-muted/30 p-2.5 rounded-xl border border-border">
                      {selectedReport.solutions_implemented}
                    </p>
                  </div>
                )}

                {selectedReport.learning_outcome && (
                  <div>
                    <span className="font-semibold text-slate-500 uppercase font-mono block">Learning Outcome</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line bg-muted/30 p-2.5 rounded-xl border border-border">
                      {selectedReport.learning_outcome}
                    </p>
                  </div>
                )}

                {selectedReport.ai_feedback?.summary && (
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-1">
                    <span className="font-semibold font-mono text-indigo-900 dark:text-indigo-200 block">AI Code Review & Feedback</span>
                    <p className="text-slate-700 dark:text-slate-300">{selectedReport.ai_feedback.summary}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

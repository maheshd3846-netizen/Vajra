"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  ProgressReportItem,
  sendMissingUpdateRemindersAction,
} from "@/app/actions/progress";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Bell,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Flame,
  X,
} from "lucide-react";

interface InternProgressRecord {
  studentId: string;
  name: string;
  avatarUrl: string | null;
  university: string | null;
  department: string | null;
  role: string | null;
  joiningDate: string;
  progressPct: number;
  attendancePct: number;
  streakDays: number;
  avgProductivity: number;
  lastUpdateDate: string | null;
  latestMood: string | null;
  status: string;
  contactInfo: {
    email: string;
    phone: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
  };
  recentReports: ProgressReportItem[];
}

interface CompanyProgressClientProps {
  initialInterns: InternProgressRecord[];
  initialStats: {
    totalActiveInterns: number;
    todaySubmittedCount: number;
    missingTodayCount: number;
    companyAvgProductivity: number;
    submissionRatePct: number;
  };
}

export default function CompanyProgressClient({
  initialInterns,
  initialStats,
}: CompanyProgressClientProps) {
  const [interns] = useState<InternProgressRecord[]>(initialInterns);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntern, setSelectedIntern] = useState<InternProgressRecord | null>(null);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const filteredInterns = interns.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      const res = await sendMissingUpdateRemindersAction();
      if (res.success) {
        toast.success(`Sent missing update reminders to ${res.count || 0} active interns.`);
        setStats((prev) => ({ ...prev, missingTodayCount: 0 }));
      } else {
        toast.error(res.error || "Failed to send reminders.");
      }
    } catch {
      toast.error("Error triggering reminder notifications.");
    } finally {
      setIsSendingReminders(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono">
              Enterprise Recruiter Progress Tracker
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
              Intern Performance & Progress Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Monitor real-time intern task completion, working hours, daily submission trends, productivity metrics, and mentor evaluations across your organization.
            </p>
          </div>

          {stats.missingTodayCount > 0 && (
            <button
              onClick={handleSendReminders}
              disabled={isSendingReminders}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              <span>{isSendingReminders ? "Sending Reminders..." : `Remind ${stats.missingTodayCount} Pending Interns`}</span>
            </button>
          )}
        </div>

        {/* Top KPI Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-500/20">
          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Total Active Interns</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-indigo-300" />
              {stats.totalActiveInterns}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Today&apos;s Submission Rate</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {stats.submissionRatePct}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Avg Productivity Score</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              {stats.companyAvgProductivity} / 5
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block">Missing Today&apos;s Log</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-1.5 mt-0.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              {stats.missingTodayCount} Interns
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by intern name, role, university..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredInterns.length} of {interns.length} Intern Records
        </span>
      </div>

      {/* Intern Rankings & Submission Matrix Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-mono text-slate-500 uppercase">
                <th className="py-3 px-4">Intern Candidate</th>
                <th className="py-3 px-4">University & Role</th>
                <th className="py-3 px-4">Today&apos;s Submission</th>
                <th className="py-3 px-4">Streak & Attendance</th>
                <th className="py-3 px-4">Avg Productivity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-xs">
              {filteredInterns.map((intern) => {
                const hasSubmittedToday = intern.lastUpdateDate === todayStr;

                return (
                  <tr key={intern.studentId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                          {intern.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{intern.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{intern.contactInfo.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">{intern.role}</span>
                        <span className="text-[10px] text-slate-500">{intern.university || "University Partner"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {hasSubmittedToday ? (
                        <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 font-mono text-[10px]">
                          ✓ Submitted ({intern.lastUpdateDate})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 font-mono text-[10px]">
                          ⚠ Pending Update
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          {intern.streakDays}d
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {intern.attendancePct}% Attendance
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {intern.avgProductivity} / 5.0 ⭐
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedIntern(intern)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium text-xs transition-colors cursor-pointer"
                      >
                        View Full Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED INTERN PROFILE MODAL */}
      <AnimatePresence>
        {selectedIntern && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border bg-muted/40 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white font-mono font-extrabold text-base flex items-center justify-center shadow-md">
                    {selectedIntern.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                      {selectedIntern.name}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedIntern.role} • {selectedIntern.university}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedIntern(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                {/* Contact & Links Bar */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{selectedIntern.contactInfo.email}</span>
                  </div>

                  {selectedIntern.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{selectedIntern.contactInfo.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 col-span-full pt-1">
                    {selectedIntern.contactInfo.githubUrl && (
                      <a href={selectedIntern.contactInfo.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                        <Github className="w-3.5 h-3.5" /> GitHub Profile
                      </a>
                    )}

                    {selectedIntern.contactInfo.linkedinUrl && (
                      <a href={selectedIntern.contactInfo.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}

                    {selectedIntern.contactInfo.portfolioUrl && (
                      <a href={selectedIntern.contactInfo.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                        <Globe className="w-3.5 h-3.5" /> Portfolio Site
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress History Stream */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-900 dark:text-slate-100">
                    Recent Daily Progress Submissions ({selectedIntern.recentReports.length})
                  </h4>

                  {selectedIntern.recentReports.length > 0 ? (
                    <div className="space-y-3">
                      {selectedIntern.recentReports.map((rep) => (
                        <div key={rep.id} className="p-4 rounded-xl border border-border bg-background space-y-2">
                          <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{rep.report_date}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{rep.hours_worked} Hours</Badge>
                              <Badge variant="outline" className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {rep.productivity_rating}/5 ⭐
                              </Badge>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300">{rep.tasks_completed}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No daily progress reports recorded yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

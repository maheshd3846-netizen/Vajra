"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  ProgressReportItem,
  submitMentorProgressReviewAction,
} from "@/app/actions/progress";
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";

interface MentorProgressClientProps {
  initialPending: ProgressReportItem[];
  initialReviewed: ProgressReportItem[];
}

export default function MentorProgressClient({
  initialPending,
  initialReviewed,
}: MentorProgressClientProps) {
  const [pending, setPending] = useState<ProgressReportItem[]>(initialPending);
  const [reviewed, setReviewed] = useState<ProgressReportItem[]>(initialReviewed);
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");
  const [selectedReport, setSelectedReport] = useState<ProgressReportItem | null>(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"approved" | "needs_revision">("approved");
  const [comments, setComments] = useState("");
  const [achievements, setAchievements] = useState("");
  const [improvements, setImprovements] = useState("");
  const [nextTasks, setNextTasks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsSubmitting(true);
    try {
      const res = await submitMentorProgressReviewAction({
        reportId: selectedReport.id,
        status,
        rating: Number(rating),
        comments: comments.trim() || undefined,
        achievementsMarked: achievements.split(",").map((a) => a.trim()).filter(Boolean),
        suggestedImprovements: improvements.trim() || undefined,
        assignedNextTasks: nextTasks.trim() || undefined,
      });

      if (res.success) {
        toast.success("Mentor review submitted successfully!");
        const updatedRep: ProgressReportItem = {
          ...selectedReport,
          mentorReview: {
            id: `rev-${Date.now()}`,
            status,
            rating,
            comments: comments.trim() || null,
            achievements_marked: achievements.split(",").map((a) => a.trim()).filter(Boolean),
            suggested_improvements: improvements.trim() || null,
            assigned_next_tasks: nextTasks.trim() || null,
            created_at: new Date().toISOString(),
          },
        };

        setPending((prev) => prev.filter((r) => r.id !== selectedReport.id));
        setReviewed((prev) => [updatedRep, ...prev]);
        setSelectedReport(null);
        setComments("");
        setAchievements("");
        setImprovements("");
        setNextTasks("");
      } else {
        toast.error(res.error || "Review submission failed.");
      }
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="space-y-2 relative z-10">
          <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono">
            Mentor Evaluation Hub
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
            Intern Daily Progress Reviews
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Evaluate daily work submissions from assigned students, provide 1–5 star ratings, mark milestone achievements, and suggest actionable technical improvements.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5 inline-block mr-1.5" />
          Pending Reviews ({pending.length})
        </button>

        <button
          onClick={() => setActiveTab("reviewed")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === "reviewed"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1.5" />
          Reviewed Reports ({reviewed.length})
        </button>
      </div>

      {/* PENDING QUEUE */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-border bg-card space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-semibold font-mono text-slate-900 dark:text-slate-100">
                All Student Daily Reports Reviewed!
              </h3>
              <p className="text-xs text-slate-500">You are up to date on evaluating your assigned interns&apos; progress logs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <CalendarIcon className="w-4 h-4 text-indigo-500" />
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {rep.report_date}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">{rep.hours_worked} Hours Worked</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300">
                        Awaiting Review
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-500 uppercase font-mono text-[10px]">Completed Work</span>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2">{rep.tasks_completed}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEWED REPORTS */}
      {activeTab === "reviewed" && (
        <div className="space-y-4">
          {reviewed.map((rep) => (
            <div key={rep.id} className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{rep.report_date}</span>
                <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {rep.mentorReview?.rating} / 5 ⭐ Approved
                </Badge>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300">{rep.tasks_completed}</p>

              {rep.mentorReview?.comments && (
                <p className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 italic">
                  &ldquo;{rep.mentorReview.comments}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
                <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  Evaluate Daily Progress ({selectedReport.report_date})
                </h3>
                <button onClick={() => setSelectedReport(null)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="font-semibold font-mono uppercase text-[10px] text-slate-500">Student Submission Summary</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedReport.tasks_completed}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold font-mono text-slate-700 dark:text-slate-300">Rating (1-5 Stars)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-background outline-none"
                    >
                      <option value="5">5 ⭐ — Exceptional Work</option>
                      <option value="4">4 ⭐ — Exceeds Expectations</option>
                      <option value="3">3 ⭐ — Meets Standards</option>
                      <option value="2">2 ⭐ — Needs Revision</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold font-mono text-slate-700 dark:text-slate-300">Approval Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "approved" | "needs_revision")}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-background outline-none"
                    >
                      <option value="approved">Approved & Verified</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold font-mono text-slate-700 dark:text-slate-300">Mentor Comments & Feedback</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide constructive feedback for the student..."
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none h-20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold font-mono text-slate-700 dark:text-slate-300">Milestone Achievements (comma-separated)</label>
                  <input
                    type="text"
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="e.g. Bug Hunter, Fast Code Deploy"
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

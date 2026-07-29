/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCompanyInternAction } from "@/app/actions/company";
import {
  UserCheck,
  Star,
  Loader2,
  X,
  Edit,
} from "lucide-react";

export interface CompanyInternItem {
  id: string;
  joining_date: string;
  progress_pct: number;
  attendance_pct: number;
  status: "active" | "completed" | "terminated";
  notes: string | null;
  rating: number | null;
  weekly_reports: unknown;
  assigned_tasks: unknown;
  student_profiles: {
    id: string;
    university: string | null;
    major: string | null;
    degree: string | null;
    branch: string | null;
    phone: string | null;
    users: {
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null;
  internships: {
    title: string;
  } | null;
  mentors: {
    users: {
      full_name: string | null;
    } | null;
  } | null;
}

interface CompanyInternTrackerClientProps {
  initialInterns: CompanyInternItem[];
}

export default function CompanyInternTrackerClient({
  initialInterns,
}: CompanyInternTrackerClientProps) {
  const router = useRouter();
  const [interns, setInterns] = useState<CompanyInternItem[]>(initialInterns);

  // Edit Modal State
  const [selectedIntern, setSelectedIntern] = useState<CompanyInternItem | null>(null);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [notesVal, setNotesVal] = useState<string>("");
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [statusVal, setStatusVal] = useState<"active" | "completed" | "terminated">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEditModal = (item: CompanyInternItem) => {
    setSelectedIntern(item);
    setProgressVal(item.progress_pct || 0);
    setNotesVal(item.notes || "");
    setRatingVal(item.rating || 5);
    setStatusVal(item.status);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntern) return;

    setIsSubmitting(true);

    const res = await updateCompanyInternAction(selectedIntern.id, {
      progress_pct: progressVal,
      notes: notesVal,
      rating: ratingVal,
      status: statusVal,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Intern progress & feedback record updated!");
      setInterns((prev) =>
        prev.map((i) =>
          i.id === selectedIntern.id
            ? {
                ...i,
                progress_pct: progressVal,
                notes: notesVal,
                rating: ratingVal,
                status: statusVal,
              }
            : i
        )
      );
      setSelectedIntern(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update intern record.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest">
          <UserCheck className="w-4 h-4" />
          Selected Talent Onboarding
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Company Intern Tracker</h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Track selected student interns, log weekly completion percentages, record performance ratings, and issue completion certificates.
        </p>
      </div>

      {/* Interns List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
          Active Internships ({interns.length})
        </h2>

        {interns.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3 max-w-md mx-auto">
            <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No Selected Interns Yet</p>
            <p className="text-xs text-slate-400 font-sans">
              When you accept applicant candidates in the Applications page, intern tracking records will automatically be created here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {interns.map((item) => {
              const stud = item.student_profiles;
              const studUser = stud?.users;
              const mentorUser = item.mentors?.users;
              const isCompleted = item.status === "completed";

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-lg text-emerald-400 shrink-0">
                          {studUser?.avatar_url ? (
                            <img src={studUser.avatar_url} alt="" className="h-full w-full object-cover rounded-2xl" />
                          ) : (
                            studUser?.full_name?.[0] || "I"
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{studUser?.full_name || "Vajra Intern"}</h3>
                          <p className="text-xs text-slate-400 font-sans">{studUser?.email}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            : item.status === "active"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 font-sans">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Role</span>
                        <span className="text-slate-200 font-medium">{item.internships?.title || "Engineering Intern"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">University</span>
                        <span className="text-slate-200 font-medium truncate block">{stud?.university || "N/A"}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Assigned Mentor</span>
                        <span className="text-blue-400 font-medium">{mentorUser?.full_name || "Not Assigned"}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Joining Date</span>
                        <span className="text-slate-200 font-medium font-mono text-[11px]">
                          {new Date(item.joining_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Completion Progress</span>
                        <span className="text-emerald-400 font-bold">{item.progress_pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${item.progress_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Rating & Notes */}
                    {item.rating && (
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <span className="text-slate-400 font-sans mr-1">Performance Rating:</span>
                        {Array.from({ length: Math.round(item.rating) }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 font-sans italic leading-relaxed">
                        &ldquo;{item.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-400" />
                      Update Progress & Notes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedIntern && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-md w-full space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Update Intern Tracking Record
              </h3>
              <button
                onClick={() => setSelectedIntern(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs font-sans">
              {/* Progress Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">Completion Progress (%)</label>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{progressVal}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progressVal}
                  onChange={(e) => setProgressVal(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Internship Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as "active" | "completed" | "terminated")}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">Active Intern</option>
                  <option value="completed">Completed Internship</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Performance Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= ratingVal
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Performance Notes & Feedback</label>
                <textarea
                  rows={3}
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  placeholder="Record project milestones, weekly highlights, or feedback..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedIntern(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

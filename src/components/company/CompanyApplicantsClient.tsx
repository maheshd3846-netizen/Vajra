"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Users, FileText, Sparkles, Loader2 } from "lucide-react";
import { updateApplicationStatusAction } from "@/app/actions/company";

export interface CandidateItem {
  id: string;
  status: string;
  applied_at: string;
  resume_url: string;
  cover_letter?: string | null;
  internshipTitle: string;
  studentName: string;
  university: string | null;
  major: string | null;
}

interface CompanyApplicantsClientProps {
  initialCandidates: CandidateItem[];
}

const PIPELINE_STAGES = [
  "applied",
  "reviewing",
  "shortlisted",
  "interviewing",
  "accepted",
  "rejected",
] as const;

export default function CompanyApplicantsClient({
  initialCandidates,
}: CompanyApplicantsClientProps) {
  const [candidates, setCandidates] = useState<CandidateItem[]>(initialCandidates);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (
    candidateId: string,
    newStatus: CandidateItem["status"]
  ) => {
    setUpdatingId(candidateId);
    toast.loading(`Updating candidate stage to ${newStatus.toUpperCase()}...`);

    try {
      const res = await updateApplicationStatusAction(
        candidateId,
        newStatus as "applied" | "reviewing" | "shortlisted" | "interviewing" | "accepted" | "rejected"
      );
      toast.dismiss();

      if (res.success) {
        toast.success(`Candidate status moved to ${newStatus.toUpperCase()}`);
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
        );
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.dismiss();
      toast.error("Error updating candidate pipeline stage.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white font-sans">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Applicant Tracking & Pipeline Manager
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Manage Candidate Applications
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Review candidate profile benchmarks, inspect PDF resumes, and advance candidates through recruitment stages.
        </p>
      </div>

      {/* Candidates Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Candidates Pipeline ({candidates.length})
          </h2>
        </div>

        {candidates.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No applications received yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
              As student engineers apply to your active job listings, candidate records and resume cards will populate here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{cand.studentName}</h3>
                    <p className="text-xs text-slate-400 font-sans">
                      {cand.major || "Engineering"} at {cand.university || "Institute of Technology"}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono pt-1">
                      <span className="text-slate-500">Applied Role:</span>
                      <span className="text-blue-400 font-bold">{cand.internshipTitle}</span>
                    </div>
                  </div>

                  {/* Stage Dropdown & Resume */}
                  <div className="flex items-center gap-3 shrink-0">
                    {cand.resume_url && (
                      <a
                        href={cand.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all font-sans cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        View Resume
                      </a>
                    )}

                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10">
                      {updatingId === cand.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      ) : (
                        <select
                          value={cand.status}
                          onChange={(e) =>
                            handleStatusChange(cand.id, e.target.value as CandidateItem["status"])
                          }
                          className="bg-transparent text-xs font-mono uppercase font-bold text-blue-400 focus:outline-none cursor-pointer"
                        >
                          {PIPELINE_STAGES.map((stage) => (
                            <option key={stage} value={stage} className="bg-slate-900 text-white capitalize font-sans">
                              Stage: {stage.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {cand.cover_letter && (
                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 text-xs text-slate-400 font-sans italic leading-relaxed">
                    &ldquo;{cand.cover_letter}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

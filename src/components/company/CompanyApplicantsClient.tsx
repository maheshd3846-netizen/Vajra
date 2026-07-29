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
    <div className="space-y-8 max-w-5xl mx-auto text-foreground font-sans">
      {/* Header */}
      <div className="space-y-2 border-b border-[#BFDFFF] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-4 h-4" />
          Applicant Tracking & Pipeline Manager
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-heading text-foreground">
          Manage Candidate Applications
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl font-sans">
          Review candidate profile benchmarks, inspect PDF resumes, and advance candidates through recruitment stages.
        </p>
      </div>

      {/* Candidates Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#BFDFFF] pb-3">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-foreground">
            Candidates Pipeline ({candidates.length})
          </h2>
        </div>

        {candidates.length === 0 ? (
          <div className="space-y-3 rounded-[28px] border border-[#BFDFFF] bg-white/80 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-500" />
            <p className="text-sm font-bold text-foreground">No applications received yet</p>
            <p className="mx-auto max-w-sm text-xs text-muted-foreground font-sans">
              As student engineers apply to your active job listings, candidate records and resume cards will populate here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="space-y-4 rounded-[28px] border border-[#BFDFFF] bg-white/90 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(59,130,246,0.10)]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{cand.studentName}</h3>
                    <p className="text-xs text-muted-foreground font-sans">
                      {cand.major || "Engineering"} at {cand.university || "Institute of Technology"}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono pt-1">
                      <span className="text-slate-500">Applied Role:</span>
                      <span className="font-bold text-primary">{cand.internshipTitle}</span>
                    </div>
                  </div>

                  {/* Stage Dropdown & Resume */}
                  <div className="flex items-center gap-3 shrink-0">
                    {cand.resume_url && (
                      <a
                        href={cand.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex cursor-pointer items-center gap-1.5 rounded-[18px] border border-[#BFDFFF] bg-white px-3.5 py-2.5 text-xs text-muted-foreground font-sans transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)]"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        View Resume
                      </a>
                    )}

                    <div className="flex items-center gap-1.5 rounded-[18px] border border-[#BFDFFF] bg-white px-3 py-1.5">
                      {updatingId === cand.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <select
                          value={cand.status}
                          onChange={(e) =>
                            handleStatusChange(cand.id, e.target.value as CandidateItem["status"])
                          }
                          className="cursor-pointer bg-transparent text-xs font-mono uppercase font-bold text-primary focus:outline-none"
                        >
                          {PIPELINE_STAGES.map((stage) => (
                            <option key={stage} value={stage} className="bg-white capitalize font-sans text-foreground">
                              Stage: {stage.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {cand.cover_letter && (
                  <div className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3 text-xs leading-relaxed text-muted-foreground font-sans italic">
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

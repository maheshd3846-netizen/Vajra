/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateApplicationStatusAction } from "@/app/actions/company";
import {
  Users,
  Sparkles,
  Calendar,
  Award,
  Github,
  Linkedin,
  Globe,
  Briefcase,
  Eye,
  Download,
  X,
  UserCheck,
} from "lucide-react";

export interface CandidateItem {
  id: string;
  status: string;
  applied_at: string;
  resume_url: string;
  cover_letter?: string | null;
  internshipTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatarUrl: string;
  university: string | null;
  degree: string | null;
  branch: string | null;
  cgpa: string | null;
  targetRole: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  skills: string[];
  projects: Array<{
    title: string;
    description: string | null;
    project_url: string | null;
    github_url: string | null;
    technologies: string[];
  }>;
  careerDnaScore: number;
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
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<CandidateItem | null>(null);
  const [filterStage, setFilterStage] = useState<string>("all");

  const handleStatusChange = async (
    candidateId: string,
    newStatus: CandidateItem["status"]
  ) => {
    setUpdatingId(candidateId);

    try {
      const res = await updateApplicationStatusAction(
        candidateId,
        newStatus as "applied" | "reviewing" | "shortlisted" | "interviewing" | "accepted" | "rejected"
      );

      if (res.success) {
        if (newStatus === "accepted") {
          toast.success("Candidate marked as SELECTED! Added to Company Intern Tracker.");
        } else {
          toast.success(`Candidate status moved to ${newStatus.toUpperCase()}`);
        }
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
        );
        if (selectedCandidateModal?.id === candidateId) {
          setSelectedCandidateModal((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Error updating candidate pipeline stage.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (filterStage === "all") return true;
    return c.status === filterStage;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
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
          Review candidate profiles, Career DNA scores, PDF resumes, and perform recruitment actions (Shortlist, Schedule Interview, Select, Reject).
        </p>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        <span className="text-xs text-slate-400 font-mono shrink-0 mr-1">Filter Stage:</span>
        {["all", ...PIPELINE_STAGES].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStage(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition shrink-0 ${
              filterStage === st
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            {st} ({st === "all" ? candidates.length : candidates.filter((c) => c.status === st).length})
          </button>
        ))}
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No candidates in this stage</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
              As student engineers apply to your active job listings, candidate records will populate here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Student Summary Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-xl text-blue-400 shrink-0">
                      {cand.avatarUrl ? (
                        <img src={cand.avatarUrl} alt={cand.studentName} className="h-full w-full object-cover" />
                      ) : (
                        cand.studentName?.[0] || "S"
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-white">{cand.studentName}</h3>
                        <span
                          className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border ${
                            cand.status === "accepted"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : cand.status === "shortlisted"
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                              : cand.status === "interviewing"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : cand.status === "rejected"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-slate-800 border-white/10 text-slate-300"
                          }`}
                        >
                          {cand.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-sans">
                        {cand.branch || cand.degree || "Engineering"} {cand.university ? `• ${cand.university}` : ""} {cand.cgpa ? `(CGPA: ${cand.cgpa})` : ""}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        <span className="text-slate-400 font-sans">
                          Applied: <strong className="text-blue-400">{cand.internshipTitle}</strong>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-mono">
                          <Award className="w-3 h-3 text-indigo-400" />
                          Career DNA: {cand.careerDnaScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Controller */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                    <button
                      onClick={() => setSelectedCandidateModal(cand)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      View Profile
                    </button>

                    {cand.resume_url && (
                      <a
                        href={cand.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        Resume
                      </a>
                    )}

                    <div className="h-5 w-px bg-white/10 hidden sm:block" />

                    {/* Quick Stage Action Buttons */}
                    {cand.status !== "shortlisted" && (
                      <button
                        onClick={() => handleStatusChange(cand.id, "shortlisted")}
                        disabled={updatingId === cand.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition"
                      >
                        Shortlist
                      </button>
                    )}

                    {cand.status !== "interviewing" && (
                      <button
                        onClick={() => handleStatusChange(cand.id, "interviewing")}
                        disabled={updatingId === cand.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Schedule Interview
                      </button>
                    )}

                    {cand.status !== "accepted" && (
                      <button
                        onClick={() => handleStatusChange(cand.id, "accepted")}
                        disabled={updatingId === cand.id}
                        className="px-2.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        Mark Selected
                      </button>
                    )}

                    {cand.status !== "rejected" && (
                      <button
                        onClick={() => handleStatusChange(cand.id, "rejected")}
                        disabled={updatingId === cand.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {cand.cover_letter && (
                  <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-white/5 text-xs text-slate-400 font-sans italic leading-relaxed">
                    &ldquo;{cand.cover_letter}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Full Profile Modal */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-3xl w-full my-8 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-lg text-blue-400">
                  {selectedCandidateModal.avatarUrl ? (
                    <img src={selectedCandidateModal.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    selectedCandidateModal.studentName?.[0]
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedCandidateModal.studentName}</h2>
                  <p className="text-xs text-slate-400">{selectedCandidateModal.studentEmail}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 text-xs font-sans">
              {/* Academics & Target Role */}
              <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <span className="text-slate-500 block">University</span>
                  <span className="text-slate-200 font-medium">{selectedCandidateModal.university || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Degree / Branch</span>
                  <span className="text-slate-200 font-medium">{selectedCandidateModal.branch || selectedCandidateModal.degree || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CGPA</span>
                  <span className="text-slate-200 font-medium">{selectedCandidateModal.cgpa || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Role</span>
                  <span className="text-blue-400 font-medium">{selectedCandidateModal.targetRole || "Software Engineer"}</span>
                </div>
              </div>

              {/* Career DNA Score */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-white">Career DNA Benchmark Score</h4>
                    <p className="text-[11px] text-slate-400">AI-verified readiness rating for technical engineering roles.</p>
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-blue-400">
                  {selectedCandidateModal.careerDnaScore}/100
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Verified Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidateModal.skills.length === 0 ? (
                    <span className="text-slate-500">No skills listed.</span>
                  ) : (
                    selectedCandidateModal.skills.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 rounded bg-slate-950 text-cyan-300 border border-cyan-500/20 font-mono text-[11px]">
                        {sk}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Portfolio Projects ({selectedCandidateModal.projects.length})
                </h4>
                {selectedCandidateModal.projects.length === 0 ? (
                  <p className="text-slate-500">No projects added yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {selectedCandidateModal.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-white">{proj.title}</h5>
                          {proj.github_url && (
                            <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {proj.description && <p className="text-slate-400 text-[11px] leading-relaxed">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Links & Resume */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                {selectedCandidateModal.resume_url && (
                  <a
                    href={selectedCandidateModal.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </a>
                )}
                {selectedCandidateModal.portfolioUrl && (
                  <a
                    href={selectedCandidateModal.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-medium flex items-center gap-1.5 transition border border-white/10"
                  >
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Portfolio Website
                  </a>
                )}
                {selectedCandidateModal.githubUrl && (
                  <a
                    href={selectedCandidateModal.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {selectedCandidateModal.linkedinUrl && (
                  <a
                    href={selectedCandidateModal.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

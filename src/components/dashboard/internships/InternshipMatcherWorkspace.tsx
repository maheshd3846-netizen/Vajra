"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Loader2,
  Clock,
  Bookmark,
  Share2,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyToInternshipAction,
  toggleSaveInternshipAction,
  runAiApplicationReviewAction,
  type EnhancedInternshipRecord,
} from "@/app/actions/internships";
import type { PreApplicationAiReview } from "@/lib/ai-internship-matching-engine";

interface ApplicationItem {
  id: string;
  internship_id: string;
  resume_url: string;
  status: string; // applied, reviewing, shortlisted, interviewing, accepted, rejected
  applied_at: string;
  internships?: {
    title: string;
    companies?: {
      name: string;
    } | null;
  } | null;
}

interface StudentSkill {
  skill_name: string;
}

interface WorkspaceProps {
  initialInternships: EnhancedInternshipRecord[];
  initialApplications: ApplicationItem[];
  studentSkills: StudentSkill[];
  userId: string;
}

export default function InternshipMatcherWorkspace({
  initialInternships,
  initialApplications,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studentSkills: _studentSkills,
  userId: _userId,
}: WorkspaceProps) {
  const [internships, setInternships] = useState<EnhancedInternshipRecord[]>(initialInternships);
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  
  // Active Tab: Explore vs Applications Tracker
  const [activeMainTab, setActiveMainTab] = useState<"explore" | "applications">("explore");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "remote" | "high" | "paid" | "verified" | "saved">("all");
  const [sortBy, setSortBy] = useState<"match" | "newest" | "stipend">("match");

  // Pre-Apply AI Review Modal State
  const [reviewModalJob, setReviewModalJob] = useState<EnhancedInternshipRecord | null>(null);
  const [aiReviewData, setAiReviewData] = useState<PreApplicationAiReview | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  // Quick Apply Modal State
  const [activeModalJob, setActiveModalJob] = useState<EnhancedInternshipRecord | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  // Bookmark Toggle
  const handleToggleSave = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const res = await toggleSaveInternshipAction(jobId);
      if (res.success) {
        setInternships((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, isSaved: res.isSaved } : j))
        );
        toast.success(res.isSaved ? "Saved to Bookmarks" : "Removed from Bookmarks");
      }
    } catch {
      toast.error("Could not update bookmark.");
    }
  };

  // Run AI Validation Review
  const handleOpenAiReview = async (job: EnhancedInternshipRecord) => {
    setReviewModalJob(job);
    setIsLoadingReview(true);
    setAiReviewData(null);

    try {
      const res = await runAiApplicationReviewAction(job.id);
      if (res.success && res.review) {
        setAiReviewData(res.review);
      } else {
        toast.error(res.error || "Failed to generate AI application review.");
      }
    } catch {
      toast.error("Error loading pre-application review.");
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Quick Apply Handler
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalJob) return;

    // Check if already applied
    if (applications.some((app) => app.internship_id === activeModalJob.id)) {
      toast.info("You have already applied to this position.");
      return;
    }

    setIsApplying(true);
    toast.loading(`Submitting application for ${activeModalJob.title}...`);

    try {
      const resumePath = `resumes/${_userId}/primary_resume.pdf`;
      const res = await applyToInternshipAction(activeModalJob.id, resumePath, coverLetter);
      toast.dismiss();

      if (res.success) {
        toast.success(`Application sent to ${activeModalJob.company.name}!`);

        const newApp: ApplicationItem = {
          id: Math.random().toString(),
          internship_id: activeModalJob.id,
          resume_url: resumePath,
          status: "applied",
          applied_at: new Date().toISOString(),
          internships: {
            title: activeModalJob.title,
            companies: { name: activeModalJob.company.name },
          },
        };
        setApplications((prev) => [newApp, ...prev]);

        setActiveModalJob(null);
        setCoverLetter("");
      } else {
        toast.error(res.error || "Failed to submit application.");
      }
    } catch {
      toast.dismiss();
      toast.error("Unexpected error submitting application.");
    } finally {
      setIsApplying(false);
    }
  };

  // Share Link
  const handleShareLink = (job: EnhancedInternshipRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/internships?id=${job.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Internship link copied to clipboard!");
  };

  // Filter & Sort Logic
  const filteredJobs = internships
    .filter((job) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.skills_needed.some((s) => s.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (filterMode === "remote") return job.type.toLowerCase() === "remote";
      if (filterMode === "high") return job.matchResult.matchScore >= 80;
      if (filterMode === "paid") {
        return (
          job.salary_range &&
          !job.salary_range.toLowerCase().includes("unpaid") &&
          !job.salary_range.includes("₹0")
        );
      }
      if (filterMode === "verified") return job.company.verification_status === "verified";
      if (filterMode === "saved") return job.isSaved;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "stipend") {
        const getVal = (s: string | null) => {
          if (!s) return 0;
          const match = s.match(/\d+/g);
          return match ? parseInt(match.join("")) : 0;
        };
        return getVal(b.salary_range) - getVal(a.salary_range);
      }
      return b.matchResult.matchScore - a.matchResult.matchScore;
    });

  const getPipelineStageStep = (st: string) => {
    switch (st.toLowerCase()) {
      case "applied":
        return 1;
      case "reviewing":
        return 2;
      case "shortlisted":
        return 3;
      case "interviewing":
        return 4;
      case "accepted":
        return 5;
      case "rejected":
        return -1;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white font-sans">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            AI Career Intelligence Marketplace
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">
            Internship Matching Platform
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-sans">
            AI-calibrated internship recommendations matched against your Career DNA, verified technical skills, and portfolio projects.
          </p>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveMainTab("explore")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === "explore"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Explore Internships ({internships.length})
          </button>
          <button
            onClick={() => setActiveMainTab("applications")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === "applications"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            My Applications ({applications.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: EXPLORE INTERNSHIPS ─── */}
      {activeMainTab === "explore" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-slate-900/80 p-4 rounded-2xl border border-white/10">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                placeholder="Search roles, technologies, or partner companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Filter:</span>
              {(["all", "remote", "high", "paid", "verified", "saved"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium uppercase font-mono tracking-wider transition-all cursor-pointer ${
                    filterMode === m
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : "bg-slate-950 text-slate-400 border border-white/5 hover:border-white/10"
                  }`}
                >
                  {m === "all" && "All Roles"}
                  {m === "remote" && "Remote"}
                  {m === "high" && "Match > 80%"}
                  {m === "paid" && "Paid Stipend"}
                  {m === "verified" && "Verified"}
                  {m === "saved" && "Bookmarked"}
                </button>
              ))}

              <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "match" | "newest" | "stipend")}
                className="bg-slate-950 border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="match">Sort: Highest Match</option>
                <option value="newest">Sort: Newest</option>
                <option value="stipend">Sort: Highest Stipend</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="md:col-span-2 p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-white">No internships found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                  No open job listings match your current search query or active filter selections.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isAlreadyApplied = applications.some((app) => app.internship_id === job.id);

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all space-y-5 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center font-bold text-white text-lg shrink-0">
                            {job.company.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white leading-tight">{job.title}</h3>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-xs text-slate-400 font-sans">{job.company.name}</span>
                              <span
                                className={`text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${job.company.trustBadgeClass.bg} ${job.company.trustBadgeClass.border} ${job.company.trustBadgeClass.text}`}
                              >
                                {job.company.trustBadgeLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center shrink-0">
                          <span className="text-[8px] uppercase font-mono text-slate-400 block">AI Match</span>
                          <span className="text-base font-black font-mono text-blue-400">
                            {job.matchResult.matchScore}%
                          </span>
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-sans pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {job.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                          {job.salary_range || "Stipend Negotiable"}
                        </span>
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-950 text-[10px] text-blue-400 border border-blue-500/10 font-mono">
                          {job.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Readiness: {job.matchResult.expectedReadiness}%
                        </span>
                      </div>

                      {/* AI Fit Summary */}
                      <p className="text-xs text-slate-300/80 leading-relaxed font-sans line-clamp-2 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        💡 {job.matchResult.aiFitSummary}
                      </p>

                      {/* Skills Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills_needed.map((sk, i) => {
                          const isMatch = job.matchResult.reasons.some((r) =>
                            r.toLowerCase().includes(sk.toLowerCase())
                          );
                          return (
                            <span
                              key={i}
                              className={`text-[9px] font-semibold font-mono px-2 py-0.5 rounded border ${
                                isMatch
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-slate-950 border-white/5 text-slate-400"
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleSave(job.id, e)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            job.isSaved
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                              : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                          }`}
                          title="Bookmark Internship"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleShareLink(job, e)}
                          className="p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Share Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenAiReview(job)}
                          className="bg-slate-950 border-blue-500/20 text-blue-400 hover:text-white hover:bg-blue-600/20 text-xs py-2 px-3 rounded-xl cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1" /> AI Review
                        </Button>

                        {isAlreadyApplied ? (
                          <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </span>
                        ) : (
                          <Button
                            onClick={() => setActiveModalJob(job)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-md cursor-pointer"
                          >
                            Quick Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MY APPLICATIONS TRACKER ─── */}
      {activeMainTab === "applications" && (
        <div className="space-y-6">
          <div className="space-y-1 border-b border-white/10 pb-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Recruitment Pipeline & Stage Tracker
            </h2>
            <p className="text-xs text-slate-400">
              Track real-time progress for your submitted internship applications across employer review stages.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No active applications submitted yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                Browse available roles in the Explore tab and click Quick Apply to start tracking application stages.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => {
                const currentStageStep = getPipelineStageStep(app.status);
                const title = app.internships?.title || "Internship Role";
                const companyName = app.internships?.companies?.name || "Partner Organization";

                return (
                  <div
                    key={app.id}
                    className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{title}</h3>
                        <p className="text-xs text-slate-400">{companyName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500">
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-xs font-mono uppercase font-bold px-3 py-1 rounded-full border ${
                            app.status === "accepted"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : app.status === "rejected"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Tracker Progress Bar */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono uppercase text-slate-400">
                        <span className={currentStageStep >= 1 ? "text-blue-400 font-bold" : ""}>Applied</span>
                        <span className={currentStageStep >= 2 ? "text-blue-400 font-bold" : ""}>Under Review</span>
                        <span className={currentStageStep >= 3 ? "text-blue-400 font-bold" : ""}>Shortlisted</span>
                        <span className={currentStageStep >= 4 ? "text-blue-400 font-bold" : ""}>Interview</span>
                        <span className={currentStageStep >= 5 ? "text-emerald-400 font-bold" : ""}>Selected</span>
                      </div>

                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            currentStageStep === -1
                              ? "bg-red-500 w-full"
                              : "bg-gradient-to-r from-blue-500 to-emerald-500"
                          }`}
                          style={{
                            width:
                              currentStageStep === -1
                                ? "100%"
                                : `${Math.max(20, (currentStageStep / 5) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PRE-APPLICATION AI REVIEW MODAL */}
      <AnimatePresence>
        {reviewModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] uppercase font-mono text-blue-400 font-bold block">
                    AI Pre-Application Diagnostic Report
                  </span>
                  <h3 className="text-base font-bold text-white">{reviewModalJob.title}</h3>
                  <p className="text-xs text-slate-400">{reviewModalJob.company.name}</p>
                </div>
                <button
                  onClick={() => setReviewModalJob(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {isLoadingReview || !aiReviewData ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Running AI ATS match validation report...</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs font-sans">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Resume Match</span>
                      <span className="text-lg font-bold font-mono text-blue-400">{aiReviewData.resumeMatchPercent}%</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Expected ATS Match</span>
                      <span className="text-lg font-bold font-mono text-purple-400">{aiReviewData.expectedAtsMatchPercent}%</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 text-center">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Readiness Index</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">{aiReviewData.applicationReadinessScore}%</span>
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {aiReviewData.missingSkills.length > 0 && (
                    <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl space-y-1.5">
                      <span className="text-[10px] font-bold uppercase font-mono text-yellow-300">
                        Missing Technical Skill Requirements
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {aiReviewData.missingSkills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-[10px] font-mono rounded">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                      AI Application Optimization Suggestions
                    </span>
                    {aiReviewData.suggestions.map((sug, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button
                      variant="outline"
                      onClick={() => setReviewModalJob(null)}
                      className="bg-transparent border-white/10 text-slate-400 text-xs cursor-pointer"
                    >
                      Close Report
                    </Button>
                    <Button
                      onClick={() => {
                        const target = reviewModalJob;
                        setReviewModalJob(null);
                        if (target) setActiveModalJob(target);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 cursor-pointer"
                    >
                      Proceed to Quick Apply →
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK APPLY MODAL */}
      <AnimatePresence>
        {activeModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Quick Apply — {activeModalJob.title}</h3>
                  <p className="text-xs text-slate-400">{activeModalJob.company.name}</p>
                </div>
                <button
                  onClick={() => setActiveModalJob(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Attached Credentials:</span>
                  <span className="text-emerald-400 font-bold">VAJRA Primary Resume + Career DNA</span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Cover Note (Optional)</Label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state why you're interested in this engineering role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveModalJob(null)}
                    className="bg-transparent border-white/10 text-slate-400 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isApplying}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-5 cursor-pointer"
                  >
                    {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { applyToInternshipAction } from "@/app/actions/internships";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyInfo {
  name: string;
  logo_url: string | null;
  is_verified: boolean;
}

interface Internship {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string | null;
  type: string;
  requirements: string[];
  skills_needed: string[];
  salary_range: string | null;
  status: string;
  created_at: string;
  companies: CompanyInfo | null;
  matchScore?: number;
}

interface Application {
  id: string;
  internship_id: string;
  resume_url: string;
  status: string;
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
  initialInternships: Internship[];
  initialApplications: Application[];
  studentSkills: StudentSkill[];
  userId: string;
}

export default function InternshipMatcherWorkspace({
  initialInternships,
  initialApplications,
  studentSkills,
  userId,
}: WorkspaceProps) {
  const internships = initialInternships;
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "remote" | "high" | "paid">("all");
  const [sortBy, setSortBy] = useState<"match" | "newest" | "stipend">("match");
  
  // Modal State
  const [activeModalJob, setActiveModalJob] = useState<Internship | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const studentSkillNames = studentSkills.map((s) => s.skill_name.toLowerCase());

  // Filter & Sort logic
  const filteredJobs = internships
    .filter((job) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        (job.companies?.name || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterMode === "remote") return job.type.toLowerCase() === "remote";
      if (filterMode === "high") return (job.matchScore || 50) >= 85;
      if (filterMode === "paid") {
        return (
          job.salary_range &&
          !job.salary_range.toLowerCase().includes("unpaid") &&
          !job.salary_range.includes("₹0")
        );
      }

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
      return (b.matchScore || 50) - (a.matchScore || 50);
    });

  const handleQuickApply = async (job: Internship) => {
    // Check if already applied
    if (applications.some((app) => app.internship_id === job.id)) {
      toast.info("You have already applied to this position.");
      return;
    }

    toast.loading(`Submitting Quick Application for ${job.title}...`);
    try {
      const resumePath = `resumes/${userId}/resume.pdf`; // fallback path
      const res = await applyToInternshipAction(job.id, resumePath, "Quick Apply via Career DNA Profile");
      toast.dismiss();

      if (res.success) {
        toast.success(`Application sent to ${job.companies?.name}!`);
        
        // Add new application to client pipeline in real-time
        const newApp: Application = {
          id: Math.random().toString(),
          internship_id: job.id,
          resume_url: resumePath,
          status: "applied",
          applied_at: new Date().toISOString(),
          internships: {
            title: job.title,
            companies: {
              name: job.companies?.name || "Verified Partner",
            },
          },
        };
        setApplications((prev) => [newApp, ...prev]);
      } else {
        toast.error(res.error || "Failed to submit application.");
      }
    } catch {
      toast.dismiss();
      toast.error("An unexpected error occurred.");
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalJob) return;

    setIsApplying(true);
    try {
      const resumePath = `resumes/${userId}/resume.pdf`;
      const res = await applyToInternshipAction(activeModalJob.id, resumePath, coverLetter);

      if (res.success) {
        toast.success(`Applied successfully to ${activeModalJob.companies?.name}!`);
        const newApp: Application = {
          id: Math.random().toString(),
          internship_id: activeModalJob.id,
          resume_url: resumePath,
          status: "applied",
          applied_at: new Date().toISOString(),
          internships: {
            title: activeModalJob.title,
            companies: {
              name: activeModalJob.companies?.name || "Verified Partner",
            },
          },
        };
        setApplications((prev) => [newApp, ...prev]);
        setActiveModalJob(null);
        setCoverLetter("");
      } else {
        toast.error(res.error || "Failed to submit application.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsApplying(false);
    }
  };

  // Get status color mappings for active applications tracker
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reviewing":
      case "under review":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "interviewing":
      case "interview scheduled":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "accepted":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "rejected":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Filter & Search Toolbar */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <Input
            placeholder="Search by role or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-5 bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "remote", "high", "paid"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                filterMode === mode
                  ? "bg-blue-500/10 border-blue-500 text-white"
                  : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {mode === "high" ? ">85% Match" : mode}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-sans">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "match" | "newest" | "stipend")}
            className="bg-slate-950 border border-white/10 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
          >
            <option value="match">Highest Match</option>
            <option value="newest">Newest</option>
            <option value="stipend">Highest Stipend</option>
          </select>
        </div>
      </div>

      {/* 2. Main Dual Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Internship Cards Grid (Col span 8) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="p-16 border border-white/10 border-dashed rounded-2xl text-center text-muted-foreground bg-slate-900/30">
              <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-slate-400 font-heading">No Opportunities Match Search</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-1">Try adjusting your filters or search query terms.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const hasApplied = applications.some((app) => app.internship_id === job.id);
              return (
                <div
                  key={job.id}
                  className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Header Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-semibold">{job.companies?.name}</span>
                        {job.companies?.is_verified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                            Verified
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-400 ml-2 font-mono">
                          {job.matchScore || 50}% Match
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white font-heading leading-tight">
                        {job.title}
                      </h3>
                      
                      {/* Meta data */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground mt-2 font-sans">
                        <span className="flex items-center gap-0.5 capitalize">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.type}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills overlaps */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                    <span className="text-[9px] uppercase font-semibold text-slate-500 font-sans block">Skill Match Summary</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills_needed.map((skill) => {
                        const isMatch = studentSkillNames.includes(skill.toLowerCase());
                        return (
                          <span
                            key={skill}
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-semibold border ${
                              isMatch
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-slate-950/40 border-white/10 text-slate-500"
                            }`}
                          >
                            {isMatch ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action footers */}
                  <div className="flex items-center gap-3 mt-5 pt-3 border-t border-white/5">
                    <Button
                      onClick={() => setActiveModalJob(job)}
                      className="flex-1 py-3.5 bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleQuickApply(job)}
                      disabled={hasApplied}
                      className={`flex-1 py-3.5 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        hasApplied
                          ? "bg-slate-800 border border-white/5 text-slate-500 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {hasApplied ? "Already Applied" : "Quick Apply"}
                    </Button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Active Applications Sidebar (Col span 4) */}
        <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Active Applications
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">({applications.length})</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs font-sans">
                  No active submissions found.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {app.internships?.title}
                        </h4>
                        <span className="text-[9px] text-muted-foreground block mt-0.5">
                          {app.internships?.companies?.name || "Verified Partner"}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center text-[10px] text-muted-foreground font-mono flex items-center justify-center gap-1 select-none">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Verified Recruiter Channels
          </div>
        </div>

      </div>

      {/* 3. Detailed Opportunity Drawer Modal */}
      {activeModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setActiveModalJob(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Card */}
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl relative z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {activeModalJob.companies?.name}
                </span>
                <h2 className="text-lg font-bold text-white font-heading mt-2">
                  {activeModalJob.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalJob(null)}
                className="p-1.5 rounded-lg bg-slate-950 border border-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Skill Fit Analysis */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-white/5 font-sans">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wide">
                AI Skill Fit Analysis
              </span>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Matching DNA skills overlap</span>
                <span className="font-mono font-bold">{activeModalJob.matchScore || 50}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${activeModalJob.matchScore || 50}%` }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 font-sans text-xs">
              <h4 className="font-bold text-slate-200 text-xs">Job Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {activeModalJob.description}
              </p>
            </div>

            {/* Requirements List */}
            <div className="space-y-2 font-sans text-xs">
              <h4 className="font-bold text-slate-200 text-xs">Key Requirements</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground leading-relaxed">
                {activeModalJob.requirements.length > 0 ? (
                  activeModalJob.requirements.map((req, i) => <li key={i}>{req}</li>)
                ) : (
                  <li>Proficient in requested skill tags matching target outputs.</li>
                )}
              </ul>
            </div>

            {/* Apply Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4 pt-4 border-t border-white/5 font-sans">
              <div className="space-y-1.5">
                <Label htmlFor="coverLetter" className="text-xs text-slate-300 font-semibold">
                  Add brief cover note (Optional)
                </Label>
                <textarea
                  id="coverLetter"
                  rows={3}
                  placeholder="Introduce yourself or highlight matching projects..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setActiveModalJob(null)}
                  className="flex-1 py-4 bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isApplying}
                  className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<"explore" | "applications">("explore");

  // Filter & Search State
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
    <div className="space-y-6">
      {/* Top Title & Tab Switcher Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Engine</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Internship Marketplace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified opportunities matched against your Career DNA and technical skill vector.
          </p>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg border border-border bg-muted/40 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "explore"
                ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Explore ({internships.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === "applications"
                ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Applications ({applications.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: EXPLORE INTERNSHIPS ─── */}
      {activeTab === "explore" && (
        <div className="space-y-5">
          {/* Command Filter Bar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card p-3 rounded-xl border border-border shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by role title, technology, or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-muted/30"
              />
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "remote", "high", "paid", "verified", "saved"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    filterMode === m
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {m === "all" && "All"}
                  {m === "remote" && "Remote"}
                  {m === "high" && "Match > 80%"}
                  {m === "paid" && "Paid Stipend"}
                  {m === "verified" && "Verified"}
                  {m === "saved" && "Saved"}
                </button>
              ))}

              <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "match" | "newest" | "stipend")}
                className="h-8 rounded-md border border-border bg-background px-2 text-[11px] font-medium text-foreground cursor-pointer focus:outline-none"
              >
                <option value="match">Sort: AI Match</option>
                <option value="newest">Sort: Newest</option>
                <option value="stipend">Sort: Stipend</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="md:col-span-2 py-12 px-4 rounded-xl border border-dashed border-border bg-card text-center space-y-2">
                <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">No internships found</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search keywords or switching off active filter tags.
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isAlreadyApplied = applications.some((app) => app.internship_id === job.id);

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:border-foreground/20 transition-all flex flex-col justify-between h-full">
                      <CardHeader className="space-y-3 pb-3">
                        {/* Top Header: Company logo & Match Score */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg border border-border bg-muted/40 flex items-center justify-center font-bold text-sm text-foreground shrink-0 font-mono">
                              {job.company.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold leading-tight text-foreground">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {job.company.name}
                                </span>
                                <Badge
                                  variant={job.company.verification_status === "verified" ? "success" : "secondary"}
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {job.company.verification_status === "verified" ? "Verified" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <Badge variant="ai" className="px-2 py-1 text-xs shrink-0 font-mono">
                            {job.matchResult.matchScore}% Match
                          </Badge>
                        </div>

                        {/* Metadata Specs */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location || "Remote"}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salary_range || "Negotiable"}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {job.type}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 py-2">
                        {/* AI Summary */}
                        <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50 leading-relaxed line-clamp-2">
                          ⚡ {job.matchResult.aiFitSummary}
                        </p>

                        {/* Skills Badges */}
                        <div className="flex flex-wrap gap-1">
                          {job.skills_needed.map((sk, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] font-mono px-2 py-0.5 bg-background"
                            >
                              {sk}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => handleToggleSave(job.id, e)}
                            className={job.isSaved ? "text-amber-500 hover:text-amber-600" : ""}
                            title="Save job"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => handleShareLink(job, e)}
                            title="Share link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAiReview(job)}
                          >
                            <FileCheck className="w-3.5 h-3.5 mr-1" /> AI Diagnostic
                          </Button>

                          {isAlreadyApplied ? (
                            <Badge variant="success" className="h-8 px-3 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Applied
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setActiveModalJob(job)}
                            >
                              Quick Apply
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: APPLICATIONS TRACKER ─── */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xs font-semibold text-foreground uppercase font-mono tracking-wider">
              Submitted Applications & Timeline Status
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              Total: {applications.length}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="py-12 px-4 rounded-xl border border-dashed border-border bg-card text-center space-y-2">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No applications submitted yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Explore available roles in the marketplace and click Quick Apply to track your recruitment stages here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const currentStageStep = getPipelineStageStep(app.status);
                const title = app.internships?.title || "Internship Role";
                const companyName = app.internships?.companies?.name || "Partner Company";

                return (
                  <Card key={app.id} className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="text-xs text-muted-foreground">{companyName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                        <Badge
                          variant={
                            app.status === "accepted"
                              ? "success"
                              : app.status === "rejected"
                              ? "destructive"
                              : "default"
                          }
                          className="uppercase font-mono text-[10px]"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Stage Timeline */}
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-5 text-center text-[10px] font-mono text-muted-foreground uppercase">
                        <span className={currentStageStep >= 1 ? "text-primary font-bold" : ""}>Applied</span>
                        <span className={currentStageStep >= 2 ? "text-primary font-bold" : ""}>Reviewing</span>
                        <span className={currentStageStep >= 3 ? "text-primary font-bold" : ""}>Shortlisted</span>
                        <span className={currentStageStep >= 4 ? "text-primary font-bold" : ""}>Interview</span>
                        <span className={currentStageStep >= 5 ? "text-emerald-500 font-bold" : ""}>Selected</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            currentStageStep === -1 ? "bg-destructive w-full" : "bg-primary"
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
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PRE-APPLICATION DIAGNOSTIC MODAL */}
      <AnimatePresence>
        {reviewModalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-card border border-border rounded-xl p-5 max-w-lg w-full space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <Badge variant="ai" className="mb-1 text-[10px] uppercase font-mono">
                    AI Diagnostic Report
                  </Badge>
                  <h3 className="text-sm font-semibold text-foreground">{reviewModalJob.title}</h3>
                  <p className="text-xs text-muted-foreground">{reviewModalJob.company.name}</p>
                </div>
                <button
                  onClick={() => setReviewModalJob(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>

              {isLoadingReview || !aiReviewData ? (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">Evaluating resume ATS compatibility...</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
                      <span className="text-[10px] uppercase font-mono text-muted-foreground block">Resume Match</span>
                      <span className="text-sm font-bold font-mono text-primary">{aiReviewData.resumeMatchPercent}%</span>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
                      <span className="text-[10px] uppercase font-mono text-muted-foreground block">ATS Index</span>
                      <span className="text-sm font-bold font-mono text-indigo-400">{aiReviewData.expectedAtsMatchPercent}%</span>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
                      <span className="text-[10px] uppercase font-mono text-muted-foreground block">Readiness</span>
                      <span className="text-sm font-bold font-mono text-emerald-500">{aiReviewData.applicationReadinessScore}%</span>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-foreground block">AI Recommendations</span>
                    {aiReviewData.suggestions.map((sug, i) => (
                      <div key={i} className="flex items-start gap-2 text-muted-foreground text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewModalJob(null)}
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const target = reviewModalJob;
                        setReviewModalJob(null);
                        if (target) setActiveModalJob(target);
                      }}
                    >
                      Proceed to Apply →
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-card border border-border rounded-xl p-5 max-w-lg w-full space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Apply to {activeModalJob.title}</h3>
                  <p className="text-xs text-muted-foreground">{activeModalJob.company.name}</p>
                </div>
                <button
                  onClick={() => setActiveModalJob(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Attached Credential:</span>
                  <span className="text-emerald-500 font-semibold">Primary Resume + DNA</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-foreground font-medium">Cover Note (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Brief note highlighting your relevant projects..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-input/40 border border-border text-xs text-foreground rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModalJob(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isApplying}
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

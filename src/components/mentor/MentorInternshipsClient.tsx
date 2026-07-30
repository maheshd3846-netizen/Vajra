"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateInternshipApprovalStatusAction,
} from "@/app/actions/internships";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Ban,
  Building,
  MessageSquare,
  X,
  Users,
} from "lucide-react";

export interface PendingInternshipItem {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string | null;
  type: string;
  internship_type?: string | null;
  duration?: string | null;
  stipend?: string | null;
  salary_range?: string | null;
  requirements: string[];
  skills_needed: string[];
  eligibility?: string | null;
  deadline?: string | null;
  openings_count: number;
  status: string; // pending_approval, approved, changes_requested, rejected, suspended, archived
  admin_feedback?: string | null;
  created_at: string;
  company: {
    name: string;
    logo_url: string | null;
    official_email: string | null;
    is_verified: boolean;
  };
}

interface MentorInternshipsClientProps {
  initialInternships: PendingInternshipItem[];
}

export default function MentorInternshipsClient({
  initialInternships,
}: MentorInternshipsClientProps) {
  const [internships, setInternships] = useState<PendingInternshipItem[]>(initialInternships);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending_approval");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal State
  const [selectedJob, setSelectedJob] = useState<PendingInternshipItem | null>(null);
  const [actionModalType, setActionModalType] = useState<"approve" | "reject" | "changes" | "suspend" | "archive" | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const pendingCount = internships.filter((i) => i.status === "pending_approval").length;
  const approvedCount = internships.filter((i) => i.status === "approved" || i.status === "open").length;
  const changesCount = internships.filter((i) => i.status === "changes_requested").length;
  const rejectedCount = internships.filter((i) => i.status === "rejected").length;

  const filteredInternships = internships.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.company.name.toLowerCase().includes(q) ||
      (job.skills_needed || []).some((s) => s.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter !== "all" && job.status !== statusFilter) {
      return false;
    }

    if (typeFilter !== "all" && job.type.toLowerCase() !== typeFilter) {
      return false;
    }

    return true;
  });

  const handleExecuteStatusChange = async () => {
    if (!selectedJob || !actionModalType) return;

    const statusMap: Record<string, "approved" | "rejected" | "changes_requested" | "suspended" | "archived"> = {
      approve: "approved",
      reject: "rejected",
      changes: "changes_requested",
      suspend: "suspended",
      archive: "archived",
    };

    const targetStatus = statusMap[actionModalType];
    setIsSubmitting(true);

    try {
      const res = await updateInternshipApprovalStatusAction(selectedJob.id, targetStatus, feedbackNotes);
      if (res.success) {
        toast.success(`Internship status updated to "${targetStatus}"`);
        setInternships((prev) =>
          prev.map((i) =>
            i.id === selectedJob.id ? { ...i, status: targetStatus, admin_feedback: feedbackNotes } : i
          )
        );
        setActionModalType(null);
        setSelectedJob(null);
        setFeedbackNotes("");
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "pending_approval":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>;
      case "approved":
      case "open":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved & Live</Badge>;
      case "changes_requested":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20"><AlertCircle className="w-3 h-3 mr-1" /> Changes Requested</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20"><Ban className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mentor Control Panel</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Internship Approval Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review company internship postings, request modifications, or approve listings for student discovery.
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-amber-500 font-bold">{pendingCount}</span>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-emerald-500 font-bold">{approvedCount}</span>
            <span className="text-muted-foreground">Approved</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-blue-500 font-bold">{changesCount}</span>
            <span className="text-muted-foreground">Revisions</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-rose-500 font-bold">{rejectedCount}</span>
            <span className="text-muted-foreground">Rejected</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border rounded-xl p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {[
            { id: "pending_approval", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "changes_requested", label: "Changes" },
            { id: "rejected", label: "Rejected" },
            { id: "all", label: "All Statuses" },
          ].map((st) => (
            <Button
              key={st.id}
              variant={statusFilter === st.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(st.id)}
              className="h-8 text-xs px-2.5 rounded-lg"
            >
              {st.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Internship Cards Grid */}
      {filteredInternships.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/40">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-semibold text-foreground">No Internships Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No internship listings match your selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInternships.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border hover:border-primary/40 transition-all rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                      {job.company.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{job.company.name}</span>
                        {job.company.is_verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(job.status)}</div>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{job.location || job.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">{job.stipend || job.salary_range || "Negotiable"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{job.duration || "3 Months"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>{job.openings_count} Openings</span>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1">
                  {(job.skills_needed || []).slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                  {(job.skills_needed || []).length > 4 && (
                    <span className="text-[10px] text-muted-foreground font-mono self-center">
                      +{(job.skills_needed || []).length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(job)}
                  className="h-8 text-xs gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Button>

                {job.status === "pending_approval" && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedJob(job);
                        setActionModalType("approve");
                      }}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedJob(job);
                        setActionModalType("changes");
                      }}
                      className="h-8 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-50"
                    >
                      Request Changes
                    </Button>
                  </div>
                )}

                {job.status !== "pending_approval" && (
                  <div className="flex items-center gap-1">
                    {job.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedJob(job);
                          setActionModalType("approve");
                        }}
                        className="h-8 text-xs text-emerald-600 hover:bg-emerald-50"
                      >
                        Approve
                      </Button>
                    )}
                    {job.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedJob(job);
                          setActionModalType("reject");
                        }}
                        className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details & Review Action Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                    {selectedJob.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedJob.title}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{selectedJob.company.name}</span>
                      {selectedJob.company.official_email && (
                        <span>({selectedJob.company.official_email})</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedJob(null);
                    setActionModalType(null);
                    setFeedbackNotes("");
                  }}
                  className="h-8 w-8 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">Current Status:</span>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">
                  Submitted {new Date(selectedJob.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Job Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block uppercase font-mono">Location</span>
                  <span className="font-medium text-foreground">{selectedJob.location || selectedJob.type}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block uppercase font-mono">Stipend</span>
                  <span className="font-medium text-emerald-600">{selectedJob.stipend || selectedJob.salary_range || "Negotiable"}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block uppercase font-mono">Duration</span>
                  <span className="font-medium text-foreground">{selectedJob.duration || "3 Months"}</span>
                </div>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground text-[10px] block uppercase font-mono">Openings</span>
                  <span className="font-medium text-foreground">{selectedJob.openings_count} Position(s)</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Role Description
                </h4>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-3 rounded-lg border border-border/40">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills & Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.skills_needed || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Eligibility
                  </h4>
                  <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    {selectedJob.eligibility || "Open to eligible students"}
                  </p>
                </div>
              </div>

              {/* Decision / Action Area */}
              {actionModalType && (
                <div className="space-y-3 pt-3 border-t border-border bg-muted/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span>
                      {actionModalType === "approve"
                        ? "Approve Internship Listing"
                        : actionModalType === "reject"
                        ? "Reject Internship Listing"
                        : actionModalType === "changes"
                        ? "Request Modifications"
                        : "Update Listing Status"}
                    </span>
                  </div>
                  <Input
                    placeholder="Enter notes or feedback for the company recruiter (optional)..."
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    className="text-xs h-9 bg-card"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionModalType(null)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleExecuteStatusChange}
                      disabled={isSubmitting}
                      className={`h-8 text-xs text-white ${
                        actionModalType === "approve"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : actionModalType === "reject"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      {isSubmitting ? "Updating..." : "Confirm Decision"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Trigger Buttons if no active action form */}
              {!actionModalType && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionModalType("changes")}
                    className="h-8 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-50"
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionModalType("reject")}
                    className="h-8 text-xs border-rose-500/40 text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActionModalType("approve")}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve Listing
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

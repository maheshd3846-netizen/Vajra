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
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Trash2,
  Ban,
  Archive,
  X,
  MessageSquare,
  Users,
  Sparkles,
  Briefcase,
} from "lucide-react";

export interface AdminInternshipRecord {
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
  status: string; // pending_approval, approved, changes_requested, rejected, suspended, archived, open, closed
  admin_feedback?: string | null;
  created_at: string;
  company: {
    name: string;
    logo_url: string | null;
    official_email: string | null;
    is_verified: boolean;
  };
}

interface AdminInternshipsClientProps {
  initialInternships: AdminInternshipRecord[];
}

export default function AdminInternshipsClient({
  initialInternships,
}: AdminInternshipsClientProps) {
  const [internships, setInternships] = useState<AdminInternshipRecord[]>(initialInternships);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal State
  const [selectedJob, setSelectedJob] = useState<AdminInternshipRecord | null>(null);
  const [actionModalType, setActionModalType] = useState<"approved" | "rejected" | "changes_requested" | "suspended" | "archived" | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics Stats
  const totalCount = internships.length;
  const pendingCount = internships.filter((i) => i.status === "pending_approval").length;
  const approvedCount = internships.filter((i) => i.status === "approved" || i.status === "open").length;
  const rejectedCount = internships.filter((i) => i.status === "rejected").length;
  const suspendedCount = internships.filter((i) => i.status === "suspended").length;

  const filteredList = internships.filter((job) => {
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

  const handleUpdateStatus = async () => {
    if (!selectedJob || !actionModalType) return;

    setIsSubmitting(true);
    try {
      const res = await updateInternshipApprovalStatusAction(selectedJob.id, actionModalType, feedbackNotes);
      if (res.success) {
        toast.success(`Internship override status set to "${actionModalType.toUpperCase()}"`);
        setInternships((prev) =>
          prev.map((i) =>
            i.id === selectedJob.id ? { ...i, status: actionModalType, admin_feedback: feedbackNotes } : i
          )
        );
        setActionModalType(null);
        setSelectedJob(null);
        setFeedbackNotes("");
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Error executing status update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "pending_approval":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending Approval</Badge>;
      case "approved":
      case "open":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin Governance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Platform Internship Oversight
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full platform visibility across all company postings, mentor decisions, suspensions, and override controls.
          </p>
        </div>

        {/* Analytics Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-foreground font-bold">{totalCount}</span>
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-amber-500 font-bold">{pendingCount}</span>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-emerald-500 font-bold">{approvedCount}</span>
            <span className="text-muted-foreground">Live</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-rose-500 font-bold">{rejectedCount}</span>
            <span className="text-muted-foreground">Rejected</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-purple-500 font-bold">{suspendedCount}</span>
            <span className="text-muted-foreground">Suspended</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border rounded-xl p-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>
          {[
            { id: "all", label: "All" },
            { id: "pending_approval", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "suspended", label: "Suspended" },
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

      {/* Table / List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {filteredList.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-foreground">No Internships Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No platform internships match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredList.map((job) => (
              <div
                key={job.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {job.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground truncate">{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Building className="w-3 h-3 text-primary" />
                        {job.company.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location || job.type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        {job.stipend || job.salary_range || "Negotiable"}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    className="h-8 text-xs gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </Button>

                  {job.status !== "approved" && job.status !== "open" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedJob(job);
                        setActionModalType("approved");
                      }}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                  )}

                  {job.status !== "suspended" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedJob(job);
                        setActionModalType("suspended");
                      }}
                      className="h-8 text-xs border-purple-500/30 text-purple-600 hover:bg-purple-50"
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Action Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedJob.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedJob.company.name} ({selectedJob.company.official_email || "Official Email"})
                  </p>
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

              {/* Status Header */}
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg text-xs">
                <span className="font-semibold text-muted-foreground">Status:</span>
                {getStatusBadge(selectedJob.status)}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground">Description</h4>
                <p className="text-xs text-foreground bg-muted/20 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase text-muted-foreground">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.skills_needed || []).map((s, idx) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Admin Override Action Controls */}
              {actionModalType && (
                <div className="space-y-3 pt-3 border-t border-border bg-muted/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span>Confirm Admin Override: {actionModalType.toUpperCase()}</span>
                  </div>
                  <Input
                    placeholder="Enter reason or compliance notes (optional)..."
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
                      onClick={handleUpdateStatus}
                      disabled={isSubmitting}
                      className="h-8 text-xs bg-primary text-primary-foreground"
                    >
                      {isSubmitting ? "Executing..." : "Apply Override"}
                    </Button>
                  </div>
                </div>
              )}

              {!actionModalType && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionModalType("rejected")}
                    className="h-8 text-xs border-rose-500/30 text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionModalType("suspended")}
                    className="h-8 text-xs border-purple-500/30 text-purple-600 hover:bg-purple-50"
                  >
                    Suspend
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActionModalType("approved")}
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

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Building,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInternshipAction,
  updateCompanyProfileAction,
  type CompanyDashboardData,
  type CreateInternshipPayload,
} from "@/app/actions/company";

interface CompanyDashboardClientProps {
  initialData: CompanyDashboardData;
}

export default function CompanyDashboardClient({
  initialData,
}: CompanyDashboardClientProps) {
  const [data, setData] = useState<CompanyDashboardData>(initialData);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Internship Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newType, setNewType] = useState<"remote" | "hybrid" | "on-site">("remote");
  const [newSkills, setNewSkills] = useState("React, Node.js, TypeScript");
  const [newSalary, setNewSalary] = useState("₹25,000 / month");

  // Profile Edit State
  const [editWebsite, setEditWebsite] = useState(data.website || "");
  const [editIndustry, setEditIndustry] = useState(data.industry || "");
  const [editDescription, setEditDescription] = useState(data.description || "");
  const [editGst, setEditGst] = useState(data.gst_number || "");
  const [editOfficialEmail, setEditOfficialEmail] = useState(data.official_email || "");

  const status = data.verification_status;
  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isBlacklisted = status === "blacklisted";

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error(
        isBlacklisted
          ? "Account is blacklisted. Posting prohibited."
          : "Your account is pending verification. Only VERIFIED companies can publish internships."
      );
      return;
    }

    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Please fill in internship title and description.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Publishing new internship role...");

    try {
      const payload: CreateInternshipPayload = {
        title: newTitle,
        description: newDescription,
        location: newLocation,
        type: newType,
        requirements: ["Strong problem solving", "Team collaboration"],
        skills_needed: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
        salary_range: newSalary,
      };

      const res = await createInternshipAction(payload);
      toast.dismiss();

      if (res.success) {
        toast.success(`Published ${newTitle} successfully!`);
        setData((prev) => ({
          ...prev,
          internshipsCount: prev.internshipsCount + 1,
        }));
        setShowCreateModal(false);
        setNewTitle("");
        setNewDescription("");
      } else {
        toast.error(res.error || "Failed to publish internship.");
      }
    } catch {
      toast.dismiss();
      toast.error("Unexpected error publishing role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Updating company profile & credentials...");

    try {
      const res = await updateCompanyProfileAction({
        website: editWebsite,
        industry: editIndustry,
        description: editDescription,
        gst_number: editGst,
        official_email: editOfficialEmail,
      });
      toast.dismiss();

      if (res.success) {
        toast.success("Company credentials updated!");
        setData((prev) => ({
          ...prev,
          website: editWebsite,
          industry: editIndustry,
          description: editDescription,
          gst_number: editGst,
          official_email: editOfficialEmail,
        }));
        setShowEditProfileModal(false);
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch {
      toast.dismiss();
      toast.error("Error updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-foreground font-sans">
      {/* Status Notice Banners */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wider font-mono">
              Pending Administrative Verification
            </h4>
            <p className="text-xs text-yellow-200/80 leading-relaxed font-sans">
              Your company account is currently under identity review by VAJRA administrators.
              <strong className="text-yellow-300"> Internship publishing and applicant matching are disabled</strong> until verification completes.
              Complete your profile details below to expedite approval.
            </p>
          </div>
        </div>
      )}

      {isBlacklisted && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono">
              Account Suspended / Blacklisted
            </h4>
            <p className="text-xs text-red-200/80 leading-relaxed font-sans">
              This organization account has been blacklisted by platform administration due to policy violations.
              All active job postings are hidden from students. Contact support@vajra.ai for inquiries.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-heading tracking-tight">
              Welcome, {data.name}
            </h1>
            <span
              className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border ${data.trustScoreResult.badgeColorClass.bg} ${data.trustScoreResult.badgeColorClass.border} ${data.trustScoreResult.badgeColorClass.text}`}
            >
              {data.trustScoreResult.badgeLabel}
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl font-sans">
            Recruiter & Employer Command Center. Track candidate application pipelines and manage verified postings.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowEditProfileModal(true)}
            variant="outline"
            className="border-border/70 bg-background/70 text-xs py-5 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Edit Credentials
          </Button>
          <Button
            onClick={() => {
              if (!isVerified) {
                toast.error("Posting restricted: Only VERIFIED companies can publish internships.");
                return;
              }
              setShowCreateModal(true);
            }}
            disabled={!isVerified}
            className={`py-5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isVerified
                ? "bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
                : "bg-muted text-muted-foreground border border-border/70 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            Post New Internship
          </Button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Verification & Trust Score */}
        <div className="glass-card relative overflow-hidden flex items-center justify-between gap-4 rounded-3xl border-border/70 p-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-muted-foreground">AI Trust Score</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-primary">{data.trustScoreResult.trustScore}</h3>
              <span className="text-xs font-mono text-muted-foreground">/100</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans">
              {data.trustScoreResult.summaryExplanation.slice(0, 65)}...
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Active Postings */}
        <div className="glass-card flex items-center justify-between gap-4 rounded-3xl border-border/70 p-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-muted-foreground">Internships Listed</span>
            <h3 className="text-3xl font-bold font-mono text-foreground">{data.internshipsCount}</h3>
            <p className="text-[11px] text-muted-foreground font-sans">
              {isVerified ? "Active & open for applications" : "Listings pending account approval"}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>
        </div>

        {/* Active Candidates */}
        <div className="glass-card flex items-center justify-between gap-4 rounded-3xl border-border/70 p-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Applicants</span>
            <h3 className="text-3xl font-bold font-mono text-emerald-400">{data.applicantsCount}</h3>
            <p className="text-[11px] text-muted-foreground font-sans">
              Candidates in recruitment pipeline
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* AI Trust Score Breakdown */}
      <div className="glass-card rounded-3xl border-border/70 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-foreground">
              Company Trust Engine Diagnostic
            </h3>
          </div>
          <button onClick={() => setShowEditProfileModal(true)} className="text-xs font-semibold text-primary hover:underline">
            Improve Trust Score →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {data.trustScoreResult.breakdown.map((item, i) => (
            <div
              key={i}
              className={`space-y-1.5 rounded-2xl border p-4 ${
                item.passed ? "border-border/70 bg-background/70" : "border-yellow-500/20 bg-yellow-500/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono truncate text-muted-foreground">{item.dimension}</span>
                <span className={`text-xs font-mono font-bold ${item.passed ? "text-emerald-400" : "text-yellow-400"}`}>
                  {item.score}/{item.maxScore}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed font-sans text-muted-foreground line-clamp-2">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE INTERNSHIP MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg space-y-5 rounded-3xl border-border/70 p-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Briefcase className="w-5 h-5 text-primary" /> Post New Internship Role
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-sm text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInternship} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Internship Title</Label>
                  <Input
                    placeholder="e.g. Frontend Engineering Intern"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl border-border/70 bg-background/70 py-5 text-xs text-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Work Model</Label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as "remote" | "hybrid" | "on-site")}
                      className="w-full rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="on-site">On-Site</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <Input
                      placeholder="e.g. Bengaluru / Remote"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="rounded-xl border-border/70 bg-background/70 py-5 text-xs text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stipend / Salary Range</Label>
                  <Input
                    placeholder="e.g. ₹25,000 - ₹35,000 / month"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="rounded-xl border-border/70 bg-background/70 py-5 text-xs text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Required Skills (Comma separated)</Label>
                  <Input
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    className="rounded-xl border-border/70 bg-background/70 py-5 text-xs text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Job Description & Responsibilities</Label>
                  <textarea
                    rows={4}
                    placeholder="Describe role expectations, deliverables, and tech stack..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="border-border/70 bg-transparent text-xs text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-violet-500 text-xs font-semibold px-5 text-white cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Listing"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CREDENTIALS MODAL */}
      <AnimatePresence>
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/60 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg space-y-5 rounded-3xl border-border/70 p-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Building className="w-5 h-5 text-primary" /> Corporate Credentials & Profile
                </h3>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Official Website URL</Label>
                  <Input
                    placeholder="https://yourcompany.com"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="rounded-xl border-border/70 bg-background/70 py-5 text-xs text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">GST Registration Number</Label>
                    <Input
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={editGst}
                      onChange={(e) => setEditGst(e.target.value)}
                      className="rounded-xl border-border/70 bg-background/70 py-5 text-xs font-mono text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Official Recruiter Email</Label>
                    <Input
                      placeholder="hiring@yourcompany.com"
                      value={editOfficialEmail}
                      onChange={(e) => setEditOfficialEmail(e.target.value)}
                      className="rounded-xl border-border/70 bg-background/70 py-5 text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Industry Sector</Label>
                  <Input
                    placeholder="e.g. Artificial Intelligence & SaaS"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    className="rounded-xl border-border/70 bg-background/70 py-5 text-xs text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Company Overview</Label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of your company mission and technical focus..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditProfileModal(false)}
                    className="border-border/70 bg-transparent text-xs text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-violet-500 text-xs font-semibold px-5 text-white cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
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

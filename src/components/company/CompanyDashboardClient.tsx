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
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
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
          <p className="text-sm text-slate-400 max-w-2xl font-sans">
            Recruiter & Employer Command Center. Track candidate application pipelines and manage verified postings.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowEditProfileModal(true)}
            variant="outline"
            className="bg-slate-900 border-white/10 text-slate-300 hover:text-white text-xs py-5 rounded-xl cursor-pointer"
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
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
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
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">AI Trust Score</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-blue-400">{data.trustScoreResult.trustScore}</h3>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              {data.trustScoreResult.summaryExplanation.slice(0, 65)}...
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Active Postings */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Internships Listed</span>
            <h3 className="text-3xl font-bold font-mono text-white">{data.internshipsCount}</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              {isVerified ? "Active & open for applications" : "Listings pending account approval"}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>
        </div>

        {/* Active Candidates */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Total Applicants</span>
            <h3 className="text-3xl font-bold font-mono text-emerald-400">{data.applicantsCount}</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Candidates in recruitment pipeline
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* AI Trust Score Breakdown */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Company Trust Engine Diagnostic
            </h3>
          </div>
          <button
            onClick={() => setShowEditProfileModal(true)}
            className="text-xs text-blue-400 hover:underline font-semibold"
          >
            Improve Trust Score →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {data.trustScoreResult.breakdown.map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border ${
                item.passed ? "bg-slate-950/60 border-white/10" : "bg-yellow-500/5 border-yellow-500/20"
              } space-y-1.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 truncate">{item.dimension}</span>
                <span className={`text-xs font-mono font-bold ${item.passed ? "text-emerald-400" : "text-yellow-400"}`}>
                  {item.score}/{item.maxScore}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE INTERNSHIP MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" /> Post New Internship Role
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInternship} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Internship Title</Label>
                  <Input
                    placeholder="e.g. Frontend Engineering Intern"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Work Model</Label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as "remote" | "hybrid" | "on-site")}
                      className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="on-site">On-Site</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Location</Label>
                    <Input
                      placeholder="e.g. Bengaluru / Remote"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Stipend / Salary Range</Label>
                  <Input
                    placeholder="e.g. ₹25,000 - ₹35,000 / month"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Required Skills (Comma separated)</Label>
                  <Input
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Job Description & Responsibilities</Label>
                  <textarea
                    rows={4}
                    placeholder="Describe role expectations, deliverables, and tech stack..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-transparent border-white/10 text-slate-400 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-5 cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" /> Corporate Credentials & Profile
                </h3>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Official Website URL</Label>
                  <Input
                    placeholder="https://yourcompany.com"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">GST Registration Number</Label>
                    <Input
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      value={editGst}
                      onChange={(e) => setEditGst(e.target.value)}
                      className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Official Recruiter Email</Label>
                    <Input
                      placeholder="hiring@yourcompany.com"
                      value={editOfficialEmail}
                      onChange={(e) => setEditOfficialEmail(e.target.value)}
                      className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Industry Sector</Label>
                  <Input
                    placeholder="e.g. Artificial Intelligence & SaaS"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white rounded-xl text-xs py-5"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Company Overview</Label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of your company mission and technical focus..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditProfileModal(false)}
                    className="bg-transparent border-white/10 text-slate-400 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 cursor-pointer"
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

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  ShieldAlert,
  Globe,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  History,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateCompanyVerificationStatusAction,
  type CompanyAdminItem,
  type AuditLogItem,
} from "@/app/actions/admin";
import type { CompanyVerificationStatus } from "@/lib/ai-company-trust-engine";

interface AdminClientProps {
  initialCompanies: CompanyAdminItem[];
  initialAuditLogs: AuditLogItem[];
}

export default function AdminCompanyVerificationClient({
  initialCompanies,
  initialAuditLogs,
}: AdminClientProps) {
  const [companies, setCompanies] = useState<CompanyAdminItem[]>(initialCompanies);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "blacklisted" | "audit">("pending");
  
  // Modal State
  const [selectedCompany, setSelectedCompany] = useState<CompanyAdminItem | null>(null);
  const [targetActionStatus, setTargetActionStatus] = useState<CompanyVerificationStatus | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.industry || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "audit") return true;
    return c.verification_status === activeTab;
  });

  const handleOpenActionModal = (company: CompanyAdminItem, actionStatus: CompanyVerificationStatus) => {
    setSelectedCompany(company);
    setTargetActionStatus(actionStatus);
    setAdminNotes("");
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !targetActionStatus) return;

    setIsUpdating(true);
    toast.loading(`Updating ${selectedCompany.name} verification status...`);

    try {
      const res = await updateCompanyVerificationStatusAction(
        selectedCompany.id,
        targetActionStatus,
        adminNotes
      );
      toast.dismiss();

      if (res.success) {
        toast.success(`Updated ${selectedCompany.name} to ${targetActionStatus.toUpperCase()}`);
        
        // Update local state
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === selectedCompany.id
              ? {
                  ...c,
                  verification_status: targetActionStatus,
                  is_verified: targetActionStatus === "verified",
                  trust_score: targetActionStatus === "verified" ? 92 : targetActionStatus === "blacklisted" ? 0 : 45,
                }
              : c
          )
        );

        // Add mock log
        const newLog: AuditLogItem = {
          id: Math.random().toString(),
          user_id: "admin",
          action: `COMPANY_VERIFICATION_${targetActionStatus.toUpperCase()}`,
          table_name: "companies",
          record_id: selectedCompany.id,
          old_data: { status: selectedCompany.verification_status },
          new_data: { status: targetActionStatus, notes: adminNotes },
          created_at: new Date().toISOString(),
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        setSelectedCompany(null);
        setTargetActionStatus(null);
      } else {
        toast.error(res.error || "Failed to update verification status.");
      }
    } catch {
      toast.dismiss();
      toast.error("Unexpected error updating company status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingCount = companies.filter((c) => c.verification_status === "pending").length;
  const verifiedCount = companies.filter((c) => c.verification_status === "verified").length;
  const blacklistedCount = companies.filter((c) => c.verification_status === "blacklisted").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Company Trust Engine & Verification Queue
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">
            Organization Verification Control Center
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-sans">
            Review corporate identity credentials, inspect GST registration documents, calculate AI Trust Scores, and moderate platform recruiters.
          </p>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "verified" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab("blacklisted")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "blacklisted" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Blacklisted ({blacklistedCount})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "audit" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Search Input */}
      {activeTab !== "audit" && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <Input
            placeholder="Search organizations by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-white/10 text-white rounded-xl text-xs py-5"
          />
        </div>
      )}

      {/* AUDIT LOGS VIEW */}
      {activeTab === "audit" ? (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Platform Verification Audit History
          </h2>
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No audit log entries recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-blue-400 font-bold">{log.action}</span>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Target Record ID: {log.record_id}
                    </p>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* COMPANIES LIST VIEW */
        <div className="grid gap-6">
          {filteredCompanies.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No companies in this queue</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                {activeTab === "pending"
                  ? "All company verification submissions have been reviewed."
                  : `No ${activeTab} organizations match your current search filter.`}
              </p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all space-y-5 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center font-bold text-white text-lg shrink-0">
                      {company.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-white">{company.name}</h3>
                        <span
                          className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border ${
                            company.verification_status === "verified"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : company.verification_status === "blacklisted"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {company.verification_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        {company.industry || "Technology & Software"} • Registered:{" "}
                        {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Trust Score & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-center shrink-0">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Trust Score</span>
                      <span className="text-lg font-bold font-mono text-blue-400">{company.trust_score}/100</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {company.verification_status !== "verified" && (
                        <Button
                          onClick={() => handleOpenActionModal(company, "verified")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 px-3 rounded-xl cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}
                      {company.verification_status !== "blacklisted" && (
                        <Button
                          onClick={() => handleOpenActionModal(company, "blacklisted")}
                          className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs py-2 px-3 rounded-xl cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Blacklist
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs text-slate-300 font-sans">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Website & Domain</span>
                    <p className="flex items-center gap-1.5 text-blue-400">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          {company.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        "No website listed"
                      )}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500">GST / Registration Credentials</span>
                    <p className="flex items-center gap-1.5 font-mono text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {company.gst_number || "GST-PENDING-2026"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Official Recruiter Email</span>
                    <p className="text-slate-300 font-mono">
                      {company.official_email || `recruiter@${company.name.toLowerCase().replace(/\s+/g, "")}.com`}
                    </p>
                  </div>
                </div>

                {company.description && (
                  <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
                    {company.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {selectedCompany && targetActionStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    targetActionStatus === "verified"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {targetActionStatus === "verified" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <ShieldAlert className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Confirm Status Change
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update <strong className="text-white">{selectedCompany.name}</strong> to{" "}
                    <span className="uppercase font-mono font-bold text-blue-400">
                      {targetActionStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Administrator Review Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for status update or approval note..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCompany(null);
                    setTargetActionStatus(null);
                  }}
                  className="bg-transparent border-white/10 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  disabled={isUpdating}
                  className={`text-white text-xs font-medium cursor-pointer ${
                    targetActionStatus === "verified"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Confirm ${targetActionStatus.toUpperCase()}`
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

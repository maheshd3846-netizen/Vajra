"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  CompanyItem,
  AddMentorCompanyPayload,
  addMentorCompanyAction,
  updateMentorCompanyAction,
  updateMentorCompanyVerificationAction,
  deleteMentorCompanyAction,
} from "@/app/actions/mentor";
import {
  Building,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Eye,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Ban,
  Users,
} from "lucide-react";

interface MentorCompaniesClientProps {
  initialCompanies: CompanyItem[];
  initialStats: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export default function MentorCompaniesClient({
  initialCompanies,
  initialStats,
}: MentorCompaniesClientProps) {
  const [companies, setCompanies] = useState<CompanyItem[]>(initialCompanies);
  const [stats, setStats] = useState(initialStats);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<AddMentorCompanyPayload>({
    name: "",
    logo_url: "",
    industry: "IT & Software",
    description: "",
    website: "",
    official_email: "",
    contact_person: "",
    contact_phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    company_size: "11-50 employees",
    linkedin_url: "",
    status: "active",
  });

  // Calculate distinct industries for filter dropdown
  const industries = Array.from(
    new Set(companies.map((c) => c.industry).filter(Boolean))
  ) as string[];

  // Recalculate Stats Helper
  const recalculateStats = (list: CompanyItem[]) => {
    return {
      total: list.length,
      verified: list.filter((c) => c.verification_status === "verified").length,
      pending: list.filter((c) => c.verification_status === "pending" || !c.verification_status).length,
      rejected: list.filter((c) => c.verification_status === "rejected").length,
    };
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      logo_url: "",
      industry: "IT & Software",
      description: "",
      website: "",
      official_email: "",
      contact_person: "",
      contact_phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      company_size: "11-50 employees",
      linkedin_url: "",
      status: "active",
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (company: CompanyItem) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      logo_url: company.logo_url || "",
      industry: company.industry || "IT & Software",
      description: company.description || "",
      website: company.website || "",
      official_email: company.official_email || company.contact_email || "",
      contact_person: company.contact_person || "",
      contact_phone: company.contact_phone || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      country: company.country || "India",
      company_size: company.company_size || "11-50 employees",
      linkedin_url: company.linkedin_url || "",
      status: company.status === "inactive" ? "inactive" : "active",
    });
    setIsAddEditModalOpen(true);
  };

  // Save (Create/Update) Handler
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.official_email?.trim()) {
      toast.error("Company name and official email are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCompany) {
        // Update Existing
        const res = await updateMentorCompanyAction(editingCompany.id, formData);
        if (res.success) {
          toast.success(`Company "${formData.name}" updated successfully!`);
          const updatedList = companies.map((c) =>
            c.id === editingCompany.id
              ? {
                  ...c,
                  ...formData,
                  official_email: formData.official_email || c.official_email,
                  status: formData.status || "active",
                  updated_at: new Date().toISOString(),
                }
              : c
          );
          setCompanies(updatedList);
          setStats(recalculateStats(updatedList));
          setIsAddEditModalOpen(false);
        } else {
          toast.error(res.error || "Failed to update company.");
        }
      } else {
        // Create New
        const res = await addMentorCompanyAction(formData);
        if (res.success && res.companyId) {
          toast.success(`Company "${formData.name}" added successfully with Pending verification status!`);
          const newCompany: CompanyItem = {
            id: res.companyId,
            name: formData.name.trim(),
            logo_url: formData.logo_url || null,
            industry: formData.industry || null,
            description: formData.description || null,
            website: formData.website || null,
            official_email: formData.official_email || null,
            contact_email: formData.official_email || null,
            contact_person: formData.contact_person || null,
            contact_phone: formData.contact_phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            country: formData.country || null,
            company_size: formData.company_size || null,
            linkedin_url: formData.linkedin_url || null,
            status: formData.status || "active",
            verification_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const updatedList = [newCompany, ...companies];
          setCompanies(updatedList);
          setStats(recalculateStats(updatedList));
          setIsAddEditModalOpen(false);
        } else {
          toast.error(res.error || "Failed to add company.");
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification Status Update Handler (Verify, Reject, Suspend)
  const handleUpdateVerification = async (
    company: CompanyItem,
    newVerificationStatus: "verified" | "rejected" | "suspended"
  ) => {
    try {
      const res = await updateMentorCompanyVerificationAction(
        company.id,
        newVerificationStatus
      );
      if (res.success) {
        toast.success(
          `Company "${company.name}" status updated to ${newVerificationStatus.toUpperCase()}`
        );
        const updatedList = companies.map((c) =>
          c.id === company.id
            ? {
                ...c,
                verification_status: newVerificationStatus,
                status:
                  newVerificationStatus === "suspended"
                    ? "suspended"
                    : newVerificationStatus === "rejected"
                    ? "rejected"
                    : "active",
                updated_at: new Date().toISOString(),
              }
            : c
        );
        setCompanies(updatedList);
        setStats(recalculateStats(updatedList));

        if (selectedCompany?.id === company.id) {
          setSelectedCompany((prev) =>
            prev ? { ...prev, verification_status: newVerificationStatus } : null
          );
        }
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Error updating verification status.");
    }
  };

  // Delete Handler
  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await deleteMentorCompanyAction(companyToDelete.id);
      if (res.success) {
        toast.success(`Company "${companyToDelete.name}" removed successfully.`);
        const updatedList = companies.filter((c) => c.id !== companyToDelete.id);
        setCompanies(updatedList);
        setStats(recalculateStats(updatedList));
        setIsDeleteModalOpen(false);
        setCompanyToDelete(null);
      } else {
        toast.error(res.error || "Failed to delete company.");
      }
    } catch {
      toast.error("Error deleting company.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredCompanies = companies.filter((company) => {
    // Search by name
    const matchesSearch =
      !searchQuery.trim() ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.official_email && company.official_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.contact_person && company.contact_person.toLowerCase().includes(searchQuery.toLowerCase()));

    // Verification Filter
    const matchesVerification =
      verificationFilter === "all" || company.verification_status === verificationFilter;

    // Industry Filter
    const matchesIndustry =
      industryFilter === "all" || company.industry === industryFilter;

    // Status (Active/Inactive) Filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && company.status === "active") ||
      (statusFilter === "inactive" && company.status === "inactive");

    return matchesSearch && matchesVerification && matchesIndustry && matchesStatus;
  });

  // Verification Badge Renderer
  const renderVerificationBadge = (vStatus: string) => {
    switch (vStatus) {
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-mono text-[11px] px-2.5 py-0.5"
          >
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            Verified
          </Badge>
        );
      case "pending":
      case undefined:
      case "":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-mono text-[11px] px-2.5 py-0.5 animate-pulse"
          >
            <AlertCircle className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 font-mono text-[11px] px-2.5 py-0.5"
          >
            <XCircle className="w-3 h-3 mr-1 text-red-600 dark:text-red-400" />
            Rejected
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-mono text-[11px] px-2.5 py-0.5"
          >
            <Ban className="w-3 h-3 mr-1 text-slate-500" />
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] px-2 py-0.5 uppercase">
            {vStatus}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-900/95 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-2.5 py-0.5 text-xs font-mono"
              >
                <Building className="w-3.5 h-3.5 mr-1" />
                Partner Enterprise Network
              </Badge>

              <Badge
                variant="outline"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-2.5 py-0.5 text-xs font-mono"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Mentor RBAC Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-white">
              Mentor Companies Management
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Register partner companies, review verification applications, manage industry affiliations, and maintain enterprise governance for student internship allocations.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Company</span>
          </button>
        </div>

        {/* Dashboard Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-indigo-500/20">
          <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-indigo-200 font-mono block uppercase">
              Total Companies
            </span>
            <span className="text-2xl font-extrabold font-mono text-white flex items-center gap-2 mt-1">
              <Building className="w-5 h-5 text-indigo-400" />
              {stats.total}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-emerald-300 font-mono block uppercase">
              Verified Companies
            </span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 flex items-center gap-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {stats.verified}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-amber-300 font-mono block uppercase">
              Pending Verification
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-400 flex items-center gap-2 mt-1">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              {stats.pending}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-[11px] text-red-300 font-mono block uppercase">
              Rejected Companies
            </span>
            <span className="text-2xl font-extrabold font-mono text-red-400 flex items-center gap-2 mt-1">
              <XCircle className="w-5 h-5 text-red-400" />
              {stats.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, email, or contact person..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Verification Status Filter */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Verification</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div className="bg-background border border-border rounded-xl px-3 py-1.5">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Active/Inactive Filter */}
          <div className="bg-background border border-border rounded-xl px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Responsive Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[950px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-slate-600 dark:text-slate-400 font-mono uppercase text-[11px] whitespace-nowrap">
                <th className="p-4 min-w-[200px]">Company</th>
                <th className="p-4 min-w-[120px]">Industry</th>
                <th className="p-4 min-w-[100px]">Website</th>
                <th className="p-4 min-w-[180px]">Email</th>
                <th className="p-4 min-w-[140px]">Contact Person</th>
                <th className="p-4 min-w-[100px]">Status</th>
                <th className="p-4 min-w-[130px]">Verification</th>
                <th className="p-4 min-w-[100px]">Date Added</th>
                <th className="p-4 min-w-[160px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Logo & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0 overflow-hidden">
                          {company.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            company.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {company.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Size: {company.company_size || "11-50 employees"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {company.industry || "Technology"}
                      </Badge>
                    </td>

                    {/* Website */}
                    <td className="p-4">
                      {company.website ? (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px]"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {company.official_email || company.contact_email || "N/A"}
                    </td>

                    {/* Contact Person */}
                    <td className="p-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">
                        {company.contact_person || "HR / Manager"}
                      </span>
                      {company.contact_phone && (
                        <span className="text-[10px] text-slate-500 font-mono block flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {company.contact_phone}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                          company.status === "inactive"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {company.status === "inactive" ? "Inactive" : "Active"}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="p-4">
                      {renderVerificationBadge(company.verification_status)}
                    </td>

                    {/* Date Added */}
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(company.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsViewModalOpen(true);
                          }}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(company)}
                          title="Edit Company"
                          className="p-1.5 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Verify / Approve Action */}
                        {company.verification_status !== "verified" && (
                          <button
                            onClick={() => handleUpdateVerification(company, "verified")}
                            title="Verify Company"
                            className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reject Action */}
                        {company.verification_status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateVerification(company, "rejected")}
                            title="Reject Company"
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-700 dark:text-red-300 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Suspend Action */}
                        {company.verification_status !== "suspended" && (
                          <button
                            onClick={() => handleUpdateVerification(company, "suspended")}
                            title="Suspend Company"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setCompanyToDelete(company);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete Company"
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Building className="w-8 h-8 text-slate-400 stroke-1" />
                      <p className="font-semibold text-sm">No companies found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search or filter parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT COMPANY MODAL */}
      <AnimatePresence>
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                    {editingCompany ? "Edit Partner Company" : "Add Partner Company"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCompany} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Acme Tech Solutions Inc."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Official Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={formData.official_email}
                      onChange={(e) =>
                        setFormData({ ...formData, official_email: e.target.value })
                      }
                      placeholder="e.g. contact@acmetech.com"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g. IT & Software"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  {/* Company Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Company Size
                    </label>
                    <select
                      value={formData.company_size}
                      onChange={(e) =>
                        setFormData({ ...formData, company_size: e.target.value })
                      }
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    >
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "active" | "inactive",
                        })
                      }
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Website */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://acmetech.com"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Logo Upload / Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Person */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Contact Person / HR Lead
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_person: e.target.value })
                      }
                      placeholder="e.g. Jane Doe (Talent Manager)"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_phone: e.target.value })
                      }
                      placeholder="+91 9876543210"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>
                </div>

                {/* Address, City, State, Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                    Office Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Building #4, Tech Park, Outer Ring Road"
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="India"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LinkedIn */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      LinkedIn Page URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin_url: e.target.value })
                      }
                      placeholder="https://linkedin.com/company/acmetech"
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">
                      Company Overview
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of company business operations and tech stack..."
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background outline-none h-16"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingCompany ? "Save Changes" : "Add Company"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW COMPANY DETAILS MODAL */}
      <AnimatePresence>
        {isViewModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 overflow-hidden">
                    {selectedCompany.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedCompany.logo_url}
                        alt={selectedCompany.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedCompany.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {selectedCompany.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {selectedCompany.industry || "Technology"}
                      </Badge>
                      {renderVerificationBadge(selectedCompany.verification_status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              {selectedCompany.description && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                    Overview
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border">
                    {selectedCompany.description}
                  </p>
                </div>
              )}

              {/* Company Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Official Email
                  </span>
                  <span className="font-semibold font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedCompany.official_email || selectedCompany.contact_email || "N/A"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Contact Person & Phone
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {selectedCompany.contact_person || "HR Lead"}
                  </span>
                  {selectedCompany.contact_phone && (
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {selectedCompany.contact_phone}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Location & HQ
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {[selectedCompany.city, selectedCompany.state, selectedCompany.country]
                      .filter(Boolean)
                      .join(", ") || "India"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-border bg-background space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Company Size
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedCompany.company_size || "11-50 employees"}
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {selectedCompany.website && (
                  <a
                    href={
                      selectedCompany.website.startsWith("http")
                        ? selectedCompany.website
                        : `https://${selectedCompany.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:bg-muted"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {selectedCompany.linkedin_url && (
                  <a
                    href={selectedCompany.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-blue-600 dark:text-blue-400 hover:bg-muted"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                  </a>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedCompany.verification_status !== "verified" && (
                    <button
                      onClick={() => handleUpdateVerification(selectedCompany, "verified")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                    >
                      Verify Company
                    </button>
                  )}
                  {selectedCompany.verification_status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateVerification(selectedCompany, "rejected")}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium cursor-pointer"
                    >
                      Reject Company
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && companyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold font-mono">Delete Partner Company</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete <strong>{companyToDelete.name}</strong>? This action will permanently remove the company record from the Mentor Network.
              </p>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCompany}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createInternshipAction,
  updateInternshipAction,
  deleteInternshipAction,
  updateInternshipStatusAction,
  type DetailedInternshipPayload,
} from "@/app/actions/company";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  FileText,
} from "lucide-react";

export interface InternshipListItem {
  id: string;
  title: string;
  description: string;
  location: string | null;
  type: "remote" | "hybrid" | "on-site";
  internship_type: string | null;
  duration: string | null;
  stipend: string | null;
  salary_range: string | null;
  requirements: string[];
  skills_needed: string[];
  eligibility: string | null;
  deadline: string | null;
  openings_count: number;
  status: "draft" | "published" | "open" | "closed";
  created_at: string;
}

export interface PipelineSummaryStats {
  totalApplicants: number;
  shortlisted: number;
  rejected: number;
  pending: number;
  selected: number;
}

interface CompanyInternshipsClientProps {
  initialInternships: InternshipListItem[];
  stats: PipelineSummaryStats;
}

export default function CompanyInternshipsClient({
  initialInternships,
  stats,
}: CompanyInternshipsClientProps) {
  const router = useRouter();

  const [internships, setInternships] = useState<InternshipListItem[]>(initialInternships);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InternshipListItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formState, setFormState] = useState<DetailedInternshipPayload>({
    title: "",
    description: "",
    location: "Remote",
    type: "remote",
    internship_type: "Full-time",
    duration: "3 Months",
    stipend: "$1,500 / month",
    requirements: [],
    skills_needed: [],
    eligibility: "B.Tech / MCA / BE 3rd & 4th Year",
    deadline: "",
    openings_count: 2,
    status: "open",
  });

  const [skillInput, setSkillInput] = useState("");

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormState({
      title: "",
      description: "",
      location: "Remote",
      type: "remote",
      internship_type: "Full-time",
      duration: "3 Months",
      stipend: "$1,500 / month",
      requirements: ["Strong analytical thinking", "Team collaboration"],
      skills_needed: ["React", "TypeScript", "Node.js"],
      eligibility: "B.Tech 3rd & 4th Year Students",
      deadline: "",
      openings_count: 2,
      status: "open",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InternshipListItem) => {
    setEditingItem(item);
    setFormState({
      id: item.id,
      title: item.title,
      description: item.description,
      location: item.location || "Remote",
      type: item.type,
      internship_type: item.internship_type || "Full-time",
      duration: item.duration || "3 Months",
      stipend: item.stipend || item.salary_range || "Negotiable",
      requirements: item.requirements || [],
      skills_needed: item.skills_needed || [],
      eligibility: item.eligibility || "",
      deadline: item.deadline ? item.deadline.split("T")[0] : "",
      openings_count: item.openings_count || 1,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setIsSubmitting(true);

    if (editingItem) {
      // Edit
      const res = await updateInternshipAction(editingItem.id, formState);
      setIsSubmitting(false);
      if (res.success) {
        toast.success("Internship posting updated successfully!");
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update posting.");
      }
    } else {
      // Create
      const res = await createInternshipAction(formState);
      setIsSubmitting(false);
      if (res.success) {
        toast.success("New internship posting created!");
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create posting.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    const res = await deleteInternshipAction(id);
    setIsSubmitting(false);
    setDeleteConfirmId(null);

    if (res.success) {
      toast.success("Internship posting deleted.");
      setInternships((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete internship.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "draft" | "published" | "open" | "closed") => {
    const res = await updateInternshipStatusAction(id, newStatus);
    if (res.success) {
      toast.success(`Internship status changed to ${newStatus}.`);
      setInternships((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      router.refresh();
    } else {
      toast.error(res.error || "Status update failed.");
    }
  };

  // Filtered List
  const filteredInternships = internships.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            Recruiter Hub
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Manage Internships</h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Post new opportunities, edit requirements, draft job descriptions, and track candidate pipeline stats.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Internship
        </button>
      </div>

      {/* Internship Dashboard Pipeline Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Total Applicants */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-sans font-medium">Total Applicants</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{stats.totalApplicants}</h3>
        </div>

        {/* Shortlisted */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-sans font-medium">Shortlisted</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-purple-400">{stats.shortlisted}</h3>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-sans font-medium">Pending Review</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-400">{stats.pending}</h3>
        </div>

        {/* Selected */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-sans font-medium">Selected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">{stats.selected}</h3>
        </div>

        {/* Rejected */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-sans font-medium">Rejected</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-400">{stats.rejected}</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search postings by title or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {["all", "open", "published", "draft", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition shrink-0 ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Internships List */}
      <div className="space-y-4">
        {filteredInternships.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-4 max-w-md mx-auto">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Internship Postings Found</h3>
            <p className="text-xs text-slate-400 font-sans">
              Create your first internship opportunity to start receiving candidate applications.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Internship
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInternships.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-white/20 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-white">{job.title}</h3>
                    <span
                      className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border ${
                        job.status === "open" || job.status === "published"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : job.status === "draft"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-sans pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      {job.stipend || job.salary_range || "Negotiable"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.duration || "3 Months"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-blue-400 border border-blue-500/10 uppercase font-mono">
                      {job.type} ({job.internship_type || "Full-time"})
                    </span>
                  </div>
                </div>

                {/* Actions & Status Controller */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 text-xs">
                    {job.status !== "published" && job.status !== "open" && (
                      <button
                        onClick={() => handleStatusChange(job.id, "open")}
                        className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                      >
                        Publish
                      </button>
                    )}
                    {job.status !== "draft" && (
                      <button
                        onClick={() => handleStatusChange(job.id, "draft")}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                      >
                        Draft
                      </button>
                    )}
                    {job.status !== "closed" && (
                      <button
                        onClick={() => handleStatusChange(job.id, "closed")}
                        className="px-2.5 py-1 text-[11px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        Close
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(job)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
                      title="Edit Internship"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(job.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      title="Delete Internship"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-2xl w-full my-8 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                {editingItem ? "Edit Internship Posting" : "Create New Internship Posting"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-300">Internship Title *</label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Frontend Software Engineering Intern"
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Location</label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Remote / Bangalore"
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Remote / Hybrid / Onsite */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Work Model</label>
                  <select
                    value={formState.type}
                    onChange={(e) => setFormState((prev) => ({ ...prev, type: e.target.value as "remote" | "hybrid" | "on-site" }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                  </select>
                </div>

                {/* Internship Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Internship Program Type</label>
                  <input
                    type="text"
                    value={formState.internship_type}
                    onChange={(e) => setFormState((prev) => ({ ...prev, internship_type: e.target.value }))}
                    placeholder="e.g. Full-time Summer Intern"
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Duration</label>
                  <input
                    type="text"
                    value={formState.duration}
                    onChange={(e) => setFormState((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 3 Months / 6 Months"
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Stipend */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Stipend / Compensation</label>
                  <input
                    type="text"
                    value={formState.stipend}
                    onChange={(e) => setFormState((prev) => ({ ...prev, stipend: e.target.value }))}
                    placeholder="e.g. $1,500 / month or ₹25,000 / pm"
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Number of Openings */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Number of Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={formState.openings_count}
                    onChange={(e) => setFormState((prev) => ({ ...prev, openings_count: parseInt(e.target.value, 10) }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Eligibility */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-300">Eligibility Criteria</label>
                  <input
                    type="text"
                    value={formState.eligibility}
                    onChange={(e) => setFormState((prev) => ({ ...prev, eligibility: e.target.value }))}
                    placeholder="e.g. B.Tech / BE 3rd & 4th Year, min 7.5 CGPA"
                    className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Outline internship scope, responsibilities, projects, and learning objectives..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* Required Skills Tag Manager */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Required Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add skill (e.g. React, Next.js)"
                    className="flex-1 px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skillInput.trim()) {
                        setFormState((prev) => ({
                          ...prev,
                          skills_needed: [...(prev.skills_needed || []), skillInput.trim()],
                        }));
                        setSkillInput("");
                      }
                    }}
                    className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-xl border border-blue-500/30 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formState.skills_needed || []).map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-950 text-[11px] text-blue-300 border border-blue-500/20 flex items-center gap-1">
                      {sk}
                      <button
                        type="button"
                        onClick={() =>
                          setFormState((prev) => ({
                            ...prev,
                            skills_needed: (prev.skills_needed || []).filter((_, i) => i !== idx),
                          }))
                        }
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Initial Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value as "draft" | "published" | "open" | "closed" }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="open">Open (Active Applications)</option>
                  <option value="published">Published</option>
                  <option value="draft">Save as Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? "Update Posting" : "Publish Posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Internship Posting?</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Are you sure you want to permanently delete this posting? Existing applicants and data will be affected.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Posting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

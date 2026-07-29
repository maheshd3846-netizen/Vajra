/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Users,
  Award,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Globe,
  ExternalLink,
  Eye,
  Calendar,
  Clock,
  X,
  GraduationCap,
} from "lucide-react";

export interface MentorDashboardStudentItem {
  id: string;
  status: string;
  assigned_at: string;
  student_profiles: {
    id: string;
    university: string | null;
    major: string | null;
    degree: string | null;
    branch: string | null;
    graduation_year: number | null;
    gpa: number | null;
    cgpa: number | null;
    target_role: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    users: {
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null;
}

export interface MentorDashboardData {
  totalStudents: number;
  activeStudents: number;
  pendingReviews: number;
  upcomingSessions: number;
  avgCareerDna: number;
  students: MentorDashboardStudentItem[];
  isVerified: boolean;
}

interface MentorDashboardClientProps {
  initialData: MentorDashboardData;
}

export default function MentorDashboardClient({ initialData }: MentorDashboardClientProps) {
  const [data] = useState<MentorDashboardData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name" | "assigned_at">("assigned_at");

  // Selected Student Drawer / Modal
  const [selectedStudent, setSelectedStudent] = useState<MentorDashboardStudentItem | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "reports">("profile");

  const filteredStudents = data.students
    .filter((item) => {
      const stud = item.student_profiles;
      const name = stud?.users?.full_name || "";
      const email = stud?.users?.email || "";
      const college = stud?.university || "";
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortKey === "name") {
        const nameA = a.student_profiles?.users?.full_name || "";
        const nameB = b.student_profiles?.users?.full_name || "";
        return nameA.localeCompare(nameB);
      } else {
        return new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime();
      }
    });

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Mentor Dashboard
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Mentorship Hub</h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Track student cohort metrics, review academic performance, inspect Career DNA reports, and schedule sessions.
        </p>
      </div>

      {/* Grid Stats (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{data.totalStudents}</h3>
        </div>

        {/* Active Students */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Cohort</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">{data.activeStudents}</h3>
        </div>

        {/* Pending Reviews */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Reviews</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-400">{data.pendingReviews}</h3>
        </div>

        {/* Upcoming Sessions */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Upcoming Sessions</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-purple-400">{data.upcomingSessions}</h3>
        </div>

        {/* Average Career DNA */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Career DNA</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-cyan-400">{data.avgCareerDna}/100</h3>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, email, college..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {["all", "active", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize text-xs transition ${
                  statusFilter === st ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortKey((prev) => (prev === "assigned_at" ? "name" : "assigned_at"))}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-white/10 text-xs font-mono flex items-center gap-1.5 transition shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            Sort: {sortKey === "assigned_at" ? "Date" : "Name"}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Assigned Student Cohort ({filteredStudents.length})
          </h2>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-sans">
            No student matches found. Try clearing your search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-white/5">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">College / Branch</th>
                  <th className="p-4">CGPA</th>
                  <th className="p-4">Target Role</th>
                  <th className="p-4">Assigned Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredStudents.map((assign) => {
                  const stud = assign.student_profiles;
                  const studUser = stud?.users;

                  return (
                    <tr key={assign.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                            {studUser?.avatar_url ? (
                              <img src={studUser.avatar_url} alt="" className="h-full w-full object-cover rounded-xl" />
                            ) : (
                              studUser?.full_name?.[0] || "S"
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{studUser?.full_name || "Vajra Student"}</span>
                            <span className="text-[11px] text-slate-400">{studUser?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-200 block font-medium">{stud?.university || "N/A"}</span>
                        <span className="text-[11px] text-slate-400">{stud?.branch || stud?.major || "N/A"}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-200">
                        {stud?.cgpa || stud?.gpa || "N/A"}
                      </td>
                      <td className="p-4 text-blue-400 font-medium">
                        {stud?.target_role || "Software Engineer"}
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        {new Date(assign.assigned_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          {assign.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(assign);
                            setActiveTab("profile");
                          }}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Drawer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 max-w-2xl w-full my-8 space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-lg text-purple-400">
                  {selectedStudent.student_profiles?.users?.full_name?.[0] || "S"}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedStudent.student_profiles?.users?.full_name}</h3>
                  <p className="text-xs text-slate-400">{selectedStudent.student_profiles?.users?.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === "profile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Academic & Links
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === "reports" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                AI Reports & Career DNA
              </button>
            </div>

            {/* Tab 1: Profile & Links */}
            {activeTab === "profile" && (
              <div className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">University</span>
                    <span className="text-slate-200 font-semibold">{selectedStudent.student_profiles?.university || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Degree / Major</span>
                    <span className="text-slate-200 font-semibold">{selectedStudent.student_profiles?.branch || selectedStudent.student_profiles?.major || "N/A"}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">CGPA</span>
                    <span className="text-slate-200 font-semibold">{selectedStudent.student_profiles?.cgpa || selectedStudent.student_profiles?.gpa || "N/A"}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Target Role</span>
                    <span className="text-blue-400 font-semibold">{selectedStudent.student_profiles?.target_role || "Software Engineer"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {selectedStudent.student_profiles?.portfolio_url && (
                    <a
                      href={selectedStudent.student_profiles.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-white/10"
                    >
                      <Globe className="w-4 h-4 text-cyan-400" />
                      View Portfolio
                    </a>
                  )}
                  {selectedStudent.student_profiles?.github_url && (
                    <a
                      href={selectedStudent.student_profiles.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-white/10"
                    >
                      <FileText className="w-4 h-4 text-purple-400" />
                      GitHub Profile
                    </a>
                  )}
                  {selectedStudent.student_profiles?.linkedin_url && (
                    <a
                      href={selectedStudent.student_profiles.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-white/10"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: AI Reports */}
            {activeTab === "reports" && (
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Career DNA Intelligence Score</h4>
                    <p className="text-slate-400 text-[11px]">Evaluated across technical projects, mock interviews, and resume syntax.</p>
                  </div>
                  <div className="text-3xl font-bold font-mono text-cyan-400">85/100</div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white">Generated Reports</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Resume Review Report</span>
                      <span className="text-emerald-400 font-mono font-bold">Passed</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Mock Interview Score</span>
                      <span className="text-blue-400 font-mono font-bold">88/100</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Skills Gap Analysis</span>
                      <span className="text-amber-400 font-mono font-bold">Medium Gap</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Career Pathway Map</span>
                      <span className="text-purple-400 font-mono font-bold">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

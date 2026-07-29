/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addStudentByMentorAction, type AddStudentByMentorPayload } from "@/app/actions/mentor";
import {
  Users,
  Sparkles,
  Plus,
  Calendar,
  Search,
  X,
  Loader2,
} from "lucide-react";

export interface StudentCohortItem {
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
    phone: string | null;
    target_role: string | null;
    users: {
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  } | null;
}

interface MentorStudentsClientProps {
  initialCohort: StudentCohortItem[];
}

export default function MentorStudentsClient({ initialCohort }: MentorStudentsClientProps) {
  const router = useRouter();
  const cohort = initialCohort;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<AddStudentByMentorPayload>({
    name: "",
    email: "",
    password: "",
    college: "",
    department: "",
    year: 2026,
    phone: "",
  });

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim()) {
      toast.error("Student name and email are required.");
      return;
    }

    setIsSubmitting(true);

    const res = await addStudentByMentorAction(formState);
    setIsSubmitting(false);

    if (res.success) {
      if (res.isExistingUser) {
        toast.success(`Existing student (${formState.email}) assigned to your cohort!`);
      } else {
        toast.success(`New student account created and assigned to your cohort!`);
      }
      setIsAddModalOpen(false);
      setFormState({
        name: "",
        email: "",
        password: "",
        college: "",
        department: "",
        year: 2026,
        phone: "",
      });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to add student to cohort.");
    }
  };

  const filteredCohort = cohort.filter((item) => {
    const name = item.student_profiles?.users?.full_name || "";
    const email = item.student_profiles?.users?.email || "";
    const college = item.student_profiles?.university || "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || college.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            Mentorship Cohort
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Assigned Students</h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Add new students, inspect academic benchmarks, and manage your assigned mentorship cohort.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students by name, email, or college..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Cohort Grid */}
      <div className="space-y-4">
        {filteredCohort.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3 max-w-md mx-auto">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No Students Found</p>
            <p className="text-xs text-slate-400 font-sans">
              Click &quot;Add Student&quot; above to onboard or link a student to your mentorship cohort.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCohort.map((assign) => {
              const student = assign.student_profiles;
              const studentUser = student?.users;

              return (
                <div
                  key={assign.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-lg text-purple-400 shrink-0">
                        {studentUser?.avatar_url ? (
                          <img src={studentUser.avatar_url} alt="" className="h-full w-full object-cover rounded-2xl" />
                        ) : (
                          studentUser?.full_name?.[0] || "S"
                        )}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <h3 className="font-bold text-sm text-white truncate">{studentUser?.full_name || "Vajra Student"}</h3>
                        <p className="text-xs text-slate-400 font-sans truncate">{studentUser?.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-slate-950/60 border border-white/5 font-sans">
                      <div>
                        <span className="text-slate-500 block text-[10px]">College</span>
                        <span className="text-slate-200 font-medium truncate block">{student?.university || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Department</span>
                        <span className="text-slate-200 font-medium truncate block">{student?.branch || student?.major || "N/A"}</span>
                      </div>
                      <div className="pt-1.5">
                        <span className="text-slate-500 block text-[10px]">CGPA / GPA</span>
                        <span className="text-slate-200 font-medium">{student?.cgpa || student?.gpa || "N/A"}</span>
                      </div>
                      <div className="pt-1.5">
                        <span className="text-slate-500 block text-[10px]">Year</span>
                        <span className="text-slate-200 font-medium">{student?.graduation_year || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(assign.assigned_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize text-emerald-400 font-bold">{assign.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-md w-full space-y-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add Student to Cohort
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs font-sans">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Student Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="rahul@college.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Temp Password */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Temporary Password (for new account)</label>
                <input
                  type="text"
                  value={formState.password}
                  onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="VajraStudent@123"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* College & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">College / Institute</label>
                  <input
                    type="text"
                    value={formState.college}
                    onChange={(e) => setFormState((prev) => ({ ...prev, college: e.target.value }))}
                    placeholder="IIT Bombay"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Department / Major</label>
                  <input
                    type="text"
                    value={formState.department}
                    onChange={(e) => setFormState((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Graduation Year & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Graduation Year</label>
                  <input
                    type="number"
                    value={formState.year}
                    onChange={(e) => setFormState((prev) => ({ ...prev, year: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Onboard Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Calendar, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface MentorAssignmentItem {
  id: string;
  status: string;
  assigned_at: string;
  student_profiles: {
    id: string;
    university: string | null;
    major: string | null;
    gpa: number | null;
    users: {
      full_name: string | null;
      email: string;
    } | null;
  } | null;
}

export default async function MentorStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor assignments
  const { data: assignments } = await supabase
    .from("mentor_assignments")
    .select(`
      id,
      status,
      assigned_at,
      student_profiles (
        id,
        university,
        major,
        gpa,
        users (
          full_name,
          email
        )
      )
    `)
    .eq("mentor_id", user.id);

  const activeStudents = (assignments as unknown as MentorAssignmentItem[]) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Mentorship Cohort
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Assigned Students
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Review academic details, target career paths, and tracking details for your assigned cohort of students.
        </p>
      </div>

      {/* Cohort list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Your Student Cohort</h2>
        {activeStudents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-4 max-w-lg">
            <Users className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-xs font-sans">
              No students are currently assigned to you. When the system coordinator links you with students, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {activeStudents.map((assign: MentorAssignmentItem) => {
              const student = assign.student_profiles;
              const studentUser = student?.users;
              return (
                <div key={assign.id} className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-lg text-purple-400">
                      {studentUser?.full_name?.[0] || "S"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{studentUser?.full_name || "Vajra Student"}</h4>
                      <p className="text-xs text-slate-400 font-sans">{studentUser?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-white/5 py-3">
                    <div>
                      <span className="text-slate-500 font-sans block">University</span>
                      <span className="text-slate-200 font-medium">{student?.university || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-sans block">Major</span>
                      <span className="text-slate-200 font-medium">{student?.major || "N/A"}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-500 font-sans block">GPA</span>
                      <span className="text-slate-200 font-medium">{student?.gpa || "N/A"}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-500 font-sans block">Status</span>
                      <span className="capitalize text-emerald-400 font-medium font-mono text-[10px]">{assign.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Assigned: {new Date(assign.assigned_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

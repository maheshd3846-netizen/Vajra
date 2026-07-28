import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface StudentItem {
  id: string;
  university: string | null;
  major: string | null;
  gpa: number | null;
  users: {
    full_name: string | null;
    email: string;
  } | null;
}

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all students
  const { data: students } = await supabase
    .from("student_profiles")
    .select(`
      id,
      university,
      major,
      gpa,
      users (
        full_name,
        email
      )
    `);

  const studentList = (students as unknown as StudentItem[]) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold font-heading tracking-tight">Manage Students</h1>
      <p className="text-sm text-slate-400 font-sans">
        Browse and manage student profiles registered on VAJRA.
      </p>

      <div className="space-y-4">
        {studentList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400">
            No registered students found.
          </div>
        ) : (
          studentList.map((stud: StudentItem) => {
            const profile = stud.users;
            return (
              <div key={stud.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">{profile?.full_name || "Vajra Student"}</h4>
                  <p className="text-xs text-slate-400 font-sans">{profile?.email || "No email"} • {stud.major || "No major"} at {stud.university || "No university"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    GPA: {stud.gpa || "N/A"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Building, Briefcase, GraduationCap, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Count students
  const { count: studentsCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  // Count companies
  const { count: companiesCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "company");

  // Count mentors
  const { count: mentorsCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "mentor");

  // Count internships
  const { count: internshipsCount } = await supabase
    .from("internships")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          System Control Center
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Overview of platform users, job posting activity, and system metrics. Approve partner organizations and moderate listings.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-4">
        {/* Total Students */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Students</p>
            <h4 className="text-2xl font-bold">{studentsCount || 0}</h4>
          </div>
        </div>

        {/* Total Companies */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Companies</p>
            <h4 className="text-2xl font-bold">{companiesCount || 0}</h4>
          </div>
        </div>

        {/* Total Mentors */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Mentors</p>
            <h4 className="text-2xl font-bold">{mentorsCount || 0}</h4>
          </div>
        </div>

        {/* Total Internships */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Internships</p>
            <h4 className="text-2xl font-bold">{internshipsCount || 0}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

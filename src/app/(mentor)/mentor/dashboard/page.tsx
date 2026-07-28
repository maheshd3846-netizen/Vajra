import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Shield, Award, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MentorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor profile
  const { data: mentor } = await supabase
    .from("mentors")
    .select("bio, company_name, job_title, expertise, is_verified")
    .eq("id", user.id)
    .single();

  // Fetch mentor assignments count
  const { count: activeStudentsCount } = await supabase
    .from("mentor_assignments")
    .select("*", { count: "exact", head: true })
    .eq("mentor_id", user.id)
    .eq("status", "active");

  const { count: completedStudentsCount } = await supabase
    .from("mentor_assignments")
    .select("*", { count: "exact", head: true })
    .eq("mentor_id", user.id)
    .eq("status", "completed");

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Mentor Dashboard
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Mentorship Hub
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Welcome back! You are logged in as a mentor. Track your student assignments, review technical progress, and provide learning feedback.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Verification Status */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${mentor?.is_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Verification Status</p>
            <h4 className="text-lg font-bold">{mentor?.is_verified ? "Verified Mentor" : "Pending Approval"}</h4>
          </div>
        </div>

        {/* Active Students */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Active Students</p>
            <h4 className="text-2xl font-bold">{activeStudentsCount || 0}</h4>
          </div>
        </div>

        {/* Completed Mentorships */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Graduated Students</p>
            <h4 className="text-2xl font-bold">{completedStudentsCount || 0}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

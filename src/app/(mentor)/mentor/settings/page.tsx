import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Settings, User, Briefcase, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MentorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor profile details
  const { data: mentor } = await supabase
    .from("mentors")
    .select("bio, company_name, job_title, expertise, is_verified")
    .eq("id", user.id)
    .single();

  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-3xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Settings className="w-4 h-4" />
          Mentor settings
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-400 max-w-xl font-sans">
          Manage your mentor dashboard credentials, list your areas of technical expertise, and configure your bio.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Personal profile
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {userProfile?.full_name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {user.email || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Professional background
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Job Title</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {mentor?.job_title || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Company Name</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {mentor?.company_name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Verification Status</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300 capitalize flex items-center gap-1.5">
                <Shield className={`w-4 h-4 ${mentor?.is_verified ? "text-emerald-400" : "text-yellow-400"}`} />
                {mentor?.is_verified ? "Verified Mentor" : "Pending Verification Review"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-400 block">Expertise areas</label>
          <div className="flex flex-wrap gap-1.5">
            {mentor?.expertise?.length === 0 ? (
              <span className="text-xs text-slate-500 font-sans">No expertise fields listed.</span>
            ) : (
              mentor?.expertise?.map((skill: string) => (
                <span key={skill} className="px-3 py-1 rounded bg-slate-950 text-xs text-blue-400 border border-blue-500/10">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <hr className="border-white/5" />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Mentor Bio</label>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300 leading-relaxed font-sans">
            {mentor?.bio || "No biography provided. Tell students more about your background!"}
          </div>
        </div>
      </div>
    </div>
  );
}

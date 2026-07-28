import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Settings as SettingsIcon, User, GraduationCap, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student profile details
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("bio, university, major, graduation_year, gpa, github_url, linkedin_url")
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
          <SettingsIcon className="w-4 h-4" />
          User Profile settings
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-400 max-w-xl font-sans">
          Manage your account credentials, edit your personal details, and configure your public portfolio settings.
        </p>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Personal Profile
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
            <GraduationCap className="w-5 h-5 text-purple-400" />
            Academics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">University</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {studentProfile?.university || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Major / Target Role</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {studentProfile?.major || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">GPA</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {studentProfile?.gpa || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Graduation Year</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {studentProfile?.graduation_year || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            Online Profiles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">GitHub Link</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {studentProfile?.github_url || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">LinkedIn Link</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {studentProfile?.linkedin_url || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Bio</label>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300 leading-relaxed">
            {studentProfile?.bio || "No biography provided. Update your profile during onboarding or profile editing."}
          </div>
        </div>
      </div>
    </div>
  );
}

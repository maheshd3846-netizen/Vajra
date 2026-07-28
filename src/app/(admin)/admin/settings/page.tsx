import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Settings, Shield, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-3xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Settings className="w-4 h-4" />
          System Settings
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Admin Settings
        </h1>
        <p className="text-sm text-slate-400 max-w-xl font-sans">
          Manage system configurations, verify access credentials, and monitor server environments.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Administrator Profile
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Admin Name</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {profile?.full_name || "System Admin"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {user.email || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Role Designation</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300 capitalize flex items-center gap-1.5 font-mono text-[11px] text-blue-400">
                <Shield className="w-4 h-4 text-blue-400" />
                {profile?.role || "Admin"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

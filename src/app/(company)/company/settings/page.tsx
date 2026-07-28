import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Settings, Building, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company profile details
  const { data: company } = await supabase
    .from("companies")
    .select("name, website, industry, description, logo_url, is_verified")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-3xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Settings className="w-4 h-4" />
          Organization settings
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-400 max-w-xl font-sans">
          Manage your company&apos;s profile info, verify recruiting credentials, and review platform authentication state.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            Company details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Company Name</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {company?.name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Industry / Domain</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {company?.industry || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Website URL</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300">
                {company?.website || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Verification Status</label>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300 capitalize flex items-center gap-1.5">
                <Shield className={`w-4 h-4 ${company?.is_verified ? "text-emerald-400" : "text-yellow-400"}`} />
                {company?.is_verified ? "Verified Employer" : "Pending Verification Review"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Organization Description</label>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-sm text-slate-300 leading-relaxed">
            {company?.description || "No description set yet. Help talent understand your company's mission."}
          </div>
        </div>
      </div>
    </div>
  );
}

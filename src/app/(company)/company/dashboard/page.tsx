import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Briefcase, Users, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company details
  const { data: company } = await supabase
    .from("companies")
    .select("name, is_verified")
    .eq("id", user.id)
    .single();

  // Query internship statistics
  const { count: internshipsCount } = await supabase
    .from("internships")
    .select("*", { count: "exact", head: true })
    .eq("company_id", user.id);

  // Query applications statistics for the company's internships
  const { data: companyInternshipIds } = await supabase
    .from("internships")
    .select("id")
    .eq("company_id", user.id);

  const internshipIds = companyInternshipIds?.map((item) => item.id) || [];

  let applicantsCount = 0;
  if (internshipIds.length > 0) {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("internship_id", internshipIds);
    applicantsCount = count || 0;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Welcome, {company?.name || "Recruiter"}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Manage your organization profile, track internship candidate pipelines, and publish new roles.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Verification Status */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${company?.is_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
            {company?.is_verified ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Account Status</p>
            <h4 className="text-lg font-bold">{company?.is_verified ? "Vetted & Verified" : "Pending Verification"}</h4>
          </div>
        </div>

        {/* Total Internships */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Internships Listed</p>
            <h4 className="text-2xl font-bold">{internshipsCount || 0}</h4>
          </div>
        </div>

        {/* Total Applicants */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-sans">Active Applicants</p>
            <h4 className="text-2xl font-bold">{applicantsCount}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

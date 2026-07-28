import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all companies
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, website, industry, is_verified")
    .order("name", { ascending: true });

  const companyList = companies || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold font-heading tracking-tight">Manage Companies</h1>
      <p className="text-sm text-slate-400 font-sans">
        Review partner organizations, verify recruiters, and manage company records.
      </p>

      <div className="space-y-4">
        {companyList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400">
            No registered companies found.
          </div>
        ) : (
          companyList.map((comp) => (
            <div key={comp.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-white">{comp.name}</h4>
                <p className="text-xs text-slate-400 font-sans">{comp.industry || "N/A"} • {comp.website || "No website"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded border ${comp.is_verified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"}`}>
                  {comp.is_verified ? "Verified" : "Pending Approval"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

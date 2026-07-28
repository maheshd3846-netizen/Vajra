import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Briefcase, MapPin, DollarSign, Calendar, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyInternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch internships listed by this company
  const { data: internships } = await supabase
    .from("internships")
    .select("id, title, location, type, salary_range, status, created_at")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });

  const activeInternships = internships || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Internship Management
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Manage Internships
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Post new roles, edit requirements, and review candidate pipeline matching score cards.
        </p>
      </div>

      {/* Internships List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Active Postings</h2>
        {activeInternships.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-4 max-w-lg">
            <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-xs font-sans">
              No internship postings found. Start listing job descriptions to match with vetted engineers.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeInternships.map((job) => (
              <div key={job.id} className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-white">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-sans">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      {job.salary_range || "Negotiable"}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-950 text-[10px] text-blue-400 border border-blue-500/10">
                      {job.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                  <span className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full border ${job.status === "open" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {job.status}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

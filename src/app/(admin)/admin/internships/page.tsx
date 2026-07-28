import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface InternshipItem {
  id: string;
  title: string;
  location: string | null;
  type: string;
  status: string;
  companies: {
    name: string;
  } | null;
}

export default async function AdminInternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all internships
  const { data: internships } = await supabase
    .from("internships")
    .select(`
      id,
      title,
      location,
      type,
      status,
      companies (
        name
      )
    `)
    .order("created_at", { ascending: false });

  const internshipList = (internships as unknown as InternshipItem[]) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold font-heading tracking-tight">Moderate Internships</h1>
      <p className="text-sm text-slate-400 font-sans">
        Review internship roles published by companies and update status details.
      </p>

      <div className="space-y-4">
        {internshipList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400">
            No internships listed.
          </div>
        ) : (
          internshipList.map((job: InternshipItem) => (
            <div key={job.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-white">{job.title}</h4>
                <p className="text-xs text-slate-400 font-sans">{job.companies?.name || "Unknown Company"} • {job.location || "Remote"}</p>
              </div>
              <div>
                <span className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded border ${job.status === "open" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {job.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

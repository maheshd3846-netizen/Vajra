import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, FileText, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface CandidateItem {
  id: string;
  status: string;
  applied_at: string;
  resume_url: string;
  internships: {
    title: string;
  } | null;
  student_profiles: {
    id: string;
    university: string | null;
    major: string | null;
    users: {
      full_name: string | null;
    } | null;
  } | null;
}

export default async function CompanyApplicantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company's internships to get candidates
  const { data: companyInternshipIds } = await supabase
    .from("internships")
    .select("id")
    .eq("company_id", user.id);

  const internshipIds = companyInternshipIds?.map((item) => item.id) || [];

  let candidates: CandidateItem[] = [];
  if (internshipIds.length > 0) {
    const { data } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        resume_url,
        internships (
          title
        ),
        student_profiles (
          id,
          university,
          major,
          users (
            full_name
          )
        )
      `)
      .in("internship_id", internshipIds)
      .order("applied_at", { ascending: false });
    candidates = (data as unknown as CandidateItem[]) || [];
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Applicant Tracking System
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Manage Applicants
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Review credentials, view resumes, and update hiring pipeline status for active applications.
        </p>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Candidates Pipeline</h2>
        {candidates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-4 max-w-lg">
            <Users className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-xs font-sans">
              No applicant submissions found yet. As students apply to your postings, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {candidates.map((cand) => {
              const student = cand.student_profiles;
              const studentUser = student?.users;
              return (
                <div key={cand.id} className="p-6 rounded-2xl bg-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">{studentUser?.full_name || "Vajra Candidate"}</h4>
                      <p className="text-xs text-slate-400 font-sans">{student?.major} at {student?.university}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500">Applied for:</span>
                      <span className="text-blue-400 font-medium">{cand.internships?.title}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                    {cand.resume_url && (
                      <a
                        href={cand.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 px-3.5 py-2 rounded-xl border border-white/5 hover:border-white/10 transition-all font-sans cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Resume
                      </a>
                    )}
                    <span className="capitalize px-3 py-1.5 text-[10px] tracking-wider font-mono rounded bg-slate-950 text-blue-400 border border-blue-500/10">
                      {cand.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

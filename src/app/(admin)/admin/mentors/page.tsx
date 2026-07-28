import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface MentorItem {
  id: string;
  bio: string | null;
  company_name: string | null;
  job_title: string | null;
  expertise: string[];
  is_verified: boolean;
  users: {
    full_name: string | null;
    email: string;
  } | null;
}

export default async function AdminMentorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all mentors
  const { data: mentors } = await supabase
    .from("mentors")
    .select(`
      id,
      bio,
      company_name,
      job_title,
      expertise,
      is_verified,
      users (
        full_name,
        email
      )
    `);

  const mentorList = (mentors as unknown as MentorItem[]) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold font-heading tracking-tight">Manage Mentors</h1>
      <p className="text-sm text-slate-400 font-sans">
        Review mentor profile applications, manage expertise tags, and moderate mentor approvals.
      </p>

      <div className="space-y-4">
        {mentorList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400">
            No mentors registered yet.
          </div>
        ) : (
          mentorList.map((ment: MentorItem) => {
            const profile = ment.users;
            return (
              <div key={ment.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">{profile?.full_name || "Vajra Mentor"}</h4>
                  <p className="text-xs text-slate-400 font-sans">{profile?.email || "No email"} • {ment.job_title} at {ment.company_name}</p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded border ${ment.is_verified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"}`}>
                    {ment.is_verified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

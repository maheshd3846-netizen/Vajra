import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Calendar, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface StudentMentorshipAssignment {
  id: string;
  status: string;
  assigned_at: string;
  mentors: {
    id: string;
    bio: string | null;
    company_name: string | null;
    job_title: string | null;
    expertise: string[];
    users: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

export default async function MentorshipPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch active mentorship assignments with mentor details
  const { data: assignments } = await supabase
    .from("mentor_assignments")
    .select(`
      id,
      status,
      assigned_at,
      mentors (
        id,
        bio,
        company_name,
        job_title,
        expertise,
        users (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("student_id", user.id)
    .eq("status", "active");

  const activeAssignments = (assignments as unknown as StudentMentorshipAssignment[]) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Industry Mentorship
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Mentorship & Cohorts
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Connect with industry experts, receive 1-on-1 feedback, and track your cohort learning progress.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Your Active Mentors</h2>
        {activeAssignments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-center space-y-4 max-w-lg">
            <Users className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-xs font-sans">
              You are not currently assigned to any industry mentors. Your advisor will assign you a mentor based on your Career DNA and target role.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {activeAssignments.map((assignment: StudentMentorshipAssignment) => {
              const mentor = assignment.mentors;
              const mentorProfile = mentor?.users;
              return (
                <div key={assignment.id} className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-lg text-blue-400">
                      {mentorProfile?.full_name?.[0] || "M"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{mentorProfile?.full_name || "Industry Mentor"}</h4>
                      <p className="text-xs text-slate-400">{mentor?.job_title} at {mentor?.company_name}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-sans leading-relaxed">
                    {mentor?.bio || "No biography provided."}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {mentor?.expertise?.map((skill: string) => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-blue-400 border border-blue-500/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
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

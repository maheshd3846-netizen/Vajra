import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare, Star, Calendar, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface FeedbackItem {
  id: string;
  feedback_text: string;
  rating: number;
  created_at: string;
  mentor_assignments: {
    student_profiles: {
      users: {
        full_name: string | null;
      } | null;
    } | null;
  } | null;
}

export default async function MentorFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch feedback submitted by this mentor
  const { data: feedback } = await supabase
    .from("mentor_feedback")
    .select(`
      id,
      feedback_text,
      rating,
      created_at,
      mentor_assignments (
        student_profiles (
          users (
            full_name
          )
        )
      )
    `)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const feedbackList = (feedback as unknown as FeedbackItem[]) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Feedback Registry
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Performance Feedback
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Log evaluations, rate cohort performance, and view feedback trails submitted to students.
        </p>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Feedback History</h2>
        {feedbackList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-4 max-w-lg">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-xs font-sans">
              No feedback logs found. Select a student from your cohort dashboard to submit evaluation reports.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {feedbackList.map((fb: FeedbackItem) => {
              const studentName = fb.mentor_assignments?.student_profiles?.users?.full_name || "Vajra Student";
              return (
                <div key={fb.id} className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{studentName}</h4>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {fb.rating} / 5
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {fb.feedback_text}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-2 border-t border-white/5">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted: {new Date(fb.created_at).toLocaleDateString()}
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

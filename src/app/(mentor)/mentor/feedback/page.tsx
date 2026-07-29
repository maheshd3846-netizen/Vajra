import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare, Star, Calendar, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";

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
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-4 h-4" />
          Feedback Registry
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Performance Feedback
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground font-sans">
          Log evaluations, rate cohort performance, and view feedback trails submitted to students.
        </p>
        </div>

      {/* Feedback list */}
      <div className="space-y-4">
        <h2 className="border-b border-border/70 pb-3 text-lg font-semibold text-foreground">Feedback History</h2>
        {feedbackList.length === 0 ? (
          <Panel className="mx-auto max-w-lg space-y-4 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-500" />
            <p className="text-xs text-muted-foreground font-sans">
              No feedback logs found. Select a student from your cohort dashboard to submit evaluation reports.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-4">
            {feedbackList.map((fb: FeedbackItem) => {
              const studentName = fb.mentor_assignments?.student_profiles?.users?.full_name || "Vajra Student";
              return (
                <Panel key={fb.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{studentName}</h4>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {fb.rating} / 5
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground font-sans">
                    {fb.feedback_text}
                  </p>
                  <div className="flex items-center gap-1 border-t border-border/70 pt-2 font-mono text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted: {new Date(fb.created_at).toLocaleDateString()}
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
      </Section>
    </Container>
  );
}

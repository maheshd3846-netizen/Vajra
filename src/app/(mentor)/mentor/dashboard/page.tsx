import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Shield, Award, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";
import MentorDashboardClient, {
  type MentorDashboardData,
  type MentorDashboardStudentItem,
} from "@/components/mentor/MentorDashboardClient";
import { fetchMentorDashboardAction } from "@/app/actions/mentor";

export const dynamic = "force-dynamic";

export default async function MentorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor record
  const { data: mentor } = await supabase
    .from("mentors")
    .select("is_verified")
    .eq("id", user.id)
    .single();

  const res = await fetchMentorDashboardAction();

  const dashboardData: MentorDashboardData = {
    totalStudents: res.data?.totalStudents || 0,
    activeStudents: res.data?.activeStudents || 0,
    pendingReviews: res.data?.pendingReviews || 0,
    upcomingSessions: res.data?.upcomingSessions || 0,
    avgCareerDna: res.data?.avgCareerDna || 78,
    students: (res.data?.students as unknown as MentorDashboardStudentItem[]) || [],
    isVerified: Boolean(mentor?.is_verified),
  };

  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Mentor Dashboard
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Mentorship Hub
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground font-sans">
          Welcome back! You are logged in as a mentor. Track your student assignments, review technical progress, and provide learning feedback.
        </p>
        </div>

      {/* Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Verification Status */}
        <Panel className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${mentor?.is_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-sans">Verification Status</p>
            <h4 className="text-lg font-bold text-foreground">{mentor?.is_verified ? "Verified Mentor" : "Pending Approval"}</h4>
          </div>
        </Panel>

        {/* Active Students */}
        <Panel className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-sans">Active Students</p>
            <h4 className="text-2xl font-bold text-foreground">{activeStudentsCount || 0}</h4>
          </div>
        </Panel>

        {/* Completed Mentorships */}
        <Panel className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-sans">Graduated Students</p>
            <h4 className="text-2xl font-bold text-foreground">{completedStudentsCount || 0}</h4>
          </div>
        </Panel>
      </div>
      </Section>
    </Container>
  );
}

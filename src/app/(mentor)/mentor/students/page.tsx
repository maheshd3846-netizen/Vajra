import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
<<<<<<< HEAD
import { Users, Calendar, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";
=======
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
import MentorStudentsClient, {
  type StudentCohortItem,
} from "@/components/mentor/MentorStudentsClient";

export const dynamic = "force-dynamic";

export default async function MentorStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor assignments
  const { data: assignments } = await supabase
    .from("mentor_assignments")
    .select(`
      id,
      status,
      assigned_at,
      student_profiles (
        id,
        university,
        major,
        degree,
        branch,
        graduation_year,
        gpa,
        cgpa,
        phone,
        target_role,
        users (
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq("mentor_id", user.id)
    .order("assigned_at", { ascending: false });

  const cohortList = (assignments as unknown as StudentCohortItem[]) || [];

<<<<<<< HEAD
  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-4 h-4" />
          Mentorship Cohort
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Assigned Students
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground font-sans">
          Review academic details, target career paths, and tracking details for your assigned cohort of students.
        </p>
        </div>

      {/* Cohort list */}
      <div className="space-y-4">
        <h2 className="border-b border-border/70 pb-3 text-lg font-semibold text-foreground">Your Student Cohort</h2>
        {activeStudents.length === 0 ? (
          <Panel className="mx-auto max-w-lg space-y-4 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-500" />
            <p className="text-xs text-muted-foreground font-sans">
              No students are currently assigned to you. When the system coordinator links you with students, they will appear here.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {activeStudents.map((assign: MentorAssignmentItem) => {
              const student = assign.student_profiles;
              const studentUser = student?.users;
              return (
                <Panel key={assign.id} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-lg text-purple-400">
                      {studentUser?.full_name?.[0] || "S"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{studentUser?.full_name || "Vajra Student"}</h4>
                      <p className="text-xs text-muted-foreground font-sans">{studentUser?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-y border-border/70 py-3 text-xs">
                    <div>
                      <span className="block font-sans text-muted-foreground">University</span>
                      <span className="font-medium text-foreground">{student?.university || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block font-sans text-muted-foreground">Major</span>
                      <span className="font-medium text-foreground">{student?.major || "N/A"}</span>
                    </div>
                    <div className="pt-2">
                      <span className="block font-sans text-muted-foreground">GPA</span>
                      <span className="font-medium text-foreground">{student?.gpa || "N/A"}</span>
                    </div>
                    <div className="pt-2">
                      <span className="block font-sans text-muted-foreground">Status</span>
                      <span className="capitalize text-emerald-400 font-medium font-mono text-[10px]">{assign.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    Assigned: {new Date(assign.assigned_at).toLocaleDateString()}
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
=======
  return <MentorStudentsClient initialCohort={cohortList} />;
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

interface StudentItem {
  id: string;
  university: string | null;
  major: string | null;
  gpa: number | null;
  users: {
    full_name: string | null;
    email: string;
  } | null;
}

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all students
  const { data: students } = await supabase
    .from("student_profiles")
    .select(`
      id,
      university,
      major,
      gpa,
      users (
        full_name,
        email
      )
    `);

  const studentList = (students as unknown as StudentItem[]) || [];

  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Manage Students</h1>
      <p className="text-sm text-muted-foreground font-sans">
        Browse and manage student profiles registered on VAJRA.
      </p>

      <div className="space-y-4">
        {studentList.length === 0 ? (
          <Panel className="text-center text-xs text-muted-foreground">
            No registered students found.
          </Panel>
        ) : (
          studentList.map((stud: StudentItem) => {
            const profile = stud.users;
            return (
              <Panel key={stud.id} className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{profile?.full_name || "Vajra Student"}</h4>
                  <p className="text-xs text-muted-foreground font-sans">{profile?.email || "No email"} • {stud.major || "No major"} at {stud.university || "No university"}</p>
                </div>
                <div>
                  <span className="rounded border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary font-mono">
                    GPA: {stud.gpa || "N/A"}
                  </span>
                </div>
              </Panel>
            );
          })
        )}
      </div>
      </Section>
    </Container>
  );
}

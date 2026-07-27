import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchFilteredInternshipsAction } from "@/app/actions/internships";
import InternshipMatcherWorkspace from "@/components/dashboard/internships/InternshipMatcherWorkspace";

export const dynamic = "force-dynamic";

export default async function InternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch student skills to parse matching overlays in modal
  const { data: studentSkills } = await supabase
    .from("student_skills")
    .select("skill_name")
    .eq("student_id", user.id);

  // 2. Query active student applications pipeline
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      internship_id,
      resume_url,
      status,
      applied_at,
      internships (
        title,
        companies (
          name
        )
      )
    `)
    .eq("student_id", user.id)
    .order("applied_at", { ascending: false });

  // 3. Trigger Server Action to fetch internships and calculate AI DNA Match scores
  const { internships } = await fetchFilteredInternshipsAction();

  const initialInternships = internships || [];
  const initialApplications =
    (applications as unknown as {
      id: string;
      internship_id: string;
      resume_url: string;
      status: string;
      applied_at: string;
      internships: {
        title: string;
        companies: {
          name: string;
        } | null;
      } | null;
    }[]) || [];
  const initialSkills = studentSkills || [];

  return (
    <InternshipMatcherWorkspace
      initialInternships={initialInternships}
      initialApplications={initialApplications}
      studentSkills={initialSkills}
      userId={user.id}
    />
  );
}

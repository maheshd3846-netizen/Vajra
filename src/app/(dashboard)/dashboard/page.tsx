import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentDashboardView from "@/components/dashboard/StudentDashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile info
  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch student profile details
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("major, university, gpa, graduation_year, github_url, linkedin_url")
    .eq("id", user.id)
    .single();

  // Fetch student skills
  const { data: skills } = await supabase
    .from("student_skills")
    .select("id, student_id, skill_name, proficiency, verified")
    .eq("student_id", user.id);

  // Fetch matching internships based on target role
  const targetRole = studentProfile?.major || "Software Engineer";
  const { data: internships } = await supabase
    .from("internships")
    .select("id, title, location, salary, companies(name)")
    .ilike("title", `%${targetRole.split(" ")[0]}%`)
    .limit(3);

  // Fallbacks mapping
  const profileName = userProfile?.full_name || user.email?.split("@")[0] || "Vajra Engineer";
  const activeSkills = skills || [];
  const activeInternships =
    (internships as unknown as {
      id: string;
      title: string;
      location: string;
      salary: number;
      companies: { name: string } | null;
    }[]) || [];

  return (
    <StudentDashboardView
      profileName={profileName}
      studentProfile={studentProfile}
      skills={activeSkills}
      internships={activeInternships}
    />
  );
}

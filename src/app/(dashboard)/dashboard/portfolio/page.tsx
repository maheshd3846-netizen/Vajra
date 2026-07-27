import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortfolioBuilderWorkspace from "@/components/dashboard/portfolio/PortfolioBuilderWorkspace";

export const dynamic = "force-dynamic";

export default async function PortfolioBuilderPage() {
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
    .select("major, university, github_url, linkedin_url")
    .eq("id", user.id)
    .single();

  // Fetch student skills
  const { data: skills } = await supabase
    .from("student_skills")
    .select("skill_name, proficiency, verified")
    .eq("student_id", user.id);

  // Fetch student projects
  const { data: projects } = await supabase
    .from("projects")
    .select("title, description")
    .eq("student_id", user.id);

  // Fetch existing published portfolio configuration
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("asset_url, title, description")
    .eq("student_id", user.id)
    .single();

  const profileName = userProfile?.full_name || user.email?.split("@")[0] || "Vajra Engineer";
  const activeSkills = skills || [];
  const activeProjects = projects || [];

  return (
    <PortfolioBuilderWorkspace
      profileName={profileName}
      studentProfile={studentProfile}
      skills={activeSkills}
      projects={activeProjects}
      existingPortfolio={portfolio}
    />
  );
}

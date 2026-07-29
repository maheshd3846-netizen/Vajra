import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentCareerIntelligenceDashboard from "@/components/dashboard/StudentCareerIntelligenceDashboard";
import { generateCareerIntelligenceSuite } from "@/lib/ai-career-intelligence-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  console.log("[INIT STAGE 11] Dashboard fetch started");
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
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch student profile details
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("major, university, gpa, graduation_year, github_url, linkedin_url")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch student skills
  const { data: skills } = await supabase
    .from("student_skills")
    .select("skill_name, proficiency, verified")
    .eq("student_id", user.id);

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, technologies")
    .eq("student_id", user.id);

  // Fetch resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, is_primary")
    .eq("student_id", user.id);

  // Fetch certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, name, issuer")
    .eq("student_id", user.id);

  // Fetch portfolios
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, title")
    .eq("student_id", user.id);

  // Fetch AI reports
  const { data: aiReports } = await supabase
    .from("ai_reports")
    .select("id, report_type, score")
    .eq("student_id", user.id);

  // Fetch career timeline
  const { data: careerTimeline } = await supabase
    .from("career_timeline")
    .select("id, title, description, start_date")
    .eq("student_id", user.id)
    .order("start_date", { ascending: false });

  console.log("[INIT STAGE 12] Dashboard DB queries completed");

  const profileName = userProfile?.full_name || user.email?.split("@")[0] || "Student Candidate";

  console.log("[INIT STAGE 13] Generating Career Intelligence suite...");
  const intelligenceData = await generateCareerIntelligenceSuite({
    studentName: profileName,
    profile: studentProfile as Record<string, unknown> | null,
    skills: skills || [],
    projects: projects || [],
    resumes: resumes || [],
    certificates: certificates || [],
    portfolios: portfolios || [],
    aiReports: aiReports || [],
    careerTimeline: (careerTimeline || []).map((t) => ({ ...t, description: t.description || "" })),
  });

  console.log("[INIT STAGE 14] Dashboard fetch completed");
  console.log("[INIT STAGE 15] Dashboard render");

  return (
    <StudentCareerIntelligenceDashboard
      initialData={intelligenceData}
      profileName={profileName}
      userEmail={user.email || undefined}
    />
  );
}

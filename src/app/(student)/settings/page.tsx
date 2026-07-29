import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentSettingsClient, {
  type StudentProfileInitialData,
} from "@/components/student/StudentSettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Attempt to fetch full student profile including extended 00006 schema fields
  let { data: studentProfile } = await supabase
    .from("student_profiles")
    .select(`
      bio,
      university,
      degree,
      branch,
      major,
      graduation_year,
      gpa,
      cgpa,
      target_role,
      linkedin_url,
      github_url,
      portfolio_url,
      phone,
      location
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (!studentProfile) {
    // Schema fallback check for older database instances
    const { data: baseProfile } = await supabase
      .from("student_profiles")
      .select("bio, university, major, graduation_year, gpa, github_url, linkedin_url")
      .eq("id", user.id)
      .maybeSingle();

    if (baseProfile) {
      studentProfile = {
        bio: baseProfile.bio,
        university: baseProfile.university,
        degree: baseProfile.major,
        branch: baseProfile.major,
        major: baseProfile.major,
        graduation_year: baseProfile.graduation_year,
        gpa: baseProfile.gpa,
        cgpa: baseProfile.gpa,
        target_role: null,
        portfolio_url: null,
        phone: null,
        location: null,
        github_url: baseProfile.github_url,
        linkedin_url: baseProfile.linkedin_url,
      };
    }
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: studentSkills } = await supabase
    .from("student_skills")
    .select("skill_name")
    .eq("student_id", user.id);

  const skillsList = (studentSkills || []).map((s) => s.skill_name);

  const initialData: StudentProfileInitialData = {
    full_name: userProfile?.full_name || "",
    email: user.email || "",
    avatar_url: userProfile?.avatar_url || "",
    bio: studentProfile?.bio || "",
    university: studentProfile?.university || "",
    degree: studentProfile?.degree || "",
    branch: studentProfile?.branch || studentProfile?.major || "",
    graduation_year: studentProfile?.graduation_year ? String(studentProfile.graduation_year) : "",
    cgpa: studentProfile?.cgpa ? String(studentProfile.cgpa) : studentProfile?.gpa ? String(studentProfile.gpa) : "",
    target_role: studentProfile?.target_role || "",
    skills: skillsList,
    linkedin_url: studentProfile?.linkedin_url || "",
    github_url: studentProfile?.github_url || "",
    portfolio_url: studentProfile?.portfolio_url || "",
    phone: studentProfile?.phone || "",
    location: studentProfile?.location || "",
  };

  return <StudentSettingsClient initialData={initialData} />;
}

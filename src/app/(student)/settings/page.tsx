import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
<<<<<<< HEAD
import { Settings as SettingsIcon } from "lucide-react";
import { StudentSettingsForm } from "@/components/student/StudentSettingsForm";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
=======
import StudentSettingsClient, {
  type StudentProfileInitialData,
} from "@/components/student/StudentSettingsClient";
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5

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

<<<<<<< HEAD
  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <SettingsIcon className="w-4 h-4" />
          User Profile settings
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Settings
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground font-sans">
          Manage your account credentials, edit your personal details, and configure your public portfolio settings.
        </p>
        </div>

        <StudentSettingsForm
          initialFullName={userProfile?.full_name || ""}
          email={user.email || ""}
          initialProfile={{
            bio: studentProfile?.bio || "",
            university: studentProfile?.university || "",
            major: studentProfile?.major || "",
            graduationYear: studentProfile?.graduation_year?.toString() || "",
            gpa: studentProfile?.gpa?.toString() || "",
            githubUrl: studentProfile?.github_url || "",
            linkedinUrl: studentProfile?.linkedin_url || "",
          }}
        />
      </Section>
    </Container>
  );
=======
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
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
}

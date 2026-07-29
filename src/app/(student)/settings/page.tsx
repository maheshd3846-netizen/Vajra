import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Settings as SettingsIcon } from "lucide-react";
import { StudentSettingsForm } from "@/components/student/StudentSettingsForm";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student profile & user details
  const { data: rawStudentProfile, error: profileError } = await supabase
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
      portfolio_url,
      phone,
      location,
      github_url,
      linkedin_url
    `)
    .eq("id", user.id)
    .maybeSingle();

  let studentProfile = rawStudentProfile;

  // Fallback if migration 00006 columns (degree, branch, cgpa, etc.) are not yet in PostgREST schema cache
  if (profileError) {
    console.warn("[SettingsPage] Extended columns query notice:", profileError.message);
    const { data: baseProfile } = await supabase
      .from("student_profiles")
      .select(`
        bio,
        university,
        major,
        graduation_year,
        gpa,
        github_url,
        linkedin_url
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (baseProfile) {
      studentProfile = {
        bio: baseProfile.bio,
        university: baseProfile.university,
        degree: null,
        branch: baseProfile.major,
        major: baseProfile.major,
        graduation_year: baseProfile.graduation_year,
        gpa: baseProfile.gpa,
        cgpa: baseProfile.gpa ? Number((baseProfile.gpa * 2.5).toFixed(2)) : null,
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
}

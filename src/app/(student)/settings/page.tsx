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

  // Fetch student profile details
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("bio, university, major, graduation_year, gpa, github_url, linkedin_url")
    .eq("id", user.id)
    .single();

  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

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

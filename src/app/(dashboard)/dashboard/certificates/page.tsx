import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SkillPassportWorkspace from "@/components/dashboard/certificates/SkillPassportWorkspace";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student profile details
  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch student skills
  const { data: skills } = await supabase
    .from("student_skills")
    .select("skill_name, proficiency, verified")
    .eq("student_id", user.id);

  // Fetch certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, student_id, name, issuer, issue_date, expiry_date, credential_id, credential_url")
    .eq("student_id", user.id);

  const profileName = userProfile?.full_name || user.email?.split("@")[0] || "Vajra Engineer";
  const activeSkills = skills || [];
  const activeCertificates =
    (certificates as unknown as {
      id: string;
      student_id: string;
      name: string;
      issuer: string;
      issue_date: string;
      expiry_date: string | null;
      credential_id: string | null;
      credential_url: string | null;
    }[]) || [];

  return (
    <SkillPassportWorkspace
      profileName={profileName}
      initialCertificates={activeCertificates}
      skills={activeSkills}
      userId={user.id}
    />
  );
}

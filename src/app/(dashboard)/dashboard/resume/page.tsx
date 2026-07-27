import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResumeAnalyzerWorkspace from "@/components/dashboard/resume/ResumeAnalyzerWorkspace";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student profile details to get their Target Role (major)
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("major")
    .eq("id", user.id)
    .single();

  const targetRole = studentProfile?.major || "Software Engineer";

  return <ResumeAnalyzerWorkspace targetRole={targetRole} />;
}

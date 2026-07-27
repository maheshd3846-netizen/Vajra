import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MockInterviewWorkspace from "@/components/dashboard/interviews/MockInterviewWorkspace";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student profile details to get target role (major)
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("major")
    .eq("id", user.id)
    .single();

  const targetRole = studentProfile?.major || "Software Engineer";

  return <MockInterviewWorkspace targetRole={targetRole} />;
}

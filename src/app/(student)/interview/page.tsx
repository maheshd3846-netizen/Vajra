import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MockInterviewWorkspace from "@/components/dashboard/interviews/MockInterviewWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Mock Interview Studio — VAJRA",
  description: "Simulate realistic technical & behavioral interviews powered by Gemini 2.5 Pro.",
};

export default async function InterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student major / target role
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("major")
    .eq("id", user.id)
    .single();

  const targetRole = studentProfile?.major || "Software Engineer";

  return <MockInterviewWorkspace targetRole={targetRole} />;
}

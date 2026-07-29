import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CareerHubClient from "@/components/dashboard/career/CareerHubClient";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
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
    .maybeSingle();

  const targetRole = studentProfile?.major || "Software Engineer";

  return <CareerHubClient targetRole={targetRole} />;
}

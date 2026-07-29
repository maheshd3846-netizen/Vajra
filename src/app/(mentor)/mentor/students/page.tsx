import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MentorStudentsClient, {
  type StudentCohortItem,
} from "@/components/mentor/MentorStudentsClient";

export const dynamic = "force-dynamic";

export default async function MentorStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor assignments
  const { data: assignments } = await supabase
    .from("mentor_assignments")
    .select(`
      id,
      status,
      assigned_at,
      student_profiles (
        id,
        university,
        major,
        degree,
        branch,
        graduation_year,
        gpa,
        cgpa,
        phone,
        target_role,
        users (
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq("mentor_id", user.id)
    .order("assigned_at", { ascending: false });

  const cohortList = (assignments as unknown as StudentCohortItem[]) || [];

  return <MentorStudentsClient initialCohort={cohortList} />;
}

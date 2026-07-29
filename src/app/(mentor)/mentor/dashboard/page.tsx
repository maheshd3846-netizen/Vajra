import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import MentorDashboardClient, {
  type MentorDashboardData,
  type MentorDashboardStudentItem,
} from "@/components/mentor/MentorDashboardClient";
import { fetchMentorDashboardAction } from "@/app/actions/mentor";

export const dynamic = "force-dynamic";

export default async function MentorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor record
  const { data: mentor } = await supabase
    .from("mentors")
    .select("is_verified")
    .eq("id", user.id)
    .maybeSingle();

  const res = await fetchMentorDashboardAction();

  const dashboardData: MentorDashboardData = {
    totalStudents: res.data?.totalStudents || 0,
    activeStudents: res.data?.activeStudents || 0,
    pendingReviews: res.data?.pendingReviews || 0,
    upcomingSessions: res.data?.upcomingSessions || 0,
    avgCareerDna: res.data?.avgCareerDna || 78,
    students: (res.data?.students as unknown as MentorDashboardStudentItem[]) || [],
    isVerified: Boolean(mentor?.is_verified),
  };

  return <MentorDashboardClient initialData={dashboardData} />;
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchStudentProgressTrackerAction } from "@/app/actions/progress";
import StudentProgressClient from "@/components/student/StudentProgressClient";

export const dynamic = "force-dynamic";

export default async function StudentProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await fetchStudentProgressTrackerAction();

  return (
    <StudentProgressClient
      initialReports={initialData.reports || []}
      initialTodaysReport={initialData.todaysReport || null}
      initialStats={
        initialData.stats || {
          streakDays: 0,
          totalHoursWorked: 0,
          tasksCompletedCount: 0,
          avgProductivity: 4,
          readinessScore: 75,
          submissionRatePct: 100,
        }
      }
      initialWeeklySummary={initialData.weeklySummary || {}}
    />
  );
}

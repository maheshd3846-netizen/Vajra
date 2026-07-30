import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyProgressDashboardAction } from "@/app/actions/progress";
import CompanyProgressClient from "@/components/company/CompanyProgressClient";

export const dynamic = "force-dynamic";

export default async function CompanyProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await fetchCompanyProgressDashboardAction();

  return (
    <CompanyProgressClient
      initialInterns={initialData.interns || []}
      initialStats={
        initialData.stats || {
          totalActiveInterns: 0,
          todaySubmittedCount: 0,
          missingTodayCount: 0,
          companyAvgProductivity: 4.5,
          submissionRatePct: 100,
        }
      }
    />
  );
}

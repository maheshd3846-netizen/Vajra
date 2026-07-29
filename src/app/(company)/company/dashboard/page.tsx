import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyDashboardAction } from "@/app/actions/company";
import CompanyDashboardClient from "@/components/company/CompanyDashboardClient";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  console.log("[Server Component Audit] Rendering CompanyDashboardPage...");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const res = await fetchCompanyDashboardAction();

  if (!res.success || !res.data) {
    console.error("[Server Component Audit] fetchCompanyDashboardAction returned error:", res.error);
    redirect("/login");
  }

  return <CompanyDashboardClient initialData={res.data} />;
}

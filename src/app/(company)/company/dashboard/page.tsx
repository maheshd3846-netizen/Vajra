import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyDashboardAction } from "@/app/actions/company";
import CompanyDashboardClient from "@/components/company/CompanyDashboardClient";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const res = await fetchCompanyDashboardAction();

  if (!res.success || !res.data) {
    redirect("/login");
  }

  return <CompanyDashboardClient initialData={res.data} />;
}

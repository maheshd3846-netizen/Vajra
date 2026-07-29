import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyDashboardAction, type CompanyDashboardData } from "@/app/actions/company";
import CompanyDashboardClient from "@/components/company/CompanyDashboardClient";
import { calculateCompanyTrustScore } from "@/lib/ai-company-trust-engine";

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

  const companyName =
    user.user_metadata?.company_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Company";

  const fallbackTrustResult = calculateCompanyTrustScore({
    id: user.id,
    name: companyName,
    website: null,
    industry: null,
    logo_url: null,
    description: null,
    is_verified: false,
    verification_status: "pending",
  });

  const fallbackData: CompanyDashboardData = {
    companyId: user.id,
    name: companyName,
    website: null,
    industry: null,
    logo_url: null,
    description: null,
    gst_number: null,
    official_email: user.email || null,
    company_size: null,
    headquarters: null,
    contact_email: user.email || null,
    contact_phone: null,
    hr_name: null,
    verification_status: "pending",
    trustScoreResult: fallbackTrustResult,
    internshipsCount: 0,
    applicantsCount: 0,
    pipelineStats: {
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewing: 0,
      accepted: 0,
      rejected: 0,
    },
  };

  const dashboardData = res.success && res.data ? res.data : fallbackData;

  return <CompanyDashboardClient initialData={dashboardData} />;
}

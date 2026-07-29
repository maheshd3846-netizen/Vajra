import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanyInternTrackerClient, {
  type CompanyInternItem,
} from "@/components/company/CompanyInternTrackerClient";
import { fetchCompanyInternsAction } from "@/app/actions/company";

export const dynamic = "force-dynamic";

export default async function CompanyInternsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const res = await fetchCompanyInternsAction();
  const internsList = (res.data as unknown as CompanyInternItem[]) || [];

  return <CompanyInternTrackerClient initialInterns={internsList} />;
}

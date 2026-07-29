import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanySettingsClient, {
  type CompanyProfileInitialData,
} from "@/components/company/CompanySettingsClient";

export const dynamic = "force-dynamic";

export default async function CompanySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company profile details
  const { data: company } = await supabase
    .from("companies")
    .select(`
      name,
      website,
      industry,
      logo_url,
      description,
      is_verified,
      company_size,
      headquarters,
      contact_email,
      contact_phone,
      hr_name,
      gst_number,
      official_email
    `)
    .eq("id", user.id)
    .single();

  const initialData: CompanyProfileInitialData = {
    name: company?.name || "",
    logo_url: company?.logo_url || "",
    industry: company?.industry || "",
    website: company?.website || "",
    company_size: company?.company_size || "",
    description: company?.description || "",
    headquarters: company?.headquarters || "",
    contact_email: company?.contact_email || user.email || "",
    contact_phone: company?.contact_phone || "",
    hr_name: company?.hr_name || "",
    is_verified: Boolean(company?.is_verified),
    gst_number: company?.gst_number || "",
    official_email: company?.official_email || user.email || "",
  };

  return <CompanySettingsClient initialData={initialData} />;
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
<<<<<<< HEAD
import { Settings, Building, Shield } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";
=======
import CompanySettingsClient, {
  type CompanyProfileInitialData,
} from "@/components/company/CompanySettingsClient";
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5

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
    .maybeSingle();

<<<<<<< HEAD
  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Settings className="w-4 h-4" />
          Organization settings
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Settings
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground font-sans">
          Manage your company&apos;s profile info, verify recruiting credentials, and review platform authentication state.
        </p>
        </div>

        <Panel className="space-y-6">
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Building className="w-5 h-5 text-primary" />
            Company details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {company?.name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Industry / Domain</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {company?.industry || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Website URL</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {company?.website || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Verification Status</label>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 p-3 text-sm capitalize text-foreground">
                <Shield className={`w-4 h-4 ${company?.is_verified ? "text-emerald-400" : "text-yellow-400"}`} />
                {company?.is_verified ? "Verified Employer" : "Pending Verification Review"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border/70" />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Organization Description</label>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm leading-relaxed text-foreground">
            {company?.description || "No description set yet. Help talent understand your company's mission."}
          </div>
        </div>
        </Panel>
      </Section>
    </Container>
  );
=======
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
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
}

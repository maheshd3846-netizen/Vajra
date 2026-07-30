import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanyInternshipsClient, {
  type InternshipListItem,
  type PipelineSummaryStats,
} from "@/components/company/CompanyInternshipsClient";

import { DEMO_INTERNSHIPS } from "@/lib/demo-seed-data";

export const dynamic = "force-dynamic";

export default async function CompanyInternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company's internship postings
  const { data: internshipsData } = await supabase
    .from("internships")
    .select(`
      id,
      title,
      description,
      location,
      type,
      internship_type,
      duration,
      stipend,
      salary_range,
      requirements,
      skills_needed,
      eligibility,
      deadline,
      openings_count,
      status,
      created_at
    `)
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });

  const activeData = (internshipsData && internshipsData.length > 0)
    ? internshipsData
    : DEMO_INTERNSHIPS.slice(0, 3); // Provide company demo listings

  const internshipsList = (activeData as unknown as InternshipListItem[]) || [];
  const internshipIds = internshipsList.map((i) => i.id);

  const stats: PipelineSummaryStats = {
    totalApplicants: 0,
    shortlisted: 0,
    rejected: 0,
    pending: 0,
    selected: 0,
  };

  if (internshipIds.length > 0) {
    const { data: apps } = await supabase
      .from("applications")
      .select("status")
      .in("internship_id", internshipIds);

    (apps || []).forEach((app) => {
      stats.totalApplicants++;
      if (app.status === "shortlisted") stats.shortlisted++;
      else if (app.status === "rejected") stats.rejected++;
      else if (app.status === "accepted") stats.selected++;
      else if (app.status === "applied" || app.status === "reviewing") stats.pending++;
    });
  }

  return <CompanyInternshipsClient initialInternships={internshipsList} stats={stats} />;
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MentorInternshipsClient, {
  type PendingInternshipItem,
} from "@/components/mentor/MentorInternshipsClient";

import { DEMO_INTERNSHIPS } from "@/lib/demo-seed-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Internship Approval Queue | Mentor Dashboard | Vajra Platform",
  description: "Review and approve company internship postings for student discovery.",
};

export default async function MentorInternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all internships for review
  const { data: rawInternships, error } = await supabase
    .from("internships")
    .select(`
      id,
      company_id,
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
      admin_feedback,
      created_at,
      companies (
        name,
        logo_url,
        official_email,
        is_verified
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("MentorInternshipsPage DB error:", error);
  }

  const activeInternships = (rawInternships && rawInternships.length > 0) ? rawInternships : DEMO_INTERNSHIPS;

  const formattedInternships: PendingInternshipItem[] = (activeInternships as unknown as Array<{
    id: string;
    company_id: string;
    title: string;
    description: string;
    location: string | null;
    type: string;
    internship_type?: string | null;
    duration?: string | null;
    stipend?: string | null;
    salary_range?: string | null;
    requirements?: string[];
    skills_needed?: string[];
    eligibility?: string | null;
    deadline?: string | null;
    openings_count?: number;
    status: string;
    admin_feedback?: string | null;
    created_at: string;
    companies?: {
      name: string;
      logo_url: string | null;
      official_email: string | null;
      is_verified: boolean;
    } | null;
    company?: {
      name: string;
      logo_url: string | null;
      official_email: string | null;
      is_verified: boolean;
    } | null;
  }>).map((item) => {
    const compRaw = item.companies || item.company;

    return {
      id: item.id,
      company_id: item.company_id,
      title: item.title,
      description: item.description,
      location: item.location,
      type: item.type,
      internship_type: item.internship_type,
      duration: item.duration,
      stipend: item.stipend || item.salary_range,
      salary_range: item.salary_range || item.stipend,
      requirements: item.requirements || [],
      skills_needed: item.skills_needed || [],
      eligibility: item.eligibility,
      deadline: item.deadline,
      openings_count: item.openings_count || 1,
      status: item.status,
      admin_feedback: item.admin_feedback,
      created_at: item.created_at,
      company: {
        name: compRaw?.name || "Partner Organization",
        logo_url: compRaw?.logo_url || null,
        official_email: compRaw?.official_email || null,
        is_verified: compRaw?.is_verified || false,
      },
    };
  });

  return <MentorInternshipsClient initialInternships={formattedInternships} />;
}

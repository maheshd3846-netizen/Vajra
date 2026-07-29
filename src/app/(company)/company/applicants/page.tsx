import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanyApplicantsClient, {
  type CandidateItem,
} from "@/components/company/CompanyApplicantsClient";

export const dynamic = "force-dynamic";

export default async function CompanyApplicantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company's internships to get candidates
  const { data: companyInternshipIds } = await supabase
    .from("internships")
    .select("id")
    .eq("company_id", user.id);

  const internshipIds = (companyInternshipIds || []).map((item) => item.id);

  let candidateList: CandidateItem[] = [];

  if (internshipIds.length > 0) {
    const { data } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        resume_url,
        cover_letter,
        internships (
          title
        ),
        student_profiles (
          id,
          university,
          major,
          users (
            full_name
          )
        )
      `)
      .in("internship_id", internshipIds)
      .order("applied_at", { ascending: false });

    candidateList = (data || []).map((item) => {
      const jobRaw = item.internships as unknown as { title: string } | null;
      const studRaw = item.student_profiles as unknown as {
        university: string | null;
        major: string | null;
        users: { full_name: string | null } | null;
      } | null;

      return {
        id: item.id,
        status: item.status,
        applied_at: item.applied_at,
        resume_url: item.resume_url,
        cover_letter: item.cover_letter,
        internshipTitle: jobRaw?.title || "Internship Role",
        studentName: studRaw?.users?.full_name || "Vajra Candidate",
        university: studRaw?.university || null,
        major: studRaw?.major || null,
      };
    });
  }

  return <CompanyApplicantsClient initialCandidates={candidateList} />;
}

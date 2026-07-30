import React from "react";
import { fetchMentorCompaniesAction } from "@/app/actions/mentor";
import MentorCompaniesClient from "@/components/mentor/MentorCompaniesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Companies Management | Mentor Dashboard | Vajra Platform",
  description: "Manage partner enterprise companies, verification applications, and company records.",
};

export default async function MentorCompaniesPage() {
  const res = await fetchMentorCompaniesAction();

  const initialCompanies = res.companies || [];
  const initialStats = res.stats || {
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  };

  return (
    <MentorCompaniesClient
      initialCompanies={initialCompanies}
      initialStats={initialStats}
    />
  );
}

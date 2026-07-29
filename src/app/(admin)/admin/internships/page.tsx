import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

interface InternshipItem {
  id: string;
  title: string;
  location: string | null;
  type: string;
  status: string;
  companies: {
    name: string;
  } | null;
}

export default async function AdminInternshipsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all internships
  const { data: internships } = await supabase
    .from("internships")
    .select(`
      id,
      title,
      location,
      type,
      status,
      companies (
        name
      )
    `)
    .order("created_at", { ascending: false });

  const internshipList = (internships as unknown as InternshipItem[]) || [];

  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Moderate Internships</h1>
      <p className="text-sm text-muted-foreground font-sans">
        Review internship roles published by companies and update status details.
      </p>

      <div className="space-y-4">
        {internshipList.length === 0 ? (
          <Panel className="text-center text-xs text-muted-foreground">
            No internships listed.
          </Panel>
        ) : (
          internshipList.map((job: InternshipItem) => (
            <Panel key={job.id} className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                <p className="text-xs text-muted-foreground font-sans">{job.companies?.name || "Unknown Company"} • {job.location || "Remote"}</p>
              </div>
              <div>
                <span className={`text-[10px] uppercase font-mono tracking-wider rounded border px-2.5 py-1 ${job.status === "open" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {job.status}
                </span>
              </div>
            </Panel>
          ))
        )}
      </div>
      </Section>
    </Container>
  );
}

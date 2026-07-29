import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
<<<<<<< HEAD
import { Briefcase, MapPin, DollarSign, Calendar, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";
=======
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
import CompanyInternshipsClient, {
  type InternshipListItem,
  type PipelineSummaryStats,
} from "@/components/company/CompanyInternshipsClient";

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

  const internshipsList = (internshipsData as InternshipListItem[]) || [];
  const internshipIds = internshipsList.map((i) => i.id);

<<<<<<< HEAD
  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-4 h-4" />
          Internship Management
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Manage Internships
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground font-sans">
          Post new roles, edit requirements, and review candidate pipeline matching score cards.
        </p>
        </div>

      {/* Internships List */}
      <div className="space-y-4">
        <h2 className="border-b border-border/70 pb-3 text-lg font-semibold text-foreground">Active Postings</h2>
        {activeInternships.length === 0 ? (
          <Panel className="mx-auto max-w-lg space-y-4 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-slate-500" />
            <p className="text-xs text-muted-foreground font-sans">
              No internship postings found. Start listing job descriptions to match with vetted engineers.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-4">
            {activeInternships.map((job) => (
              <Panel key={job.id} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-sans">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      {job.salary_range || "Negotiable"}
                    </span>
                    <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] capitalize text-primary">
                      {job.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3 md:justify-end md:border-t-0 md:pt-0">
                  <span className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full border ${job.status === "open" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {job.status}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
      </Section>
    </Container>
  );
=======
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
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
}

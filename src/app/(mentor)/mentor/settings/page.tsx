import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
<<<<<<< HEAD
import { Settings, User, Briefcase, Shield } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Panel } from "@/components/ui/panel";
import { Section } from "@/components/ui/section";
=======
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
import MentorSettingsClient, {
  type MentorProfileInitialData,
} from "@/components/mentor/MentorSettingsClient";

export const dynamic = "force-dynamic";

export default async function MentorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mentor profile details
  const { data: mentor } = await supabase
    .from("mentors")
    .select(`
      bio,
      company_name,
      job_title,
      expertise,
      is_verified,
      experience,
      skills,
      website_url,
      availability,
      contact_email,
      linkedin_url
    `)
    .eq("id", user.id)
    .maybeSingle();

  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

<<<<<<< HEAD
  return (
    <Container className="py-8 sm:py-10">
      <Section className="space-y-8">
        <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Settings className="w-4 h-4" />
          Mentor settings
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Settings
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground font-sans">
          Manage your mentor dashboard credentials, list your areas of technical expertise, and configure your bio.
        </p>
        </div>

        <Panel className="space-y-6">
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <User className="w-5 h-5 text-primary" />
            Personal profile
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {userProfile?.full_name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {user.email || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border/70" />

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Briefcase className="w-5 h-5 text-primary" />
            Professional background
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {mentor?.job_title || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
              <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-foreground">
                {mentor?.company_name || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Verification Status</label>
              <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 p-3 text-sm capitalize text-foreground">
                <Shield className={`w-4 h-4 ${mentor?.is_verified ? "text-emerald-400" : "text-yellow-400"}`} />
                {mentor?.is_verified ? "Verified Mentor" : "Pending Verification Review"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border/70" />

        <div className="space-y-4">
          <label className="block text-xs font-semibold text-muted-foreground">Expertise areas</label>
          <div className="flex flex-wrap gap-1.5">
            {mentor?.expertise?.length === 0 ? (
              <span className="text-xs text-muted-foreground font-sans">No expertise fields listed.</span>
            ) : (
              mentor?.expertise?.map((skill: string) => (
                <span key={skill} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <hr className="border-border/70" />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Mentor Bio</label>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm leading-relaxed text-foreground font-sans">
            {mentor?.bio || "No biography provided. Tell students more about your background!"}
          </div>
        </div>
        </Panel>
      </Section>
    </Container>
  );
=======
  const initialData: MentorProfileInitialData = {
    full_name: userProfile?.full_name || "",
    avatar_url: userProfile?.avatar_url || "",
    job_title: mentor?.job_title || "",
    company_name: mentor?.company_name || "",
    experience: mentor?.experience || "",
    skills: mentor?.skills || [],
    expertise: mentor?.expertise || [],
    bio: mentor?.bio || "",
    linkedin_url: mentor?.linkedin_url || "",
    website_url: mentor?.website_url || "",
    availability: mentor?.availability || "",
    contact_email: mentor?.contact_email || user.email || "",
    is_verified: Boolean(mentor?.is_verified),
  };

  return <MentorSettingsClient initialData={initialData} />;
>>>>>>> 55182242192c3070e7e903a330be5521e50fc2c5
}

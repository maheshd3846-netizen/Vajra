import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    .single();

  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

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
}

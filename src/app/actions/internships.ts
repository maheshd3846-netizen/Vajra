"use server";

import { createClient } from "@/lib/supabase/server";

interface InternshipRecord {
  id: string;
  company_id: string;
  title: string;
  description: string;
  location: string | null;
  type: string;
  requirements: string[];
  skills_needed: string[];
  salary_range: string | null;
  status: string;
  created_at: string;
  companies: {
    name: string;
    logo_url: string | null;
    is_verified: boolean;
  } | null;
  matchScore?: number;
}

export async function fetchFilteredInternshipsAction(): Promise<{
  success: boolean;
  internships?: InternshipRecord[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // 1. Fetch student skills to calculate match scores
    const { data: studentSkills } = await supabase
      .from("student_skills")
      .select("skill_name")
      .eq("student_id", user.id);

    const studentSkillNames = studentSkills
      ? studentSkills.map((s) => s.skill_name.toLowerCase())
      : [];

    // 2. Fetch internships joined with company verification metrics
    const { data: internships, error: internshipsError } = await supabase
      .from("internships")
      .select(`
        id,
        company_id,
        title,
        description,
        location,
        type,
        requirements,
        skills_needed,
        salary_range,
        status,
        created_at,
        companies (
          name,
          logo_url,
          is_verified
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (internshipsError) {
      throw internshipsError;
    }

    // 3. Process matches dynamically based on skills alignment
    const processedInternships = (internships as unknown as InternshipRecord[]).map((internship) => {
      const skillsNeeded = internship.skills_needed || [];
      
      let matchScore = 50; // Baseline potential
      if (skillsNeeded.length > 0) {
        const matches = skillsNeeded.filter((s: string) =>
          studentSkillNames.includes(s.toLowerCase())
        ).length;
        const percentage = Math.round((matches / skillsNeeded.length) * 100);
        // Map within 55 - 98% range for realistic UI visuals
        matchScore = Math.max(55, Math.min(98, percentage));
      } else {
        matchScore = 85; // Default score if no skills list defined
      }

      return {
        ...internship,
        matchScore,
      };
    });

    return {
      success: true,
      internships: processedInternships,
    };
  } catch (err: unknown) {
    const errorObj = err as Record<string, unknown> | null;
    const errorMessage = (errorObj?.message as string) || (err instanceof Error ? err.message : "Could not retrieve internship listings.");
    console.error("fetchFilteredInternshipsAction failed:", errorObj?.message || err);
    console.error("fetchFilteredInternshipsAction detailed error:", JSON.stringify(err, null, 2));
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function applyToInternshipAction(
  internshipId: string,
  resumeUrl: string,
  coverLetter?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // Insert new application record
    const { error: applyError } = await supabase.from("applications").insert({
      internship_id: internshipId,
      student_id: user.id,
      resume_url: resumeUrl,
      cover_letter: coverLetter || null,
      status: "applied",
    });

    if (applyError) {
      if (applyError.code === "23505") {
        return { success: false, error: "You have already applied to this position." };
      }
      throw applyError;
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    const errorObj = err as Record<string, unknown> | null;
    const errorMessage = (errorObj?.message as string) || (err instanceof Error ? err.message : "Failed to submit application.");
    console.error("applyToInternshipAction failed:", errorObj?.message || err);
    console.error("applyToInternshipAction detailed error:", JSON.stringify(err, null, 2));
    return {
      success: false,
      error: errorMessage,
    };
  }
}

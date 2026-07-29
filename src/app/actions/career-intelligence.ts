"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateCareerIntelligenceSuite,
  type CompleteCareerIntelligenceData,
} from "@/lib/ai-career-intelligence-service";

export async function fetchCareerIntelligenceAction(): Promise<{
  success: boolean;
  data?: CompleteCareerIntelligenceData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // Fetch user & profile data
    const [
      { data: userProfile },
      { data: studentProfile },
      { data: skills },
      { data: projects },
      { data: resumes },
      { data: certificates },
      { data: portfolios },
      { data: aiReports },
      { data: careerTimeline },
    ] = await Promise.all([
      supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("student_profiles").select("major, university, gpa").eq("id", user.id).maybeSingle(),
      supabase.from("student_skills").select("skill_name, proficiency, verified").eq("student_id", user.id),
      supabase.from("projects").select("id, title, technologies").eq("student_id", user.id),
      supabase.from("resumes").select("id, is_primary").eq("student_id", user.id),
      supabase.from("certificates").select("id, name, issuer").eq("student_id", user.id),
      supabase.from("portfolios").select("id, title").eq("student_id", user.id),
      supabase.from("ai_reports").select("id, report_type, score").eq("student_id", user.id),
      supabase.from("career_timeline").select("id, title, description, start_date").eq("student_id", user.id),
    ]);

    const studentName = userProfile?.full_name || user.email?.split("@")[0] || "Student Engineer";

    const intelligenceData = await generateCareerIntelligenceSuite({
      studentName,
      profile: studentProfile as Record<string, unknown> | null,
      skills: skills || [],
      projects: projects || [],
      resumes: resumes || [],
      certificates: certificates || [],
      portfolios: portfolios || [],
      aiReports: aiReports || [],
      careerTimeline: (careerTimeline || []).map((t) => ({ ...t, description: t.description || "" })),
    });

    return {
      success: true,
      data: intelligenceData,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to generate Career Intelligence suite.";
    console.error("fetchCareerIntelligenceAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { 
  calculateCareerDnaScores, 
  generateCareerDnaWithGemini, 
  CareerDnaAnalysisResult 
} from "@/lib/ai-career-dna-service";

interface RecalculateCareerDnaResponse {
  success: boolean;
  report?: CareerDnaAnalysisResult;
  error?: string;
}

export async function recalculateCareerDnaAction(): Promise<RecalculateCareerDnaResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // 1. Fetch student profiles & users data
    const { data: userRecord } = await supabase
      .from("users")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("major, university, gpa, cgpa, graduation_year, github_url, linkedin_url")
      .eq("id", user.id)
      .maybeSingle();

    // 2. Fetch skills
    const { data: skills } = await supabase
      .from("student_skills")
      .select("skill_name, proficiency")
      .eq("student_id", user.id);

    // 3. Fetch projects
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, description, project_url, github_url, technologies")
      .eq("student_id", user.id);

    // 4. Fetch resumes
    const { data: resumes } = await supabase
      .from("resumes")
      .select("id, name, file_url, is_primary, created_at")
      .eq("student_id", user.id);

    // 5. Fetch certificates
    const { data: certificates } = await supabase
      .from("certificates")
      .select("id, name, issuer, issue_date")
      .eq("student_id", user.id);

    // 6. Fetch portfolios
    const { data: portfolios } = await supabase
      .from("portfolios")
      .select("id, title, description, asset_url")
      .eq("student_id", user.id);

    // 7. Fetch active mentor assignment & feedback
    const { data: mentorAssignment } = await supabase
      .from("mentor_assignments")
      .select("id")
      .eq("student_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    let feedback: { feedback_text: string; rating: number }[] = [];
    if (mentorAssignment?.id) {
      const { data: mentorFeedback } = await supabase
        .from("mentor_feedback")
        .select("feedback_text, rating")
        .eq("assignment_id", mentorAssignment.id);
      feedback = mentorFeedback || [];
    }

    // 8. Fetch career timeline
    const { data: careerTimeline } = await supabase
      .from("career_timeline")
      .select("event_type, title, description, start_date")
      .eq("student_id", user.id);

    // 9. Build profile aggregation context
    const aggregatedData = {
      profileName: userRecord?.full_name || user.email?.split("@")[0] || "Vajra Engineer",
      profile: studentProfile,
      skills: skills || [],
      projects: projects || [],
      resumes: resumes || [],
      certificates: certificates || [],
      portfolios: portfolios || [],
      feedback,
      timeline: careerTimeline || []
    };

    // 10. Run Scoring calculation loops
    const scores = calculateCareerDnaScores(aggregatedData);

    // 11. Call Gemini LLM analysis
    const analysisReport = await generateCareerDnaWithGemini(aggregatedData, scores);

    // 12. Save output analysis inside public.ai_reports
    const { error: saveError } = await supabase.from("ai_reports").insert({
      student_id: user.id,
      report_type: "career_path",
      score: analysisReport.career_dna_score,
      content: analysisReport
    });

    if (saveError) {
      console.error("Database save failed for AI Career DNA report:", saveError);
      return { success: false, error: "Failed to persist Career DNA report to database." };
    }

    return {
      success: true,
      report: analysisReport
    };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during Career DNA generation.";
    console.error("Unexpected error inside recalculateCareerDnaAction:", err);
    return {
      success: false,
      error: errorMessage
    };
  }
}

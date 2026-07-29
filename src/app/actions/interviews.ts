"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getAiCoachBriefing,
  generateDynamicInterviewQuestions,
  generateAdaptiveFollowUpQuestion,
  evaluateFullInterviewSession,
  type InterviewDifficulty,
  type InterviewType,
  type StudentContextForInterview,
  type FullInterviewReport,
  type AiCoachBriefing,
} from "@/lib/ai-interview-engine";
import { calculateCareerDnaScores } from "@/lib/ai-career-dna-service";

export interface MockInterviewHistoryItem {
  id: string;
  role: string;
  difficulty: string;
  type: string;
  duration_minutes: number;
  score: number;
  created_at: string;
  report_data: FullInterviewReport;
}

/**
 * Start New Interview Session: Aggregates student context, generates questions & AI coach briefing
 */
export async function startInterviewSessionAction(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  durationMinutes: number
): Promise<{
  success: boolean;
  briefing?: AiCoachBriefing;
  questions?: string[];
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

    // Aggregate student profile context
    const [
      { data: userProfile },
      { data: studentProfile },
      { data: studentSkills },
      { data: projects },
      { data: certificates },
    ] = await Promise.all([
      supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("student_profiles").select("major, university, gpa").eq("id", user.id).maybeSingle(),
      supabase.from("student_skills").select("skill_name, proficiency").eq("student_id", user.id),
      supabase.from("projects").select("title, technologies").eq("student_id", user.id),
      supabase.from("certificates").select("name").eq("student_id", user.id),
    ]);

    const activeSkills = studentSkills || [];
    const activeProjects = projects || [];
    const activeCertificates = certificates || [];

    const localScores = calculateCareerDnaScores({
      profile: studentProfile as Record<string, unknown> | null,
      skills: activeSkills,
      projects: activeProjects,
      resumes: [],
      certificates: activeCertificates,
      portfolios: [],
      feedback: [],
      timeline: [],
    });

    const studentContext: StudentContextForInterview = {
      studentName: userProfile?.full_name || "Student Candidate",
      major: studentProfile?.major || null,
      university: studentProfile?.university || null,
      careerDnaScore: localScores.careerDnaScore,
      readinessScore: localScores.internshipReadinessScore,
      skills: activeSkills,
      projects: activeProjects.map((p) => ({ title: p.title, technologies: p.technologies || [] })),
      certificates: activeCertificates,
    };

    const briefing = getAiCoachBriefing(role, difficulty, type);
    const count = Math.max(3, Math.min(8, Math.round(durationMinutes / 5)));
    const questions = await generateDynamicInterviewQuestions(role, difficulty, type, studentContext, count);

    return {
      success: true,
      briefing,
      questions,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to initialize interview session.";
    console.error("startInterviewSessionAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Submit Current Answer & Generate Adaptive Follow-Up Question
 */
export async function submitAnswerAndGetAdaptiveNextAction(
  currentQuestion: string,
  currentAnswer: string,
  role: string,
  difficulty: InterviewDifficulty
): Promise<{ success: boolean; followUpQuestion?: string; error?: string }> {
  try {
    const followUpQuestion = await generateAdaptiveFollowUpQuestion(
      currentQuestion,
      currentAnswer,
      role,
      difficulty
    );

    return {
      success: true,
      followUpQuestion,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to generate follow-up question.";
    console.error("submitAnswerAndGetAdaptiveNextAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Finish Interview Session & Generate Complete Multidimensional Report
 */
export async function finishAndEvaluateInterviewAction(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  durationMinutes: number,
  questions: string[],
  answers: string[]
): Promise<{ success: boolean; report?: FullInterviewReport; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // Aggregate student profile context
    const [
      { data: userProfile },
      { data: studentProfile },
      { data: studentSkills },
      { data: projects },
      { data: certificates },
    ] = await Promise.all([
      supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("student_profiles").select("major, university, gpa").eq("id", user.id).maybeSingle(),
      supabase.from("student_skills").select("skill_name, proficiency").eq("student_id", user.id),
      supabase.from("projects").select("title, technologies").eq("student_id", user.id),
      supabase.from("certificates").select("name").eq("student_id", user.id),
    ]);

    const activeSkills = studentSkills || [];
    const activeProjects = projects || [];
    const activeCertificates = certificates || [];

    const localScores = calculateCareerDnaScores({
      profile: studentProfile as Record<string, unknown> | null,
      skills: activeSkills,
      projects: activeProjects,
      resumes: [],
      certificates: activeCertificates,
      portfolios: [],
      feedback: [],
      timeline: [],
    });

    const studentContext: StudentContextForInterview = {
      studentName: userProfile?.full_name || "Student Candidate",
      major: studentProfile?.major || null,
      university: studentProfile?.university || null,
      careerDnaScore: localScores.careerDnaScore,
      readinessScore: localScores.internshipReadinessScore,
      skills: activeSkills,
      projects: activeProjects.map((p) => ({ title: p.title, technologies: p.technologies || [] })),
      certificates: activeCertificates,
    };

    // Evaluate session
    const report = await evaluateFullInterviewSession(
      role,
      difficulty,
      type,
      questions,
      answers,
      durationMinutes,
      studentContext
    );

    // Save to mock_interviews table
    const { error: dbError } = await supabase.from("mock_interviews").insert({
      student_id: user.id,
      role,
      difficulty,
      type,
      duration_minutes: durationMinutes,
      score: report.overallScore,
      report_data: report,
    });

    if (dbError) {
      console.warn("mock_interviews insert warning (falling back to ai_reports):", dbError);
    }

    // Save to ai_reports table
    await supabase.from("ai_reports").insert({
      student_id: user.id,
      report_type: "interview_prep",
      content: report,
      score: report.overallScore,
    });

    // Write activity feed event
    await supabase.from("activity_feed").insert({
      user_id: user.id,
      activity_type: "mock_interview",
      content: `Completed ${difficulty} ${type} Mock Interview: ${role} (Overall Score: ${report.overallScore}/100, Recommendation: ${report.hiringRecommendation})`,
      metadata: {
        score: report.overallScore,
        role,
        difficulty,
        type,
        recommendation: report.hiringRecommendation,
      },
    });

    return {
      success: true,
      report,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to evaluate interview session.";
    console.error("finishAndEvaluateInterviewAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch Student Past Interview History & Performance Comparison
 */
export async function fetchStudentInterviewHistoryAction(): Promise<{
  success: boolean;
  history?: MockInterviewHistoryItem[];
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

    // Query mock_interviews
    const { data: rows, error: queryError } = await supabase
      .from("mock_interviews")
      .select("id, role, difficulty, type, duration_minutes, score, report_data, created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError || !rows || rows.length === 0) {
      // Fallback: Check ai_reports if mock_interviews is empty
      const { data: reports } = await supabase
        .from("ai_reports")
        .select("id, content, score, created_at")
        .eq("student_id", user.id)
        .eq("report_type", "interview_prep")
        .order("created_at", { ascending: false });

      if (reports && reports.length > 0) {
        const fallbackHistory: MockInterviewHistoryItem[] = reports.map((r) => {
          const reportObj = (r.content as unknown as FullInterviewReport) || {};
          return {
            id: r.id,
            role: "Software Engineering",
            difficulty: "Medium",
            type: "Technical Round",
            duration_minutes: reportObj.durationMinutes || 15,
            score: Number(r.score || reportObj.overallScore || 75),
            created_at: r.created_at,
            report_data: reportObj,
          };
        });

        return { success: true, history: fallbackHistory };
      }

      return { success: true, history: [] };
    }

    const historyItems: MockInterviewHistoryItem[] = rows.map((row) => ({
      id: row.id,
      role: row.role,
      difficulty: row.difficulty,
      type: row.type,
      duration_minutes: row.duration_minutes,
      score: Number(row.score),
      created_at: row.created_at,
      report_data: row.report_data as unknown as FullInterviewReport,
    }));

    return {
      success: true,
      history: historyItems,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch interview history.";
    console.error("fetchStudentInterviewHistoryAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

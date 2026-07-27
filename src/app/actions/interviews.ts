"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateInterviewQuestions,
  evaluateInterviewSession,
  InterviewEvaluationResult,
} from "@/lib/ai-interview-service";

export async function generateQuestionsAction(
  category: string,
  difficulty: string
): Promise<{ success: boolean; questions?: string[]; error?: string }> {
  try {
    const questions = await generateInterviewQuestions(category, difficulty);
    return { success: true, questions };
  } catch (err: unknown) {
    console.error("generateQuestionsAction failed:", err);
    return { success: false, error: "Failed to generate interview questions." };
  }
}

export async function evaluateSessionAction(
  category: string,
  difficulty: string,
  questions: string[],
  answers: string[]
): Promise<{ success: boolean; evaluation?: InterviewEvaluationResult; error?: string }> {
  try {
    const evaluation = await evaluateInterviewSession(category, difficulty, questions, answers);
    return { success: true, evaluation };
  } catch (err: unknown) {
    console.error("evaluateSessionAction failed:", err);
    return { success: false, error: "Failed to calculate interview evaluation." };
  }
}

interface SaveReportResponse {
  success: boolean;
  error?: string;
}

export async function saveInterviewReportAction(
  category: string,
  difficulty: string,
  evaluationResult: InterviewEvaluationResult
): Promise<SaveReportResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // 1. Save evaluation report to ai_reports table
    const { error: reportError } = await supabase.from("ai_reports").insert({
      student_id: user.id,
      report_type: "interview_prep",
      content: evaluationResult,
      score: evaluationResult.score,
    });

    if (reportError) {
      console.error("Database ai_reports insert failed:", reportError);
      return { success: false, error: "Failed to record interview report details." };
    }

    // 2. Append completed event activity to user activity_feed
    const { error: feedError } = await supabase.from("activity_feed").insert({
      user_id: user.id,
      activity_type: "mock_interview",
      content: `Completed ${difficulty} Mock Interview: ${category} (Score: ${evaluationResult.score}/100)`,
      metadata: {
        score: evaluationResult.score,
        category,
        difficulty,
      },
    });

    if (feedError) {
      console.error("Database activity_feed insert failed:", feedError);
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during report persistence.";
    console.error("saveInterviewReportAction failed:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

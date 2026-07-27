"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeResumeWithGemini } from "@/lib/ai-resume-service";

interface ScanResumeResponse {
  success: boolean;
  analysis?: {
    score: number;
    keyword_match: number;
    impact_score: number;
    formatting_score: number;
    missing_keywords: string[];
    found_keywords: string[];
    recommendations: {
      original: string;
      suggestion: string;
      reason: string;
    }[];
    formatting_feedback: string[];
  };
  error?: string;
}

export async function scanResumeAction(
  pdfBase64: string,
  fileName: string,
  context: string
): Promise<ScanResumeResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // 1. Convert base64 buffer back to Binary Buffer
    const fileBuffer = Buffer.from(pdfBase64, "base64");

    // 2. Upload file to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(`${user.id}/${fileName}`, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return { success: false, error: "Failed to upload file to resumes bucket." };
    }

    // 3. Run Gemini / Fallback analysis
    const analysisResult = await analyzeResumeWithGemini(pdfBase64, context);

    // 4. Save metadata details in public.resumes table
    // Set other resumes as non-primary
    await supabase
      .from("resumes")
      .update({ is_primary: false })
      .eq("student_id", user.id);

    const { error: resumeError } = await supabase.from("resumes").insert({
      student_id: user.id,
      name: fileName,
      file_url: `${user.id}/${fileName}`,
      is_primary: true,
    });

    if (resumeError) {
      console.error("Database resume record insert failed:", resumeError);
    }

    // 5. Save report details in public.ai_reports table
    const { error: reportError } = await supabase.from("ai_reports").insert({
      student_id: user.id,
      report_type: "resume_review",
      content: analysisResult,
      score: analysisResult.score,
    });

    if (reportError) {
      console.error("Database ai_report record insert failed:", reportError);
    }

    return {
      success: true,
      analysis: analysisResult,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during scan.";
    console.error("Unexpected error in scanResumeAction:", err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

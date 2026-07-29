"use server";

import { createClient } from "@/lib/supabase/server";
import {
  calculateCompanyTrustScore,
  getCompanyVerificationStatus,
  type CompanyVerificationStatus,
  type CompanyTrustScoreResult,
} from "@/lib/ai-company-trust-engine";

export interface CompanyDashboardData {
  companyId: string;
  name: string;
  website: string | null;
  industry: string | null;
  logo_url: string | null;
  description: string | null;
  gst_number: string | null;
  official_email: string | null;
  verification_status: CompanyVerificationStatus;
  trustScoreResult: CompanyTrustScoreResult;
  internshipsCount: number;
  applicantsCount: number;
  pipelineStats: {
    applied: number;
    reviewing: number;
    shortlisted: number;
    interviewing: number;
    accepted: number;
    rejected: number;
  };
}

export interface CreateInternshipPayload {
  title: string;
  description: string;
  location: string;
  type: "remote" | "hybrid" | "on-site";
  requirements: string[];
  skills_needed: string[];
  salary_range: string;
}

/**
 * Fetch Recruiter / Company Dashboard Data
 */
export async function fetchCompanyDashboardAction(): Promise<{
  success: boolean;
  data?: CompanyDashboardData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in as recruiter." };
    }

    // Fetch company record
    const { data: company, error: compError } = await supabase
      .from("companies")
      .select(`
        id,
        name,
        website,
        industry,
        logo_url,
        description,
        is_verified,
        verification_status,
        gst_number,
        official_email,
        registration_doc_url,
        trust_score
      `)
      .eq("id", user.id)
      .single();

    if (compError || !company) {
      return { success: false, error: "Company profile record not found." };
    }

    // Fetch internship postings count
    const { data: companyInternshipIds } = await supabase
      .from("internships")
      .select("id")
      .eq("company_id", user.id);

    const internshipIds = (companyInternshipIds || []).map((i) => i.id);

    // Fetch applicants
    const pipelineStats = {
      applied: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewing: 0,
      accepted: 0,
      rejected: 0,
    };

    let totalApplicants = 0;
    if (internshipIds.length > 0) {
      const { data: apps } = await supabase
        .from("applications")
        .select("status")
        .in("internship_id", internshipIds);

      (apps || []).forEach((app) => {
        totalApplicants++;
        const st = app.status as keyof typeof pipelineStats;
        if (pipelineStats[st] !== undefined) {
          pipelineStats[st]++;
        }
      });
    }

    const vStatus = getCompanyVerificationStatus(company);
    const trustScoreResult = calculateCompanyTrustScore({
      ...company,
      verification_status: vStatus,
      internships_posted_count: internshipIds.length,
    });

    return {
      success: true,
      data: {
        companyId: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        logo_url: company.logo_url,
        description: company.description,
        gst_number: company.gst_number || null,
        official_email: company.official_email || null,
        verification_status: vStatus,
        trustScoreResult,
        internshipsCount: internshipIds.length,
        applicantsCount: totalApplicants,
        pipelineStats,
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load company dashboard.";
    console.error("fetchCompanyDashboardAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Create Internship Listing — STRICT ENFORCEMENT: ONLY VERIFIED COMPANIES CAN POST
 */
export async function createInternshipAction(
  payload: CreateInternshipPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Sign in as recruiter." };
    }

    // Verify company status
    const { data: company, error: compError } = await supabase
      .from("companies")
      .select("is_verified, verification_status, name")
      .eq("id", user.id)
      .single();

    if (compError || !company) {
      return { success: false, error: "Company profile not found." };
    }

    const vStatus = getCompanyVerificationStatus(company);

    if (vStatus !== "verified") {
      if (vStatus === "blacklisted") {
        return {
          success: false,
          error: "Your organization account is blacklisted. Posting job listings is prohibited.",
        };
      }
      return {
        success: false,
        error: "Your account is pending verification. Only VERIFIED companies can publish internships.",
      };
    }

    // Insert new internship
    const { error: insertError } = await supabase.from("internships").insert({
      company_id: user.id,
      title: payload.title,
      description: payload.description,
      location: payload.location || "Remote",
      type: payload.type,
      requirements: payload.requirements || [],
      skills_needed: payload.skills_needed || [],
      salary_range: payload.salary_range || "Negotiable",
      status: "open",
    });

    if (insertError) {
      throw insertError;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create internship posting.";
    console.error("createInternshipAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Recruiter candidate status update (applied -> reviewing -> shortlisted -> interviewing -> accepted -> rejected)
 */
export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: "applied" | "reviewing" | "shortlisted" | "interviewing" | "accepted" | "rejected"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update candidate application status.";
    console.error("updateApplicationStatusAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Company Profile & Credentials (Website, GST, Official Email, Logo)
 */
export async function updateCompanyProfileAction(payload: {
  website?: string;
  industry?: string;
  description?: string;
  gst_number?: string;
  official_email?: string;
  logo_url?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { error: updateError } = await supabase
      .from("companies")
      .update({
        website: payload.website,
        industry: payload.industry,
        description: payload.description,
        gst_number: payload.gst_number,
        official_email: payload.official_email,
        logo_url: payload.logo_url,
      })
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update profile credentials.";
    console.error("updateCompanyProfileAction error:", err);
    return { success: false, error: errorMessage };
  }
}

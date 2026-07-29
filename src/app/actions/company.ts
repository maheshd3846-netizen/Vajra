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
  company_size: string | null;
  headquarters: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  hr_name: string | null;
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

export type CreateInternshipPayload = DetailedInternshipPayload;

export interface DetailedInternshipPayload {
  id?: string;
  title: string;
  description: string;
  location: string;
  type: "remote" | "hybrid" | "on-site";
  internship_type?: string;
  duration?: string;
  stipend?: string;
  salary_range?: string;
  requirements?: string[];
  skills_needed?: string[];
  eligibility?: string;
  deadline?: string;
  openings_count?: number;
  status?: "draft" | "published" | "open" | "closed";
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
        company_size,
        headquarters,
        contact_email,
        contact_phone,
        hr_name,
        registration_doc_url,
        trust_score
      `)
      .eq("id", user.id)
      .single();

    if (compError || !company) {
      return { success: false, error: "Company profile record not found." };
    }

    const { data: companyInternshipIds } = await supabase
      .from("internships")
      .select("id")
      .eq("company_id", user.id);

    const internshipIds = (companyInternshipIds || []).map((i) => i.id);

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
        company_size: company.company_size || null,
        headquarters: company.headquarters || null,
        contact_email: company.contact_email || null,
        contact_phone: company.contact_phone || null,
        hr_name: company.hr_name || null,
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
 * Update Company Settings & Profile Info
 */
export async function updateCompanyProfileAction(payload: {
  name?: string;
  website?: string;
  industry?: string;
  description?: string;
  company_size?: string;
  headquarters?: string;
  contact_email?: string;
  contact_phone?: string;
  hr_name?: string;
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

    if (payload.name) {
      await supabase.from("users").update({ full_name: payload.name }).eq("id", user.id);
    }

    const updates: Record<string, string | undefined> = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.website !== undefined) updates.website = payload.website;
    if (payload.industry !== undefined) updates.industry = payload.industry;
    if (payload.description !== undefined) updates.description = payload.description;
    if (payload.company_size !== undefined) updates.company_size = payload.company_size;
    if (payload.headquarters !== undefined) updates.headquarters = payload.headquarters;
    if (payload.contact_email !== undefined) updates.contact_email = payload.contact_email;
    if (payload.contact_phone !== undefined) updates.contact_phone = payload.contact_phone;
    if (payload.hr_name !== undefined) updates.hr_name = payload.hr_name;
    if (payload.gst_number !== undefined) updates.gst_number = payload.gst_number;
    if (payload.official_email !== undefined) updates.official_email = payload.official_email;
    if (payload.logo_url !== undefined) updates.logo_url = payload.logo_url;

    const { error: updateError } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update company profile.";
    console.error("updateCompanyProfileAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Create Internship Posting with full details
 */
export async function createInternshipAction(
  payload: DetailedInternshipPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { error: insertError } = await supabase.from("internships").insert({
      company_id: user.id,
      title: payload.title,
      description: payload.description,
      location: payload.location || "Remote",
      type: payload.type,
      internship_type: payload.internship_type || "Full-time",
      duration: payload.duration || "3 Months",
      stipend: payload.stipend || payload.salary_range || "Negotiable",
      salary_range: payload.stipend || payload.salary_range || "Negotiable",
      requirements: payload.requirements || [],
      skills_needed: payload.skills_needed || [],
      eligibility: payload.eligibility || "Open to all graduates",
      deadline: payload.deadline ? new Date(payload.deadline).toISOString() : null,
      openings_count: payload.openings_count || 1,
      status: payload.status || "open",
    });

    if (insertError) throw insertError;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create internship.";
    console.error("createInternshipAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Internship Posting
 */
export async function updateInternshipAction(
  id: string,
  payload: DetailedInternshipPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const updates: Record<string, string | string[] | number | null | undefined> = {
      title: payload.title,
      description: payload.description,
      location: payload.location,
      type: payload.type,
      internship_type: payload.internship_type,
      duration: payload.duration,
      stipend: payload.stipend || payload.salary_range,
      salary_range: payload.stipend || payload.salary_range,
      requirements: payload.requirements,
      skills_needed: payload.skills_needed,
      eligibility: payload.eligibility,
      deadline: payload.deadline ? new Date(payload.deadline).toISOString() : null,
      openings_count: payload.openings_count,
    };

    if (payload.status) {
      updates.status = payload.status;
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    const { error: updateError } = await supabase
      .from("internships")
      .update(cleanUpdates)
      .eq("id", id)
      .eq("company_id", user.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update internship.";
    console.error("updateInternshipAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete Internship Posting
 */
export async function deleteInternshipAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { error } = await supabase
      .from("internships")
      .delete()
      .eq("id", id)
      .eq("company_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete internship.";
    console.error("deleteInternshipAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Internship Status (Publish, Draft, Open, Close)
 */
export async function updateInternshipStatusAction(
  id: string,
  newStatus: "draft" | "published" | "open" | "closed"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { error } = await supabase
      .from("internships")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("company_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to change internship status.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Candidate Status Update by Recruiter (applied -> reviewing -> shortlisted -> interviewing -> accepted -> rejected)
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

    if (!user) return { success: false, error: "Unauthorized access." };

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update candidate application status.";
    console.error("updateApplicationStatusAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch Company Selected Interns (Company Intern Tracker)
 */
export async function fetchCompanyInternsAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { data, error } = await supabase
      .from("company_interns")
      .select(`
        id,
        joining_date,
        progress_pct,
        attendance_pct,
        status,
        notes,
        rating,
        weekly_reports,
        assigned_tasks,
        student_profiles (
          id,
          university,
          major,
          degree,
          branch,
          phone,
          users (
            full_name,
            email,
            avatar_url
          )
        ),
        internships (
          title
        ),
        mentors (
          users (
            full_name
          )
        )
      `)
      .eq("company_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch intern tracker records.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Company Intern Details (Progress, Notes, Rating, Status)
 */
export async function updateCompanyInternAction(
  internId: string,
  payload: {
    progress_pct?: number;
    notes?: string;
    rating?: number;
    status?: "active" | "completed" | "terminated";
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const updates: Record<string, number | string | undefined> = {};
    if (payload.progress_pct !== undefined) updates.progress_pct = payload.progress_pct;
    if (payload.notes !== undefined) updates.notes = payload.notes;
    if (payload.rating !== undefined) updates.rating = payload.rating;
    if (payload.status !== undefined) updates.status = payload.status;

    const { error } = await supabase
      .from("company_interns")
      .update(updates)
      .eq("id", internId)
      .eq("company_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update intern record.";
    return { success: false, error: errorMessage };
  }
}

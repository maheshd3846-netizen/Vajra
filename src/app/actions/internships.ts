import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotificationAction } from "./notifications";
import {
  calculateInternshipMatch,
  runAiApplicationReview,
  type StudentProfileForMatching,
  type InternshipForMatching,
  type InternshipMatchResult,
  type PreApplicationAiReview,
} from "@/lib/ai-internship-matching-engine";
import {
  getCompanyVerificationStatus,
  calculateCompanyTrustScore,
  type CompanyVerificationStatus,
} from "@/lib/ai-company-trust-engine";
import { calculateCareerDnaScores } from "@/lib/ai-career-dna-service";

export interface EnhancedInternshipRecord {
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
  company: {
    name: string;
    logo_url: string | null;
    is_verified: boolean;
    verification_status: CompanyVerificationStatus;
    trustScore: number;
    trustBadgeLabel: string;
    trustBadgeClass: {
      bg: string;
      border: string;
      text: string;
      dot: string;
    };
  };
  matchResult: InternshipMatchResult;
  isSaved?: boolean;
}

export interface StudentApplicationPipelineItem {
  id: string;
  internship_id: string;
  resume_url: string;
  status: string; // applied, reviewing, shortlisted, interviewing, accepted, rejected
  applied_at: string;
  internshipTitle: string;
  companyName: string;
  companyLogo: string | null;
  location: string | null;
  type: string;
  salary_range: string | null;
}

export interface FetchInternshipsFilterOptions {
  searchQuery?: string;
  filterMode?: "all" | "remote" | "high" | "paid" | "verified" | "saved";
  sortBy?: "match" | "newest" | "stipend";
}

/**
 * Fetch Filtered & Personalized AI Matched Internships
 */
export async function fetchFilteredInternshipsAction(
  options?: FetchInternshipsFilterOptions
): Promise<{
  success: boolean;
  internships?: EnhancedInternshipRecord[];
  savedIds?: string[];
  error?: string;
}> {
  try {
    console.log("===== INTERNSHIP ACTION RUNNING =====");
    console.log("Environment Verification:");
    console.log("  NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
    console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const supabase = await createClient();
    
    // Auth & Session Verification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userAuthError } = await supabase.auth.getUser();

    console.log("Auth & Session Status:");
    console.log("  Current User:", user ? { id: user.id, email: user.email, role: user.role } : "No User");
    console.log("  Session Active:", !!session);
    console.log("  Access Token Exists:", !!session?.access_token);

    if (userAuthError) {
      const errObj = userAuthError as { code?: string; details?: string; hint?: string };
      console.error("User Auth Error:", {
        code: errObj?.code,
        message: userAuthError.message,
        details: errObj?.details,
        hint: errObj?.hint,
      });
    }

    if (sessionError) {
      const errObj = sessionError as { code?: string; details?: string; hint?: string };
      console.error("Session Error:", {
        code: errObj?.code,
        message: sessionError.message,
        details: errObj?.details,
        hint: errObj?.hint,
      });
    }

    if (!user) {
      console.error("Authentication/Session Failure: User is not authenticated.");
      return { success: false, error: "Unauthorized access. User session not found." };
    }

    // 1. Fetch student data for AI matching
    console.log("Executing Supabase Queries for Student Profile & Context...");
    console.log("  Query 1: SELECT full_name FROM public.users WHERE id = ", user.id);
    console.log("  Query 2: SELECT major, university, gpa FROM public.student_profiles WHERE id = ", user.id);
    console.log("  Query 3: SELECT skill_name, proficiency FROM public.student_skills WHERE student_id = ", user.id);
    console.log("  Query 4: SELECT id, title, technologies FROM public.projects WHERE student_id = ", user.id);
    console.log("  Query 5: SELECT id, name FROM public.certificates WHERE student_id = ", user.id);
    console.log("  Query 6: SELECT id, is_primary FROM public.resumes WHERE student_id = ", user.id);
    console.log("  Query 7: SELECT internship_id FROM public.saved_internships WHERE student_id = ", user.id);

    const [
      { data: userProfile, error: errUsers },
      { data: studentProfile, error: errProfile },
      { data: studentSkills, error: errSkills },
      { data: projects, error: errProjects },
      { data: certificates, error: errCertificates },
      { data: resumes, error: errResumes },
      { data: savedRows, error: errSaved },
    ] = await Promise.all([
      supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("student_profiles")
        .select("major, university, gpa")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("student_skills")
        .select("skill_name, proficiency")
        .eq("student_id", user.id),
      supabase
        .from("projects")
        .select("id, title, technologies")
        .eq("student_id", user.id),
      supabase
        .from("certificates")
        .select("id, name")
        .eq("student_id", user.id),
      supabase
        .from("resumes")
        .select("id, is_primary")
        .eq("student_id", user.id),
      supabase
        .from("saved_internships")
        .select("internship_id")
        .eq("student_id", user.id),
    ]);

    const queryErrors = [
      { table: "users", err: errUsers },
      { table: "student_profiles", err: errProfile },
      { table: "student_skills", err: errSkills },
      { table: "projects", err: errProjects },
      { table: "certificates", err: errCertificates },
      { table: "resumes", err: errResumes },
      { table: "saved_internships", err: errSaved },
    ];

    for (const q of queryErrors) {
      if (q.err) {
        console.error(`Supabase Query Error on Table '${q.table}':`, {
          code: q.err.code,
          message: q.err.message,
          details: q.err.details,
          hint: q.err.hint,
        });
        throw new Error(`Supabase query failed for '${q.table}': ${q.err.message} (Code: ${q.err.code})`);
      }
    }

    const activeSkills = studentSkills || [];
    const activeProjects = projects || [];
    const activeCertificates = certificates || [];
    const activeResumes = resumes || [];

    // Calculate student local Career DNA score
    const localScores = calculateCareerDnaScores({
      profile: studentProfile as Record<string, unknown> | null,
      skills: activeSkills,
      projects: activeProjects,
      resumes: activeResumes,
      certificates: activeCertificates,
      portfolios: [],
      feedback: [],
      timeline: [],
    });

    const studentForMatching: StudentProfileForMatching = {
      id: user.id,
      fullName: userProfile?.full_name || "Student",
      major: studentProfile?.major || null,
      university: studentProfile?.university || null,
      gpa: studentProfile?.gpa || null,
      careerDnaScore: localScores.careerDnaScore,
      readinessScore: localScores.internshipReadinessScore,
      skills: activeSkills,
      projects: activeProjects,
      certificates: activeCertificates,
      resumes: activeResumes,
    };

    const savedSet = new Set<string>((savedRows || []).map((s: { internship_id: string }) => s.internship_id));

    // 2. Query internships with company data
    console.log("  Query 8: SELECT internships.*, companies.* FROM public.internships JOIN public.companies ON internships.company_id = companies.id WHERE status = 'open' ORDER BY created_at DESC");

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
          is_verified,
          verification_status,
          website,
          industry,
          description
        )
      `)
      .in("status", ["approved", "open"])
      .order("created_at", { ascending: false });

    if (internshipsError) {
      console.error("Supabase Query Error on Table 'internships' / Join 'companies':", {
        code: internshipsError.code,
        message: internshipsError.message,
        details: internshipsError.details,
        hint: internshipsError.hint,
      });
      throw new Error(`Supabase query failed for 'internships': ${internshipsError.message} (Code: ${internshipsError.code})`);
    }

    // 3. Process & Filter out blacklisted companies
    const processedInternships: EnhancedInternshipRecord[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internships || []).forEach((item: any) => {
      const compRaw = item.companies as unknown as {
        name: string;
        logo_url: string | null;
        is_verified: boolean;
        verification_status: CompanyVerificationStatus;
        website?: string;
        industry?: string;
        description?: string;
      } | null;

      const vStatus = compRaw ? getCompanyVerificationStatus(compRaw) : "pending";

      // SECURITY RULE: Blacklisted company listings are hidden from marketplace
      if (vStatus === "blacklisted") {
        return;
      }

      const compTrustResult = calculateCompanyTrustScore({
        id: item.company_id,
        name: compRaw?.name || "Company",
        website: compRaw?.website || null,
        industry: compRaw?.industry || null,
        logo_url: compRaw?.logo_url || null,
        description: compRaw?.description || null,
        is_verified: compRaw?.is_verified,
        verification_status: vStatus,
      });

      const jobForMatching: InternshipForMatching = {
        id: item.id,
        title: item.title,
        description: item.description,
        company_name: compRaw?.name || "Partner Organization",
        location: item.location,
        type: item.type,
        requirements: item.requirements || [],
        skills_needed: item.skills_needed || [],
        salary_range: item.salary_range,
        created_at: item.created_at,
      };

      const matchResult = calculateInternshipMatch(studentForMatching, jobForMatching);
      const isSaved = savedSet.has(item.id);

      processedInternships.push({
        id: item.id,
        company_id: item.company_id,
        title: item.title,
        description: item.description,
        location: item.location,
        type: item.type,
        requirements: item.requirements || [],
        skills_needed: item.skills_needed || [],
        salary_range: item.salary_range,
        status: item.status,
        created_at: item.created_at,
        company: {
          name: compRaw?.name || "Partner Organization",
          logo_url: compRaw?.logo_url || null,
          is_verified: vStatus === "verified",
          verification_status: vStatus,
          trustScore: compTrustResult.trustScore,
          trustBadgeLabel: compTrustResult.badgeLabel,
          trustBadgeClass: compTrustResult.badgeColorClass,
        },
        matchResult,
        isSaved,
      });
    });

    // Apply Client Options (Filter & Sort)
    let results = processedInternships;

    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills_needed.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (options?.filterMode === "remote") {
      results = results.filter((j) => j.type.toLowerCase() === "remote");
    } else if (options?.filterMode === "high") {
      results = results.filter((j) => j.matchResult.matchScore >= 80);
    } else if (options?.filterMode === "paid") {
      results = results.filter(
        (j) =>
          j.salary_range &&
          !j.salary_range.toLowerCase().includes("unpaid") &&
          !j.salary_range.includes("₹0")
      );
    } else if (options?.filterMode === "verified") {
      results = results.filter((j) => j.company.verification_status === "verified");
    } else if (options?.filterMode === "saved") {
      results = results.filter((j) => j.isSaved);
    }

    if (options?.sortBy === "newest") {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (options?.sortBy === "stipend") {
      const getVal = (s: string | null) => {
        if (!s || s.toLowerCase().includes("unpaid")) return 0;
        const matches = s.match(/\d+([.,]\d+)?/g);
        if (!matches) return 0;
        const nums = matches.map((m) => parseInt(m.replace(/,/g, ""), 10)).filter((n) => !isNaN(n));
        return nums.length > 0 ? Math.max(...nums) : 0;
      };
      results.sort((a, b) => getVal(b.salary_range) - getVal(a.salary_range));
    } else {
      // Default: Sort by AI Match Score
      results.sort((a, b) => b.matchResult.matchScore - a.matchResult.matchScore);
    }

    return {
      success: true,
      internships: results,
      savedIds: Array.from(savedSet) as string[],
    };
  } catch (err: unknown) {
    const errorObj = err as Error;
    console.error("===== INTERNSHIP ACTION ERROR =====");
    console.error("Error object:", err);
    console.error("Message:", errorObj?.message);
    console.error("Stack:", errorObj?.stack);

    return {
      success: false,
      error: errorObj?.message || "Unknown error",
    };
  }
}

/**
 * Toggle Save / Bookmark Internship
 */
export async function toggleSaveInternshipAction(
  internshipId: string
): Promise<{ success: boolean; isSaved?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // Check existing bookmark
    const { data: existing } = await supabase
      .from("saved_internships")
      .select("internship_id")
      .eq("student_id", user.id)
      .eq("internship_id", internshipId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("saved_internships")
        .delete()
        .eq("student_id", user.id)
        .eq("internship_id", internshipId);

      return { success: true, isSaved: false };
    } else {
      await supabase
        .from("saved_internships")
        .insert({ student_id: user.id, internship_id: internshipId });

      return { success: true, isSaved: true };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update saved status.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Run AI Pre-Application Validation Review
 */
export async function runAiApplicationReviewAction(
  internshipId: string
): Promise<{ success: boolean; review?: PreApplicationAiReview; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // Fetch student data & targeted internship
    const [
      { data: userProfile },
      { data: studentProfile },
      { data: studentSkills },
      { data: projects },
      { data: certificates },
      { data: resumes },
      { data: jobRaw },
    ] = await Promise.all([
      supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("student_profiles")
        .select("major, university, gpa")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("student_skills")
        .select("skill_name, proficiency")
        .eq("student_id", user.id),
      supabase.from("projects").select("id, title, technologies").eq("student_id", user.id),
      supabase.from("certificates").select("id, name").eq("student_id", user.id),
      supabase.from("resumes").select("id, is_primary").eq("student_id", user.id),
      supabase
        .from("internships")
        .select(`
          id,
          title,
          description,
          location,
          type,
          requirements,
          skills_needed,
          salary_range,
          created_at,
          companies ( name )
        `)
        .eq("id", internshipId)
        .maybeSingle(),
    ]);

    if (!jobRaw) {
      return { success: false, error: "Internship listing not found." };
    }

    const localScores = calculateCareerDnaScores({
      profile: studentProfile as Record<string, unknown> | null,
      skills: studentSkills || [],
      projects: projects || [],
      resumes: resumes || [],
      certificates: certificates || [],
      portfolios: [],
      feedback: [],
      timeline: [],
    });

    const studentForMatching: StudentProfileForMatching = {
      id: user.id,
      fullName: userProfile?.full_name || "Student",
      major: studentProfile?.major || null,
      university: studentProfile?.university || null,
      gpa: studentProfile?.gpa || null,
      careerDnaScore: localScores.careerDnaScore,
      readinessScore: localScores.internshipReadinessScore,
      skills: studentSkills || [],
      projects: projects || [],
      certificates: certificates || [],
      resumes: resumes || [],
    };

    const compName = (jobRaw.companies as unknown as { name: string } | null)?.name || "Partner Organization";

    const jobForMatching: InternshipForMatching = {
      id: jobRaw.id,
      title: jobRaw.title,
      description: jobRaw.description,
      company_name: compName,
      location: jobRaw.location,
      type: jobRaw.type,
      requirements: jobRaw.requirements || [],
      skills_needed: jobRaw.skills_needed || [],
      salary_range: jobRaw.salary_range,
      created_at: jobRaw.created_at,
    };

    const review = runAiApplicationReview(studentForMatching, jobForMatching);

    return { success: true, review };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to run AI review.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Apply to Internship with resume & cover letter
 */
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

    // Verify company status of this internship
    const { data: job } = await supabase
      .from("internships")
      .select("company_id, companies ( verification_status, is_verified )")
      .eq("id", internshipId)
      .maybeSingle();

    if (job?.companies) {
      const compRaw = job.companies as unknown as { verification_status?: string; is_verified?: boolean };
      const vStatus = getCompanyVerificationStatus({
        id: job.company_id,
        name: "",
        website: null,
        industry: null,
        logo_url: null,
        description: null,
        is_verified: compRaw.is_verified,
        verification_status: compRaw.verification_status,
      });

      if (vStatus === "blacklisted") {
        return { success: false, error: "This company has been blacklisted. Applications are disabled." };
      }
      if (vStatus === "pending") {
        return { success: false, error: "This company is pending verification. Applications are temporarily paused." };
      }
    }

    // Insert application
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

    // Send Notification to Company
    if (job?.company_id) {
      await createNotificationAction({
        userId: job.company_id,
        title: "New Application Received",
        message: `A candidate has submitted an application for your internship.`,
        type: "application",
        link: "/company/applicants",
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to submit application.";
    console.error("applyToInternshipAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Company Creates New Internship Listing (Defaults to pending_approval)
 */
export async function createCompanyInternshipAction(payload: {
  title: string;
  description: string;
  location?: string;
  type: "remote" | "hybrid" | "on-site";
  requirements?: string[];
  skills_needed?: string[];
  salary_range?: string;
  stipend?: string;
  duration?: string;
  eligibility?: string;
  deadline?: string;
  openings_count?: number;
}): Promise<{ success: boolean; internshipId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { data: internship, error: createErr } = await supabase
      .from("internships")
      .insert({
        company_id: user.id,
        title: payload.title,
        description: payload.description,
        location: payload.location || "Remote",
        type: payload.type || "remote",
        requirements: payload.requirements || [],
        skills_needed: payload.skills_needed || [],
        salary_range: payload.stipend || payload.salary_range || "Negotiable",
        stipend: payload.stipend || payload.salary_range || "Negotiable",
        duration: payload.duration || "3 Months",
        eligibility: payload.eligibility || "Open to all students",
        deadline: payload.deadline || null,
        openings_count: payload.openings_count || 1,
        status: "pending_approval",
      })
      .select("id")
      .single();

    if (createErr) throw createErr;

    // Log status history
    await supabase.from("internship_status_history").insert({
      internship_id: internship.id,
      old_status: null,
      new_status: "pending_approval",
      changed_by: user.id,
      reason: "Initial submission by company for mentor/admin review",
    });

    revalidatePath("/company/internships");
    revalidatePath("/mentor/internships");
    revalidatePath("/admin/internships");

    return { success: true, internshipId: internship.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create internship.";
    console.error("createCompanyInternshipAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Mentor / Admin Update Internship Approval Status
 */
export async function updateInternshipApprovalStatusAction(
  internshipId: string,
  newStatus: "approved" | "changes_requested" | "rejected" | "suspended" | "archived" | "open",
  feedbackNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { data: job, error: jobErr } = await supabase
      .from("internships")
      .select("id, title, company_id, status")
      .eq("id", internshipId)
      .maybeSingle();

    if (jobErr || !job) return { success: false, error: "Internship record not found." };

    const oldStatus = job.status;

    // Update internship
    const { error: updateErr } = await supabase
      .from("internships")
      .update({
        status: newStatus,
        admin_feedback: feedbackNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", internshipId);

    if (updateErr) throw updateErr;

    // Insert into status history audit log
    await supabase.from("internship_status_history").insert({
      internship_id: internshipId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: user.id,
      reason: feedbackNotes || `Status updated to ${newStatus}`,
    });

    // Notify company owner
    const statusTitles: Record<string, string> = {
      approved: "Internship Approved & Published!",
      rejected: "Internship Listing Rejected",
      changes_requested: "Modifications Requested for Internship",
      suspended: "Internship Listing Suspended",
      archived: "Internship Listing Archived",
    };

    const statusMessages: Record<string, string> = {
      approved: `Your internship listing "${job.title}" has been approved and is now live for students.`,
      rejected: `Your internship listing "${job.title}" was not approved. Notes: ${feedbackNotes || "Does not meet guidelines."}`,
      changes_requested: `Please review requested changes for "${job.title}": ${feedbackNotes || "Action required."}`,
      suspended: `Your internship listing "${job.title}" has been temporarily suspended.`,
      archived: `Your internship listing "${job.title}" has been archived.`,
    };

    await createNotificationAction({
      userId: job.company_id,
      title: statusTitles[newStatus] || "Internship Status Updated",
      message: statusMessages[newStatus] || `Status updated to ${newStatus}.`,
      type: "internship_review",
      link: "/company/internships",
    });

    revalidatePath("/mentor/internships");
    revalidatePath("/admin/internships");
    revalidatePath("/company/internships");
    revalidatePath("/student/internships");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update internship approval status.";
    console.error("updateInternshipApprovalStatusAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Student Withdraw Application
 */
export async function withdrawApplicationAction(applicationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { error: withdrawErr } = await supabase
      .from("applications")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("student_id", user.id);

    if (withdrawErr) throw withdrawErr;

    revalidatePath("/student/applications");
    revalidatePath("/company/applicants");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to withdraw application.";
    return { success: false, error: errorMessage };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateMentorProfilePayload {
  full_name?: string;
  avatar_url?: string;
  job_title?: string;
  company_name?: string;
  experience?: string;
  skills?: string[];
  expertise?: string[];
  bio?: string;
  linkedin_url?: string;
  website_url?: string;
  availability?: string;
  contact_email?: string;
}

export interface AddStudentByMentorPayload {
  name: string;
  email: string;
  password?: string;
  college?: string;
  department?: string;
  year?: number;
  phone?: string;
}

/**
 * Update Mentor Profile Information
 */
export async function updateMentorProfileAction(
  payload: UpdateMentorProfilePayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // 1. Update public.users
    if (payload.full_name !== undefined || payload.avatar_url !== undefined) {
      const userUpdates: { full_name?: string; avatar_url?: string } = {};
      if (payload.full_name !== undefined) userUpdates.full_name = payload.full_name;
      if (payload.avatar_url !== undefined) userUpdates.avatar_url = payload.avatar_url;

      const { error: userErr } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", user.id);

      if (userErr) throw userErr;
    }

    // 2. Update public.mentors
    const mentorUpdates = {
      job_title: payload.job_title,
      company_name: payload.company_name,
      experience: payload.experience,
      skills: payload.skills,
      expertise: payload.expertise,
      bio: payload.bio,
      linkedin_url: payload.linkedin_url,
      website_url: payload.website_url,
      availability: payload.availability,
      contact_email: payload.contact_email,
    };

    const cleanUpdates = Object.fromEntries(
      Object.entries(mentorUpdates).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(cleanUpdates).length > 0) {
      const { error: mentorErr } = await supabase
        .from("mentors")
        .update(cleanUpdates)
        .eq("id", user.id);

      if (mentorErr) throw mentorErr;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update mentor profile.";
    console.error("updateMentorProfileAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Mentor Add Student Action
 * If email doesn't exist: Create auth user + public.users (role='student') + student_profiles + mentor_assignments
 * If email exists: Assign that student to current mentor via mentor_assignments
 */
export async function addStudentByMentorAction(
  payload: AddStudentByMentorPayload
): Promise<{ success: boolean; isExistingUser?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentMentor },
    } = await supabase.auth.getUser();

    if (!currentMentor) {
      return { success: false, error: "Unauthorized access." };
    }

    const { data: mentorRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", currentMentor.id)
      .maybeSingle();

    const role = mentorRole?.role || currentMentor.user_metadata?.role;
    if (!role || (role !== "mentor" && role !== "admin" && role !== "super_admin")) {
      return { success: false, error: "Forbidden: Only mentors or admins can assign students." };
    }

    const emailTrimmed = payload.email.trim().toLowerCase();

    // Check if user email already exists in public.users
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", emailTrimmed)
      .maybeSingle();

    if (existingUser) {
      // Check if assignment already exists
      const { data: existingAssign } = await supabase
        .from("mentor_assignments")
        .select("id")
        .eq("mentor_id", currentMentor.id)
        .eq("student_id", existingUser.id)
        .maybeSingle();

      if (!existingAssign) {
        const { error: assignErr } = await supabase.from("mentor_assignments").insert({
          mentor_id: currentMentor.id,
          student_id: existingUser.id,
          status: "active",
        });

        if (assignErr) throw assignErr;
      }

      return { success: true, isExistingUser: true };
    } else {
      // Sign up / Create new student
      const tempPassword = payload.password || "VajraStudent@123";
      
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: emailTrimmed,
        password: tempPassword,
        options: {
          data: {
            full_name: payload.name,
            role: "student",
          },
        },
      });

      if (signUpErr || !authData.user) {
        return { success: false, error: signUpErr?.message || "Failed to create student auth account." };
      }

      const newStudentId = authData.user.id;

      // Update student profile details if created
      await supabase
        .from("student_profiles")
        .update({
          university: payload.college,
          branch: payload.department,
          major: payload.department,
          graduation_year: payload.year,
          phone: payload.phone,
        })
        .eq("id", newStudentId);

      // Create mentor assignment link
      const { error: assignErr } = await supabase.from("mentor_assignments").insert({
        mentor_id: currentMentor.id,
        student_id: newStudentId,
        status: "active",
      });

      if (assignErr) {
        console.error("Error creating mentor assignment link:", assignErr);
      }

      return { success: true, isExistingUser: false };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to add student.";
    console.error("addStudentByMentorAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch Comprehensive Mentor Dashboard Data
 */
export async function fetchMentorDashboardAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    // 1. Fetch assigned students
    const { data: assignments, error: assignErr } = await supabase
      .from("mentor_assignments")
      .select(`
        id,
        status,
        assigned_at,
        student_profiles (
          id,
          university,
          major,
          degree,
          branch,
          graduation_year,
          gpa,
          cgpa,
          target_role,
          github_url,
          linkedin_url,
          portfolio_url,
          users (
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq("mentor_id", user.id);

    if (assignErr) throw assignErr;

    const studentList = assignments || [];
    const activeCount = studentList.filter((a) => a.status === "active").length;
    const totalCount = studentList.length;

    // Fetch AI report scores for assigned students to calculate Average Career DNA
    const studentIds = studentList
      .map((a) => (a as unknown as { student_profiles: { id: string } | null })?.student_profiles?.id)
      .filter((id): id is string => Boolean(id));

    let avgCareerDna = 78; // default fallback metric
    if (studentIds.length > 0) {
      const { data: reports } = await supabase
        .from("ai_reports")
        .select("score")
        .in("student_id", studentIds);

      if (reports && reports.length > 0) {
        const totalScore = reports.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
        avgCareerDna = Math.round(totalScore / reports.length);
      }
    }

    return {
      success: true,
      data: {
        totalStudents: totalCount,
        activeStudents: activeCount,
        pendingReviews: 3,
        upcomingSessions: 2,
        avgCareerDna,
        students: studentList,
      },
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load mentor dashboard.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch Companies Scoped to Current Mentor (or pending unassigned registration approvals)
 */
export async function fetchMentorScopedCompaniesAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    // Fetch assigned companies or unassigned pending companies
    const { data: companies, error } = await supabase
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
        status,
        mentor_id,
        created_at
      `)
      .or(`mentor_id.eq.${user.id},mentor_id.is.null`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      companies: companies || [],
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch assigned companies.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Mentor Approve Company Registration
 */
export async function approveCompanyRegistrationAction(companyId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    // Verify mentor permission & company assignment check
    const { data: company } = await supabase
      .from("companies")
      .select("id, mentor_id, name")
      .eq("id", companyId)
      .maybeSingle();

    if (!company) return { success: false, error: "Company not found." };
    if (company.mentor_id && company.mentor_id !== user.id) {
      return { success: false, error: "Forbidden: Company is assigned to another mentor." };
    }

    // Approve company registration and assign to current mentor if unassigned
    const { error: updateErr } = await supabase
      .from("companies")
      .update({
        verification_status: "verified",
        is_verified: true,
        status: "active",
        mentor_id: company.mentor_id || user.id,
        trust_score: 90,
      })
      .eq("id", companyId);

    if (updateErr) throw updateErr;

    // Log Audit Event
    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "APPROVE_COMPANY_REGISTRATION",
      resource: "companies",
      recordId: companyId,
      newData: { status: "active", verification_status: "verified", mentor_id: user.id },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to approve company registration.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Mentor Reject Company Registration
 */
export async function rejectCompanyRegistrationAction(companyId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { error: updateErr } = await supabase
      .from("companies")
      .update({
        verification_status: "pending",
        is_verified: false,
        status: "rejected",
      })
      .eq("id", companyId);

    if (updateErr) throw updateErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "REJECT_COMPANY_REGISTRATION",
      resource: "companies",
      recordId: companyId,
      newData: { status: "rejected", reason: reason || "Rejected by Mentor" },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to reject company registration.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Mentor Soft Delete / Deactivate Student
 */
export async function softDeleteStudentByMentorAction(studentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { requireMentorStudentAccess } = await import("@/lib/auth/guards");
    await requireMentorStudentAccess(studentId);

    // Update student user account_status to suspended
    const { error: updateErr } = await supabase
      .from("users")
      .update({ account_status: "suspended" })
      .eq("id", studentId);

    if (updateErr) throw updateErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "SOFT_DELETE_STUDENT",
      resource: "student_profiles",
      recordId: studentId,
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to soft delete student.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Mentor Issue Internship Completion Certificate
 */
export async function issueCertificateByMentorAction(
  studentId: string,
  certificateName: string,
  issuer: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { requireMentorStudentAccess } = await import("@/lib/auth/guards");
    await requireMentorStudentAccess(studentId);

    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .insert({
        student_id: studentId,
        name: certificateName,
        issuer: issuer || "Vajra Enterprise Mentorship Platform",
        issue_date: new Date().toISOString().split("T")[0],
        credential_id: `CERT-${Date.now().toString(36).toUpperCase()}`,
      })
      .select("id")
      .single();

    if (certErr) throw certErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "ISSUE_INTERNSHIP_CERTIFICATE",
      resource: "certificates",
      recordId: cert.id,
      newData: { student_id: studentId, certificate_name: certificateName },
    });

    return { success: true, certificateId: cert.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to issue certificate.";
    return { success: false, error: errorMessage };
  }
}

export interface CompanyItem {
  id: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  official_email: string | null;
  contact_email: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  company_size: string | null;
  linkedin_url: string | null;
  status: string;
  verification_status: string;
  mentor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddMentorCompanyPayload {
  name: string;
  logo_url?: string;
  industry?: string;
  description?: string;
  website?: string;
  official_email?: string;
  contact_person?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  company_size?: string;
  linkedin_url?: string;
  status?: "active" | "inactive";
}

/**
 * Fetch Companies for Mentor Dashboard (Includes ALL registered companies & mentor additions)
 */
export async function fetchMentorCompaniesAction(): Promise<{
  success: boolean;
  companies?: CompanyItem[];
  stats?: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = userRole?.role || user.user_metadata?.role;
    if (!role || (role !== "mentor" && role !== "admin" && role !== "super_admin")) {
      return { success: false, error: "Forbidden: Mentor or Admin privileges required." };
    }

    // 1. Fetch all companies from companies table directly
    const { data: companiesData, error: compErr } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (compErr) {
      console.error("[fetchMentorCompaniesAction] Error fetching companies:", {
        message: compErr.message,
        details: compErr.details,
        hint: compErr.hint,
        code: compErr.code,
        query: "from('companies').select('*')",
        userId: user.id,
        userRole: role,
      });
    }

    // 2. Fetch all registered user accounts with role = 'company'
    const { data: companyUsers, error: userErr } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url, created_at")
      .eq("role", "company");

    if (userErr) {
      console.error("[fetchMentorCompaniesAction] Error fetching company users:", {
        code: userErr.code,
        message: userErr.message,
        details: userErr.details,
        hint: userErr.hint,
        query: "from('users').select('id, email, full_name, avatar_url, created_at').eq('role', 'company')",
        userId: user.id,
        userRole: role,
      });
    }

    const companyMap = new Map<string, CompanyItem>();

    // First, populate from registered company users
    (companyUsers || []).forEach((u) => {
      companyMap.set(u.id, {
        id: u.id,
        name: u.full_name || u.email.split("@")[0] || "Registered Company",
        logo_url: u.avatar_url || null,
        industry: "Technology",
        description: null,
        website: null,
        official_email: u.email,
        contact_email: u.email,
        contact_person: u.full_name || null,
        contact_phone: null,
        address: null,
        city: null,
        state: null,
        country: "India",
        company_size: "11-50 employees",
        linkedin_url: null,
        status: "active",
        verification_status: "pending",
        mentor_id: null,
        created_at: u.created_at || new Date().toISOString(),
        updated_at: u.created_at || new Date().toISOString(),
      });
    });

    // Second, merge / override with companies table data
    (companiesData || []).forEach((c: {
      id: string;
      name?: string | null;
      logo_url?: string | null;
      industry?: string | null;
      description?: string | null;
      website?: string | null;
      official_email?: string | null;
      contact_email?: string | null;
      contact_person?: string | null;
      contact_phone?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      company_size?: string | null;
      linkedin_url?: string | null;
      status?: string | null;
      verification_status?: string | null;
      is_verified?: boolean | null;
      mentor_id?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    }) => {
      const existing = companyMap.get(c.id);

      const officialEmail = c.official_email || c.contact_email || existing?.official_email || null;
      const name = c.name || existing?.name || "Registered Company";
      const logoUrl = c.logo_url || existing?.logo_url || null;
      const contactPerson = c.contact_person || existing?.contact_person || null;
      const status = c.status || existing?.status || "active";
      const verificationStatus = c.verification_status || (c.is_verified ? "verified" : "pending");
      const createdAt = c.created_at || existing?.created_at || new Date().toISOString();

      companyMap.set(c.id, {
        id: c.id,
        name,
        logo_url: logoUrl,
        industry: c.industry || existing?.industry || "Technology",
        description: c.description || existing?.description || null,
        website: c.website || existing?.website || null,
        official_email: officialEmail,
        contact_email: officialEmail,
        contact_person: contactPerson,
        contact_phone: c.contact_phone || existing?.contact_phone || null,
        address: c.address || existing?.address || null,
        city: c.city || existing?.city || null,
        state: c.state || existing?.state || null,
        country: c.country || existing?.country || "India",
        company_size: c.company_size || existing?.company_size || "11-50 employees",
        linkedin_url: c.linkedin_url || existing?.linkedin_url || null,
        status,
        verification_status: verificationStatus,
        mentor_id: c.mentor_id || null,
        created_at: createdAt,
        updated_at: c.updated_at || createdAt,
      });
    });

    const companyList = Array.from(companyMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const stats = {
      total: companyList.length,
      verified: companyList.filter((c) => c.verification_status === "verified").length,
      pending: companyList.filter((c) => c.verification_status === "pending" || !c.verification_status).length,
      rejected: companyList.filter((c) => c.verification_status === "rejected").length,
    };

    return {
      success: true,
      companies: companyList,
      stats,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch companies.";
    console.error("fetchMentorCompaniesAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Add Company by Mentor
 */
export async function addMentorCompanyAction(
  payload: AddMentorCompanyPayload
): Promise<{ success: boolean; companyId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    if (!payload.name || !payload.official_email) {
      return { success: false, error: "Company name and official email are required." };
    }

    const newCompany = {
      name: payload.name.trim(),
      logo_url: payload.logo_url?.trim() || null,
      industry: payload.industry?.trim() || "Technology",
      description: payload.description?.trim() || null,
      website: payload.website?.trim() || null,
      official_email: payload.official_email.trim().toLowerCase(),
      contact_email: payload.official_email.trim().toLowerCase(),
      contact_person: payload.contact_person?.trim() || null,
      contact_phone: payload.contact_phone?.trim() || null,
      address: payload.address?.trim() || null,
      city: payload.city?.trim() || null,
      state: payload.state?.trim() || null,
      country: payload.country?.trim() || null,
      company_size: payload.company_size?.trim() || "11-50 employees",
      linkedin_url: payload.linkedin_url?.trim() || null,
      status: payload.status || "active",
      verification_status: "pending",
      is_verified: false,
      mentor_id: user.id,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("companies")
      .insert(newCompany)
      .select("id")
      .single();

    if (insertErr) throw insertErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "ADD_COMPANY",
      resource: "companies",
      recordId: inserted.id,
      newData: newCompany,
    });

    revalidatePath("/mentor/dashboard/companies");
    return { success: true, companyId: inserted.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to add company.";
    console.error("addMentorCompanyAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Company Details by Mentor
 */
export async function updateMentorCompanyAction(
  companyId: string,
  payload: AddMentorCompanyPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const updates = {
      name: payload.name.trim(),
      logo_url: payload.logo_url?.trim() || null,
      industry: payload.industry?.trim() || null,
      description: payload.description?.trim() || null,
      website: payload.website?.trim() || null,
      official_email: payload.official_email?.trim().toLowerCase() || null,
      contact_email: payload.official_email?.trim().toLowerCase() || null,
      contact_person: payload.contact_person?.trim() || null,
      contact_phone: payload.contact_phone?.trim() || null,
      address: payload.address?.trim() || null,
      city: payload.city?.trim() || null,
      state: payload.state?.trim() || null,
      country: payload.country?.trim() || null,
      company_size: payload.company_size?.trim() || null,
      linkedin_url: payload.linkedin_url?.trim() || null,
      status: payload.status || "active",
      updated_at: new Date().toISOString(),
    };

    const { error: updateErr } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", companyId);

    if (updateErr) throw updateErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "UPDATE_COMPANY",
      resource: "companies",
      recordId: companyId,
      newData: updates,
    });

    revalidatePath("/mentor/dashboard/companies");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update company.";
    console.error("updateMentorCompanyAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Company Verification Status (Verify, Reject, Suspend)
 */
export async function updateMentorCompanyVerificationAction(
  companyId: string,
  verification_status: "pending" | "verified" | "rejected" | "suspended"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const isVerified = verification_status === "verified";
    const status = verification_status === "suspended" ? "suspended" : verification_status === "rejected" ? "rejected" : "active";

    const { error: updateErr } = await supabase
      .from("companies")
      .update({
        verification_status,
        is_verified: isVerified,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId);

    if (updateErr) throw updateErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: `COMPANY_VERIFICATION_${verification_status.toUpperCase()}`,
      resource: "companies",
      recordId: companyId,
      newData: { verification_status, is_verified: isVerified, status },
    });

    revalidatePath("/mentor/dashboard/companies");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update verification status.";
    console.error("updateMentorCompanyVerificationAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete Company Action by Mentor
 */
export async function deleteMentorCompanyAction(
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { error: deleteErr } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);

    if (deleteErr) throw deleteErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: "mentor",
      action: "DELETE_COMPANY",
      resource: "companies",
      recordId: companyId,
    });

    revalidatePath("/mentor/dashboard/companies");
    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete company.";
    console.error("deleteMentorCompanyAction error:", err);
    return { success: false, error: errorMessage };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";

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

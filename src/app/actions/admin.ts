"use server";

import { createClient } from "@/lib/supabase/server";
import { AppRole } from "@/lib/auth/rbac";
import {
  calculateCompanyTrustScore,
  type CompanyVerificationStatus,
} from "@/lib/ai-company-trust-engine";

export interface CompanyAdminItem {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
  verification_status: CompanyVerificationStatus;
  gst_number: string | null;
  official_email: string | null;
  registration_doc_url: string | null;
  trust_score: number;
  created_at: string;
  internships_posted_count?: number;
}

export interface AuditLogItem {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Fetch company queue for admin verification
 */
export async function fetchAdminCompanyVerificationQueueAction(): Promise<{
  success: boolean;
  companies?: CompanyAdminItem[];
  pendingCount?: number;
  verifiedCount?: number;
  blacklistedCount?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Sign in as admin." };
    }

    // Fetch user role
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = userRole?.role || user.user_metadata?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return { success: false, error: "Forbidden: Admin privileges required." };
    }

    // Query companies
    const { data: companies, error: compError } = await supabase
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
        trust_score,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (compError) {
      throw compError;
    }

    // Query internship count per company
    const { data: internships } = await supabase
      .from("internships")
      .select("company_id");

    const countsMap: Record<string, number> = {};
    (internships || []).forEach((item) => {
      countsMap[item.company_id] = (countsMap[item.company_id] || 0) + 1;
    });

    const companyList: CompanyAdminItem[] = (companies || []).map((c) => {
      const vStatus = (c.verification_status as CompanyVerificationStatus) || (c.is_verified ? "verified" : "pending");
      const trustScoreResult = calculateCompanyTrustScore({
        ...c,
        verification_status: vStatus,
        internships_posted_count: countsMap[c.id] || 0,
      });

      return {
        id: c.id,
        name: c.name,
        website: c.website,
        industry: c.industry,
        logo_url: c.logo_url,
        description: c.description,
        is_verified: vStatus === "verified",
        verification_status: vStatus,
        gst_number: c.gst_number || null,
        official_email: c.official_email || null,
        registration_doc_url: c.registration_doc_url || null,
        trust_score: trustScoreResult.trustScore,
        created_at: c.created_at,
        internships_posted_count: countsMap[c.id] || 0,
      };
    });

    const pendingCount = companyList.filter((c) => c.verification_status === "pending").length;
    const verifiedCount = companyList.filter((c) => c.verification_status === "verified").length;
    const blacklistedCount = companyList.filter((c) => c.verification_status === "blacklisted").length;

    return {
      success: true,
      companies: companyList,
      pendingCount,
      verifiedCount,
      blacklistedCount,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch admin verification queue.";
    console.error("fetchAdminCompanyVerificationQueueAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update Company Verification Status (Approve, Reject, Suspend, Blacklist) & write Audit Log
 */
export async function updateCompanyVerificationStatusAction(
  companyId: string,
  newStatus: CompanyVerificationStatus,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Sign in as admin." };
    }

    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = userRole?.role || user.user_metadata?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return { success: false, error: "Forbidden: Admin privileges required." };
    }

    // Fetch existing company record
    const { data: oldCompany, error: oldError } = await supabase
      .from("companies")
      .select("id, name, is_verified, verification_status, trust_score")
      .eq("id", companyId)
      .maybeSingle();

    if (oldError || !oldCompany) {
      return { success: false, error: "Target company record not found." };
    }

    const isVerifiedBool = newStatus === "verified";
    const calculatedTrust = newStatus === "verified" ? 92 : newStatus === "blacklisted" ? 0 : 45;

    // Update company status in database
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        verification_status: newStatus,
        is_verified: isVerifiedBool,
        trust_score: calculatedTrust,
      })
      .eq("id", companyId);

    if (updateError) {
      throw updateError;
    }

    // If company is blacklisted, close all active internship listings automatically
    if (newStatus === "blacklisted") {
      await supabase
        .from("internships")
        .update({ status: "closed" })
        .eq("company_id", companyId);
    }

    // Write audit log entry
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: `COMPANY_VERIFICATION_${newStatus.toUpperCase()}`,
      table_name: "companies",
      record_id: companyId,
      old_data: {
        status: oldCompany.verification_status,
        is_verified: oldCompany.is_verified,
      },
      new_data: {
        status: newStatus,
        is_verified: isVerifiedBool,
        admin_notes: adminNotes || "Status updated via Admin Control Center",
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update company status.";
    console.error("updateCompanyVerificationStatusAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch Audit Logs & Verification History for Admin Dashboard
 */
export async function fetchAdminAuditLogsAction(): Promise<{
  success: boolean;
  auditLogs?: AuditLogItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Sign in as admin." };
    }

    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = userRole?.role || user.user_metadata?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return { success: false, error: "Forbidden: Admin privileges required." };
    }

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("id, user_id, action, table_name, record_id, old_data, new_data, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return {
      success: true,
      auditLogs: (logs as unknown as AuditLogItem[]) || [],
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch audit logs.";
    console.error("fetchAdminAuditLogsAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch List of Available Mentors for Company Assignment
 */
export async function fetchAdminMentorsAction(): Promise<{
  success: boolean;
  mentors?: Array<{ id: string; name: string; email: string }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { data: mentors, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "mentor")
      .order("full_name", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      mentors: (mentors || []).map((m) => ({
        id: m.id,
        name: m.full_name || m.email,
        email: m.email,
      })),
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch mentors.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Assign Company to a Specific Mentor (Admin Privilege)
 */
export async function assignCompanyToMentorAction(
  companyId: string,
  mentorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // Role verification
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = userRole?.role || user.user_metadata?.role;
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return { success: false, error: "Forbidden: Admin privileges required." };
    }

    // Get current company details
    const { data: oldCompany } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", companyId)
      .maybeSingle();

    if (!oldCompany) {
      return { success: false, error: "Target company not found." };
    }

    // Update company mentor assignment in company_interns table
    const { error: updateErr } = await supabase
      .from("company_interns")
      .update({ mentor_id: mentorId })
      .eq("company_id", companyId);

    if (updateErr) throw updateErr;

    // Log Audit Event
    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      role: role as AppRole,
      action: "ASSIGN_COMPANY_TO_MENTOR",
      resource: "companies",
      recordId: companyId,
      newData: { mentorId },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to assign company to mentor.";
    console.error("assignCompanyToMentorAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Suspend User Account (Admin privilege with Super Admin immutability guard)
 */
export async function suspendUserAction(
  targetUserId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { assertAdminCanModifyTarget } = await import("@/lib/auth/guards");
    await assertAdminCanModifyTarget(user.id, targetUserId);

    // Update target user account status
    const { error: updateErr } = await supabase
      .from("users")
      .update({ account_status: "suspended" })
      .eq("id", targetUserId);

    if (updateErr) throw updateErr;

    // Audit Logger
    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      action: "SUSPEND_USER",
      resource: "users",
      recordId: targetUserId,
      newData: { status: "suspended", reason: reason || "Admin suspension" },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to suspend user.";
    console.error("suspendUserAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Activate User Account
 */
export async function activateUserAction(
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    const { assertAdminCanModifyTarget } = await import("@/lib/auth/guards");
    await assertAdminCanModifyTarget(user.id, targetUserId);

    const { error: updateErr } = await supabase
      .from("users")
      .update({ account_status: "active" })
      .eq("id", targetUserId);

    if (updateErr) throw updateErr;

    const { AuditLoggerService } = await import("@/lib/services/audit-logger");
    await AuditLoggerService.log({
      userId: user.id,
      action: "ACTIVATE_USER",
      resource: "users",
      recordId: targetUserId,
      newData: { status: "active" },
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to activate user.";
    console.error("activateUserAction error:", err);
    return { success: false, error: errorMessage };
  }
}

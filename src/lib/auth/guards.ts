import { createClient } from "@/lib/supabase/server";
import { AppRole, Permission, hasPermission, canModifyUserRole } from "@/lib/auth/rbac";

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  role: AppRole;
  accountStatus: string;
}

/**
 * Ensures request is authenticated and fetches user profile & role.
 * Throws or returns unauthorized object if missing.
 */
export async function getAuthenticatedUserContext(): Promise<AuthenticatedUserContext> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized: Authentication session required.");
  }

  // Query user record for canonical DB role & account status
  const { data: userDb } = await supabase
    .from("users")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  const role = (userDb?.role || user.user_metadata?.role || "student") as AppRole;
  const accountStatus = userDb?.account_status || "active";

  if (accountStatus === "suspended") {
    throw new Error("Forbidden: Account has been suspended by platform administration.");
  }

  return {
    userId: user.id,
    email: user.email || "",
    role,
    accountStatus,
  };
}

/**
 * Guard requiring specific role(s)
 */
export async function requireRole(allowedRoles: AppRole[]): Promise<AuthenticatedUserContext> {
  const ctx = await getAuthenticatedUserContext();
  if (ctx.role === "super_admin") return ctx; // Super admin always passes

  if (!allowedRoles.includes(ctx.role)) {
    throw new Error(`Forbidden: Access requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: ${ctx.role}`);
  }

  return ctx;
}

/**
 * Guard requiring specific granular permission
 */
export async function requirePermission(permission: Permission): Promise<AuthenticatedUserContext> {
  const ctx = await getAuthenticatedUserContext();

  if (!hasPermission(ctx.role, permission)) {
    throw new Error(`Forbidden: Missing required permission '${permission}' for role '${ctx.role}'.`);
  }

  return ctx;
}

/**
 * Guard ensuring Mentor has access ONLY to companies assigned to them
 */
export async function requireMentorCompanyAccess(companyId: string): Promise<AuthenticatedUserContext> {
  const ctx = await getAuthenticatedUserContext();

  if (ctx.role === "super_admin" || ctx.role === "admin") {
    return ctx; // Global operational managers
  }

  if (ctx.role === "company" && ctx.userId === companyId) {
    return ctx; // Company accessing self
  }

  if (ctx.role !== "mentor") {
    throw new Error("Forbidden: Only mentors or administrators can access company management.");
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("mentor_id")
    .eq("id", companyId)
    .maybeSingle();

  if (!company || company.mentor_id !== ctx.userId) {
    throw new Error("Forbidden: Mentor is not assigned to manage this company.");
  }

  return ctx;
}

/**
 * Guard ensuring Mentor has access ONLY to students belonging to assigned companies
 */
export async function requireMentorStudentAccess(studentId: string): Promise<AuthenticatedUserContext> {
  const ctx = await getAuthenticatedUserContext();

  if (ctx.role === "super_admin" || ctx.role === "admin") {
    return ctx;
  }

  if (ctx.role === "student" && ctx.userId === studentId) {
    return ctx; // Student accessing self
  }

  if (ctx.role !== "mentor") {
    throw new Error("Forbidden: Only assigned mentors or administrators can access student details.");
  }

  const supabase = await createClient();
  
  // Check if student belongs to mentor's assigned company via company_interns or mentor_assignments
  const { data: assignedIntern } = await supabase
    .from("company_interns")
    .select(`
      company_id,
      companies!inner (
        mentor_id
      )
    `)
    .eq("student_id", studentId)
    .maybeSingle();

  type AssignedCompanyIntern = {
    company_id: string;
    companies: { mentor_id: string | null } | null;
  };

  const isAssignedViaCompany =
    assignedIntern && (assignedIntern as unknown as AssignedCompanyIntern).companies?.mentor_id === ctx.userId;

  if (isAssignedViaCompany) return ctx;

  const { data: directAssignment } = await supabase
    .from("mentor_assignments")
    .select("id")
    .eq("mentor_id", ctx.userId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!directAssignment) {
    throw new Error("Forbidden: Mentor is not assigned to manage this student.");
  }

  return ctx;
}

/**
 * Guard ensuring Admin cannot modify Super Admin user accounts
 */
export async function assertAdminCanModifyTarget(actorUserId: string, targetUserId: string): Promise<void> {
  const supabase = await createClient();

  const { data: actor } = await supabase
    .from("users")
    .select("role")
    .eq("id", actorUserId)
    .maybeSingle();

  const { data: target } = await supabase
    .from("users")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();

  const actorRole = (actor?.role || "student") as AppRole;
  const targetRole = (target?.role || "student") as AppRole;

  if (!canModifyUserRole(actorRole, targetRole)) {
    throw new Error("Forbidden: Admins cannot modify or suspend Super Admin accounts.");
  }
}

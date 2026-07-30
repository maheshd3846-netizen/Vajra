export type AppRole = 'super_admin' | 'admin' | 'mentor' | 'company' | 'student';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'rejected';

/**
 * Granular System Permissions
 */
export type Permission =
  // Super Admin Permissions
  | 'manage_admins'
  | 'manage_mentors'
  | 'manage_companies'
  | 'manage_students'
  | 'manage_internships'
  | 'platform_settings'
  | 'database_management'
  | 'reports_analytics'
  | 'audit_logs'
  | 'system_config'
  | 'global_notifications'
  | 'security_settings'
  | 'backup_restore'

  // Admin Permissions
  | 'approve_mentors'
  | 'assign_companies_to_mentors'
  | 'view_all_companies'
  | 'view_all_students'
  | 'view_all_internships'
  | 'view_reports'
  | 'view_analytics'
  | 'handle_support'
  | 'monitor_activity'
  | 'suspend_activate_users'

  // Mentor (Scoped) Permissions
  | 'company:approve'
  | 'company:reject'
  | 'company:edit_profile'
  | 'company:suspend'
  | 'company:reactivate'
  | 'company:verify_docs'
  | 'company:manage_internships'
  | 'company:view_analytics'
  | 'student:add'
  | 'student:edit'
  | 'student:soft_delete'
  | 'student:activate_deactivate'
  | 'student:reset_account'
  | 'student:verify_profile'
  | 'student:assign_internship'
  | 'student:move'
  | 'student:view_full_profile'
  | 'student:view_resumes'
  | 'student:view_portfolios'
  | 'student:view_github'
  | 'student:view_linkedin'
  | 'student:view_certificates'
  | 'student:view_ai_reports'
  | 'internship:create'
  | 'internship:edit'
  | 'internship:delete'
  | 'internship:approve'
  | 'internship:close'
  | 'internship:assign_intern'
  | 'internship:remove_intern'
  | 'internship:approve_completion'
  | 'internship:track_progress'
  | 'internship:review_daily_reports'
  | 'internship:review_attendance'
  | 'internship:rate'
  | 'internship:provide_feedback'
  | 'internship:issue_certificate'
  | 'mentor:view_dashboard'

  // Company Permissions
  | 'company:manage_own_profile'
  | 'company:post_internship'
  | 'company:edit_own_internship'
  | 'company:close_own_internship'
  | 'company:view_assigned_interns'
  | 'company:review_intern_progress'
  | 'company:review_daily_reports'
  | 'company:give_feedback'
  | 'company:mark_attendance'
  | 'company:recommend_ppo'
  | 'company:view_own_analytics'

  // Student Permissions
  | 'student:update_own_profile'
  | 'student:upload_resume'
  | 'student:upload_portfolio'
  | 'student:apply_internship'
  | 'student:submit_daily_report'
  | 'student:upload_documents'
  | 'student:upload_github'
  | 'student:upload_demo'
  | 'student:view_mentor_feedback'
  | 'student:track_own_progress'
  | 'student:view_ai_analytics'
  | 'student:complete_tasks';

/**
 * Role Hierarchy Numerical Ranks
 */
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 100,
  admin: 80,
  mentor: 60,
  company: 40,
  student: 20,
};

/**
 * Role to Capability Permission Matrix
 */
const ROLE_PERMISSIONS: Record<AppRole, Set<Permission>> = {
  super_admin: new Set<Permission>([
    // Super admin has every permission in system
    'manage_admins',
    'manage_mentors',
    'manage_companies',
    'manage_students',
    'manage_internships',
    'platform_settings',
    'database_management',
    'reports_analytics',
    'audit_logs',
    'system_config',
    'global_notifications',
    'security_settings',
    'backup_restore',
    'approve_mentors',
    'assign_companies_to_mentors',
    'view_all_companies',
    'view_all_students',
    'view_all_internships',
    'view_reports',
    'view_analytics',
    'handle_support',
    'monitor_activity',
    'suspend_activate_users',
    'company:approve',
    'company:reject',
    'company:edit_profile',
    'company:suspend',
    'company:reactivate',
    'company:verify_docs',
    'company:manage_internships',
    'company:view_analytics',
    'student:add',
    'student:edit',
    'student:soft_delete',
    'student:activate_deactivate',
    'student:reset_account',
    'student:verify_profile',
    'student:assign_internship',
    'student:move',
    'student:view_full_profile',
    'student:view_resumes',
    'student:view_portfolios',
    'student:view_github',
    'student:view_linkedin',
    'student:view_certificates',
    'student:view_ai_reports',
    'internship:create',
    'internship:edit',
    'internship:delete',
    'internship:approve',
    'internship:close',
    'internship:assign_intern',
    'internship:remove_intern',
    'internship:approve_completion',
    'internship:track_progress',
    'internship:review_daily_reports',
    'internship:review_attendance',
    'internship:rate',
    'internship:provide_feedback',
    'internship:issue_certificate',
    'mentor:view_dashboard',
    'company:manage_own_profile',
    'company:post_internship',
    'company:edit_own_internship',
    'company:close_own_internship',
    'company:view_assigned_interns',
    'company:review_intern_progress',
    'company:review_daily_reports',
    'company:give_feedback',
    'company:mark_attendance',
    'company:recommend_ppo',
    'company:view_own_analytics',
    'student:update_own_profile',
    'student:upload_resume',
    'student:upload_portfolio',
    'student:apply_internship',
    'student:submit_daily_report',
    'student:upload_documents',
    'student:upload_github',
    'student:upload_demo',
    'student:view_mentor_feedback',
    'student:track_own_progress',
    'student:view_ai_analytics',
    'student:complete_tasks',
  ]),

  admin: new Set<Permission>([
    'manage_mentors',
    'manage_companies',
    'manage_students',
    'manage_internships',
    'reports_analytics',
    'approve_mentors',
    'assign_companies_to_mentors',
    'view_all_companies',
    'view_all_students',
    'view_all_internships',
    'view_reports',
    'view_analytics',
    'handle_support',
    'monitor_activity',
    'suspend_activate_users',
    'company:approve',
    'company:reject',
    'company:edit_profile',
    'company:suspend',
    'company:reactivate',
    'company:verify_docs',
    'company:manage_internships',
    'company:view_analytics',
    'student:add',
    'student:edit',
    'student:soft_delete',
    'student:activate_deactivate',
    'student:reset_account',
    'student:verify_profile',
    'student:assign_internship',
    'student:view_full_profile',
    'internship:create',
    'internship:edit',
    'internship:delete',
    'internship:approve',
    'internship:close',
    'internship:issue_certificate',
    'mentor:view_dashboard',
  ]),

  mentor: new Set<Permission>([
    'company:approve',
    'company:reject',
    'company:edit_profile',
    'company:suspend',
    'company:reactivate',
    'company:verify_docs',
    'company:manage_internships',
    'company:view_analytics',
    'student:add',
    'student:edit',
    'student:soft_delete',
    'student:activate_deactivate',
    'student:reset_account',
    'student:verify_profile',
    'student:assign_internship',
    'student:move',
    'student:view_full_profile',
    'student:view_resumes',
    'student:view_portfolios',
    'student:view_github',
    'student:view_linkedin',
    'student:view_certificates',
    'student:view_ai_reports',
    'internship:create',
    'internship:edit',
    'internship:delete',
    'internship:approve',
    'internship:close',
    'internship:assign_intern',
    'internship:remove_intern',
    'internship:approve_completion',
    'internship:track_progress',
    'internship:review_daily_reports',
    'internship:review_attendance',
    'internship:rate',
    'internship:provide_feedback',
    'internship:issue_certificate',
    'mentor:view_dashboard',
  ]),

  company: new Set<Permission>([
    'company:manage_own_profile',
    'company:post_internship',
    'company:edit_own_internship',
    'company:close_own_internship',
    'company:view_assigned_interns',
    'company:review_intern_progress',
    'company:review_daily_reports',
    'company:give_feedback',
    'company:mark_attendance',
    'company:recommend_ppo',
    'company:view_own_analytics',
  ]),

  student: new Set<Permission>([
    'student:update_own_profile',
    'student:upload_resume',
    'student:upload_portfolio',
    'student:apply_internship',
    'student:submit_daily_report',
    'student:upload_documents',
    'student:upload_github',
    'student:upload_demo',
    'student:view_mentor_feedback',
    'student:track_own_progress',
    'student:view_ai_analytics',
    'student:complete_tasks',
  ]),
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AppRole, permission: Permission): boolean {
  if (role === 'super_admin') return true;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.has(permission) : false;
}

/**
 * Check if user's role meets minimum hierarchy rank requirement
 */
export function isRoleAtLeast(userRole: AppRole, requiredRole: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if target user role can be modified by actor role
 * Rule: Admin CANNOT modify Super Admin accounts.
 */
export function canModifyUserRole(actorRole: AppRole, targetRole: AppRole): boolean {
  if (actorRole === 'super_admin') return true;
  if (targetRole === 'super_admin') return false;
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

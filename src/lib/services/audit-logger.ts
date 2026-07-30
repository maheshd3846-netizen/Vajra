import { createClient } from "@/lib/supabase/server";
import { AppRole } from "@/lib/auth/rbac";

export interface LogAuditParams {
  userId?: string | null;
  role?: AppRole | null;
  action: string;
  resource: string;
  recordId: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export class AuditLoggerService {
  /**
   * Log security & operational event into audit_logs table
   */
  static async log(params: LogAuditParams): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
      const supabase = await createClient();

      let finalUserId = params.userId;
      let finalRole = params.role;

      // If user info is not explicitly provided, pull from auth context
      if (!finalUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          finalUserId = user.id;
          if (!finalRole) {
            const { data: userData } = await supabase
              .from("users")
              .select("role")
              .eq("id", user.id)
              .maybeSingle();
            finalRole = (userData?.role || user.user_metadata?.role || "student") as AppRole;
          }
        }
      }

      const { data, error } = await supabase
        .from("audit_logs")
        .insert({
          user_id: finalUserId || null,
          role: finalRole || null,
          action: params.action,
          table_name: params.resource,
          resource: params.resource,
          record_id: params.recordId,
          old_data: params.oldData ? (params.oldData as Record<string, unknown>) : null,
          new_data: params.newData ? (params.newData as Record<string, unknown>) : null,
          ip_address: params.ipAddress || null,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("[AuditLogger] Failed to insert audit log:", error);
        return { success: false, error: error.message };
      }

      return { success: true, logId: data?.id };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Audit log exception";
      console.error("[AuditLogger] Exception during log execution:", err);
      return { success: false, error: message };
    }
  }
}

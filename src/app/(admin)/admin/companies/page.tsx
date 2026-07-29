import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAdminCompanyVerificationQueueAction,
  fetchAdminAuditLogsAction,
} from "@/app/actions/admin";
import AdminCompanyVerificationClient from "@/components/admin/AdminCompanyVerificationClient";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch companies and audit logs using server actions
  const [queueRes, logsRes] = await Promise.all([
    fetchAdminCompanyVerificationQueueAction(),
    fetchAdminAuditLogsAction(),
  ]);

  const initialCompanies = queueRes.companies || [];
  const initialAuditLogs = logsRes.auditLogs || [];

  return (
    <AdminCompanyVerificationClient
      initialCompanies={initialCompanies}
      initialAuditLogs={initialAuditLogs}
    />
  );
}

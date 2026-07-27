import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClientLayout from "@/components/dashboard/DashboardClientLayout";

export const dynamic = "force-dynamic";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student profile details matching auth id
  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <DashboardClientLayout profile={profile} email={user.email}>
      {children}
    </DashboardClientLayout>
  );
}

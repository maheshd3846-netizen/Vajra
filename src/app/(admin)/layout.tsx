import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClientLayout from "@/components/dashboard/DashboardClientLayout";

export const dynamic = "force-dynamic";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile details matching auth id
  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  // Role validation
  if (profile && profile.role !== "admin" && profile.role !== "super_admin") {
    // If not an admin, redirect them to their dashboard
    if (profile.role === "student") {
      redirect("/dashboard");
    } else if (profile.role === "company") {
      redirect("/company/dashboard");
    } else if (profile.role === "mentor") {
      redirect("/mentor/dashboard");
    } else {
      redirect("/");
    }
  }

  return (
    <DashboardClientLayout profile={profile} email={user.email}>
      {children}
    </DashboardClientLayout>
  );
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortfolioBuilderWorkspace from "@/components/dashboard/portfolio/PortfolioBuilderWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio Studio — VAJRA",
  description: "Generate your AI-powered developer portfolio in seconds.",
};

export default async function PortfolioBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch existing published portfolio (if any)
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("asset_url, title, description")
    .eq("student_id", user.id)
    .single();

  const profileName =
    userProfile?.full_name || user.email?.split("@")[0] || "Vajra Engineer";

  return (
    <PortfolioBuilderWorkspace
      profileName={profileName}
      userId={user.id}
      existingPortfolio={portfolio || null}
    />
  );
}

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Count metrics to present a polished report
  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: applicationsCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true });

  const { count: reviewsCount } = await supabase
    .from("ai_reports")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold font-heading tracking-tight">Platform Analytics</h1>
      <p className="text-sm text-slate-400 font-sans">
        Review platform utilization metrics, total candidate submissions, and AI resume processing counts.
      </p>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-sans">Total Platform Users</span>
          <h4 className="text-3xl font-bold">{usersCount || 0}</h4>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-sans">Total Applications Submitted</span>
          <h4 className="text-3xl font-bold">{applicationsCount || 0}</h4>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-sans">Total AI Career Reports Generated</span>
          <h4 className="text-3xl font-bold">{reviewsCount || 0}</h4>
        </div>
      </div>
    </div>
  );
}

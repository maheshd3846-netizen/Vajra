import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchMentorProgressReviewQueueAction } from "@/app/actions/progress";
import MentorProgressClient from "@/components/mentor/MentorProgressClient";

export const dynamic = "force-dynamic";

export default async function MentorProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await fetchMentorProgressReviewQueueAction();

  return (
    <MentorProgressClient
      initialPending={initialData.pendingReports || []}
      initialReviewed={initialData.reviewedReports || []}
    />
  );
}

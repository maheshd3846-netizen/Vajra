"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotificationAction } from "./notifications";

export interface CompanyApplicantItem {
  id: string; // application id
  internship_id: string;
  student_id: string;
  resume_url: string;
  cover_letter: string | null;
  status: string; // applied, reviewing, shortlisted, interview_scheduled, selected, accepted, rejected, joined, completed, withdrawn
  applied_at: string;
  interview_date?: string | null;
  interview_notes?: string | null;
  internshipTitle: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  university: string | null;
  major: string | null;
  gpa: number | null;
  skills: string[];
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  projectsCount: number;
  certificatesCount: number;
}

export interface InterviewSchedulePayload {
  applicationId: string;
  interviewDate: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
}

/**
 * Fetch all applicants for a company's internships
 */
export async function fetchCompanyApplicantsAction(internshipId?: string): Promise<{
  success: boolean;
  applicants?: CompanyApplicantItem[];
  stats?: {
    total: number;
    shortlisted: number;
    interviewing: number;
    selected: number;
    joined: number;
    rejected: number;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    // Get company's internships
    let companyJobQuery = supabase
      .from("internships")
      .select("id, title, company_id")
      .eq("company_id", user.id);

    if (internshipId) {
      companyJobQuery = companyJobQuery.eq("id", internshipId);
    }

    const { data: companyJobs, error: jobsErr } = await companyJobQuery;
    if (jobsErr) throw jobsErr;

    const jobMap = new Map<string, string>();
    (companyJobs || []).forEach((j) => jobMap.set(j.id, j.title));
    const jobIds = Array.from(jobMap.keys());

    if (jobIds.length === 0) {
      return {
        success: true,
        applicants: [],
        stats: { total: 0, shortlisted: 0, interviewing: 0, selected: 0, joined: 0, rejected: 0 },
      };
    }

    // Fetch applications for these internships
    const { data: apps, error: appsErr } = await supabase
      .from("applications")
      .select(`
        id,
        internship_id,
        student_id,
        resume_url,
        cover_letter,
        status,
        applied_at,
        interview_date,
        interview_notes
      `)
      .in("internship_id", jobIds)
      .order("applied_at", { ascending: false });

    if (appsErr) throw appsErr;
    if (!apps || apps.length === 0) {
      return {
        success: true,
        applicants: [],
        stats: { total: 0, shortlisted: 0, interviewing: 0, selected: 0, joined: 0, rejected: 0 },
      };
    }

    const studentIds = Array.from(new Set(apps.map((a) => a.student_id)));

    // Fetch student profile details in parallel
    const [
      { data: users },
      { data: profiles },
      { data: skills },
      { data: projects },
      { data: certificates },
    ] = await Promise.all([
      supabase.from("users").select("id, full_name, email, avatar_url").in("id", studentIds),
      supabase.from("student_profiles").select("id, university, major, gpa, github_url, linkedin_url, website_url").in("id", studentIds),
      supabase.from("student_skills").select("student_id, skill_name").in("student_id", studentIds),
      supabase.from("projects").select("student_id").in("student_id", studentIds),
      supabase.from("certificates").select("student_id").in("student_id", studentIds),
    ]);

    const userMap = new Map(users?.map((u) => [u.id, u]));
    const profileMap = new Map(profiles?.map((p) => [p.id, p]));

    const skillsMap = new Map<string, string[]>();
    (skills || []).forEach((s) => {
      const arr = skillsMap.get(s.student_id) || [];
      arr.push(s.skill_name);
      skillsMap.set(s.student_id, arr);
    });

    const projectCounts = new Map<string, number>();
    (projects || []).forEach((p) => {
      projectCounts.set(p.student_id, (projectCounts.get(p.student_id) || 0) + 1);
    });

    const certCounts = new Map<string, number>();
    (certificates || []).forEach((c) => {
      certCounts.set(c.student_id, (certCounts.get(c.student_id) || 0) + 1);
    });

    const applicantsList: CompanyApplicantItem[] = apps.map((a) => {
      const u = userMap.get(a.student_id);
      const p = profileMap.get(a.student_id);

      return {
        id: a.id,
        internship_id: a.internship_id,
        student_id: a.student_id,
        resume_url: a.resume_url,
        cover_letter: a.cover_letter,
        status: a.status,
        applied_at: a.applied_at,
        interview_date: a.interview_date || null,
        interview_notes: a.interview_notes || null,
        internshipTitle: jobMap.get(a.internship_id) || "Internship Position",
        studentName: u?.full_name || "Applicant",
        studentEmail: u?.email || "",
        studentAvatar: u?.avatar_url || null,
        university: p?.university || null,
        major: p?.major || null,
        gpa: p?.gpa || null,
        skills: skillsMap.get(a.student_id) || [],
        github_url: p?.github_url || null,
        linkedin_url: p?.linkedin_url || null,
        portfolio_url: p?.website_url || null,
        projectsCount: projectCounts.get(a.student_id) || 0,
        certificatesCount: certCounts.get(a.student_id) || 0,
      };
    });

    const stats = {
      total: applicantsList.length,
      shortlisted: applicantsList.filter((a) => a.status === "shortlisted").length,
      interviewing: applicantsList.filter((a) => a.status === "interview_scheduled" || a.status === "interviewing").length,
      selected: applicantsList.filter((a) => a.status === "selected" || a.status === "accepted").length,
      joined: applicantsList.filter((a) => a.status === "joined" || a.status === "completed").length,
      rejected: applicantsList.filter((a) => a.status === "rejected").length,
    };

    return {
      success: true,
      applicants: applicantsList,
      stats,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch applicants.";
    console.error("fetchCompanyApplicantsAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Company/Admin Update Application Status (Shortlist, Reject, Select, Mark Joined)
 */
export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: "reviewing" | "shortlisted" | "selected" | "accepted" | "rejected" | "joined" | "completed"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { data: app, error: appErr } = await supabase
      .from("applications")
      .select("id, student_id, internship_id, status, internships ( title, company_id, companies ( name ) )")
      .eq("id", applicationId)
      .maybeSingle();

    if (appErr || !app) {
      return { success: false, error: "Application record not found." };
    }

    const { error: updateErr } = await supabase
      .from("applications")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateErr) throw updateErr;

    // If candidate status is updated to 'joined', sync with company_interns
    if (newStatus === "joined") {
      await supabase.from("company_interns").upsert(
        {
          company_id: (app.internships as unknown as { company_id: string }).company_id,
          student_id: app.student_id,
          internship_id: app.internship_id,
          status: "active",
          joining_date: new Date().toISOString().split("T")[0],
        },
        { onConflict: "company_id, student_id, internship_id" }
      );
    }

    // Trigger notification to student
    const compName = (app.internships as unknown as { companies: { name: string } })?.companies?.name || "The employer";
    const jobTitle = (app.internships as unknown as { title: string })?.title || "internship";

    const notificationMessages: Record<string, { title: string; message: string }> = {
      shortlisted: {
        title: "Shortlisted!",
        message: `Congratulations! ${compName} has shortlisted your application for "${jobTitle}".`,
      },
      selected: {
        title: "Offer Received!",
        message: `Exciting news! ${compName} has selected you for the "${jobTitle}" position.`,
      },
      accepted: {
        title: "Offer Confirmed!",
        message: `Your acceptance for "${jobTitle}" at ${compName} has been recorded.`,
      },
      rejected: {
        title: "Application Status Update",
        message: `Thank you for applying for "${jobTitle}" at ${compName}. Your application was not selected.`,
      },
      joined: {
        title: "Internship Active!",
        message: `Welcome aboard! You have officially joined ${compName} for "${jobTitle}".`,
      },
      completed: {
        title: "Internship Completed!",
        message: `Congratulations on successfully completing your internship at ${compName}!`,
      },
    };

    const notifInfo = notificationMessages[newStatus] || {
      title: "Application Updated",
      message: `Your application status for "${jobTitle}" has been updated to ${newStatus}.`,
    };

    await createNotificationAction({
      userId: app.student_id,
      title: notifInfo.title,
      message: notifInfo.message,
      type: "application_update",
      link: "/student/applications",
    });

    revalidatePath("/company/applicants");
    revalidatePath("/student/applications");
    revalidatePath("/mentor/students");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update application status.";
    console.error("updateApplicationStatusAction error:", err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Schedule Interview with Candidate
 */
export async function scheduleInterviewAction(payload: InterviewSchedulePayload) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const { data: app } = await supabase
      .from("applications")
      .select("id, student_id, internship_id, internships ( title, company_id, companies ( name ) )")
      .eq("id", payload.applicationId)
      .maybeSingle();

    if (!app) return { success: false, error: "Application not found." };

    const companyId = (app.internships as unknown as { company_id: string }).company_id;

    // Update application status & date
    await supabase
      .from("applications")
      .update({
        status: "interview_scheduled",
        interview_date: payload.interviewDate,
        interview_notes: payload.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.applicationId);

    // Insert into interview_schedule
    await supabase.from("interview_schedule").insert({
      application_id: payload.applicationId,
      student_id: app.student_id,
      company_id: companyId,
      interview_date: payload.interviewDate,
      meeting_link: payload.meetingLink || null,
      location: payload.location || "Remote",
      notes: payload.notes || null,
      status: "scheduled",
    });

    const compName = (app.internships as unknown as { companies: { name: string } })?.companies?.name || "The employer";
    const jobTitle = (app.internships as unknown as { title: string })?.title || "internship";

    // Notify Student
    await createNotificationAction({
      userId: app.student_id,
      title: "Interview Scheduled!",
      message: `${compName} has scheduled an interview for "${jobTitle}" on ${new Date(payload.interviewDate).toLocaleString()}.`,
      type: "interview",
      link: "/student/applications",
    });

    revalidatePath("/company/applicants");
    revalidatePath("/student/applications");

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to schedule interview.";
    console.error("scheduleInterviewAction error:", err);
    return { success: false, error: errorMessage };
  }
}

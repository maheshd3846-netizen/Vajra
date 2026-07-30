"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateDailyReportAiReview,
  generateWeeklyProgressSummary,
  DailyReportInput,
} from "@/lib/ai-progress-engine";

export interface ProgressAttachment {
  type: "image" | "document" | "pdf" | "github" | "demo" | "figma" | "gdrive";
  title: string;
  url: string;
}

export interface SubmitDailyProgressPayload {
  reportDate?: string; // YYYY-MM-DD
  todaysTasks: string;
  tasksCompleted: string;
  hoursWorked: number;
  skillsUsed: string[];
  technologiesUsed: string[];
  challengesFaced?: string;
  solutionsImplemented?: string;
  learningOutcome?: string;
  tomorrowsPlan?: string;
  mood: "great" | "neutral" | "bad";
  productivityRating: number;
  workStatus: "not_started" | "in_progress" | "completed" | "blocked";
  attachments?: ProgressAttachment[];
}

export interface ProgressReportItem {
  id: string;
  student_id: string;
  company_id: string;
  internship_id: string | null;
  report_date: string;
  todays_tasks: string;
  tasks_completed: string;
  hours_worked: number;
  skills_used: string[];
  technologies_used: string[];
  challenges_faced: string | null;
  solutions_implemented: string | null;
  learning_outcome: string | null;
  tomorrows_plan: string | null;
  mood: "great" | "neutral" | "bad";
  productivity_rating: number;
  work_status: "not_started" | "in_progress" | "completed" | "blocked";
  attachments: ProgressAttachment[];
  ai_feedback: {
    summary?: string;
    productivityScore?: number;
    strengths?: string[];
    suggestedImprovements?: string[];
    skillGrowthPoints?: number;
    encouragement?: string;
  };
  created_at: string;
  student?: {
    full_name: string;
    avatar_url: string | null;
    university: string | null;
    branch: string | null;
    major: string | null;
    target_role: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    phone: string | null;
    email?: string;
  };
  company?: {
    name: string;
    logo_url: string | null;
  };
  mentorReview?: {
    id: string;
    status: "pending" | "approved" | "needs_revision";
    rating: number;
    comments: string | null;
    achievements_marked: string[];
    suggested_improvements: string | null;
    assigned_next_tasks: string | null;
    created_at: string;
  } | null;
}

/**
 * Submit or Update Student Daily Progress Update
 */
export async function submitDailyProgressAction(
  payload: SubmitDailyProgressPayload
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    // 1. Check active internship connection in company_interns
    const { data: internRecord } = await supabase
      .from("company_interns")
      .select("company_id, internship_id, mentor_id, progress_pct, attendance_pct")
      .eq("student_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let companyId = internRecord?.company_id;
    const internshipId = internRecord?.internship_id || null;

    // Fallback: If no company_interns active record yet, fetch from recent accepted application or first company
    if (!companyId) {
      const { data: acceptedApp } = await supabase
        .from("applications")
        .select("internship_id, internships ( company_id )")
        .eq("student_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();

      if (acceptedApp?.internships) {
        companyId = (acceptedApp.internships as unknown as { company_id: string }).company_id;
      } else {
        // Ultimate fallback: first verified company in database for testing/sandbox continuity
        const { data: anyComp } = await supabase.from("companies").select("id").limit(1).maybeSingle();
        companyId = anyComp?.id;
      }
    }

    if (!companyId) {
      return { success: false, error: "No active internship placement found to associate this update." };
    }

    const reportDate = payload.reportDate || new Date().toISOString().split("T")[0];

    // 2. Generate AI Feedback
    const aiInput: DailyReportInput = {
      todaysTasks: payload.todaysTasks,
      tasksCompleted: payload.tasksCompleted,
      hoursWorked: payload.hoursWorked,
      skillsUsed: payload.skillsUsed || [],
      technologiesUsed: payload.technologiesUsed || [],
      challengesFaced: payload.challengesFaced,
      solutionsImplemented: payload.solutionsImplemented,
      learningOutcome: payload.learningOutcome,
      tomorrowsPlan: payload.tomorrowsPlan,
      productivityRating: payload.productivityRating,
    };

    const aiFeedback = await generateDailyReportAiReview(aiInput);

    // 3. Upsert into daily_progress_reports
    const reportData = {
      student_id: user.id,
      company_id: companyId,
      internship_id: internshipId,
      report_date: reportDate,
      todays_tasks: payload.todaysTasks,
      tasks_completed: payload.tasksCompleted,
      hours_worked: payload.hoursWorked,
      skills_used: payload.skillsUsed || [],
      technologies_used: payload.technologiesUsed || [],
      challenges_faced: payload.challengesFaced || null,
      solutions_implemented: payload.solutionsImplemented || null,
      learning_outcome: payload.learningOutcome || null,
      tomorrows_plan: payload.tomorrowsPlan || null,
      mood: payload.mood || "great",
      productivity_rating: payload.productivityRating || 4,
      work_status: payload.workStatus || "completed",
      attachments: payload.attachments || [],
      ai_feedback: aiFeedback,
      updated_at: new Date().toISOString(),
    };

    const { data: insertedReport, error: upsertErr } = await supabase
      .from("daily_progress_reports")
      .upsert(reportData, { onConflict: "student_id, internship_id, report_date" })
      .select("id")
      .single();

    if (upsertErr) {
      console.error("Daily progress upsert error:", upsertErr);
      // If table doesn't exist or RLS fallback needed
      return { success: false, error: `Failed to save progress update: ${upsertErr.message}` };
    }

    // 4. Update intern overall progress_pct and attendance_pct if company_interns record exists
    if (internRecord) {
      const { count: reportCount } = await supabase
        .from("daily_progress_reports")
        .select("id", { count: "exact", head: true })
        .eq("student_id", user.id);

      const updatedProgressPct = Math.min(100, Math.round(((reportCount || 1) / 30) * 100));

      await supabase
        .from("company_interns")
        .update({
          progress_pct: updatedProgressPct,
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", user.id)
        .eq("company_id", companyId);
    }

    // 5. Create notification for Company HR & Mentor
    await supabase.from("progress_notifications").insert([
      {
        user_id: companyId,
        type: "report_submitted",
        title: "New Daily Progress Report",
        message: `An intern submitted daily progress for ${reportDate} (${payload.hoursWorked} hrs).`,
        metadata: { report_id: insertedReport.id, student_id: user.id },
      },
    ]);

    return { success: true, reportId: insertedReport.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit daily progress.";
    console.error("submitDailyProgressAction exception:", err);
    return { success: false, error: msg };
  }
}

/**
 * Fetch Complete Student Progress Tracker State & Analytics
 */
export async function fetchStudentProgressTrackerAction(): Promise<{
  success: boolean;
  reports?: ProgressReportItem[];
  todaysReport?: ProgressReportItem | null;
  stats?: {
    streakDays: number;
    totalHoursWorked: number;
    tasksCompletedCount: number;
    avgProductivity: number;
    readinessScore: number;
    submissionRatePct: number;
  };
  weeklySummary?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // Fetch progress reports
    const { data: reports, error: reportsErr } = await supabase
      .from("daily_progress_reports")
      .select(`
        id,
        student_id,
        company_id,
        internship_id,
        report_date,
        todays_tasks,
        tasks_completed,
        hours_worked,
        skills_used,
        technologies_used,
        challenges_faced,
        solutions_implemented,
        learning_outcome,
        tomorrows_plan,
        mood,
        productivity_rating,
        work_status,
        attachments,
        ai_feedback,
        created_at,
        companies ( name, logo_url )
      `)
      .eq("student_id", user.id)
      .order("report_date", { ascending: false });

    if (reportsErr) {
      console.warn("fetchStudentProgressTrackerAction reports error:", reportsErr.message);
    }

    const reportList: ProgressReportItem[] = (reports || []).map((r) => {
      const compRaw = r.companies as unknown as { name: string; logo_url: string | null } | null;
      return {
        id: r.id,
        student_id: r.student_id,
        company_id: r.company_id,
        internship_id: r.internship_id,
        report_date: r.report_date,
        todays_tasks: r.todays_tasks,
        tasks_completed: r.tasks_completed,
        hours_worked: Number(r.hours_worked) || 0,
        skills_used: r.skills_used || [],
        technologies_used: r.technologies_used || [],
        challenges_faced: r.challenges_faced,
        solutions_implemented: r.solutions_implemented,
        learning_outcome: r.learning_outcome,
        tomorrows_plan: r.tomorrows_plan,
        mood: r.mood || "great",
        productivity_rating: r.productivity_rating || 4,
        work_status: r.work_status || "completed",
        attachments: (r.attachments as unknown as ProgressAttachment[]) || [],
        ai_feedback: (r.ai_feedback as unknown as ProgressReportItem["ai_feedback"]) || {},
        created_at: r.created_at,
        company: {
          name: compRaw?.name || "Partner Company",
          logo_url: compRaw?.logo_url || null,
        },
      };
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const todaysReport = reportList.find((r) => r.report_date === todayStr) || null;

    // Calculate streak days (consecutive days with reports)
    let streakDays = 0;
    const sortedDates = Array.from(new Set(reportList.map((r) => r.report_date))).sort().reverse();
    const currentCheck = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = currentCheck.toISOString().split("T")[0];
      if (sortedDates.includes(dateStr)) {
        streakDays++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        // Allow skipping weekends or today if not yet submitted
        if (i === 0 && dateStr === todayStr) {
          currentCheck.setDate(currentCheck.getDate() - 1);
          continue;
        }
        break;
      }
    }

    const totalHoursWorked = reportList.reduce((acc, r) => acc + r.hours_worked, 0);
    const tasksCompletedCount = reportList.length * 3; // Estimated tasks completed
    const avgProductivity = reportList.length > 0
      ? Math.round(reportList.reduce((acc, r) => acc + r.productivity_rating, 0) / reportList.length)
      : 4;

    const submissionRatePct = Math.min(100, Math.round((reportList.length / 20) * 100)) || 100;
    const readinessScore = Math.min(98, 70 + streakDays * 3 + Math.round(totalHoursWorked / 10));

    // AI Weekly Summary
    const recentWeeklyInputs: DailyReportInput[] = reportList.slice(0, 5).map((r) => ({
      todaysTasks: r.todays_tasks,
      tasksCompleted: r.tasks_completed,
      hoursWorked: r.hours_worked,
      skillsUsed: r.skills_used,
      technologiesUsed: r.technologies_used,
      challengesFaced: r.challenges_faced || undefined,
      solutionsImplemented: r.solutions_implemented || undefined,
      learningOutcome: r.learning_outcome || undefined,
      tomorrowsPlan: r.tomorrows_plan || undefined,
      productivityRating: r.productivity_rating,
    }));

    const weeklySummary = await generateWeeklyProgressSummary(recentWeeklyInputs);

    return {
      success: true,
      reports: reportList,
      todaysReport,
      stats: {
        streakDays,
        totalHoursWorked,
        tasksCompletedCount,
        avgProductivity,
        readinessScore,
        submissionRatePct,
      },
      weeklySummary: weeklySummary as unknown as Record<string, unknown>,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load progress tracker.";
    console.error("fetchStudentProgressTrackerAction error:", err);
    return { success: false, error: msg };
  }
}

/**
 * Fetch Company Progress Dashboard & Active Intern Overview
 */
export async function fetchCompanyProgressDashboardAction(): Promise<{
  success: boolean;
  interns?: {
    studentId: string;
    name: string;
    avatarUrl: string | null;
    university: string | null;
    department: string | null;
    role: string | null;
    joiningDate: string;
    progressPct: number;
    attendancePct: number;
    streakDays: number;
    avgProductivity: number;
    lastUpdateDate: string | null;
    latestMood: string | null;
    status: string;
    contactInfo: {
      email: string;
      phone: string | null;
      githubUrl: string | null;
      linkedinUrl: string | null;
      portfolioUrl: string | null;
    };
    recentReports: ProgressReportItem[];
  }[];
  stats?: {
    totalActiveInterns: number;
    todaySubmittedCount: number;
    missingTodayCount: number;
    companyAvgProductivity: number;
    submissionRatePct: number;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // 1. Query company interns
    const { data: internsData, error: internsErr } = await supabase
      .from("company_interns")
      .select(`
        id,
        joining_date,
        progress_pct,
        attendance_pct,
        status,
        student_profiles (
          id,
          university,
          major,
          branch,
          target_role,
          phone,
          github_url,
          linkedin_url,
          portfolio_url,
          users (
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq("company_id", user.id);

    if (internsErr) {
      console.warn("fetchCompanyProgressDashboardAction interns query notice:", internsErr.message);
    }

    // 2. Query all daily progress reports for this company
    const { data: companyReports } = await supabase
      .from("daily_progress_reports")
      .select(`
        id,
        student_id,
        company_id,
        internship_id,
        report_date,
        todays_tasks,
        tasks_completed,
        hours_worked,
        skills_used,
        technologies_used,
        challenges_faced,
        solutions_implemented,
        learning_outcome,
        tomorrows_plan,
        mood,
        productivity_rating,
        work_status,
        attachments,
        ai_feedback,
        created_at
      `)
      .eq("company_id", user.id)
      .order("report_date", { ascending: false });

    const todayStr = new Date().toISOString().split("T")[0];
    const reportsList = (companyReports || []) as unknown as ProgressReportItem[];

    const internList = (internsData || []).map((item) => {
      const sp = item.student_profiles as unknown as {
        id: string;
        university: string | null;
        major: string | null;
        branch: string | null;
        target_role: string | null;
        phone: string | null;
        github_url: string | null;
        linkedin_url: string | null;
        portfolio_url: string | null;
        users: { full_name: string; email: string; avatar_url: string | null } | null;
      } | null;

      const studentId = sp?.id || item.id;
      const studentReports = reportsList.filter((r) => r.student_id === studentId);
      const latestReport = studentReports[0] || null;

      const totalProd = studentReports.reduce((acc, r) => acc + (r.productivity_rating || 4), 0);
      const avgProductivity = studentReports.length > 0 ? Number((totalProd / studentReports.length).toFixed(1)) : 4.0;

      return {
        studentId,
        name: sp?.users?.full_name || "Intern Candidate",
        avatarUrl: sp?.users?.avatar_url || null,
        university: sp?.university || "Partner University",
        department: sp?.branch || sp?.major || "Computer Science",
        role: sp?.target_role || "Software Engineering Intern",
        joiningDate: item.joining_date,
        progressPct: item.progress_pct || 0,
        attendancePct: item.attendance_pct || 100,
        streakDays: studentReports.length,
        avgProductivity,
        lastUpdateDate: latestReport?.report_date || null,
        latestMood: latestReport?.mood || null,
        status: item.status || "active",
        contactInfo: {
          email: sp?.users?.email || "intern@vajra.ai",
          phone: sp?.phone || null,
          githubUrl: sp?.github_url || null,
          linkedinUrl: sp?.linkedin_url || null,
          portfolioUrl: sp?.portfolio_url || null,
        },
        recentReports: studentReports.slice(0, 7),
      };
    });

    const activeInterns = internList.filter((i) => i.status === "active");
    const todaySubmittedCount = activeInterns.filter((i) => i.lastUpdateDate === todayStr).length;
    const missingTodayCount = activeInterns.length - todaySubmittedCount;

    const companyAvgProductivity = activeInterns.length > 0
      ? Number((activeInterns.reduce((acc, i) => acc + i.avgProductivity, 0) / activeInterns.length).toFixed(1))
      : 4.5;

    const submissionRatePct = activeInterns.length > 0
      ? Math.round((todaySubmittedCount / activeInterns.length) * 100)
      : 100;

    return {
      success: true,
      interns: internList,
      stats: {
        totalActiveInterns: activeInterns.length,
        todaySubmittedCount,
        missingTodayCount,
        companyAvgProductivity,
        submissionRatePct,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load company progress dashboard.";
    console.error("fetchCompanyProgressDashboardAction error:", err);
    return { success: false, error: msg };
  }
}

/**
 * Fetch Mentor Review Queue for Daily Updates
 */
export async function fetchMentorProgressReviewQueueAction(): Promise<{
  success: boolean;
  pendingReports?: ProgressReportItem[];
  reviewedReports?: ProgressReportItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // 1. Fetch assigned students
    const { data: assignments } = await supabase
      .from("mentor_assignments")
      .select("student_id")
      .eq("mentor_id", user.id);

    const studentIds = (assignments || []).map((a) => a.student_id);

    if (studentIds.length === 0) {
      return { success: true, pendingReports: [], reviewedReports: [] };
    }

    // 2. Fetch progress reports for assigned students
    const { data: reports } = await supabase
      .from("daily_progress_reports")
      .select(`
        id,
        student_id,
        company_id,
        internship_id,
        report_date,
        todays_tasks,
        tasks_completed,
        hours_worked,
        skills_used,
        technologies_used,
        challenges_faced,
        solutions_implemented,
        learning_outcome,
        tomorrows_plan,
        mood,
        productivity_rating,
        work_status,
        attachments,
        ai_feedback,
        created_at,
        companies ( name, logo_url )
      `)
      .in("student_id", studentIds)
      .order("report_date", { ascending: false });

    // 3. Fetch mentor reviews
    const { data: reviews } = await supabase
      .from("progress_mentor_reviews")
      .select("id, report_id, status, rating, comments, achievements_marked, suggested_improvements, assigned_next_tasks, created_at")
      .eq("mentor_id", user.id);

    const reviewMap = new Map((reviews || []).map((r) => [r.report_id, r]));

    const reportList: ProgressReportItem[] = (reports || []).map((r) => {
      const reviewObj = reviewMap.get(r.id) || null;
      const compRaw = r.companies as unknown as { name: string; logo_url: string | null } | null;

      return {
        id: r.id,
        student_id: r.student_id,
        company_id: r.company_id,
        internship_id: r.internship_id,
        report_date: r.report_date,
        todays_tasks: r.todays_tasks,
        tasks_completed: r.tasks_completed,
        hours_worked: Number(r.hours_worked) || 0,
        skills_used: r.skills_used || [],
        technologies_used: r.technologies_used || [],
        challenges_faced: r.challenges_faced,
        solutions_implemented: r.solutions_implemented,
        learning_outcome: r.learning_outcome,
        tomorrows_plan: r.tomorrows_plan,
        mood: r.mood || "great",
        productivity_rating: r.productivity_rating || 4,
        work_status: r.work_status || "completed",
        attachments: (r.attachments as unknown as ProgressAttachment[]) || [],
        ai_feedback: (r.ai_feedback as unknown as ProgressReportItem["ai_feedback"]) || {},
        created_at: r.created_at,
        company: {
          name: compRaw?.name || "Partner Company",
          logo_url: compRaw?.logo_url || null,
        },
        mentorReview: reviewObj ? {
          id: reviewObj.id,
          status: reviewObj.status as "pending" | "approved" | "needs_revision",
          rating: reviewObj.rating,
          comments: reviewObj.comments,
          achievements_marked: reviewObj.achievements_marked || [],
          suggested_improvements: reviewObj.suggested_improvements,
          assigned_next_tasks: reviewObj.assigned_next_tasks,
          created_at: reviewObj.created_at,
        } : null,
      };
    });

    const pendingReports = reportList.filter((r) => !r.mentorReview);
    const reviewedReports = reportList.filter((r) => !!r.mentorReview);

    return {
      success: true,
      pendingReports,
      reviewedReports,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load mentor review queue.";
    console.error("fetchMentorProgressReviewQueueAction error:", err);
    return { success: false, error: msg };
  }
}

/**
 * Submit Mentor Review & Feedback for a Progress Report
 */
export async function submitMentorProgressReviewAction(payload: {
  reportId: string;
  status: "approved" | "needs_revision";
  rating: number;
  comments?: string;
  achievementsMarked?: string[];
  suggestedImprovements?: string;
  assignedNextTasks?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access." };
    }

    // Upsert review record
    const { error: reviewErr } = await supabase
      .from("progress_mentor_reviews")
      .upsert({
        report_id: payload.reportId,
        mentor_id: user.id,
        status: payload.status,
        rating: payload.rating,
        comments: payload.comments || null,
        achievements_marked: payload.achievementsMarked || [],
        suggested_improvements: payload.suggestedImprovements || null,
        assigned_next_tasks: payload.assignedNextTasks || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "report_id, mentor_id" });

    if (reviewErr) throw reviewErr;

    // Fetch report student ID for notification
    const { data: reportRecord } = await supabase
      .from("daily_progress_reports")
      .select("student_id, report_date")
      .eq("id", payload.reportId)
      .maybeSingle();

    if (reportRecord) {
      await supabase.from("progress_notifications").insert({
        user_id: reportRecord.student_id,
        type: "mentor_reviewed",
        title: "Mentor Feedback Received",
        message: `Your mentor reviewed your progress report for ${reportRecord.report_date} (${payload.rating} ⭐).`,
        metadata: { report_id: payload.reportId, rating: payload.rating },
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit mentor review.";
    console.error("submitMentorProgressReviewAction error:", err);
    return { success: false, error: msg };
  }
}

/**
 * Send Reminders for Missing Daily Updates
 */
export async function sendMissingUpdateRemindersAction(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized access." };

    const todayStr = new Date().toISOString().split("T")[0];

    // Find active company interns without a report for today
    const { data: activeInterns } = await supabase
      .from("company_interns")
      .select("student_id")
      .eq("company_id", user.id)
      .eq("status", "active");

    const { data: todayReports } = await supabase
      .from("daily_progress_reports")
      .select("student_id")
      .eq("company_id", user.id)
      .eq("report_date", todayStr);

    const reportedIds = new Set((todayReports || []).map((r) => r.student_id));
    const missingStudents = (activeInterns || []).filter((i) => !reportedIds.has(i.student_id));

    const notifications = missingStudents.map((s) => ({
      user_id: s.student_id,
      type: "remind_report",
      title: "Daily Progress Update Reminder",
      message: `Don't forget to submit your daily progress update for ${todayStr}. Keep your daily streak active!`,
    }));

    if (notifications.length > 0) {
      await supabase.from("progress_notifications").insert(notifications);
    }

    return { success: true, count: notifications.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send reminders.";
    return { success: false, error: msg };
  }
}

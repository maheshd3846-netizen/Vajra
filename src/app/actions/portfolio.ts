"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generatePortfolioContentWithGemini,
  type PortfolioProfile,
  type GeneratedPortfolioContent,
  type PortfolioTheme,
} from "@/lib/ai-portfolio-service";
import { calculateCareerDnaScores } from "@/lib/ai-career-dna-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublishPortfolioResponse {
  success: boolean;
  error?: string;
}

interface PublicPortfolioData {
  title: string;
  description: string | null;
  slug: string;
  generatedContent: GeneratedPortfolioContent | null;
  student: {
    fullName: string;
    major: string | null;
    university: string | null;
    gpa: number | null;
    gradYear: number | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
  };
  skills: { skill_name: string; proficiency: string; verified: boolean }[];
  projects: {
    id: string;
    title: string;
    description: string | null;
    technologies: string[];
    github_url: string | null;
    project_url: string | null;
  }[];
  certificates: {
    id: string;
    name: string;
    issuer: string;
    issue_date: string;
    credential_url: string | null;
  }[];
  resumes: { id: string; name: string; file_url: string; is_primary: boolean }[];
  careerTimeline: {
    event_type: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
  }[];
  careerDna: {
    score: number;
    readinessScore: number;
    confidenceLevel: string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGeneratedContent(
  description: string | null
): GeneratedPortfolioContent | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description);
    // Check it's a GeneratedPortfolioContent object
    if (parsed && typeof parsed === "object" && "content" in parsed && "theme" in parsed) {
      return parsed as GeneratedPortfolioContent;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Existing Action (unchanged API) ─────────────────────────────────────────

export async function publishPortfolioAction(
  slug: string,
  title: string,
  description: string
): Promise<PublishPortfolioResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    if (!cleanSlug) {
      return { success: false, error: "Invalid URL slug context." };
    }

    // Check if the slug is already taken by another user
    const { data: existingSlug } = await supabase
      .from("portfolios")
      .select("student_id")
      .eq("asset_url", cleanSlug)
      .single();

    if (existingSlug && existingSlug.student_id !== user.id) {
      return { success: false, error: "Subdomain slug already taken by another student." };
    }

    // Check if user already published a portfolio
    const { data: existingPortfolio } = await supabase
      .from("portfolios")
      .select("id")
      .eq("student_id", user.id)
      .single();

    if (existingPortfolio) {
      const { error: updateError } = await supabase
        .from("portfolios")
        .update({ title, description, asset_url: cleanSlug })
        .eq("student_id", user.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("portfolios").insert({
        student_id: user.id,
        title,
        description,
        asset_url: cleanSlug,
      });
      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to publish developer portfolio.";
    console.error("publishPortfolioAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

// ─── NEW: AI Portfolio Generation Action ─────────────────────────────────────

export async function generatePortfolioAction(
  slug: string,
  theme: PortfolioTheme
): Promise<{ success: boolean; content?: GeneratedPortfolioContent; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized access. Please sign in." };
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    // — Aggregate full profile —
    const [
      { data: userProfile },
      { data: studentProfile },
      { data: skills },
      { data: projects },
      { data: resumes },
      { data: certificates },
      { data: careerTimeline },
      { data: aiReports },
      { data: mentorAssignment },
    ] = await Promise.all([
      supabase.from("users").select("full_name, email").eq("id", user.id).single(),
      supabase
        .from("student_profiles")
        .select("bio, major, university, gpa, cgpa, graduation_year, github_url, linkedin_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("student_skills")
        .select("skill_name, proficiency, verified")
        .eq("student_id", user.id),
      supabase
        .from("projects")
        .select("id, title, description, technologies, github_url, project_url")
        .eq("student_id", user.id),
      supabase
        .from("resumes")
        .select("id, name, file_url, is_primary")
        .eq("student_id", user.id),
      supabase
        .from("certificates")
        .select("id, name, issuer, issue_date, credential_url")
        .eq("student_id", user.id),
      supabase
        .from("career_timeline")
        .select("event_type, title, description, start_date, end_date")
        .eq("student_id", user.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("ai_reports")
        .select("report_type, content, score")
        .eq("student_id", user.id)
        .eq("report_type", "career_path")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("mentor_assignments")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
    ]);

    // Fetch mentor feedback if assignment exists
    let mentorFeedbackTexts: string[] = [];
    if (mentorAssignment?.id) {
      const { data: feedbackData } = await supabase
        .from("mentor_feedback")
        .select("feedback_text, rating")
        .eq("assignment_id", mentorAssignment.id)
        .limit(5);
      mentorFeedbackTexts =
        feedbackData?.map((f) => `Rating ${f.rating}/5: ${f.feedback_text}`) || [];
    }

    // Calculate Career DNA scores locally
    const activeSkills = skills || [];
    const activeProjects = projects || [];
    const activeResumes = resumes || [];
    const activeCertificates = certificates || [];
    const activePortfolios: { id?: string }[] = [];
    const activeTimeline = careerTimeline || [];

    const localScores = calculateCareerDnaScores({
      profile: studentProfile as Record<string, unknown> | null,
      skills: activeSkills,
      projects: activeProjects,
      resumes: activeResumes,
      certificates: activeCertificates,
      portfolios: activePortfolios,
      feedback: [],
      timeline: activeTimeline,
    });

    // Merge with stored AI report if available
    const latestAiReport = aiReports?.[0];
    const aiReportContent = latestAiReport?.content as Record<string, unknown> | null;

    // Extract hackathons from timeline
    const hackathons = activeTimeline
      .filter(
        (t) =>
          t.title.toLowerCase().includes("hackathon") ||
          t.event_type === "project"
      )
      .map((t) => t.title);

    // Extract achievements from timeline and certificates
    const achievements = [
      ...activeCertificates.map((c) => `${c.name} — ${c.issuer}`),
      ...activeTimeline
        .filter((t) => t.event_type === "certificate")
        .map((t) => t.title),
    ];

    // Build Portfolio Profile
    const portfolioProfile: PortfolioProfile = {
      student: {
        fullName: userProfile?.full_name || "Student",
        email: userProfile?.email,
        major: studentProfile?.major || null,
        university: studentProfile?.university || null,
        cgpa: studentProfile?.cgpa || null,
        gpa: studentProfile?.gpa || null,
        graduationYear: studentProfile?.graduation_year || null,
        bio: studentProfile?.bio || null,
        githubUrl: studentProfile?.github_url || null,
        linkedinUrl: studentProfile?.linkedin_url || null,
      },
      careerDna: {
        score: latestAiReport?.score
          ? Number(latestAiReport.score)
          : localScores.careerDnaScore,
        readinessScore: localScores.internshipReadinessScore,
        confidenceLevel: localScores.confidenceLevel,
        summary:
          typeof aiReportContent?.careerSummary === "string"
            ? aiReportContent.careerSummary
            : "",
        strengths: Array.isArray(aiReportContent?.topStrengths)
          ? (aiReportContent.topStrengths as string[])
          : [],
        weaknesses: Array.isArray(aiReportContent?.topWeaknesses)
          ? (aiReportContent.topWeaknesses as string[])
          : [],
        growthAreas: Array.isArray(aiReportContent?.growthAreas)
          ? (aiReportContent.growthAreas as string[])
          : [],
      },
      skills: activeSkills.map((s) => ({
        skill_name: s.skill_name,
        proficiency: s.proficiency,
        verified: s.verified ?? false,
      })),
      projects: activeProjects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || null,
        technologies: p.technologies || [],
        github_url: p.github_url || null,
        project_url: p.project_url || null,
      })),
      resumes: activeResumes.map((r) => ({
        id: r.id,
        name: r.name,
        file_url: r.file_url,
        is_primary: r.is_primary,
      })),
      certificates: activeCertificates.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issue_date: c.issue_date,
        credential_url: c.credential_url || null,
      })),
      achievements,
      hackathons,
      mentorFeedback: mentorFeedbackTexts,
      careerTimeline: activeTimeline.map((t) => ({
        event_type: t.event_type,
        title: t.title,
        description: t.description || null,
        start_date: t.start_date,
        end_date: t.end_date || null,
      })),
    };

    // Generate AI content
    const generatedContent = await generatePortfolioContentWithGemini(
      portfolioProfile,
      theme,
      cleanSlug
    );

    // Serialize and save to portfolios table
    const title = `${portfolioProfile.student.fullName}'s Portfolio`;
    const serialized = JSON.stringify(generatedContent);

    // Check for existing portfolio
    const { data: existing } = await supabase
      .from("portfolios")
      .select("id")
      .eq("student_id", user.id)
      .single();

    if (existing) {
      await supabase
        .from("portfolios")
        .update({ title, description: serialized, asset_url: cleanSlug })
        .eq("student_id", user.id);
    } else {
      await supabase.from("portfolios").insert({
        student_id: user.id,
        title,
        description: serialized,
        asset_url: cleanSlug,
      });
    }

    return { success: true, content: generatedContent };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to generate portfolio.";
    console.error("generatePortfolioAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

// ─── Public Portfolio Viewer Action ──────────────────────────────────────────

export async function getPublicPortfolioAction(
  username: string
): Promise<{ success: boolean; data?: PublicPortfolioData; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: portfolio, error: portError } = await supabase
      .from("portfolios")
      .select("id, student_id, title, description, asset_url")
      .eq("asset_url", username.toLowerCase())
      .single();

    if (portError || !portfolio) {
      return { success: false, error: "Developer portfolio not found." };
    }

    const studentId = portfolio.student_id;

    const [
      { data: studentProfile },
      { data: userProfile },
      { data: skills },
      { data: projects },
      { data: certificates },
      { data: resumes },
      { data: careerTimeline },
      { data: aiReports },
    ] = await Promise.all([
      supabase
        .from("student_profiles")
        .select("major, university, gpa, cgpa, graduation_year, github_url, linkedin_url")
        .eq("id", studentId)
        .single(),
      supabase.from("users").select("full_name").eq("id", studentId).single(),
      supabase
        .from("student_skills")
        .select("skill_name, proficiency, verified")
        .eq("student_id", studentId),
      supabase
        .from("projects")
        .select("id, title, description, technologies, github_url, project_url")
        .eq("student_id", studentId),
      supabase
        .from("certificates")
        .select("id, name, issuer, issue_date, credential_url")
        .eq("student_id", studentId),
      supabase
        .from("resumes")
        .select("id, name, file_url, is_primary")
        .eq("student_id", studentId),
      supabase
        .from("career_timeline")
        .select("event_type, title, description, start_date, end_date")
        .eq("student_id", studentId)
        .order("start_date", { ascending: false }),
      supabase
        .from("ai_reports")
        .select("score, content")
        .eq("student_id", studentId)
        .eq("report_type", "career_path")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    if (!studentProfile || !userProfile) {
      return { success: false, error: "Associated student profile not found." };
    }

    const localScores = calculateCareerDnaScores({
      profile: studentProfile as Record<string, unknown> | null,
      skills: skills || [],
      projects: projects || [],
      resumes: resumes || [],
      certificates: certificates || [],
      portfolios: [],
      feedback: [],
      timeline: careerTimeline || [],
    });

    const latestReport = aiReports?.[0];

    return {
      success: true,
      data: {
        title: portfolio.title,
        description: portfolio.description,
        slug: portfolio.asset_url,
        generatedContent: parseGeneratedContent(portfolio.description),
        student: {
          fullName: userProfile.full_name || "Vajra Engineer",
          major: studentProfile.major,
          university: studentProfile.university,
          gpa: studentProfile.gpa,
          gradYear: studentProfile.graduation_year,
          githubUrl: studentProfile.github_url,
          linkedinUrl: studentProfile.linkedin_url,
        },
        skills: (skills || []).map((s) => ({
          ...s,
          verified: s.verified ?? false,
        })),
        projects: (projects || []).map((p) => ({
          ...p,
          description: p.description || null,
          technologies: p.technologies || [],
          github_url: p.github_url || null,
          project_url: p.project_url || null,
        })),
        certificates: (certificates || []).map((c) => ({
          ...c,
          credential_url: c.credential_url || null,
        })),
        resumes: (resumes || []).map((r) => ({ ...r })),
        careerTimeline: (careerTimeline || []).map((t) => ({
          ...t,
          description: t.description || null,
          end_date: t.end_date || null,
        })),
        careerDna: {
          score: latestReport?.score
            ? Number(latestReport.score)
            : localScores.careerDnaScore,
          readinessScore: localScores.internshipReadinessScore,
          confidenceLevel: localScores.confidenceLevel,
        },
      },
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to retrieve public developer portfolio.";
    console.error("getPublicPortfolioAction failed:", err);
    return { success: false, error: errorMessage };
  }
}

// ─── Profile Hash Check Action ────────────────────────────────────────────────

export async function getPortfolioStatusAction(): Promise<{
  hasPortfolio: boolean;
  currentHash: string;
  savedHash: string | null;
  isOutdated: boolean;
  slug: string | null;
  theme: PortfolioTheme | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        hasPortfolio: false,
        currentHash: "",
        savedHash: null,
        isOutdated: false,
        slug: null,
        theme: null,
      };
    }

    const [
      { data: studentProfile },
      { data: skills },
      { data: projects },
      { data: resumes },
      { data: certificates },
      { data: timeline },
      { data: portfolio },
    ] = await Promise.all([
      supabase
        .from("student_profiles")
        .select("major, university, gpa")
        .eq("id", user.id)
        .single(),
      supabase.from("student_skills").select("skill_name").eq("student_id", user.id),
      supabase.from("projects").select("id").eq("student_id", user.id),
      supabase.from("resumes").select("id").eq("student_id", user.id),
      supabase.from("certificates").select("id").eq("student_id", user.id),
      supabase.from("career_timeline").select("id").eq("student_id", user.id),
      supabase
        .from("portfolios")
        .select("asset_url, description")
        .eq("student_id", user.id)
        .single(),
    ]);

    const currentHash = [
      (skills || []).length,
      (projects || []).length,
      (resumes || []).length,
      (certificates || []).length,
      (timeline || []).length,
      studentProfile?.major ?? "",
      studentProfile?.university ?? "",
    ].join("|");

    const generatedContent = parseGeneratedContent(portfolio?.description || null);
    const savedHash = generatedContent?.profileHash || null;

    return {
      hasPortfolio: !!portfolio,
      currentHash,
      savedHash,
      isOutdated: !!savedHash && savedHash !== currentHash,
      slug: portfolio?.asset_url || null,
      theme: generatedContent?.theme || null,
    };
  } catch {
    return {
      hasPortfolio: false,
      currentHash: "",
      savedHash: null,
      isOutdated: false,
      slug: null,
      theme: null,
    };
  }
}

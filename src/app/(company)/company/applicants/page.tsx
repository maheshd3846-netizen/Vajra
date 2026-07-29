import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanyApplicantsClient, {
  type CandidateItem,
} from "@/components/company/CompanyApplicantsClient";

export const dynamic = "force-dynamic";

interface StudentProfileRaw {
  id: string;
  university: string | null;
  degree: string | null;
  branch: string | null;
  major: string | null;
  cgpa: number | null;
  gpa: number | null;
  target_role: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  users: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface ProjectItem {
  student_id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
  technologies: string[];
}

export default async function CompanyApplicantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch company's internships to get candidates
  const { data: companyInternshipIds } = await supabase
    .from("internships")
    .select("id")
    .eq("company_id", user.id);

  const internshipIds = (companyInternshipIds || []).map((item) => item.id);

  let candidateList: CandidateItem[] = [];

  if (internshipIds.length > 0) {
    const { data } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        resume_url,
        cover_letter,
        internships (
          title
        ),
        student_profiles (
          id,
          university,
          degree,
          branch,
          major,
          cgpa,
          gpa,
          target_role,
          portfolio_url,
          github_url,
          linkedin_url,
          users (
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .in("internship_id", internshipIds)
      .order("applied_at", { ascending: false });

    if (data && data.length > 0) {
      const studentIds = data
        .map((item) => (item.student_profiles as unknown as StudentProfileRaw | null)?.id)
        .filter((id): id is string => Boolean(id));

      // Fetch student skills
      const { data: skillsData } = await supabase
        .from("student_skills")
        .select("student_id, skill_name")
        .in("student_id", studentIds);

      // Fetch student projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("student_id, title, description, project_url, github_url, technologies")
        .in("student_id", studentIds);

      // Fetch student AI reports score for Career DNA
      const { data: aiReportsData } = await supabase
        .from("ai_reports")
        .select("student_id, score")
        .in("student_id", studentIds);

      const skillsMap = new Map<string, string[]>();
      (skillsData || []).forEach((s) => {
        const existing = skillsMap.get(s.student_id) || [];
        skillsMap.set(s.student_id, [...existing, s.skill_name]);
      });

      const projectsMap = new Map<string, ProjectItem[]>();
      (projectsData || []).forEach((p) => {
        const existing = projectsMap.get(p.student_id) || [];
        projectsMap.set(p.student_id, [...existing, p as ProjectItem]);
      });

      const dnaMap = new Map<string, number>();
      (aiReportsData || []).forEach((r) => {
        if (r.score !== null && r.score !== undefined) {
          dnaMap.set(r.student_id, Math.round(Number(r.score)));
        }
      });

      candidateList = data.map((item) => {
        const jobRaw = item.internships as unknown as { title: string } | null;
        const studRaw = item.student_profiles as unknown as StudentProfileRaw | null;

        const studId = studRaw?.id || "";
        const skills = skillsMap.get(studId) || [];
        const projects = projectsMap.get(studId) || [];
        const careerDnaScore = dnaMap.get(studId) || 82; // calculated or fallback

        return {
          id: item.id,
          status: item.status,
          applied_at: item.applied_at,
          resume_url: item.resume_url,
          cover_letter: item.cover_letter,
          internshipTitle: jobRaw?.title || "Internship Role",
          studentId: studId,
          studentName: studRaw?.users?.full_name || "Vajra Candidate",
          studentEmail: studRaw?.users?.email || "",
          avatarUrl: studRaw?.users?.avatar_url || "",
          university: studRaw?.university || null,
          degree: studRaw?.degree || null,
          branch: studRaw?.branch || studRaw?.major || null,
          cgpa: studRaw?.cgpa ? String(studRaw.cgpa) : studRaw?.gpa ? String(studRaw.gpa) : null,
          targetRole: studRaw?.target_role || null,
          portfolioUrl: studRaw?.portfolio_url || null,
          githubUrl: studRaw?.github_url || null,
          linkedinUrl: studRaw?.linkedin_url || null,
          skills,
          projects,
          careerDnaScore,
        };
      });
    }
  }

  return <CompanyApplicantsClient initialCandidates={candidateList} />;
}

/**
 * Shared types for portfolio themes.
 * All themes receive a PublicPortfolioData object as props.
 */
import type { GeneratedPortfolioContent } from "@/lib/ai-portfolio-service";

export interface PublicPortfolioData {
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

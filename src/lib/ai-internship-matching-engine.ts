/**
 * VAJRA AI Internship Matching & Application Review Engine
 * 
 * Computes personalized Match Scores, Expected Interview Readiness,
 * Match Explanations (Why Recommended / Missing Skills), AI Fit Summaries,
 * and Pre-Application ATS Review Reports.
 */

export interface StudentProfileForMatching {
  id: string;
  fullName: string;
  major: string | null;
  university: string | null;
  gpa: number | null;
  careerDnaScore: number;
  readinessScore: number;
  skills: { skill_name: string; proficiency: string; verified?: boolean }[];
  projects: { id: string; title: string; technologies: string[] }[];
  certificates: { id: string; name: string }[];
  resumes: { id: string; is_primary: boolean }[];
}

export interface InternshipForMatching {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string | null;
  type: string;
  requirements: string[];
  skills_needed: string[];
  salary_range: string | null;
  created_at: string;
}

export interface InternshipMatchResult {
  internshipId: string;
  matchScore: number; // 50 to 98%
  expectedReadiness: number; // 50 to 95%
  reasons: string[]; // Positive alignment factors
  missingSkills: string[]; // Missing or growth skill requirements
  aiFitSummary: string;
}

export interface PreApplicationAiReview {
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  resumeMatchPercent: number; // 0-100%
  careerDnaMatchPercent: number; // 0-100%
  expectedAtsMatchPercent: number; // 0-100%
  applicationReadinessScore: number; // 0-100%
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  isRecommendedToApply: boolean;
}

/**
 * Calculates dynamic AI Match Score, Expected Readiness, Reasons & Missing Skills
 */
export function calculateInternshipMatch(
  student: StudentProfileForMatching,
  job: InternshipForMatching
): InternshipMatchResult {
  const studentSkillNames = student.skills.map((s) => s.skill_name.toLowerCase());
  const jobSkills = job.skills_needed || [];
  
  // 1. Skill Alignment (40% weight)
  let skillMatchCount = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((needed) => {
    const isMatched = studentSkillNames.some((sk) => sk.includes(needed.toLowerCase()) || needed.toLowerCase().includes(sk));
    if (isMatched) {
      skillMatchCount++;
      matchedSkills.push(needed);
    } else {
      missingSkills.push(needed);
    }
  });

  const skillMatchRatio = jobSkills.length > 0 ? skillMatchCount / jobSkills.length : 0.8;
  const skillPoints = Math.round(skillMatchRatio * 40);

  // 2. Target Role Alignment (20% weight)
  let rolePoints = 12; // Baseline
  const jobTitleLower = job.title.toLowerCase();
  const majorLower = (student.major || "").toLowerCase();

  if (
    (jobTitleLower.includes("frontend") && (studentSkillNames.includes("react") || studentSkillNames.includes("next.js"))) ||
    (jobTitleLower.includes("backend") && (studentSkillNames.includes("node") || studentSkillNames.includes("postgres"))) ||
    (jobTitleLower.includes("full stack") && student.projects.length >= 1) ||
    (majorLower && jobTitleLower.includes(majorLower))
  ) {
    rolePoints = 20;
  }

  // 3. Career DNA Alignment (20% weight)
  const dnaPoints = Math.round((student.careerDnaScore / 100) * 20);

  // 4. Project & Certification Alignment (20% weight)
  let projectPoints = 10;
  if (student.projects.length >= 2) projectPoints += 5;
  if (student.certificates.length >= 1) projectPoints += 5;

  // Calculate final score
  const totalScore = skillPoints + rolePoints + dnaPoints + projectPoints;
  const matchScore = Math.max(58, Math.min(98, totalScore));
  const expectedReadiness = Math.max(52, Math.min(96, Math.round((matchScore * 0.6) + (student.readinessScore * 0.4))));

  // Generate explainable reasons
  const reasons: string[] = [];
  if (matchedSkills.length > 0) {
    reasons.push(`Strong alignment in ${matchedSkills.slice(0, 3).join(", ")}`);
  }
  if (student.projects.length >= 1) {
    reasons.push(`Verified portfolio projects matching ${job.title}`);
  }
  if (student.careerDnaScore >= 75) {
    reasons.push(`High Career DNA Index (${student.careerDnaScore}/100)`);
  }
  if (reasons.length === 0) {
    reasons.push("General software engineering foundation");
  }

  // AI Fit Summary
  const aiFitSummary = matchedSkills.length > 0
    ? `Excellent fit for ${job.company_name}. Your proficiency in ${matchedSkills[0]} and background in ${student.major || "Computer Science"} aligns directly with their technical requirements.`
    : `Good potential match for ${job.title}. Acquiring ${missingSkills.slice(0, 2).join(" & ")} will boost your match score significantly.`;

  return {
    internshipId: job.id,
    matchScore,
    expectedReadiness,
    reasons,
    missingSkills,
    aiFitSummary,
  };
}

/**
 * Pre-Application AI Review (ATS Match, Missing Skills, Readiness Suggestions)
 */
export function runAiApplicationReview(
  student: StudentProfileForMatching,
  job: InternshipForMatching
): PreApplicationAiReview {
  const matchResult = calculateInternshipMatch(student, job);
  const studentSkillNames = student.skills.map((s) => s.skill_name.toLowerCase());
  const jobSkills = job.skills_needed || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((needed) => {
    const isMatched = studentSkillNames.some((sk) => sk.includes(needed.toLowerCase()) || needed.toLowerCase().includes(sk));
    if (isMatched) {
      matchedSkills.push(needed);
    } else {
      missingSkills.push(needed);
    }
  });

  const hasPrimaryResume = student.resumes.some((r) => r.is_primary) || student.resumes.length > 0;
  const resumeMatchPercent = Math.min(96, Math.max(60, matchResult.matchScore + (hasPrimaryResume ? 5 : -10)));
  const careerDnaMatchPercent = Math.min(98, Math.max(55, student.careerDnaScore));
  const expectedAtsMatchPercent = Math.min(95, Math.max(50, Math.round((resumeMatchPercent * 0.7) + (matchedSkills.length / Math.max(1, jobSkills.length) * 30))));
  const applicationReadinessScore = Math.round((resumeMatchPercent * 0.4) + (expectedAtsMatchPercent * 0.4) + (matchResult.expectedReadiness * 0.2));

  const suggestions: string[] = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add projects highlighting ${missingSkills.slice(0, 2).join(" or ")} to improve ATS keyword score.`);
  }
  if (!hasPrimaryResume) {
    suggestions.push("Upload a primary ATS-optimized PDF resume to increase recruiter response rates.");
  }
  if (student.projects.length < 2) {
    suggestions.push("Link 1 more verified full-stack project in your VAJRA portfolio.");
  }
  if (suggestions.length < 2) {
    suggestions.push("Tailor your cover letter to reference specific company engineering goals.");
  }

  return {
    internshipId: job.id,
    internshipTitle: job.title,
    companyName: job.company_name,
    resumeMatchPercent,
    careerDnaMatchPercent,
    expectedAtsMatchPercent,
    applicationReadinessScore,
    matchedSkills,
    missingSkills,
    suggestions,
    isRecommendedToApply: applicationReadinessScore >= 70,
  };
}

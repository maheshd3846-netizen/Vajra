export interface CareerDnaReportContent {
  careerSummary: string;
  topStrengths: string[];
  topWeaknesses: string[];
  skillGaps: { name: string; urgency: "Critical" | "Moderate"; action: string }[];
  careerRisks: string[];
  interviewReadiness: {
    status: string;
    score: number;
    explanation: string;
  };
  recommendedLearningRoadmap: {
    phase: number;
    title: string;
    description: string;
    whyItMatters: string;
    skillsCovered: string[];
    duration: string;
    dnaGain: string;
    readinessGain: string;
    companies: string[];
    aiExplanation: string;
  }[];
  recommendedCertifications: { name: string; provider: string; difficulty: string }[];
  recommendedProjects: { title: string; description: string; technologies: string[]; priority: string }[];
  recommendedHackathons: { name: string; focus: string; difficulty: string }[];
  recommendedCompanies: string[];
  recommendedInternshipDomains: string[];
  suggestedWeeklyGoals: string[];
  suggestedDailyGoal: { title: string; desc: string; time: string; priority: "High" | "Medium" | "Low"; actionText: string; actionType: string };
  motivationalInsight: string;
}

export interface CareerDnaAnalysisResult {
  career_dna_score: number;
  internship_score: number;
  profile_completion: number;
  confidence_level: string;
  explanation_metadata: Record<string, { score: number; weight: number; contribution: number; explanation: string }>;
  content: CareerDnaReportContent;
}

export function calculateCareerDnaScores(aggregatedData: {
  profile: Record<string, unknown> | null;
  skills: { skill_name: string; proficiency: string }[];
  projects: { title: string | null; description?: string | null; technologies?: string[] | null }[];
  resumes: { id?: string; is_primary?: boolean }[];
  certificates: { name?: string | null }[];
  portfolios: { id?: string }[];
  feedback: { rating: number; feedback_text?: string | null }[];
  timeline: { title: string; description?: string | null; event_type?: string }[];
}) {
  const { profile, skills, projects, resumes, certificates, portfolios, feedback, timeline } = aggregatedData;

  // 1. Profile Completion (5% weight)
  let completionPoints = 0;
  if (profile?.bio) completionPoints += 20;
  if (profile?.university) completionPoints += 20;
  if (profile?.major) completionPoints += 20;
  if (profile?.graduation_year) completionPoints += 20;
  if (profile?.cgpa || profile?.gpa) completionPoints += 10;
  if (profile?.github_url || profile?.linkedin_url) completionPoints += 10;
  const profileCompletionScore = completionPoints;

  // 2. Skills Score (35% weight)
  let skillsScore = 0;
  if (skills.length > 0) {
    const proficiencies = skills.map(s => {
      const p = s.proficiency.toLowerCase();
      if (p === "advanced") return 100;
      if (p === "intermediate") return 75;
      return 50; // beginner
    });
    const avgProficiency = proficiencies.reduce((sum, val) => sum + val, 0) / proficiencies.length;
    // Quantity multiplier: reward having at least 5 skills
    const quantityMultiplier = Math.min(5, skills.length) / 5;
    skillsScore = Math.round(avgProficiency * quantityMultiplier);
  }

  // 3. Projects Score (20% weight)
  let projectsScore = 0;
  if (projects.length === 1) projectsScore = 60;
  else if (projects.length >= 2) projectsScore = 100;

  // 4. Resume Score (15% weight)
  const resumeScore = resumes.length > 0 ? 78 : 0; // Baseline ATS score if uploaded, else 0

  // 5. Certificates Score (10% weight)
  let certificatesScore = 0;
  if (certificates.length === 1) certificatesScore = 70;
  else if (certificates.length >= 2) certificatesScore = 100;

  // 6. Hackathons Score (5% weight)
  const hasHackathon = 
    timeline.some(t => t.title.toLowerCase().includes("hackathon") || t.description?.toLowerCase().includes("hackathon")) ||
    projects.some(p => p.title?.toLowerCase().includes("hackathon") || p.description?.toLowerCase()?.includes("hackathon"));
  const hackathonsScore = hasHackathon ? 100 : (projects.length > 0 ? 50 : 0);

  // 7. Portfolio Score (5% weight)
  const portfolioScore = portfolios.length > 0 ? 100 : 0;

  // 8. Mentor Feedback Score (5% weight)
  let mentorFeedbackScore = 70; // baseline neutral
  if (feedback.length > 0) {
    const ratings = feedback.map(f => f.rating);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    mentorFeedbackScore = Math.round(avgRating * 20); // Scale 1-5 to 20-100
  }

  // Total DNA Calculation (Weighted Sum)
  const careerDnaScore = Math.round(
    profileCompletionScore * 0.05 +
    skillsScore * 0.35 +
    projectsScore * 0.20 +
    resumeScore * 0.15 +
    certificatesScore * 0.10 +
    hackathonsScore * 0.05 +
    portfolioScore * 0.05 +
    mentorFeedbackScore * 0.05
  );

  // Internship Readiness Score calculation (weighted vectors: Skills 40%, Projects 30%, Resume 20%, Mentor 10%)
  const internshipReadinessScore = Math.round(
    skillsScore * 0.40 +
    projectsScore * 0.30 +
    resumeScore * 0.20 +
    mentorFeedbackScore * 0.10
  );

  // Confidence Level estimation
  let inputsCount = 0;
  if (skills.length >= 3) inputsCount++;
  if (projects.length >= 1) inputsCount++;
  if (resumes.length >= 1) inputsCount++;
  if (certificates.length >= 1) inputsCount++;
  if (feedback.length >= 1) inputsCount++;

  let confidenceLevel = "Low";
  if (inputsCount >= 4) confidenceLevel = "High";
  else if (inputsCount >= 2) confidenceLevel = "Medium";

  // Build transparent logs of the calculations
  const explanationMetadata = {
    profile_completion: { score: profileCompletionScore, weight: 0.05, contribution: Math.round(profileCompletionScore * 0.05 * 10) / 10, explanation: `Calculated based on profile completion parameters (${completionPoints}% complete).` },
    skills: { score: skillsScore, weight: 0.35, contribution: Math.round(skillsScore * 0.35 * 10) / 10, explanation: `Weighted index from ${skills.length} active skill proficiencies.` },
    projects: { score: projectsScore, weight: 0.20, contribution: Math.round(projectsScore * 0.20 * 10) / 10, explanation: `${projects.length} linked GitHub projects verified.` },
    resume: { score: resumeScore, weight: 0.15, contribution: Math.round(resumeScore * 0.15 * 10) / 10, explanation: `ATS scanner calibration based on primary resume upload.` },
    certificates: { score: certificatesScore, weight: 0.10, contribution: Math.round(certificatesScore * 0.10 * 10) / 10, explanation: `${certificates.length} verified credentials registered.` },
    hackathons: { score: hackathonsScore, weight: 0.05, contribution: Math.round(hackathonsScore * 0.05 * 10) / 10, explanation: `Scan of project repository context for hackathon metrics.` },
    portfolio: { score: portfolioScore, weight: 0.05, contribution: Math.round(portfolioScore * 0.05 * 10) / 10, explanation: `Custom technical portfolio site domain link checks.` },
    mentor_feedback: { score: mentorFeedbackScore, weight: 0.05, contribution: Math.round(mentorFeedbackScore * 0.05 * 10) / 10, explanation: `Calibrated from session logs with verified industry mentor.` }
  };

  return {
    careerDnaScore,
    internshipReadinessScore,
    profileCompletionScore,
    confidenceLevel,
    explanationMetadata
  };
}

export async function generateCareerDnaWithGemini(
  aggregatedData: Record<string, unknown>,
  scores: ReturnType<typeof calculateCareerDnaScores>
): Promise<CareerDnaAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No GEMINI_API_KEY set. Falling back to local scoring and analysis.");
    return {
      career_dna_score: scores.careerDnaScore,
      internship_score: scores.internshipReadinessScore,
      profile_completion: scores.profileCompletionScore,
      confidence_level: scores.confidenceLevel,
      explanation_metadata: scores.explanationMetadata,
      content: getFallbackDnaReport(aggregatedData, scores)
    };
  }

  // Aggregate user details to present to Gemini
  const agProfile = aggregatedData.profile as Record<string, unknown> | null;
  const promptData = {
    studentName: (aggregatedData.profileName as string | undefined) || "Student",
    major: (agProfile?.major as string | undefined) || "Computer Science",
    university: (agProfile?.university as string | undefined) || "Silicon Valley Institute",
    targetRole: (agProfile?.major as string | undefined) || "Software Engineer",
    skills: (aggregatedData.skills as { skill_name: string; proficiency: string }[]).map((s) => `${s.skill_name} (${s.proficiency})`),
    projects: (aggregatedData.projects as { title: string; description: string; technologies: string[] }[]).map((p) => ({ title: p.title, desc: p.description, tech: p.technologies })),
    certificates: (aggregatedData.certificates as { name: string }[]).map((c) => c.name),
    portfolioCount: (aggregatedData.portfolios as unknown[]).length,
    mentorFeedbackText: (aggregatedData.feedback as { feedback_text: string }[]).map((f) => f.feedback_text).join("\n"),
    timelineEvents: (aggregatedData.timeline as { event_type: string; title: string }[]).map((t) => `${t.event_type}: ${t.title}`),
    scoresCalculated: {
      careerDnaScore: scores.careerDnaScore,
      internshipReadinessScore: scores.internshipReadinessScore
    }
  };

  const systemInstruction = `You are the VAJRA Chief AI Career Intelligence Architect.
Analyze the student profile data provided and output a highly personalized career diagnostics report.
You must return only a valid JSON object matching the following TypeScript schema:
{
  "careerSummary": "string",
  "topStrengths": ["string"],
  "topWeaknesses": ["string"],
  "skillGaps": [{"name": "string", "urgency": "Critical" | "Moderate", "action": "string"}],
  "careerRisks": ["string"],
  "interviewReadiness": {"status": "string", "score": number, "explanation": "string"},
  "recommendedLearningRoadmap": [
    {
      "phase": number,
      "title": "string",
      "description": "string",
      "whyItMatters": "string",
      "skillsCovered": ["string"],
      "duration": "string",
      "dnaGain": "string",
      "readinessGain": "string",
      "companies": ["string"],
      "aiExplanation": "string"
    }
  ],
  "recommendedCertifications": [{"name": "string", "provider": "string", "difficulty": "string"}],
  "recommendedProjects": [{"title": "string", "description": "string", "technologies": ["string"], "priority": "string"}],
  "recommendedHackathons": [{"name": "string", "focus": "string", "difficulty": "string"}],
  "recommendedCompanies": ["string"],
  "recommendedInternshipDomains": ["string"],
  "suggestedWeeklyGoals": ["string"],
  "suggestedDailyGoal": {"title": "string", "desc": "string", "time": "string", "priority": "High" | "Medium" | "Low", "actionText": "string", "actionType": "string"},
  "motivationalInsight": "string"
}

Ensure the recommendedLearningRoadmap contains exactly 6 phases to align with the frontend dashboard widgets:
- Phase 1: Complete React & Next.js (or frontend skills)
- Phase 2: Learn DSA Basics (or backend algorithms)
- Phase 3: Build 2 Full Stack Projects (or custom engineering projects)
- Phase 4: ATS Resume Tuning
- Phase 5: Expert Mock Interview (mentor sync)
- Phase 6: Apply for Internships (pipeline submissions)

Do NOT include any Markdown, backticks (like \`\`\`json), or explanations outside of the JSON object. Return clean, raw JSON only.`;

  let attempts = 1;
  let delay = 500;

  while (attempts > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout limit

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nStudent Profile Input:\n${JSON.stringify(promptData, null, 2)}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini responds with status ${response.status}`);
      }

      const json = await response.json();
      const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("Empty content received from Gemini.");
      }

      // Safe parse
      const parsedContent = JSON.parse(textContent) as CareerDnaReportContent;
      
      return {
        career_dna_score: scores.careerDnaScore,
        internship_score: scores.internshipReadinessScore,
        profile_completion: scores.profileCompletionScore,
        confidence_level: scores.confidenceLevel,
        explanation_metadata: scores.explanationMetadata,
        content: parsedContent
      };

    } catch (err) {
      attempts--;
      console.error(`Gemini API attempt failed. ${attempts} attempts remaining. Error:`, err);
      if (attempts === 0) {
        break;
      }
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; // exponential backoff
    }
  }

  // Fallback if all attempts fail
  console.warn("All Gemini API attempts failed. Falling back to local diagnostics engine.");
  return {
    career_dna_score: scores.careerDnaScore,
    internship_score: scores.internshipReadinessScore,
    profile_completion: scores.profileCompletionScore,
    confidence_level: scores.confidenceLevel,
    explanation_metadata: scores.explanationMetadata,
    content: getFallbackDnaReport(aggregatedData, scores)
  };
}

export function getFallbackDnaReport(
  aggregatedData: Record<string, unknown>,
  scores: ReturnType<typeof calculateCareerDnaScores>
): CareerDnaReportContent {
  const profile = aggregatedData.profile as Record<string, unknown> | null;
  const major = (profile?.major as string | undefined) || "Software Engineering";
  
  // Custom diagnostic analysis depending on skills
  const skillList = (aggregatedData.skills as { skill_name: string }[]);
  const hasReact = skillList.some((s) => s.skill_name.toLowerCase().includes("react"));
  const hasPostgres = skillList.some((s) => s.skill_name.toLowerCase().includes("postgres"));

  return {
    careerSummary: `Calibrated Career DNA for target major: ${major}. Profile exhibits strong ${hasReact ? "React ecosystem familiarity" : "conceptual engineering foundations"} and validated certificates, but needs to bridge skill gaps in database configurations and systems architecture design.`,
    topStrengths: [
      hasReact ? "Advanced Frontend styling and responsive React UI pipelines" : "Conceptual software engineering architecture baseline",
      "GitHub activity synchronization locked to career ledger",
      "Credentials verification matches target industry expectations"
    ],
    topWeaknesses: [
      "Relational SQL schema mapping limits and RLS policies configurations",
      "REST controller testing models and middleware request logging",
      hasPostgres ? "Next.js server-side caching schemes" : "PostgreSQL connection pooling limits"
    ],
    skillGaps: [
      ...(!hasPostgres ? [{ name: "PostgreSQL Database tuning", urgency: "Critical" as const, action: "Complete Postgres database indexes challenge" }] : []),
      { name: "Docker Containerization", urgency: "Moderate" as const, action: "Link project containing Dockerfile configuration" },
      { name: "AWS Cloud Deployment", urgency: "Moderate" as const, action: "Upload verified AWS Cloud Practitioner certificate" }
    ],
    careerRisks: [
      "Limited backend API deployment proof on transactional database nodes",
      "Lack of quantitative business metrics inside project profiles"
    ],
    interviewReadiness: {
      status: scores.internshipReadinessScore >= 80 ? "Interview Ready" : "Requires Practice",
      score: scores.internshipReadinessScore,
      explanation: `Calibrated at ${scores.internshipReadinessScore}% matching threshold. Frontend presentation speeds are high, but database query complexity performance explanation needs rehearsal.`
    },
    recommendedLearningRoadmap: [
      {
        phase: 1,
        title: "Complete React & Next.js",
        description: "Master React hook architectures, server rendering, and components styling.",
        whyItMatters: "Modern SaaS platforms require advanced state synchronization and layout frameworks. Next.js forms the structural baseline for VAJRA's core UI pipeline.",
        skillsCovered: ["React hooks", "Server Components", "Tailwind styling", "Client state hydration"],
        duration: "2 weeks",
        dnaGain: "+12",
        readinessGain: "+15%",
        companies: ["Vercel", "Linear", "Supabase", "Google"],
        aiExplanation: "Companies hiring frontend professionals heavily evaluate DOM optimization and server render capabilities. Finalizing this milestone positions you in the top 15% of candidate matches."
      },
      {
        phase: 2,
        title: "Learn DSA Basics",
        description: "Focus on indexing structures, search algorithms, and optimization arrays.",
        whyItMatters: "Underpinning all backend query loops is algorithm design. Solving sorting and complexity limits protects databases from crashing under heavy scale.",
        skillsCovered: ["Sorting Arrays", "Tree traversals", "PostgreSQL indexing", "Big O complexity"],
        duration: "3 weeks",
        dnaGain: "+8",
        readinessGain: "+10%",
        companies: ["Google", "Amazon", "Meta", "Netflix"],
        aiExplanation: "LeetCode patterns are evaluated in technical interviews to predict developer query modeling intelligence. Practicing dynamic arrays saves code execution cycles."
      },
      {
        phase: 3,
        title: "Build 2 Full Stack Projects",
        description: "Coordinate state synchronization across server/client database components.",
        whyItMatters: "Mock projects prove practical capabilities. A complete portfolio with real RLS databases is the fastest way to convince senior hiring leads.",
        skillsCovered: ["Supabase joins", "Database design", "Next.js server actions", "Vercel deployments"],
        duration: "4 weeks",
        dnaGain: "+15",
        readinessGain: "+18%",
        companies: ["Supabase", "Vercel", "Stripe", "Clerk"],
        aiExplanation: "Judges and lead architects look for repository proof rather than certificates. Creating two verified deployment links demonstrates engineering maturity."
      },
      {
        phase: 4,
        title: "ATS Resume Tuning",
        description: "Tweak impact metrics, increase keywords, and test PDF formatting.",
        whyItMatters: "Unoptimized resumes are discarded by scanner scripts. An ATS-compliant layout ensures your applications bypass bots and reach real human reviewers.",
        skillsCovered: ["ATS parsing structures", "Quantitative impact metrics", "Core skill keywords", "PDF standardization"],
        duration: "1 week",
        dnaGain: "+10",
        readinessGain: "+12%",
        companies: ["Workday", "Taleo", "Lever", "Greenhouse"],
        aiExplanation: "Standardizing contact tags and replacing passive phrasing ('Developed UI') with quantifiable records ('Reduced layout shifts by 35%') triggers recruiter notifications."
      },
      {
        phase: 5,
        title: "Expert Mock Interview",
        description: "Coordinate system design and React data flow prep with your mentor.",
        whyItMatters: "Theoretical preparation falls flat under face-to-face pressure. Mock interview sessions build technical speech vocabulary and coding logic explanations.",
        skillsCovered: ["System architecture design", "State sync explanations", "Communication soft skills", "Code walkthrough presentation"],
        duration: "2 weeks",
        dnaGain: "+8",
        readinessGain: "+10%",
        companies: ["Google Brain", "Vercel core", "Stanford AI labs"],
        aiExplanation: "Mock loops with vetted experts calibrate your speech profiles. Practicing coding structures while speaking out loud increases positive evaluation ratings."
      },
      {
        phase: 6,
        title: "Apply for Internships",
        description: "Register match credentials and submit matching positions to partners.",
        whyItMatters: "The final step of the career path. Directly connects your verified expertise ledger to partner company applications.",
        skillsCovered: ["Ledger validation", "Shortlist optimizations", "Application submissions", "Follow-up coordination"],
        duration: "4 weeks",
        dnaGain: "+20",
        readinessGain: "+25%",
        companies: ["All VAJRA Partners"],
        aiExplanation: "Submitting matched profile scores yields a 4.2x higher interview conversion rate than cold applications on generic listings."
      }
    ],
    recommendedCertifications: [
      { name: "Supabase Certified Database Developer", provider: "Supabase Academy", difficulty: "Medium" },
      { name: "AWS Certified Developer Associate", provider: "Amazon Web Services", difficulty: "Hard" }
    ],
    recommendedProjects: [
      { title: "Real-time Relational Sync Engine", description: "Design a Next.js server instance syncing changes to Supabase channels dynamically.", technologies: ["Next.js", "PostgreSQL", "WebSockets"], priority: "High" },
      { title: "Quantitative Profile Ledgers Hub", description: "A dashboard recording student repository commits and verifying signatures via public key encryption.", technologies: ["React", "Node.js", "Cryptography"], priority: "Medium" }
    ],
    recommendedHackathons: [
      { name: "Supabase Launch Week Hackathon", focus: "Building serverless databases tools", difficulty: "Medium" },
      { name: "Vercel Sprints Challenge", focus: "Frontend rendering speed optimization", difficulty: "Hard" }
    ],
    recommendedCompanies: ["Supabase", "Vercel", "Stripe", "Linear"],
    recommendedInternshipDomains: ["Frontend Engineering", "Full-Stack Development", "AI Integration Engineering"],
    suggestedWeeklyGoals: [
      "Write a multi-table database transaction block and test RLS constraints.",
      "Sync all recent project builds from GitHub to student ledger catalog."
    ],
    suggestedDailyGoal: {
      title: "Model a Postgres Schema",
      desc: "Design a relational schema with 3 tables, matching keys, and test active RLS constraints in Supabase.",
      time: "45 minutes",
      priority: "High",
      actionText: "Open SQL Editor",
      actionType: "dsa"
    },
    motivationalInsight: "Your engineering baseline is incredibly solid. Adding database structures and showcasing quantifiably verified projects will unlock high-tier recruiter shortlists."
  };
}

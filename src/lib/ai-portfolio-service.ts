/**
 * VAJRA AI Portfolio Generation Service
 *
 * Aggregates the student's complete profile and sends it to Gemini 2.5 Pro
 * to generate premium, personalized portfolio content.
 *
 * No schema changes required — content stored as JSON in portfolios.description.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortfolioProfile {
  student: {
    fullName: string;
    email?: string;
    major: string | null;
    university: string | null;
    gpa: number | null;
    graduationYear: number | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
  };
  careerDna: {
    score: number;
    readinessScore: number;
    confidenceLevel: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    growthAreas: string[];
  } | null;
  skills: {
    skill_name: string;
    proficiency: string;
    verified: boolean;
  }[];
  projects: {
    id: string;
    title: string;
    description: string | null;
    technologies: string[];
    github_url: string | null;
    project_url: string | null;
  }[];
  resumes: {
    id: string;
    name: string;
    file_url: string;
    is_primary: boolean;
  }[];
  certificates: {
    id: string;
    name: string;
    issuer: string;
    issue_date: string;
    credential_url: string | null;
  }[];
  achievements: string[];
  hackathons: string[];
  mentorFeedback: string[];
  careerTimeline: {
    event_type: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
  }[];
}

export interface GeneratedPortfolioContent {
  version: number;
  generatedAt: string;
  theme: "aurora" | "minimal" | "cyber" | "professional" | "creative";
  slug: string;
  profileHash: string;

  // AI-Generated Content
  content: {
    headline: string;
    tagline: string;
    shortBio: string;
    aboutMe: string;
    professionalSummary: string;
    careerObjective: string;
    technicalSkillsSummary: string;
    achievementsSummary: string;
    certificateHighlights: string;
    careerDnaSummary: string;
    strengths: string[];
    futureGoals: string;
    callToAction: string;
    seoTitle: string;
    seoDescription: string;
    socialSharingDescription: string;
    projectImpacts: { projectId: string; impactSummary: string }[];
  };

  // Display Config
  config: {
    showSections: {
      about: boolean;
      dna: boolean;
      skills: boolean;
      projects: boolean;
      experience: boolean;
      certificates: boolean;
      hackathons: boolean;
      achievements: boolean;
      timeline: boolean;
      aiRecommendations: boolean;
      resumeDownload: boolean;
      contact: boolean;
    };
  };
}

export type PortfolioTheme = GeneratedPortfolioContent["theme"];

export const PORTFOLIO_THEMES: {
  id: PortfolioTheme;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Dark glassmorphism with gradient orbs",
    icon: "🌌",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Apple-inspired clean white design",
    icon: "⬜",
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Blue AI aesthetic with grid lines",
    icon: "⚡",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate sidebar layout",
    icon: "💼",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold gradients and large typography",
    icon: "🎨",
  },
];

// ─── Profile Hash ─────────────────────────────────────────────────────────────

export function computePortfolioHash(profile: PortfolioProfile): string {
  const signals = [
    profile.skills.length,
    profile.projects.length,
    profile.resumes.length,
    profile.certificates.length,
    profile.careerTimeline.length,
    profile.achievements.length,
    profile.careerDna?.score ?? 0,
    profile.student.major ?? "",
    profile.student.university ?? "",
  ];
  return signals.join("|");
}

// ─── Default Fallback Content ─────────────────────────────────────────────────

export function getFallbackPortfolioContent(
  profile: PortfolioProfile,
  theme: PortfolioTheme,
  slug: string
): GeneratedPortfolioContent {
  const name = profile.student.fullName;
  const major = profile.student.major || "Software Engineering";
  const university = profile.student.university || "Institute of Technology";
  const topSkills = profile.skills
    .slice(0, 5)
    .map((s) => s.skill_name)
    .join(", ");
  const projectCount = profile.projects.length;
  const certCount = profile.certificates.length;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    theme,
    slug,
    profileHash: computePortfolioHash(profile),
    content: {
      headline: `${name} — ${major} Engineer`,
      tagline: "Building the future, one commit at a time.",
      shortBio: `${major} student at ${university} with a passion for building scalable applications and solving real-world problems.`,
      aboutMe: `I am ${name}, a ${major} student at ${university}. I specialize in ${topSkills || "modern software development"} and am actively building my technical portfolio through hands-on projects and continuous learning. I am driven by the challenge of solving complex problems with elegant code.`,
      professionalSummary: `Motivated ${major} engineer with ${projectCount} verified projects and ${certCount} industry certifications. Experienced in ${topSkills || "full-stack development"} with a strong foundation in software engineering principles.`,
      careerObjective: `To secure a high-impact internship where I can apply my skills in ${topSkills || "software development"} to solve real business challenges, while continuing to grow as an engineer.`,
      technicalSkillsSummary: `Proficient in ${topSkills || "modern development tools and frameworks"}, with hands-on experience building production-grade applications.`,
      achievementsSummary:
        "Consistently demonstrated technical excellence through project delivery, certifications, and active participation in the engineering community.",
      certificateHighlights:
        certCount > 0
          ? `Earned ${certCount} industry-recognized certification${certCount > 1 ? "s" : ""} from leading technology providers.`
          : "Actively pursuing industry certifications to validate technical expertise.",
      careerDnaSummary: profile.careerDna
        ? `VAJRA Career DNA Score of ${profile.careerDna.score}/100, indicating ${profile.careerDna.confidenceLevel} readiness for technical internships.`
        : "Career DNA score calibrated and growing through active portfolio development.",
      strengths: [
        "Strong problem-solving and analytical thinking",
        "Consistent project delivery and technical execution",
        "Fast learner with high adaptability to new technologies",
      ],
      futureGoals: `To grow into a senior software engineer role at a product-led company, contributing to systems that impact millions of users, while continuously expanding expertise in ${major}.`,
      callToAction: "Let's build something great together.",
      seoTitle: `${name} — ${major} Developer Portfolio | VAJRA`,
      seoDescription: `${name} is a ${major} student at ${university} specializing in ${topSkills}. View verified projects, skills, and career DNA analysis.`,
      socialSharingDescription: `🚀 Check out ${name}'s AI-verified developer portfolio — built with VAJRA Career Intelligence Platform.`,
      projectImpacts: profile.projects.map((p) => ({
        projectId: p.id,
        impactSummary: `${p.title} demonstrates practical application of ${p.technologies.slice(0, 3).join(", ")} in a real-world context.`,
      })),
    },
    config: {
      showSections: {
        about: true,
        dna: !!profile.careerDna,
        skills: profile.skills.length > 0,
        projects: profile.projects.length > 0,
        experience: profile.careerTimeline.length > 0,
        certificates: profile.certificates.length > 0,
        hackathons: profile.hackathons.length > 0,
        achievements: profile.achievements.length > 0,
        timeline: profile.careerTimeline.length > 0,
        aiRecommendations: !!profile.careerDna,
        resumeDownload: profile.resumes.length > 0,
        contact: true,
      },
    },
  };
}

// ─── Gemini Portfolio Generator ───────────────────────────────────────────────

export async function generatePortfolioContentWithGemini(
  profile: PortfolioProfile,
  theme: PortfolioTheme,
  slug: string
): Promise<GeneratedPortfolioContent> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[AI Portfolio] No GEMINI_API_KEY — using fallback content.");
    return getFallbackPortfolioContent(profile, theme, slug);
  }

  const systemPrompt = `You are the VAJRA AI Portfolio Content Architect. Your job is to generate a premium, professional portfolio website content for a software engineering student.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown. No explanation. No code blocks.
2. Every piece of content must be PERSONALIZED to this specific student.
3. Content must sound natural and human — NOT like AI-generated text.
4. Use specific details from the profile (skills, projects, university, major).
5. Professional headline should be compelling and specific.
6. About Me section should be first-person, warm, and authentic.
7. Project impact summaries should highlight real value delivered.
8. SEO content should be optimized for recruiter search terms.

Return this exact JSON schema (no additional keys):
{
  "headline": "string — compelling professional headline",
  "tagline": "string — memorable personal brand tagline (max 10 words)",
  "shortBio": "string — 1-2 sentence elevator pitch",
  "aboutMe": "string — 3-4 paragraph authentic about section, first-person",
  "professionalSummary": "string — 2-3 sentence LinkedIn-style summary",
  "careerObjective": "string — specific internship/job objective",
  "technicalSkillsSummary": "string — paragraph describing technical expertise",
  "achievementsSummary": "string — highlight key achievements naturally",
  "certificateHighlights": "string — describe certificates and their value",
  "careerDnaSummary": "string — explain the Career DNA score in human terms",
  "strengths": ["string", "string", "string", "string"],
  "futureGoals": "string — authentic future career aspirations",
  "callToAction": "string — memorable CTA for recruiters",
  "seoTitle": "string — SEO-optimized page title (max 60 chars)",
  "seoDescription": "string — SEO meta description (max 160 chars)",
  "socialSharingDescription": "string — engaging social media description",
  "projectImpacts": [
    { "projectId": "string", "impactSummary": "string — 2-3 sentence impact description" }
  ]
}`;

  const userMessage = `Generate a premium portfolio for this student:

Name: ${profile.student.fullName}
Major: ${profile.student.major || "Software Engineering"}
University: ${profile.student.university || "Institute of Technology"}
GPA: ${profile.student.gpa || "N/A"}
Graduation Year: ${profile.student.graduationYear || "N/A"}
GitHub: ${profile.student.githubUrl || "N/A"}
LinkedIn: ${profile.student.linkedinUrl || "N/A"}
Bio: ${profile.student.bio || "N/A"}

Career DNA Score: ${profile.careerDna?.score ?? "N/A"}/100
Readiness Score: ${profile.careerDna?.readinessScore ?? "N/A"}%
Career Strengths: ${profile.careerDna?.strengths?.join(", ") || "N/A"}
Career Weaknesses: ${profile.careerDna?.weaknesses?.join(", ") || "N/A"}
Growth Areas: ${profile.careerDna?.growthAreas?.join(", ") || "N/A"}

Skills (${profile.skills.length}):
${profile.skills.map((s) => `  - ${s.skill_name} (${s.proficiency}${s.verified ? ", verified" : ""})`).join("\n")}

Projects (${profile.projects.length}):
${profile.projects
  .map(
    (p) =>
      `  - ID: ${p.id}
    Title: ${p.title}
    Description: ${p.description || "N/A"}
    Technologies: ${p.technologies.join(", ")}
    GitHub: ${p.github_url || "N/A"}
    Live: ${p.project_url || "N/A"}`
  )
  .join("\n")}

Certificates (${profile.certificates.length}):
${profile.certificates.map((c) => `  - ${c.name} by ${c.issuer} (${c.issue_date})`).join("\n")}

Resumes: ${profile.resumes.length} uploaded (${profile.resumes.filter((r) => r.is_primary).length} primary)

Career Timeline Events (${profile.careerTimeline.length}):
${profile.careerTimeline.map((t) => `  - [${t.event_type}] ${t.title} (${t.start_date})`).join("\n")}

Achievements: ${profile.achievements.join(", ") || "N/A"}
Hackathons: ${profile.hackathons.join(", ") || "N/A"}
Mentor Feedback: ${profile.mentorFeedback.join(" | ") || "N/A"}

Generate the most compelling, authentic, recruiter-ready portfolio content possible. Make every word count.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const aiContent = JSON.parse(rawText) as GeneratedPortfolioContent["content"];

    // Build full portfolio content object
    const result: GeneratedPortfolioContent = {
      version: 1,
      generatedAt: new Date().toISOString(),
      theme,
      slug,
      profileHash: computePortfolioHash(profile),
      content: aiContent,
      config: {
        showSections: {
          about: true,
          dna: !!profile.careerDna,
          skills: profile.skills.length > 0,
          projects: profile.projects.length > 0,
          experience: profile.careerTimeline.length > 0,
          certificates: profile.certificates.length > 0,
          hackathons: profile.hackathons.length > 0,
          achievements: profile.achievements.length > 0,
          timeline: profile.careerTimeline.length > 0,
          aiRecommendations: !!profile.careerDna,
          resumeDownload: profile.resumes.length > 0,
          contact: true,
        },
      },
    };

    return result;
  } catch (err) {
    console.error("[AI Portfolio] Gemini generation failed:", err);
    return getFallbackPortfolioContent(profile, theme, slug);
  }
}

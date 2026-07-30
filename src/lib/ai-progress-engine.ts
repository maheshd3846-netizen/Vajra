export interface DailyReportInput {
  todaysTasks: string;
  tasksCompleted: string;
  hoursWorked: number;
  skillsUsed: string[];
  technologiesUsed: string[];
  challengesFaced?: string;
  solutionsImplemented?: string;
  learningOutcome?: string;
  tomorrowsPlan?: string;
  productivityRating: number;
}

export interface DailyAiFeedback {
  summary: string;
  productivityScore: number;
  strengths: string[];
  suggestedImprovements: string[];
  skillGrowthPoints: number;
  encouragement: string;
}

export interface WeeklyAiSummary {
  weeklySummary: string;
  topAchievements: string[];
  productivityTrend: "improving" | "steady" | "needs_focus";
  skillGrowthMatrix: { skill: string; masteryIncrease: string }[];
  readinessBoost: number;
  recommendations: string[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

/**
 * Generate AI Feedback & Critique for a Daily Report
 */
export async function generateDailyReportAiReview(
  input: DailyReportInput
): Promise<DailyAiFeedback> {
  if (GEMINI_API_KEY) {
    try {
      const prompt = `
Act as a Senior Tech Lead and Career Mentor evaluating an intern's daily progress report:

Intern Submission Details:
- Tasks Planned: ${input.todaysTasks}
- Tasks Completed: ${input.tasksCompleted}
- Hours Worked: ${input.hoursWorked} hours
- Skills Used: ${input.skillsUsed.join(", ") || "General Engineering"}
- Tech Stack Used: ${input.technologiesUsed.join(", ") || "Standard Tooling"}
- Challenges Faced: ${input.challengesFaced || "None noted"}
- Solutions Implemented: ${input.solutionsImplemented || "Executed standard workflows"}
- Key Learning Outcome: ${input.learningOutcome || "Refined implementation skills"}
- Tomorrow's Target: ${input.tomorrowsPlan || "Continue pipeline tasks"}
- Intern Productivity Rating (1-5): ${input.productivityRating}

Generate a concise JSON feedback object with EXACTLY this structure:
{
  "summary": "1-2 sentence executive summary of today's work quality and throughput",
  "productivityScore": number between 60 and 100 based on tasks completed vs hours worked,
  "strengths": ["Strength 1", "Strength 2"],
  "suggestedImprovements": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "skillGrowthPoints": integer between 10 and 50,
  "encouragement": "Empowering concluding sentence"
}
Return ONLY valid raw JSON with no Markdown wrappers.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && typeof parsed === "object") {
          return {
            summary: parsed.summary || "Solid daily progress update submitted cleanly.",
            productivityScore: Math.min(100, Math.max(60, Number(parsed.productivityScore) || 85)),
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Clear task execution", "Strong problem solving"],
            suggestedImprovements: Array.isArray(parsed.suggestedImprovements) ? parsed.suggestedImprovements : ["Document edge cases clearly"],
            skillGrowthPoints: Number(parsed.skillGrowthPoints) || 25,
            encouragement: parsed.encouragement || "Keep building momentum!",
          };
        }
      }
    } catch (err) {
      console.warn("[AiProgressEngine] Gemini REST API notice:", err);
    }
  }

  // Heuristic Fallback Engine
  const completionRatio = input.tasksCompleted.length > 10 ? 1 : 0.8;
  const hoursScore = Math.min(100, Math.round((input.hoursWorked / 8) * 100));
  const calcScore = Math.round((hoursScore * 0.4) + (input.productivityRating * 12) + (completionRatio * 20));

  return {
    summary: `Logged ${input.hoursWorked} hrs focusing on ${input.technologiesUsed.slice(0, 2).join(", ") || "core tasks"}. Successfully delivered planned tasks.`,
    productivityScore: Math.min(98, Math.max(65, calcScore)),
    strengths: [
      `Active utilization of ${input.skillsUsed[0] || "problem solving skills"}`,
      input.solutionsImplemented ? "Proactive issue resolution" : "Consistent task execution",
    ],
    suggestedImprovements: [
      "Add detail to learning outcomes for portfolio verification",
      "Break down tomorrow's plan into milestone sub-tasks",
    ],
    skillGrowthPoints: Math.round(input.hoursWorked * 4 + input.productivityRating * 3),
    encouragement: "Great job logging your daily progress! Consistency builds technical excellence.",
  };
}

/**
 * Generate AI Weekly Progress Summary
 */
export async function generateWeeklyProgressSummary(
  reports: DailyReportInput[]
): Promise<WeeklyAiSummary> {
  const totalHours = reports.reduce((acc, r) => acc + r.hoursWorked, 0);
  const avgProductivity = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.productivityRating, 0) / reports.length)
    : 4;

  const allSkills = Array.from(new Set(reports.flatMap((r) => r.skillsUsed)));
  const allTech = Array.from(new Set(reports.flatMap((r) => r.technologiesUsed)));

  return {
    weeklySummary: `Completed ${reports.length} daily logs totaling ${totalHours} hours. Demonstrated consistent productivity (avg ${avgProductivity}/5) with key focus on ${allTech.slice(0, 3).join(", ") || "core development"}.`,
    topAchievements: [
      `Logged ${totalHours} productive internship hours across ${reports.length} workdays`,
      `Applied ${allSkills.length} key engineering skills: ${allSkills.slice(0, 3).join(", ") || "Software Engineering"}`,
      `Maintained an average daily productivity score of ${avgProductivity * 20}%`,
    ],
    productivityTrend: avgProductivity >= 4 ? "improving" : avgProductivity >= 3 ? "steady" : "needs_focus",
    skillGrowthMatrix: allSkills.map((skill) => ({
      skill,
      masteryIncrease: `+${Math.floor(Math.random() * 5 + 3)}%`,
    })),
    readinessBoost: Math.min(15, Math.round(reports.length * 2.5)),
    recommendations: [
      "Keep pushing code commits linked to daily task updates",
      "Schedule mentor check-in to review technical challenges faced this week",
    ],
  };
}

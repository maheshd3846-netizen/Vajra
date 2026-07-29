/**
 * VAJRA AI Mock Interview Engine
 * 
 * Dynamic question generation based on Career DNA, Skills, Projects,
 * adaptive cross-questioning, multidimensional evaluation, 7-Day Improvement Plan,
 * score predictions, and achievement unlocks.
 */

export type InterviewDifficulty = "Easy" | "Medium" | "Hard";
export type InterviewType = "HR Round" | "Technical Round" | "Behavioral Round" | "System Design" | "Mixed Round";

export interface StudentContextForInterview {
  studentName: string;
  major: string | null;
  university: string | null;
  careerDnaScore: number;
  readinessScore: number;
  skills: { skill_name: string; proficiency: string }[];
  projects: { title: string; technologies: string[] }[];
  certificates: { name: string }[];
}

export interface AiCoachBriefing {
  role: string;
  difficulty: InterviewDifficulty;
  type: InterviewType;
  whatToExpect: string;
  commonMistakes: string[];
  prepTips: string[];
}

export interface PerAnswerFeedback {
  questionNumber: number;
  question: string;
  answer: string;
  score: number; // 0-100
  technicalAccuracy: number; // 0-100
  communication: number; // 0-100
  confidence: number; // 0-100
  whatWasGood: string;
  whatWasMissing: string;
  modelAnswer: string;
  betterApproach: string;
  recommendedResources: string[];
}

export interface AchievementUnlocked {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
}

export interface SevenDayImprovementPlan {
  dailyTasks: { day: number; topic: string; task: string; resource: string }[];
  expectedScoreAfterCompletion: number;
}

export interface ScorePrediction {
  currentScore: number;
  expectedFutureScore: number;
  confidenceLevel: string;
  rationale: string;
}

export interface FullInterviewReport {
  overallScore: number; // 0-100
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  behavioralScore: number;
  readinessScore: number; // 0-100%
  hiringRecommendation: "Strong Hire" | "Hire" | "Needs Practice" | "Re-interview Required";
  strengths: string[];
  weaknesses: string[];
  missedConcepts: string[];
  suggestedImprovements: string[];
  topicsToLearn: string[];
  geminiSummary: string;
  perAnswerFeedback: PerAnswerFeedback[];
  improvementPlan: SevenDayImprovementPlan;
  prediction: ScorePrediction;
  achievements: AchievementUnlocked[];
  durationMinutes: number;
  completedAt: string;
}

/**
 * Generate AI Coach Pre-Interview Briefing
 */
export function getAiCoachBriefing(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType
): AiCoachBriefing {
  let whatToExpect = `Expect technical and behavioral questions focused on ${role} core principles at ${difficulty} level.`;
  let commonMistakes = [
    "Jumping straight to code without discussing architecture or edge cases.",
    "Not asking clarifying questions before framing a response.",
    "Providing vague answers without quantitative metrics or STAR framework examples.",
  ];
  let prepTips = [
    "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
    "State your assumptions clearly before designing systems or writing code.",
    "Be honest about unknown concepts while demonstrating problem-solving logic.",
  ];

  if (type === "System Design") {
    whatToExpect = `Architectural evaluation for ${role}. Focus on scalability, rate limiting, caching, database sharding, and latency trade-offs.`;
    commonMistakes = [
      "Ignoring single points of failure and database bottlenecks.",
      "Not estimating throughput (QPS) or storage requirements.",
    ];
    prepTips = [
      "Start with High-Level Architecture before deep diving into microservices.",
      "Discuss CAP theorem trade-offs for distributed databases.",
    ];
  } else if (type === "Behavioral Round" || type === "HR Round") {
    whatToExpect = "Evaluation of team collaboration, conflict resolution, leadership, and engineering culture fit.";
    commonMistakes = [
      "Blaming teammates during project conflict questions.",
      "Giving abstract answers without concrete personal contributions.",
    ];
  }

  return { role, difficulty, type, whatToExpect, commonMistakes, prepTips };
}

/**
 * Generate Initial Batch of Interview Questions using Gemini 2.5 Pro (with fallback)
 */
export async function generateDynamicInterviewQuestions(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  student: StudentContextForInterview,
  questionCount: number = 4
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getFallbackQuestions(role, difficulty, type, student, questionCount);
  }

  const prompt = `You are a Principal Tech Interviewer at a top software engineering company.
Generate ${questionCount} dynamic, realistic interview questions for a mock candidate.

Candidate Profile:
- Target Role: ${role}
- Difficulty: ${difficulty}
- Interview Round: ${type}
- Major: ${student.major || "Computer Science"}
- Career DNA Score: ${student.careerDnaScore}/100
- Skills: ${student.skills.map((s) => `${s.skill_name} (${s.proficiency})`).join(", ")}
- Projects: ${student.projects.map((p) => `${p.title} [${p.technologies.join(", ")}]`).join("; ")}

Return ONLY a JSON array of ${questionCount} strings. No markdown, no commentary. Example:
[
  "Question 1...",
  "Question 2...",
  "Question 3...",
  "Question 4..."
]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini status ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");

    const parsed = JSON.parse(text) as string[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return getFallbackQuestions(role, difficulty, type, student, questionCount);
  } catch (err) {
    console.error("generateDynamicInterviewQuestions failed:", err);
    return getFallbackQuestions(role, difficulty, type, student, questionCount);
  }
}

/**
 * Generate Adaptive Follow-Up Question based on student's previous answer
 */
export async function generateAdaptiveFollowUpQuestion(
  previousQuestion: string,
  previousAnswer: string,
  role: string,
  difficulty: InterviewDifficulty
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `Can you elaborate on how you would handle edge cases or scale the solution you just described for ${role}?`;
  }

  const prompt = `You are an adaptive tech interviewer.
Role: ${role} (${difficulty} level)
The candidate was asked: "${previousQuestion}"
Their answer was: "${previousAnswer}"

Generate ONE sharp, adaptive follow-up or cross-question. Challenge an assumption, ask about edge cases, or inquire about system trade-offs.
Return ONLY plain text (1 question string).`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini status error");
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || `How would you handle failure recovery and rate limiting in the approach you just described?`;
  } catch {
    return `Can you explain the trade-offs of your approach compared to an alternative architecture in a high-throughput environment?`;
  }
}

/**
 * Evaluate Complete Mock Interview Session
 */
export async function evaluateFullInterviewSession(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  questions: string[],
  answers: string[],
  durationMinutes: number,
  student: StudentContextForInterview
): Promise<FullInterviewReport> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const qaPairsText = questions
        .map((q, i) => `Question ${i + 1}: ${q}\nAnswer ${i + 1}: ${answers[i] || "No answer provided"}`)
        .join("\n\n");

      const prompt = `You are the Chief AI Interview Assessor at a top product company.
Evaluate this completed mock interview session for a ${role} (${difficulty} level, ${type} round).

Candidate Q&A Logs:
${qaPairsText}

Return a valid JSON object strictly matching this schema:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "behavioralScore": number (0-100),
  "readinessScore": number (0-100),
  "hiringRecommendation": "Strong Hire" | "Hire" | "Needs Practice" | "Re-interview Required",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "missedConcepts": ["string", "string"],
  "suggestedImprovements": ["string", "string"],
  "topicsToLearn": ["string", "string"],
  "geminiSummary": "string",
  "perAnswerFeedback": [
    {
      "questionNumber": number,
      "question": "string",
      "answer": "string",
      "score": number,
      "technicalAccuracy": number,
      "communication": number,
      "confidence": number,
      "whatWasGood": "string",
      "whatWasMissing": "string",
      "modelAnswer": "string",
      "betterApproach": "string",
      "recommendedResources": ["string", "string"]
    }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const aiReport = JSON.parse(text);
          return enrichReport(aiReport, role, difficulty, durationMinutes, student, questions, answers);
        }
      }
    } catch (err) {
      console.error("evaluateFullInterviewSession Gemini error:", err);
    }
  }

  // Fallback engine
  return buildFallbackReport(role, difficulty, type, questions, answers, durationMinutes, student);
}

/**
 * Enriches report with 7-Day Plan, Predictions, and Achievements
 */
function enrichReport(
  baseReport: Partial<FullInterviewReport>,
  role: string,
  difficulty: InterviewDifficulty,
  durationMinutes: number,
  student: StudentContextForInterview,
  questions: string[],
  answers: string[]
): FullInterviewReport {
  const score = baseReport.overallScore ?? 75;
  const techScore = baseReport.technicalScore ?? score + 2;
  const commScore = baseReport.communicationScore ?? score - 3;
  const confScore = baseReport.confidenceScore ?? score - 2;
  const psScore = baseReport.problemSolvingScore ?? score + 1;
  const behScore = baseReport.behavioralScore ?? score - 1;

  let recommendation: FullInterviewReport["hiringRecommendation"] = "Hire";
  if (score >= 88) recommendation = "Strong Hire";
  else if (score < 65) recommendation = "Needs Practice";

  // Build 7-day plan
  const improvementPlan: SevenDayImprovementPlan = {
    dailyTasks: [
      { day: 1, topic: "Core Fundamentals", task: `Review ${role} system architecture patterns & memory lifecycle.`, resource: "VAJRA Engineering Roadmap" },
      { day: 2, topic: "Algorithmic Efficiency", task: "Practice 2 Data Structures & Algorithms problems under time constraint.", resource: "LeetCode Top 75" },
      { day: 3, topic: "System Design Trade-offs", task: "Sketch architecture diagrams for database sharding and caching strategies.", resource: "System Design Primer" },
      { day: 4, topic: "STAR Method Practice", task: "Record 3 behavioral answers addressing project conflict and technical failures.", resource: "VAJRA HR Guide" },
      { day: 5, topic: "Edge Case & Error Handling", task: "Identify edge cases in recent project APIs (rate limiting, auth, retry logic).", resource: "MDN & Tech Specs" },
      { day: 6, topic: "Mock Practice Session", task: `Complete a Hard difficulty ${role} technical round.`, resource: "VAJRA Interview Studio" },
      { day: 7, topic: "Final Readiness Audit", task: "Review model answers and retake target role diagnostic.", resource: "VAJRA Career DNA Engine" },
    ],
    expectedScoreAfterCompletion: Math.min(98, score + 12),
  };

  // Score Prediction
  const prediction: ScorePrediction = {
    currentScore: score,
    expectedFutureScore: Math.min(98, score + 12),
    confidenceLevel: score >= 80 ? "High Confidence" : "Moderate Confidence",
    rationale: `Completing the 7-day improvement plan will resolve identified gaps in ${baseReport.weaknesses?.[0] || "system design"} and boost interview readiness from ${score}% to ${Math.min(98, score + 12)}%.`,
  };

  // Achievements Unlocked
  const achievements: AchievementUnlocked[] = [
    {
      id: "first_interview",
      title: "First Step Forward",
      description: "Completed your first VAJRA AI Mock Interview session.",
      badgeIcon: "🎯",
    },
  ];

  if (score >= 85) {
    achievements.push({
      id: "top_performer",
      title: "Top Performer",
      description: "Scored 85+ in a competitive technical interview.",
      badgeIcon: "🏆",
    });
  }

  if (score >= 90) {
    achievements.push({
      id: "ninety_club",
      title: "90+ Elite Club",
      description: "Demonstrated top-tier engineering interview mastery.",
      badgeIcon: "👑",
    });
  }

  const perAnswerFeedback: PerAnswerFeedback[] = (baseReport.perAnswerFeedback || []).map((fb, idx) => ({
    questionNumber: idx + 1,
    question: fb.question || questions[idx] || `Question ${idx + 1}`,
    answer: fb.answer || answers[idx] || "No response submitted.",
    score: fb.score || 72,
    technicalAccuracy: fb.technicalAccuracy || 75,
    communication: fb.communication || 70,
    confidence: fb.confidence || 70,
    whatWasGood: fb.whatWasGood || "Clear logical structure and relevant terminology used.",
    whatWasMissing: fb.whatWasMissing || "Could elaborate on quantitative metrics and alternative system trade-offs.",
    modelAnswer: fb.modelAnswer || "A complete answer incorporates core architectural principles, error handling, and performance metrics.",
    betterApproach: fb.betterApproach || "Structure answer using: 1) System assumption, 2) Technical design, 3) Performance trade-offs.",
    recommendedResources: fb.recommendedResources || ["VAJRA Technical Guide", "MDN Web Docs"],
  }));

  return {
    overallScore: score,
    technicalScore: techScore,
    communicationScore: commScore,
    confidenceScore: confScore,
    problemSolvingScore: psScore,
    behavioralScore: behScore,
    readinessScore: Math.min(98, Math.round(score * 0.95 + student.readinessScore * 0.05)),
    hiringRecommendation: recommendation,
    strengths: baseReport.strengths || ["Logical problem solving", "Clear articulation", "Solid foundational knowledge"],
    weaknesses: baseReport.weaknesses || ["Limited quantitative impact details", "Edge case coverage could be deeper"],
    missedConcepts: baseReport.missedConcepts || ["Distributed lock management", "Caching invalidation strategies"],
    suggestedImprovements: baseReport.suggestedImprovements || ["State assumptions early", "Discuss alternative solutions before coding"],
    topicsToLearn: baseReport.topicsToLearn || ["Database Partitioning", "Microservice Resiliency", "STAR Framing"],
    geminiSummary: baseReport.geminiSummary || `Solid performance in the ${role} mock interview. Technical proficiency is evident, with room to refine quantitative answers.`,
    perAnswerFeedback,
    improvementPlan,
    prediction,
    achievements,
    durationMinutes,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Fallback questions if Gemini API key is missing
 */
function getFallbackQuestions(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  student: StudentContextForInterview,
  count: number
): string[] {
  const roleLower = role.toLowerCase();
  const techSkill = student.skills[0]?.skill_name || "React";

  if (type === "Behavioral Round" || type === "HR Round") {
    return [
      `Tell me about a time you encountered a major obstacle while building a ${role} project. How did you resolve it?`,
      `How do you prioritize technical debt versus shipping new features under tight deadlines?`,
      `Describe a scenario where you received critical feedback on your code. How did you react and improve?`,
      `Why are you interested in a ${role} position, and what engineering values drive your work?`,
    ].slice(0, count);
  }

  if (type === "System Design") {
    return [
      `How would you architect a high-throughput, low-latency API rate limiting service for a ${role} platform?`,
      `Describe how you would design a real-time notification engine supporting 50,000 concurrent WebSocket connections.`,
      `How do you handle database read replicas, connection pooling, and cache invalidation when scaling a web application?`,
      `Design an idempotent payment processing pipeline with fallback mechanisms for failed webhooks.`,
    ].slice(0, count);
  }

  if (roleLower.includes("frontend")) {
    return [
      `How does Next.js 15 App Router handle Server Components versus Client Components? When should you use each?`,
      `Explain how React's virtual DOM reconciliation works and how you optimize long lists for 60fps rendering.`,
      `How do you manage global state, side-effects, and API caching in modern frontend applications?`,
      `Describe how you build accessible (WCAG 2.1) UI components with proper keyboard navigation and ARIA attributes.`,
    ].slice(0, count);
  }

  if (roleLower.includes("backend")) {
    return [
      `Explain the Node.js event loop execution order for microtasks (Promises) vs macrotasks (setTimeout, setImmediate).`,
      `How does PostgreSQL index scanning work? Contrast B-Tree indexes with GIN/GiST indexes for JSON searching.`,
      `How do you implement secure JWT authentication with refresh token rotation and RLS database policies?`,
      `Describe your approach to API versioning, error logging, and graceful degradation during service outages.`,
    ].slice(0, count);
  }

  // Default Full-Stack / General Technical questions
  return [
    `How do you structure a end-to-end full-stack application using ${techSkill} and database integrations?`,
    `Explain the concept of database transactions, ACID properties, and isolation levels under high concurrency.`,
    `How do you optimize critical rendering path, bundle size, and server response times in web platforms?`,
    `Describe your Git workflow, CI/CD pipeline steps, and automated testing strategy before deploying to production.`,
  ].slice(0, count);
}

/**
 * Fallback report generator
 */
function buildFallbackReport(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  questions: string[],
  answers: string[],
  durationMinutes: number,
  student: StudentContextForInterview
): FullInterviewReport {
  const avgLen = answers.reduce((acc, a) => acc + a.length, 0) / Math.max(1, answers.length);
  const score = Math.max(62, Math.min(94, Math.round(55 + avgLen * 0.15)));

  return enrichReport(
    {
      overallScore: score,
      technicalScore: score + 2,
      communicationScore: score - 2,
      confidenceScore: score,
      problemSolvingScore: score + 1,
      behavioralScore: score - 1,
      strengths: [
        `Good technical understanding of ${role} concepts`,
        "Clear communication and logical approach",
        "Relevant project experience alignment",
      ],
      weaknesses: [
        "Could include more specific performance benchmarks",
        "Deepen edge-case error recovery explanations",
      ],
      geminiSummary: `Completed ${difficulty} ${type} interview for ${role}. Demonstrated solid technical foundation with clear potential for senior engineering readiness.`,
    },
    role,
    difficulty,
    durationMinutes,
    student,
    questions,
    answers
  );
}

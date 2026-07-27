interface EvaluationFeedback {
  question: string;
  answer: string;
  score: number;
  missing_points: string[];
  model_answer: string;
}

export interface InterviewEvaluationResult {
  score: number;
  technical_score: number;
  communication_score: number;
  star_alignment_score: number;
  feedback: EvaluationFeedback[];
}

export async function generateInterviewQuestions(
  category: string,
  difficulty: string
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getFallbackQuestions(category, difficulty);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                  text: `You are an expert interviewer. Generate a list of 3 interview questions for a mock interview session.\nCategory: ${category}\nDifficulty: ${difficulty}\n\nYou must return a JSON response matching exactly this TypeScript string array format:\n[\n  "question 1 text",\n  "question 2 text",\n  "question 3 text"\n]`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini responded with status ${response.status}`);
    }

    const json = await response.json();
    const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("Empty response from Gemini.");
    }

    return JSON.parse(textContent) as string[];
  } catch (error) {
    console.error("Gemini questions generation failed, falling back:", error);
    return getFallbackQuestions(category, difficulty);
  }
}

export async function evaluateInterviewSession(
  category: string,
  difficulty: string,
  questions: string[],
  answers: string[]
): Promise<InterviewEvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getFallbackEvaluation(category, difficulty, questions, answers);
  }

  try {
    const qaPairs = questions.map((q, i) => `Question ${i + 1}: ${q}\nAnswer: ${answers[i] || "No answer provided"}`).join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                  text: `You are an expert interviewer. Evaluate these mock interview responses.\nCategory: ${category}\nDifficulty: ${difficulty}\n\nQ&A Logs:\n${qaPairs}\n\nYou must return a JSON response matching exactly this TypeScript structure:\n{\n  "score": number (0 to 100),\n  "technical_score": number (0 to 100),\n  "communication_score": number (0 to 100),\n  "star_alignment_score": number (0 to 100),\n  "feedback": [\n    {\n      "question": string,\n      "answer": string,\n      "score": number (0 to 100),\n      "missing_points": string[],\n      "model_answer": string\n    }\n  ]\n}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini responded with status ${response.status}`);
    }

    const json = await response.json();
    const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("Empty response from Gemini.");
    }

    return JSON.parse(textContent) as InterviewEvaluationResult;
  } catch (error) {
    console.error("Gemini evaluation failed, falling back:", error);
    return getFallbackEvaluation(category, difficulty, questions, answers);
  }
}

function getFallbackQuestions(category: string, difficulty: string): string[] {
  const isBehavioral = category.toLowerCase().includes("behavioral") || category.toLowerCase().includes("hr");
  const isDesign = category.toLowerCase().includes("design") || category.toLowerCase().includes("architecture");

  if (isBehavioral) {
    return [
      "Tell me about a time you worked on a challenging project with conflicting team views. How did you resolve it?",
      "Describe a technical failure you encountered. What did you learn and how did you pivot?",
      "Why do you want to join this position, and how do your skills align with our engineering culture?",
    ];
  }

  if (isDesign) {
    return [
      "How would you design a scalable rate limiting service for a public REST API supporting 10k requests/sec?",
      "Explain how you would architect a real-time notification engine with strict ordering constraints.",
      "How do you handle database sharding and read replicas when scaling web applications?",
    ];
  }

  // Default Technical questions
  if (difficulty.toLowerCase() === "advanced" || difficulty.toLowerCase() === "senior") {
    return [
      "Explain the event loop in Node.js. How do microtasks and macrotasks differ in execution priority?",
      "How does PostgreSQL execute an index scan versus a sequential scan? When does the planner choose a sequential scan?",
      "Describe React 19's Server Actions and how they manage state transitions under high load.",
    ];
  }

  return [
    "What is the difference between client-side rendering (CSR) and server-side rendering (SSR) in Next.js?",
    "Explain the concept of database foreign keys and how cascading delete rules operate.",
    "Describe how you structure a Git workflow (e.g., branches, PRs, squashing) when collaborating in a team.",
  ];
}

function getFallbackEvaluation(
  category: string,
  difficulty: string,
  questions: string[],
  answers: string[]
): InterviewEvaluationResult {
  const mockFeedback: EvaluationFeedback[] = questions.map((q, i) => {
    const answer = answers[i] || "";
    const score = answer.length > 30 ? 82 : 40;
    
    let missingPoints = [
      "Lacks quantitative details demonstrating impact.",
      "Explain system constraints and tradeoffs in more detail.",
    ];
    let modelAnswer = "A comprehensive answer should lay out: (1) core technical design architecture, (2) quantitative metrics (e.g., latency under 100ms, throughput scaling 2x), and (3) lessons learned from trade-offs.";

    if (q.includes("event loop")) {
      modelAnswer = "The event loop executes JavaScript concurrently. Call stack executes sync code first. Next, microtasks (Promise.then, queueMicrotask) run, followed by macrotasks (setTimeout, setImmediate). Sync blocks pause macro execution.";
      missingPoints = ["Mention microtask queue priority over macrotask queue.", "Elaborate on nextTick queuing behavior in Node."];
    } else if (q.includes("rendering")) {
      modelAnswer = "SSR pre-renders HTML on the server for speed and SEO optimization. CSR sends empty shells to browser which then fetches and renders JS bundle. React Server Components build on SSR by removing JS runtime from pages.";
      missingPoints = ["Contrast SEO compatibility details.", "Distinguish React hydration overhead differences."];
    }

    return {
      question: q,
      answer,
      score,
      missing_points: missingPoints,
      model_answer: modelAnswer,
    };
  });

  const totalScore = Math.round(mockFeedback.reduce((acc, curr) => acc + curr.score, 0) / questions.length) || 68;

  return {
    score: totalScore,
    technical_score: Math.min(100, totalScore + 4),
    communication_score: Math.min(100, totalScore - 2),
    star_alignment_score: Math.max(50, totalScore - 5),
    feedback: mockFeedback,
  };
}

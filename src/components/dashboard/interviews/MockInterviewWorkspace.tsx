"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  generateQuestionsAction,
  evaluateSessionAction,
  saveInterviewReportAction,
} from "@/app/actions/interviews";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Mic,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type WorkspaceView = "setup" | "room" | "report";
type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
type CategoryType = "Technical Concepts" | "System Design" | "Behavioral & HR" | "Internship-Specific";

interface MockInterviewWorkspaceProps {
  targetRole: string;
}

interface EvaluationResult {
  score: number;
  technical_score: number;
  communication_score: number;
  star_alignment_score: number;
  feedback: {
    question: string;
    answer: string;
    score: number;
    missing_points: string[];
    model_answer: string;
  }[];
}

export default function MockInterviewWorkspace({ targetRole }: MockInterviewWorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>("setup");
  const [category, setCategory] = useState<CategoryType>("Technical Concepts");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Intermediate");

  // Interview Room State
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswerText, setCurrentAnswerText] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Evaluation Report State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);

  // Start Session Timer
  useEffect(() => {
    if (view === "room") {
      setSecondsElapsed(0);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [view]);

  // Format seconds to MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = async () => {
    setIsInitializing(true);
    toast.loading("Generating interview questions matching criteria...");

    try {
      const parsedCategory = category === "Internship-Specific" ? `Internship Role: ${targetRole}` : category;
      const res = await generateQuestionsAction(parsedCategory, difficulty);
      toast.dismiss();

      if (res.success && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setAnswers(new Array(res.questions.length).fill(""));
        setCurrentQuestionIndex(0);
        setCurrentAnswerText("");
        setView("room");
        toast.success("AI Interview session active! Good luck.");
      } else {
        toast.error(res.error || "Failed to generate interview questions.");
      }
    } catch {
      toast.dismiss();
      toast.error("Could not initialize mock session.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswerText.trim()) {
      toast.error("Please provide your response before submitting.");
      return;
    }

    // Save answer
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswerText;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Go to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswerText("");
    } else {
      // Last question completed. Trigger evaluation action
      setIsEvaluating(true);
      toast.loading("Compiling answers and executing diagnostic score audits...");

      try {
        const parsedCategory = category === "Internship-Specific" ? `Internship Role: ${targetRole}` : category;
        const res = await evaluateSessionAction(parsedCategory, difficulty, questions, updatedAnswers);
        toast.dismiss();

        if (res.success && res.evaluation) {
          setEvaluation(res.evaluation);
          setView("report");
          toast.success("AI Evaluation completed successfully!");
        } else {
          toast.error(res.error || "Failed to parse interview evaluation.");
        }
      } catch {
        toast.dismiss();
        toast.error("Could not run performance evaluations.");
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleSaveReport = async () => {
    if (!evaluation) return;
    setIsSaving(true);
    toast.loading("Saving mock metrics to Career DNA Passport...");

    try {
      const parsedCategory = category === "Internship-Specific" ? `Internships (${targetRole})` : category;
      const res = await saveInterviewReportAction(parsedCategory, difficulty, evaluation);
      toast.dismiss();

      if (res.success) {
        toast.success("Interview scorecard registered to Skill Passport!");
      } else {
        toast.error(res.error || "Failed to record credentials.");
      }
    } catch {
      toast.dismiss();
      toast.error("An unexpected error occurred during save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePracticeAgain = () => {
    setQuestions([]);
    setAnswers([]);
    setEvaluation(null);
    setView("setup");
  };

  const toggleAccordion = (idx: number) => {
    setOpenAccordions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Color mappings based on score ranges
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Interview Ready 🔥";
    if (score >= 60) return "Competent (Needs Optimization) ⚡";
    return "Needs Immediate Practice 🚨";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-heading">
            AI Mock Interviewer & Coach 🎤
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Practice real-world technical and behavioral interviews with instant AI feedback.
          </p>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 self-start md:self-auto">
          Domain Context: {targetRole}
        </span>
      </div>

      {/* 2. Workspace View State Machine switcher */}
      {view === "setup" && (
        /* SETUP MODE (View A) */
        <div className="max-w-xl mx-auto bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center mb-8">
            <h2 className="text-lg font-bold text-white font-heading">Configure Practice Room</h2>
            <p className="text-xs text-muted-foreground font-sans">
              Select category and difficulty contexts for your mock session.
            </p>
          </div>

          <div className="space-y-6">
            {/* Category Select */}
            <div className="space-y-3 font-sans">
              <Label className="text-xs font-semibold text-slate-200">Interview Category</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["Technical Concepts", "System Design", "Behavioral & HR", "Internship-Specific"] as CategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-3.5 px-3 rounded-xl border text-[10px] uppercase font-semibold tracking-wide cursor-pointer transition-all ${
                      category === cat
                        ? "bg-blue-500/10 border-blue-500 text-white"
                        : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {cat === "Internship-Specific" ? "Internship Style" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Toggle */}
            <div className="space-y-3 font-sans pt-2">
              <Label className="text-xs font-semibold text-slate-200">Difficulty Grade</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["Beginner", "Intermediate", "Advanced"] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`py-3 rounded-xl border text-[10px] uppercase font-semibold tracking-wide cursor-pointer transition-all ${
                      difficulty === lvl
                        ? "bg-blue-500/10 border-blue-500 text-white"
                        : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Button */}
            <Button
              onClick={handleStartSession}
              disabled={isInitializing}
              className="w-full py-6 mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isInitializing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Configuring Session...
                </>
              ) : (
                <>
                  Start AI Interview Session
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {view === "room" && (
        /* INTERVIEW ACTIVE ROOM (View B) */
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Top Metrics Bar */}
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5 text-blue-400">
              <HelpCircle className="w-4 h-4" />
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Session Time: {formatTimer(secondsElapsed)}</span>
            </div>
          </div>

          {/* AI Interviewer Avatar Card */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center py-10">
            {/* Pulsing Visualizer Node */}
            <div className="relative flex items-center justify-center h-20 w-20 mb-6">
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500/10 rounded-full blur-lg"
              />
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl relative animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
            </div>

            {/* Question Text */}
            <div className="max-w-md space-y-2">
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-semibold">AI Interviewer asking:</span>
              <p className="text-sm font-bold text-white leading-relaxed font-heading">
                {questions[currentQuestionIndex]}
              </p>
            </div>
          </div>

          {/* Student Response Area */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="answerArea" className="text-slate-300 font-semibold">Your Response</Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {currentAnswerText.length} characters (min 30 suggested)
              </span>
            </div>
            <textarea
              id="answerArea"
              rows={6}
              placeholder="Structure your answer clearly. For behavioral questions, use the STAR technique (Situation, Task, Action, Result)..."
              value={currentAnswerText}
              onChange={(e) => setCurrentAnswerText(e.target.value)}
              className="w-full bg-slate-900/40 border border-white/10 text-xs text-white rounded-xl p-4 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePracticeAgain}
              className="flex-1 py-3 text-xs font-semibold text-muted-foreground hover:text-white border border-white/5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Quit Session
            </button>
            
            <Button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating}
              className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 />
                  Compiling score...
                </>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Finish & Score
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {view === "report" && evaluation && (
        /* EVALUATION DIAGNOSTIC REPORT (View C) */
        <div className="space-y-8">
          {/* Top Overall Rating Panel */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Dial Gauge */}
              <div className="relative h-28 w-28 rounded-full border-[6px] border-slate-950 bg-slate-900 border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 flex flex-col items-center justify-center shadow-2xl shrink-0">
                <span className="text-3xl font-mono font-bold text-white">{evaluation.score}</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Total Score</span>
              </div>

              {/* Summary */}
              <div className="space-y-2 text-center sm:text-left">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold font-mono ${getScoreColor(evaluation.score)}`}>
                  {getScoreLabel(evaluation.score)}
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  AI Interview Performance Scorecard
                </h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  Your mock session successfully logged. Review structural sub-metrics and missing details to align responses to target rubrics.
                </p>
              </div>
            </div>

            {/* Sub metrics grid */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5 font-sans">
              {[
                { name: "Technical Precision", val: evaluation.technical_score },
                { name: "Communication Clarity", val: evaluation.communication_score },
                { name: "STAR Alignment", val: evaluation.star_alignment_score },
              ].map((sub) => (
                <div key={sub.name} className="text-center p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <p className="text-[10px] font-semibold text-slate-400 truncate">{sub.name}</p>
                  <p className="text-lg font-mono font-bold text-white mt-1">{sub.val}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A Accordion List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Question-by-Question Diagnostics
            </h3>

            <div className="space-y-3 font-sans">
              {evaluation.feedback.map((item, i) => {
                const isOpen = openAccordions.includes(i);
                return (
                  <div
                    key={i}
                    className="border border-white/5 rounded-xl overflow-hidden bg-slate-900/40"
                  >
                    {/* Trigger button */}
                    <button
                      onClick={() => toggleAccordion(i)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="text-xs font-bold text-white truncate max-w-[280px] sm:max-w-xl">
                        Question #{i + 1}: {item.question}
                      </span>
                      <span className="text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div className="p-5 border-t border-white/5 space-y-4 bg-slate-950/20">
                        {/* Student Response */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-semibold text-slate-400">Your Response:</span>
                          <p className="text-xs text-slate-300 bg-slate-950 border border-white/5 p-3 rounded-lg leading-relaxed">
                            {item.answer || "No response provided."}
                          </p>
                        </div>

                        {/* Missing Points list */}
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase font-semibold text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Missing Key Points
                          </span>
                          <ul className="space-y-1.5">
                            {item.missing_points.map((pt, j) => (
                              <li key={j} className="text-xs text-slate-400 pl-3 relative">
                                <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500/40" />
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Model Suggested Answer */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            AI Suggested Model Answer
                          </span>
                          <p className="text-xs text-white bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg leading-relaxed">
                            {item.model_answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action controls */}
          <div className="flex gap-4">
            <button
              onClick={handlePracticeAgain}
              className="flex-1 py-4 bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Practice Again
            </button>
            <Button
              onClick={handleSaveReport}
              disabled={isSaving}
              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save to Skill Passport"}
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}

// Local spinner component
function Loader2() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

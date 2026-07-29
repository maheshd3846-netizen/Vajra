"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Mic,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Target,
  Trophy,
  TrendingUp,
  FileText,
  Zap,
  ListOrdered,
  History as HistoryIcon,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  startInterviewSessionAction,
  submitAnswerAndGetAdaptiveNextAction,
  finishAndEvaluateInterviewAction,
  fetchStudentInterviewHistoryAction,
  type MockInterviewHistoryItem,
} from "@/app/actions/interviews";
import {
  type InterviewDifficulty,
  type InterviewType,
  type FullInterviewReport,
  type AiCoachBriefing,
} from "@/lib/ai-interview-engine";

type WorkspaceView = "setup" | "room" | "report" | "history";

const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Analyst",
  "Cyber Security",
  "Cloud Engineer",
];

const DIFFICULTIES: InterviewDifficulty[] = ["Easy", "Medium", "Hard"];
const INTERVIEW_TYPES: InterviewType[] = [
  "Technical Round",
  "HR Round",
  "Behavioral Round",
  "System Design",
  "Mixed Round",
];
const DURATIONS = [15, 30, 45, 60];

interface MockInterviewWorkspaceProps {
  targetRole: string;
}

export default function MockInterviewWorkspace({
  targetRole: initialTargetRole,
}: MockInterviewWorkspaceProps) {
  const [view, setView] = useState<WorkspaceView>("setup");
  const [selectedRole, setSelectedRole] = useState(
    TARGET_ROLES.includes(initialTargetRole) ? initialTargetRole : "Frontend Developer"
  );
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("Medium");
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical Round");
  const [durationMinutes, setDurationMinutes] = useState<number>(15);

  // Setup & Briefing State
  const [briefing, setBriefing] = useState<AiCoachBriefing | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Interview Room State
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswerText, setCurrentAnswerText] = useState("");
  const [isAdaptiveLoading, setIsAdaptiveLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Report & History State
  const [report, setReport] = useState<FullInterviewReport | null>(null);
  const [history, setHistory] = useState<MockInterviewHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedFeedbackIndexes, setExpandedFeedbackIndexes] = useState<number[]>([0]);

  // Session timer
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start Session Handler
  const handleStartSession = async () => {
    setIsInitializing(true);
    toast.loading("Gemini AI is crafting your dynamic interview session...");

    try {
      const res = await startInterviewSessionAction(
        selectedRole,
        difficulty,
        interviewType,
        durationMinutes
      );
      toast.dismiss();

      if (res.success && res.questions && res.questions.length > 0) {
        setBriefing(res.briefing || null);
        setQuestions(res.questions);
        setAnswers(new Array(res.questions.length).fill(""));
        setCurrentQuestionIndex(0);
        setCurrentAnswerText("");
        setView("room");
        toast.success("AI Mock Interview session live!");
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

  // Submit Answer & Get Adaptive Follow-Up
  const handleSubmitAnswer = async () => {
    if (!currentAnswerText.trim()) {
      toast.error("Please enter your answer before proceeding.");
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = currentAnswerText;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswerText("");
    } else {
      // Prompt adaptive follow-up or finish
      setIsAdaptiveLoading(true);
      toast.loading("Gemini is analyzing answer and generating adaptive follow-up...");

      try {
        const res = await submitAnswerAndGetAdaptiveNextAction(
          questions[currentQuestionIndex],
          currentAnswerText,
          selectedRole,
          difficulty
        );
        toast.dismiss();

        if (res.success && res.followUpQuestion) {
          // Append adaptive follow-up
          setQuestions((prev) => [...prev, res.followUpQuestion!]);
          setAnswers((prev) => [...prev, ""]);
          setCurrentQuestionIndex((prev) => prev + 1);
          setCurrentAnswerText("");
          toast.info("Adaptive follow-up question added!");
        } else {
          handleFinishSession(updatedAnswers);
        }
      } catch {
        toast.dismiss();
        handleFinishSession(updatedAnswers);
      } finally {
        setIsAdaptiveLoading(false);
      }
    }
  };

  // Finish & Evaluate Session
  const handleFinishSession = async (finalAnswers?: string[]) => {
    const activeAnswers = finalAnswers || answers;
    if (activeAnswers.filter(Boolean).length === 0) {
      toast.error("Please answer at least one question before completing.");
      return;
    }

    setIsEvaluating(true);
    toast.loading("Gemini is compiling multidimensional evaluation & 7-Day Plan...");

    try {
      const res = await finishAndEvaluateInterviewAction(
        selectedRole,
        difficulty,
        interviewType,
        durationMinutes,
        questions,
        activeAnswers
      );
      toast.dismiss();

      if (res.success && res.report) {
        setReport(res.report);
        setView("report");
        toast.success(`Mock Interview Complete! Score: ${res.report.overallScore}/100`);
      } else {
        toast.error(res.error || "Failed to generate interview report.");
      }
    } catch {
      toast.dismiss();
      toast.error("Failed to complete evaluation audit.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Load History
  const handleLoadHistory = async () => {
    setIsLoadingHistory(true);
    setView("history");
    try {
      const res = await fetchStudentInterviewHistoryAction();
      if (res.success && res.history) {
        setHistory(res.history);
      }
    } catch {
      toast.error("Failed to load interview history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleAccordion = (idx: number) => {
    setExpandedFeedbackIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const wordCount = currentAnswerText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-white font-sans">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4" />
            AI Interview Intelligence Platform
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">
            AI Mock Interview Studio
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-sans">
            Simulate realistic tech recruiter interviews with adaptive cross-questioning, multidimensional scoring, and 7-day action plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {view !== "setup" && (
            <Button
              variant="outline"
              onClick={() => setView("setup")}
              className="bg-slate-900 border-white/10 text-slate-300 hover:text-white text-xs py-5 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Setup Session
            </Button>
          )}
          <Button
            onClick={handleLoadHistory}
            variant="outline"
            className="bg-slate-900 border-white/10 text-blue-400 hover:text-white text-xs py-5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <HistoryIcon className="w-4 h-4" /> View Session History
          </Button>
        </div>
      </div>

      {/* ─── SETUP VIEW ─── */}
      {view === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-7 space-y-6 bg-slate-900/80 border border-white/10 rounded-3xl p-6">
            <div className="space-y-1 border-b border-white/5 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Configure Interview Session
              </h2>
              <p className="text-xs text-slate-400">
                Select your target engineering role, difficulty, round type, and session duration.
              </p>
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-300 font-semibold">Target Engineering Role</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TARGET_ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      selectedRole === r
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-bold"
                        : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Round Type */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-300 font-semibold">Interview Round Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setInterviewType(t)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                      interviewType === t
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold"
                        : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-semibold">Difficulty Level</Label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        difficulty === d
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-950 border-white/5 text-slate-400"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-semibold">Session Duration</Label>
                <div className="flex gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDurationMinutes(dur)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                        durationMinutes === dur
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-slate-950 border-white/5 text-slate-400"
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartSession}
              disabled={isInitializing}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/20 cursor-pointer"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Adaptive Questions...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  ⚡ Generate AI Interview Session
                </>
              )}
            </Button>
          </div>

          {/* AI Coach Briefing Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 font-mono uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Interview Coach Briefing
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-blue-400 font-bold">What to Expect</span>
                  <p className="text-slate-300">
                    {briefing?.whatToExpect || `Adaptive evaluation for ${selectedRole} at ${difficulty} level (${interviewType}).`}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                    Common Mistakes to Avoid
                  </span>
                  <ul className="space-y-1 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>Jumping to answers without framing system assumptions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>Omitting quantitative metrics or performance impact details.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
                    Preparation Tips
                  </span>
                  <ul className="space-y-1 text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>Use STAR method (Situation, Task, Action, Result).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>Discuss trade-offs (e.g. latency vs consistency).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── INTERVIEW ROOM VIEW ─── */}
      {view === "room" && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Interview Card */}
          <div className="lg:col-span-8 space-y-6">
            {/* Session Room Header */}
            <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase">
                  {interviewType}
                </span>
                <span className="text-slate-400">{selectedRole}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  {formatTimer(secondsElapsed)}
                </div>
                <span className="text-slate-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                  Question #{currentQuestionIndex + 1}
                </span>
                <span className="text-xs text-slate-500 font-mono">Gemini Adaptive Assessor</span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {questions[currentQuestionIndex]}
              </h2>
            </div>

            {/* Answer Input Area */}
            <div className="space-y-3 bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between text-xs">
                <Label className="text-slate-300 font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Your Technical Response
                </Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsVoiceActive(!isVoiceActive);
                      toast.info(isVoiceActive ? "Voice mode paused." : "Voice mode active — Speak your answer!");
                    }}
                    className={`px-3 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                      isVoiceActive
                        ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                        : "bg-slate-950 border-white/10 text-slate-400"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isVoiceActive ? "Listening..." : "Voice Ready"}
                  </button>
                  <span className="text-slate-500 font-mono text-[10px]">{wordCount} words</span>
                </div>
              </div>

              <textarea
                rows={7}
                placeholder="Type or dictate your structured response here... Include assumptions, architectural approach, and key metrics."
                value={currentAnswerText}
                onChange={(e) => setCurrentAnswerText(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-sm text-white rounded-2xl p-4 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  💾 Auto-saved to current response cache
                </span>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleFinishSession()}
                    variant="outline"
                    disabled={isEvaluating}
                    className="bg-transparent border-white/10 text-slate-400 hover:text-white text-xs py-5 rounded-xl cursor-pointer"
                  >
                    Finish Early
                  </Button>

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={isAdaptiveLoading || isEvaluating}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-5 px-5 rounded-xl shadow-lg cursor-pointer"
                  >
                    {isAdaptiveLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Adaptive Evaluation...
                      </>
                    ) : currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next Question <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    ) : (
                      <>
                        Submit & Complete Session <Check className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Sidebar Drawer */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
                Question Stack ({questions.length})
              </h3>

              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[idx];
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isAnswered || idx <= currentQuestionIndex) {
                          setCurrentQuestionIndex(idx);
                          setCurrentAnswerText(answers[idx] || "");
                        }
                      }}
                      className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-blue-500/20 border-blue-500/50 text-white font-bold"
                          : isAnswered
                          ? "bg-emerald-500/10 border-emerald-500/20 text-slate-300"
                          : "bg-slate-950 border-white/5 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-slate-400">#0{idx + 1}</span>
                        {isAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="line-clamp-2 leading-relaxed">{q}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FINAL REPORT & ANALYTICS VIEW ─── */}
      {view === "report" && report && (
        <div className="space-y-8">
          {/* Hero Overall Score Banner */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    {report.completedAt ? new Date(report.completedAt).toLocaleDateString() : "Session Complete"}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      report.hiringRecommendation === "Strong Hire"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : report.hiringRecommendation === "Hire"
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    Recommendation: {report.hiringRecommendation}
                  </span>
                </div>
                <h1 className="text-3xl font-bold font-heading text-white">{selectedRole} Interview Report</h1>
                <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">{report.geminiSummary}</p>
              </div>

              {/* Overall Score Circle/Badge */}
              <div className="flex items-center gap-4 bg-slate-950 p-6 rounded-3xl border border-white/10 shrink-0">
                <div className="text-center">
                  <span className="text-5xl font-black font-mono text-blue-400 leading-none">{report.overallScore}</span>
                  <span className="text-sm font-mono text-slate-500 block mt-1">/100 Overall</span>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <span className="text-3xl font-black font-mono text-emerald-400 leading-none">{report.readinessScore}%</span>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mt-1">Readiness</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multidimensional Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Technical", score: report.technicalScore, color: "text-blue-400" },
              { label: "Communication", score: report.communicationScore, color: "text-purple-400" },
              { label: "Confidence", score: report.confidenceScore, color: "text-emerald-400" },
              { label: "Problem Solving", score: report.problemSolvingScore, color: "text-amber-400" },
              { label: "Behavioral", score: report.behavioralScore, color: "text-rose-400" },
              { label: "Readiness Index", score: report.readinessScore, color: "text-cyan-400" },
            ].map((dim, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">{dim.label}</span>
                <span className={`text-2xl font-black font-mono ${dim.color}`}>{dim.score}</span>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Key Strengths
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 font-sans">
                {report.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span> {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Gaps & Missed Concepts
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 font-sans">
                {report.weaknesses.concat(report.missedConcepts).slice(0, 4).map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">!</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Per-Answer Detailed Feedback Accordions */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-400" /> Per-Question Diagnostic Breakdown
            </h2>

            <div className="space-y-4">
              {report.perAnswerFeedback.map((fb, idx) => {
                const isOpen = expandedFeedbackIndexes.includes(idx);

                return (
                  <div key={idx} className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-blue-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{fb.question}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Score: {fb.score}/100</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono font-bold text-blue-400">{fb.score}%</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-6 border-t border-white/5 space-y-4 bg-slate-950/40 text-xs font-sans">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Candidate Answer</span>
                          <p className="p-3 bg-slate-950 rounded-xl border border-white/5 text-slate-300 italic">
                            &ldquo;{fb.answer}&rdquo;
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-1">
                            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">What Was Good</span>
                            <p className="text-slate-300">{fb.whatWasGood}</p>
                          </div>

                          <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-1">
                            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">What Was Missing</span>
                            <p className="text-slate-300">{fb.whatWasMissing}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">Ideal Model Answer</span>
                          <p className="p-3 bg-slate-950 rounded-xl border border-white/5 text-slate-300 leading-relaxed">
                            {fb.modelAnswer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🎯 7-DAY AI IMPROVEMENT PLAN & 📈 SCORE PREDICTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  🎯 7-Day AI Custom Action Plan
                </h3>
              </div>

              <div className="space-y-3">
                {report.improvementPlan.dailyTasks.map((t) => (
                  <div key={t.day} className="p-3.5 bg-slate-950 rounded-2xl border border-white/5 flex items-start gap-3 text-xs">
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold rounded-lg shrink-0">
                      Day {t.day}
                    </span>
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{t.topic}: </span>
                      <span className="text-slate-300">{t.task}</span>
                      <p className="text-[10px] text-blue-400 font-mono pt-1">Resource: {t.resource}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Prediction & Achievements */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    📈 Score Forecast
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Score</span>
                    <span className="font-mono font-bold text-white">{report.prediction.currentScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Expected Score After 7-Day Plan</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">{report.prediction.expectedFutureScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1 border-t border-white/5">
                    {report.prediction.rationale}
                  </p>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    🏆 Unlocked Badges
                  </h3>
                </div>

                <div className="space-y-3">
                  {report.achievements.map((ach) => (
                    <div key={ach.id} className="p-3 bg-slate-950 rounded-2xl border border-white/5 flex items-center gap-3">
                      <span className="text-2xl">{ach.badgeIcon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                        <p className="text-[10px] text-slate-400">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HISTORY VIEW ─── */}
      {view === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Interview History & Score Trends
            </h2>
            <Button
              onClick={() => setView("setup")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              + New Mock Session
            </Button>
          </div>

          {isLoadingHistory ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading interview records...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
              <BrainCircuit className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No mock interviews completed yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                Start your first interview session to track your performance trend over time.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.report_data) {
                      setReport(item.report_data);
                      setSelectedRole(item.role);
                      setView("report");
                    }
                  }}
                  className="p-5 rounded-3xl bg-slate-900 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{item.role}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">
                      {item.type} • {item.duration_minutes}m duration • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-xl font-bold text-blue-400 block">{item.score}/100</span>
                      <span className="text-[9px] text-slate-500 uppercase">Score</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { scanResumeAction } from "@/app/actions/resume";
import { toast } from "sonner";
import {
  Sparkles,
  UploadCloud,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ResumeAnalyzerWorkspaceProps {
  targetRole: string;
}

interface AnalysisResult {
  score: number;
  keyword_match: number;
  impact_score: number;
  formatting_score: number;
  missing_keywords: string[];
  found_keywords: string[];
  recommendations: {
    original: string;
    suggestion: string;
    reason: string;
  }[];
  formatting_feedback: string[];
}

export default function ResumeAnalyzerWorkspace({ targetRole }: ResumeAnalyzerWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [jdMode, setJdMode] = useState<"target" | "custom">("target");
  const [customJd, setCustomJd] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }
    setSelectedFile(file);
    toast.success(`Selected file: ${file.name}`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const toggleAccordion = (idx: number) => {
    setOpenAccordions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleRunScan = () => {
    if (!selectedFile) {
      toast.error("Please upload your resume in PDF format first.");
      return;
    }

    if (jdMode === "custom" && !customJd) {
      toast.error("Please enter a custom Job Description for analysis.");
      return;
    }

    setIsScanning(true);
    toast.loading("Analyzing resume structures and calculating ATS score...");

    const context = jdMode === "target" ? targetRole : customJd;
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(",")[1];
        const res = await scanResumeAction(base64String, selectedFile.name, context);

        toast.dismiss();

        if (res.success && res.analysis) {
          setAnalysis(res.analysis);
          toast.success("Resume scan completed! Review diagnostics.");
        } else {
          toast.error(res.error || "Failed to scan resume.");
        }
      } catch {
        toast.dismiss();
        toast.error("An unexpected error occurred during scan.");
      } finally {
        setIsScanning(false);
      }
    };

    reader.onerror = () => {
      toast.dismiss();
      toast.error("Could not read uploaded file.");
      setIsScanning(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  // Color mappings based on scores
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong Match 🔥";
    if (score >= 60) return "Review Recommendations ⚡";
    return "Action Required 🚨";
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    
    // Mock export text document download
    const reportText = `
VAJRA AI RESUME OPTIMIZATION REPORT
----------------------------------
File: ${selectedFile?.name || "resume.pdf"}
Target Context: ${jdMode === "target" ? targetRole : "Custom JD"}
Overall Score: ${analysis.score} / 100

METRIC SUB-SCORES
- Keyword Match: ${analysis.keyword_match}%
- Impact Formatting: ${analysis.impact_score}%
- ATS structure: ${analysis.formatting_score}%

MISSING CRITICAL KEYWORDS:
${analysis.missing_keywords.join(", ")}

FOUND KEYWORDS:
${analysis.found_keywords.join(", ")}
    `;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Vajra_ATS_Report_${selectedFile?.name.replace(".pdf", "")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Optimization report downloaded!");
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setCustomJd("");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-heading">
            AI Resume Analyzer & ATS Optimizer 📄
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Scan your resume against real-world ATS filters and get instant, AI-tailored improvements.
          </p>
        </div>
        <span className="self-start rounded-[18px] border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-wider text-primary md:self-auto">
          Analyzing for: {targetRole}
        </span>
      </div>

      {/* Dual Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-card relative overflow-hidden rounded-[28px] border-[#BFDFFF] p-6 backdrop-blur-xl">
            <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />
            
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
              Resume Document
            </h3>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(59,130,246,0.10)] ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-[#BFDFFF] bg-white/80 hover:border-primary/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 animate-pulse">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="max-w-[200px] truncate text-xs font-bold text-foreground">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="mb-3 w-8 h-8 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-600">Drag & drop your resume</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">PDF format up to 10MB</p>
                </>
              )}
            </div>

            {/* JD Context Selector */}
            <div className="mt-6 space-y-3 border-t border-[#BFDFFF] pt-6 font-sans">
              <Label className="text-xs font-semibold text-slate-600">
                Target Role Context
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setJdMode("target")}
                    className={`rounded-[18px] border py-3 text-[10px] uppercase font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                    jdMode === "target"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  Onboarding Role
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode("custom")}
                    className={`rounded-[18px] border py-3 text-[10px] uppercase font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                    jdMode === "custom"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-[#BFDFFF] bg-white text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  Custom JD
                </button>
              </div>

              {jdMode === "custom" && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="jdInput" className="text-[10px] text-slate-500">
                    Paste target Job Description text
                  </Label>
                  <textarea
                    id="jdInput"
                    rows={4}
                    placeholder="Paste job posting content here..."
                    value={customJd}
                    onChange={(e) => setCustomJd(e.target.value)}
                    className="w-full rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none font-sans"
                  />
                </div>
              )}
            </div>

            {/* Submit Scan Trigger */}
            <Button
              onClick={handleRunScan}
              disabled={isScanning || !selectedFile}
              className="mt-6 w-full rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 font-medium text-white transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
            >
              {isScanning ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning Resume...
                </>
              ) : (
                <>
                  Run AI Resume Scan
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>

          </div>

        </div>

        {/* Right Column: Diagnostic Results */}
        <div className="lg:col-span-7">
          
          {!analysis ? (
            /* Empty State */
            <div className="flex min-h-[480px] flex-col items-center justify-center rounded-[28px] border border-[#BFDFFF] border-dashed bg-white/80 p-16 text-center text-muted-foreground">
              <FileText className="mb-4 h-12 w-12 animate-pulse text-slate-500" />
              <h3 className="text-sm font-bold text-slate-600 font-heading">No Scan Conducted</h3>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 font-sans">
                Upload your resume in PDF format and choose your target context to calculate your baseline ATS matching diagnostics.
              </p>
            </div>
          ) : (
            /* Diagnostic Card Suite */
            <div className="space-y-6">
              
              {/* ATS SCORE CARD */}
              <div className="glass-card relative overflow-hidden rounded-[28px] border-[#BFDFFF] p-6 backdrop-blur-xl">
                <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Gauge */}
                  <div className="relative flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-[#BFDFFF] border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 bg-white shadow-[0_12px_40px_rgba(59,130,246,0.10)]">
                    <span className="text-3xl font-mono font-bold text-foreground">{analysis.score}</span>
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">ATS Score</span>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 text-center sm:text-left">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold font-mono ${getScoreColor(analysis.score)}`}>
                      {getScoreLabel(analysis.score)}
                    </div>
                    <h3 className="text-base font-bold text-foreground font-heading">
                      Calculated Matching Diagnostic
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      Your resume matches {analysis.keyword_match}% of the core keywords. Optimize impact-driven metrics to hit the target 85+ score.
                    </p>
                  </div>
                </div>

                {/* Sub metrics grid */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#BFDFFF] pt-6 font-sans">
                  {[
                    { name: "Keyword Match", val: analysis.keyword_match },
                    { name: "Impact Metrics", val: analysis.impact_score },
                    { name: "ATS Structure", val: analysis.formatting_score },
                  ].map((sub) => (
                    <div key={sub.name} className="rounded-[18px] border border-[#BFDFFF] bg-white/80 p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-500">{sub.name}</p>
                      <p className="mt-1 text-lg font-mono font-bold text-foreground">{sub.val}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* KEYWORDS DICTIONARY TAGS */}
              <div className="glass-card rounded-[28px] border-[#BFDFFF] p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                  Keyword Comparison Engine
                </h3>

                <div className="space-y-4 font-sans">
                  {/* Found Keywords */}
                  <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-muted-foreground">Found Keywords ({analysis.found_keywords.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.found_keywords.map((k) => (
                          <span key={k} className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-muted-foreground">Missing Keywords ({analysis.missing_keywords.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missing_keywords.map((k) => (
                          <span key={k} className="inline-flex items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION SUGGESTIONS */}
              <div className="glass-card rounded-[28px] border-[#BFDFFF] p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                  AI Sentence & Impact Optimizations
                </h3>

                <div className="space-y-3 font-sans">
                  {analysis.recommendations.map((rec, i) => {
                    const isOpen = openAccordions.includes(i);
                    return (
                      <div
                        key={i}
                        className="overflow-hidden rounded-[18px] border border-[#BFDFFF] bg-white/80"
                      >
                        <button
                          onClick={() => toggleAccordion(i)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="max-w-[280px] truncate text-xs font-bold text-foreground sm:max-w-md">
                            Rewrite recommendation #{i + 1}
                          </span>
                          <span className="text-slate-500">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="space-y-3 border-t border-[#BFDFFF] p-4">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-semibold text-red-400">Original Resume Sentence:</span>
                              <p className="rounded-lg border border-red-500/10 bg-red-500/5 p-2.5 text-xs text-slate-600">
                                {rec.original}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-semibold text-emerald-500">AI Suggested Rewrite:</span>
                              <p className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2.5 text-xs text-foreground">
                                {rec.suggestion}
                              </p>
                            </div>
                            <div className="space-y-1 pt-1">
                              <span className="text-[9px] uppercase font-semibold text-slate-400">Strategy Rationale:</span>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">
                                {rec.reason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORMATTING CHECKS */}
              <div className="glass-card rounded-[28px] border-[#BFDFFF] p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                  ATS Layout & Structure Check
                </h3>
                <ul className="space-y-2.5 font-sans">
                  {analysis.formatting_feedback.map((feedback, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <span className="mt-0.5 flex-shrink-0 rounded bg-primary/10 p-0.5 text-primary">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </span>
                      {feedback}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex gap-4">
                <Button
                  onClick={handleReset}
                  className="flex-1 cursor-pointer rounded-[18px] border border-[#BFDFFF] bg-white py-4 text-xs font-semibold text-muted-foreground transition-all flex items-center justify-center gap-1.5 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-scan Resume
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  className="flex-1 cursor-pointer rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-4 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Report
                </Button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

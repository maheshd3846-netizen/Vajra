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
          <h1 className="text-xl font-bold tracking-tight text-white font-heading">
            AI Resume Analyzer & ATS Optimizer 📄
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Scan your resume against real-world ATS filters and get instant, AI-tailored improvements.
          </p>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 self-start md:self-auto">
          Analyzing for: {targetRole}
        </span>
      </div>

      {/* Dual Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans mb-4">
              Resume Document
            </h3>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-blue-500 bg-blue-500/10"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/10 hover:border-white/20 bg-slate-950/40"
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
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white max-w-[200px] truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-500 mb-3" />
                  <h4 className="text-xs font-bold text-slate-300">Drag & drop your resume</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">PDF format up to 10MB</p>
                </>
              )}
            </div>

            {/* JD Context Selector */}
            <div className="space-y-3 pt-6 mt-6 border-t border-white/5 font-sans">
              <Label className="text-xs font-semibold text-slate-200">
                Target Role Context
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setJdMode("target")}
                  className={`py-3 rounded-xl border text-[10px] uppercase font-semibold tracking-wide cursor-pointer transition-all ${
                    jdMode === "target"
                      ? "bg-blue-500/10 border-blue-500 text-white"
                      : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  Onboarding Role
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode("custom")}
                  className={`py-3 rounded-xl border text-[10px] uppercase font-semibold tracking-wide cursor-pointer transition-all ${
                    jdMode === "custom"
                      ? "bg-blue-500/10 border-blue-500 text-white"
                      : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  Custom JD
                </button>
              </div>

              {jdMode === "custom" && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="jdInput" className="text-[10px] text-slate-400">
                    Paste target Job Description text
                  </Label>
                  <textarea
                    id="jdInput"
                    rows={4}
                    placeholder="Paste job posting content here..."
                    value={customJd}
                    onChange={(e) => setCustomJd(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
                  />
                </div>
              )}
            </div>

            {/* Submit Scan Trigger */}
            <Button
              onClick={handleRunScan}
              disabled={isScanning || !selectedFile}
              className="w-full py-6 mt-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="bg-slate-900/30 border border-white/10 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center text-muted-foreground min-h-[480px]">
              <FileText className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 font-heading">No Scan Conducted</h3>
              <p className="text-xs text-slate-500 font-sans max-w-sm mt-1.5 leading-relaxed">
                Upload your resume in PDF format and choose your target context to calculate your baseline ATS matching diagnostics.
              </p>
            </div>
          ) : (
            /* Diagnostic Card Suite */
            <div className="space-y-6">
              
              {/* ATS SCORE CARD */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Gauge */}
                  <div className="relative h-28 w-28 rounded-full border-[6px] border-slate-950 bg-slate-900 border-t-emerald-500 border-r-emerald-500 border-b-emerald-500 flex flex-col items-center justify-center shadow-2xl shrink-0">
                    <span className="text-3xl font-mono font-bold text-white">{analysis.score}</span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">ATS Score</span>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 text-center sm:text-left">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold font-mono ${getScoreColor(analysis.score)}`}>
                      {getScoreLabel(analysis.score)}
                    </div>
                    <h3 className="text-base font-bold text-white font-heading">
                      Calculated Matching Diagnostic
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      Your resume matches {analysis.keyword_match}% of the core keywords. Optimize impact-driven metrics to hit the target 85+ score.
                    </p>
                  </div>
                </div>

                {/* Sub metrics grid */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5 font-sans">
                  {[
                    { name: "Keyword Match", val: analysis.keyword_match },
                    { name: "Impact Metrics", val: analysis.impact_score },
                    { name: "ATS Structure", val: analysis.formatting_score },
                  ].map((sub) => (
                    <div key={sub.name} className="text-center p-3 rounded-xl bg-slate-950/40 border border-white/5">
                      <p className="text-[10px] font-semibold text-slate-400">{sub.name}</p>
                      <p className="text-lg font-mono font-bold text-white mt-1">{sub.val}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* KEYWORDS DICTIONARY TAGS */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans mb-4">
                  Keyword Comparison Engine
                </h3>

                <div className="space-y-4 font-sans">
                  {/* Found Keywords */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-semibold">Found Keywords ({analysis.found_keywords.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.found_keywords.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-semibold">Missing Keywords ({analysis.missing_keywords.length})</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missing_keywords.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION SUGGESTIONS */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans mb-4">
                  AI Sentence & Impact Optimizations
                </h3>

                <div className="space-y-3 font-sans">
                  {analysis.recommendations.map((rec, i) => {
                    const isOpen = openAccordions.includes(i);
                    return (
                      <div
                        key={i}
                        className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/40"
                      >
                        <button
                          onClick={() => toggleAccordion(i)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="text-xs font-bold text-white truncate max-w-[280px] sm:max-w-md">
                            Rewrite recommendation #{i + 1}
                          </span>
                          <span className="text-slate-400">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="p-4 border-t border-white/5 space-y-3">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-semibold text-red-400">Original Resume Sentence:</span>
                              <p className="text-xs text-slate-400 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">
                                {rec.original}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-semibold text-emerald-400">AI Suggested Rewrite:</span>
                              <p className="text-xs text-white bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
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
              <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans mb-4">
                  ATS Layout & Structure Check
                </h3>
                <ul className="space-y-2.5 font-sans">
                  {analysis.formatting_feedback.map((feedback, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="p-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5 flex-shrink-0">
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
                  className="flex-1 py-4 bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-scan Resume
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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

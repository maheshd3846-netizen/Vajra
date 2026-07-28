"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mic, Sparkles } from "lucide-react";
import ResumeAnalyzerWorkspace from "@/components/dashboard/resume/ResumeAnalyzerWorkspace";
import MockInterviewWorkspace from "@/components/dashboard/interviews/MockInterviewWorkspace";

interface CareerHubClientProps {
  targetRole: string;
}

export default function CareerHubClient({ targetRole }: CareerHubClientProps) {
  const [activeTab, setActiveTab] = useState<"hub" | "resume" | "interview">("hub");

  if (activeTab === "resume") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveTab("hub")}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          ← Back to Career DNA Hub
        </button>
        <ResumeAnalyzerWorkspace targetRole={targetRole} />
      </div>
    );
  }

  if (activeTab === "interview") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveTab("hub")}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          ← Back to Career DNA Hub
        </button>
        <MockInterviewWorkspace targetRole={targetRole} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4 animate-pulse" />
          AI Career Accelerator
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-white sm:text-4xl">
          Career DNA Hub
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl font-sans">
          Leverage our customized AI agent suite tailored to your target role: <strong className="text-blue-300 font-semibold">{targetRole}</strong>. Optimize your resume alignment and practice realistic mock interviews.
        </p>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Resume Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          className="p-8 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                AI Resume Analyzer
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Upload your resume to check match metrics against <span className="text-slate-300 font-medium">{targetRole}</span> requirements. Get keyword improvements, scoring, and tailored feedback instantly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("resume")}
            className="mt-6 w-full py-3.5 rounded-xl bg-slate-950 border border-white/5 hover:border-blue-500/30 text-xs font-semibold text-white hover:bg-blue-500/10 transition-all cursor-pointer"
          >
            Launch Analyzer
          </button>
        </motion.div>

        {/* Mock Interview Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          className="p-8 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all">
              <Mic className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                AI Mock Interview
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Experience simulated technical and behavioral interviews for <span className="text-slate-300 font-medium">{targetRole}</span>. Receive a detailed report and improvement checklist.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("interview")}
            className="mt-6 w-full py-3.5 rounded-xl bg-slate-950 border border-white/5 hover:border-purple-500/30 text-xs font-semibold text-white hover:bg-purple-500/10 transition-all cursor-pointer"
          >
            Launch Interviewer
          </button>
        </motion.div>
      </div>
    </div>
  );
}

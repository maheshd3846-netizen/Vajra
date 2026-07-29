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
          className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
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
          className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
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
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          AI Career Accelerator
        </div>
        <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground sm:text-4xl">
          Career DNA Hub
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl font-sans">
          Leverage our customized AI agent suite tailored to your target role: <strong className="font-semibold text-primary">{targetRole}</strong>. Optimize your resume alignment and practice realistic mock interviews.
        </p>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Resume Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          className="glass-card flex flex-col justify-between rounded-2xl border-border/70 p-8 group transition-all"
        >
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-all group-hover:bg-primary/20">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                AI Resume Analyzer
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground font-sans">
                Upload your resume to check match metrics against <span className="font-medium text-foreground">{targetRole}</span> requirements. Get keyword improvements, scoring, and tailored feedback instantly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("resume")}
            className="mt-6 w-full cursor-pointer rounded-xl border border-border/70 bg-background/70 py-3.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10"
          >
            Launch Analyzer
          </button>
        </motion.div>

        {/* Mock Interview Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          className="glass-card flex flex-col justify-between rounded-2xl border-border/70 p-8 group transition-all"
        >
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500 transition-all group-hover:bg-cyan-500/20">
              <Mic className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                AI Mock Interview
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground font-sans">
                Experience simulated technical and behavioral interviews for <span className="font-medium text-foreground">{targetRole}</span>. Receive a detailed report and improvement checklist.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("interview")}
            className="mt-6 w-full cursor-pointer rounded-xl border border-border/70 bg-background/70 py-3.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10"
          >
            Launch Interviewer
          </button>
        </motion.div>
      </div>
    </div>
  );
}

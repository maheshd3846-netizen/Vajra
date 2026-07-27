"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  MapPin,
  DollarSign,
  Github,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillItem {
  id: string;
  student_id: string;
  skill_name: string;
  proficiency: string;
  verified: boolean;
}

interface InternshipItem {
  id: string;
  title: string;
  location: string;
  salary: number;
  companies?: {
    name: string;
  } | null;
}

interface StudentDashboardViewProps {
  profileName: string;
  studentProfile: {
    major: string | null;
    university: string | null;
    gpa: number | null;
    graduation_year: number | null;
    github_url: string | null;
    linkedin_url: string | null;
  } | null;
  skills: SkillItem[];
  internships: InternshipItem[];
}

export default function StudentDashboardView({
  profileName,
  studentProfile,
  skills,
  internships,
}: StudentDashboardViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [analyzingCardId, setAnalyzingCardId] = useState<number | null>(null);

  // Sync github activity simulation
  const handleSyncGithub = async () => {
    setIsSyncing(true);
    toast.loading("Syncing GitHub repositories and commit metrics...");
    await new Promise((res) => setTimeout(res, 2000));
    toast.dismiss();
    setIsSyncing(false);
    toast.success("GitHub activity successfully parsed. Readiness score recalculated (+2% profile boost)!");
  };

  // Run AI Recommendations simulation
  const handleRunAIAction = async (actionId: number, title: string) => {
    setAnalyzingCardId(actionId);
    toast.loading(`Processing: ${title}`);
    await new Promise((res) => setTimeout(res, 1800));
    toast.dismiss();
    setAnalyzingCardId(null);
    toast.success(`Action successfully executed: ${title}`);
  };

  // Fallback skills if student_skills is empty
  const activeSkills =
    skills.length > 0
      ? skills
      : [
          { id: "1", skill_name: "React", proficiency: "advanced", verified: true },
          { id: "2", skill_name: "TypeScript", proficiency: "intermediate", verified: true },
          { id: "3", skill_name: "Node.js", proficiency: "intermediate", verified: false },
          { id: "4", skill_name: "PostgreSQL", proficiency: "beginner", verified: false },
        ];

  // Fallback internships if internships list is empty
  const activeInternships =
    internships.length > 0
      ? internships
      : [
          {
            id: "int-1",
            title: "Frontend Engineering Intern",
            location: "San Francisco, CA (Remote)",
            salary: 4200,
            companies: { name: "Vercel Labs" },
          },
          {
            id: "int-2",
            title: "AI Integrations Engineer",
            location: "New York, NY (Hybrid)",
            salary: 5000,
            companies: { name: "Linear Systems" },
          },
        ];

  // Map proficiency keywords to percentages
  const getProficiencyPercentage = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return 88;
      case "intermediate":
        return 65;
      default:
        return 40;
    }
  };

  // Recommendation steps mockup
  const aiNextSteps = [
    {
      id: 1,
      type: "ATS Analysis",
      description: "Analyze Resume against modern ATS selection algorithms.",
      buttonText: "Run AI Analysis",
      badge: "🎯 Goal Match",
    },
    {
      id: 2,
      type: "Skill quiz",
      description: "Complete PostgreSQL Indexing optimization assessment.",
      buttonText: "Start Quick Quiz",
      badge: "⚡ Skill Gap",
    },
    {
      id: 3,
      type: "Endorsement",
      description: "Request validation check on Smart Patient Risk System.",
      buttonText: "Verify Project",
      badge: "🏆 Verification",
    },
  ];

  // Timeline list mockup
  const timelineActivities = [
    { text: "Completed AI Onboarding Sequence", relativeTime: "Today", type: "success" },
    { text: "Linked GitHub Profile integration", relativeTime: "Yesterday", type: "info" },
    { text: "System Baseline Calibrated: 68% Readiness", relativeTime: "2 days ago", type: "warning" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Dashboard Layout Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* HERO WIDGET: Career DNA Status Card (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                  Welcome back, {profileName || "Vajra User"} 👋
                </h1>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Target: {studentProfile?.major || "Software Engineer"}
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Level: Explorer 🚀
              </span>
            </div>

            {/* Readiness Index & Breakdown Display */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2">
              {/* Dial dial indicator */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center relative py-2">
                <div className="h-28 w-28 rounded-full border-[6px] border-slate-950 flex flex-col items-center justify-center bg-slate-900 border-t-blue-500 border-r-blue-500 relative shadow-2xl">
                  <span className="text-2xl font-bold text-white font-mono">68%</span>
                  <span className="text-[8px] text-muted-foreground uppercase font-semibold tracking-wider">Readiness</span>
                </div>
              </div>

              {/* Sub metrics breakdown */}
              <div className="sm:col-span-8 space-y-3 font-sans">
                {[
                  { name: "Technical Proficiency", val: 72, color: "bg-blue-500" },
                  { name: "Portfolio Index", val: 60, color: "bg-indigo-500" },
                  { name: "Interview Readiness", val: 55, color: "bg-purple-500" },
                  { name: "Profile Completeness", val: 85, color: "bg-emerald-500" },
                ].map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                      <span>{metric.name}</span>
                      <span className="text-white font-mono">{metric.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${metric.color}`} style={{ width: `${metric.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/5">
            <Button
              onClick={handleSyncGithub}
              disabled={isSyncing}
              className="flex-1 py-4 bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              {isSyncing ? "Syncing Repos..." : "Sync GitHub Activity"}
            </Button>
            
            <Button className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Generate AI Report
            </Button>
          </div>
        </div>

        {/* SKILL RADAR / MATRIX VISUALIZER (Col span 5) */}
        <div className="lg:col-span-5 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Active Skill Matrix
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Top Competencies</span>
            </div>

            <div className="space-y-4 font-sans max-h-[220px] overflow-y-auto pr-1">
              {activeSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{skill.skill_name}</span>
                      {skill.verified ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          <Zap className="w-2.5 h-2.5" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${skill.verified ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${getProficiencyPercentage(skill.proficiency)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 select-none">
                    {skill.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/dashboard/certificates" className="mt-4 pt-4 border-t border-white/5 block text-center">
            <span className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
              View Verified Skill Passport
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

      </div>

      {/* 2. HIGH-PRIORITY AI RECOMMENDATIONS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          High-Priority AI Action Items
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiNextSteps.map((step) => (
            <div
              key={step.id}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between min-h-[170px]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-heading">{step.type}</h4>
                <p className="text-[11px] text-muted-foreground font-sans mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <Button
                onClick={() => handleRunAIAction(step.id, step.description)}
                disabled={analyzingCardId === step.id}
                className="mt-4 py-2 w-full bg-slate-950 hover:bg-slate-800 text-[10px] font-semibold text-slate-300 border border-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {analyzingCardId === step.id ? (
                  <>
                    <Loader2 />
                    Analyzing...
                  </>
                ) : (
                  step.buttonText
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. OPPORTUNITIES PREVIEW & ACTIVITY FEED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MATCHED OPPORTUNITIES (Col span 7) */}
        <div className="lg:col-span-7 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Vetted Internship Matches
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Based on target DNA</span>
            </div>

            <div className="space-y-4 font-sans">
              {activeInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white leading-none">{internship.title}</h4>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        94% Match
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-slate-300">{internship.companies?.name || "Verified Partner"}</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {internship.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {internship.salary}/mo
                      </span>
                    </div>
                  </div>

                  <Button className="py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-[10px] font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto">
                    Quick Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Link href="/dashboard/internships" className="mt-4 pt-4 border-t border-white/5 block text-center">
            <span className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
              Explore Match Pipeline
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* CAREER TIMELINE / ACTIVITY FEED (Col span 5) */}
        <div className="lg:col-span-5 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Career Timeline
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Activity logs</span>
            </div>

            <div className="relative pl-4 space-y-5 font-sans border-l border-white/10 ml-2">
              {timelineActivities.map((act, i) => (
                <div key={i} className="relative group">
                  {/* Bullet */}
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-slate-950 bg-blue-400 group-hover:scale-125 transition-transform" />
                  
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200 leading-snug">
                      {act.text}
                    </p>
                    <span className="text-[9px] font-mono text-muted-foreground block">
                      {act.relativeTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <span className="text-[11px] text-muted-foreground font-mono inline-flex items-center gap-1.5 select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              All checkpoints verified
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

// Inline Spinner loader helper
function Loader2() {
  return (
    <svg
      className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-slate-300"
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

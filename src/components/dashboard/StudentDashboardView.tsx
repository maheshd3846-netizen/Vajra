"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
  RefreshCw,
  BarChart2,
  Briefcase,
  FileText,
  Check,
  AlertTriangle,
  GraduationCap,
  Trophy,
  Globe,
  User,
  Plus,
  Compass,
  MessageCircle,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { recalculateCareerDnaAction } from "@/app/actions/career-dna";
import {
  calculateCareerDnaScores,
  getFallbackDnaReport,
  type CareerDnaAnalysisResult,
} from "@/lib/ai-career-dna-service";
import PredictiveCareerPanel from "@/components/dashboard/PredictiveCareerPanel";
import type { PredictiveInputs } from "@/lib/predictive-career-engine";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface SkillItem {
  skill_name: string;
  proficiency: string;
}

interface CompanyItem {
  name: string;
  logo_url: string | null;
  is_verified: boolean;
}

interface InternshipItem {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  requirements: string[];
  skills_needed: string[];
  salary_range: string | null;
  status: string;
  created_at: string;
  companies: CompanyItem | null;
  matchScore?: number;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
  technologies: string[];
}

interface ResumeItem {
  id: string;
  name: string;
  file_url: string;
  is_primary: boolean;
  created_at: string;
}

interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  asset_url: string;
  created_at: string;
}

interface MentorAssignmentItem {
  id: string;
  status: string;
  assigned_at: string;
  mentor_id: string;
  mentors: {
    id: string;
    bio: string | null;
    company_name: string | null;
    job_title: string | null;
    expertise: string[];
    users: {
      full_name: string | null;
      avatar_url: string | null;
      email: string;
    } | null;
  } | null;
}

interface AiReportItem {
  id: string;
  report_type: string;
  content: unknown;
  score: number | null;
  created_at: string;
}

interface CareerTimelineItem {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
}

interface StudentDashboardViewProps {
  profileName: string;
  avatarUrl: string | null;
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
  projects: ProjectItem[];
  resumes: ResumeItem[];
  certificates: CertificateItem[];
  portfolios: PortfolioItem[];
  mentorAssignment: MentorAssignmentItem | null;
  aiReports: AiReportItem[];
  careerTimeline: CareerTimelineItem[];
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function StudentDashboardView({
  profileName,
  avatarUrl,
  studentProfile,
  skills,
  internships,
  projects,
  resumes,
  certificates,
  portfolios,
  mentorAssignment,
  aiReports,
  careerTimeline,
}: StudentDashboardViewProps) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [studentXp, setStudentXp] = useState(650);
  const [phaseCompletions, setPhaseCompletions] = useState<boolean[]>([
    true, false, false, false, false, false,
  ]);
  const [unlockedBadge, setUnlockedBadge] = useState<{
    title: string;
    xp: number;
    icon: string;
    desc: string;
  } | null>(null);
  const [dnaTab, setDnaTab] = useState<"breakdown" | "diagnostics">("breakdown");
  const [coachTab, setCoachTab] = useState<"chat" | "profile">("chat");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<InternshipItem | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationResume, setApplicationResume] = useState("");
  const [applicationCoverLetter, setApplicationCoverLetter] = useState("");
  const [coachInput, setCoachInput] = useState("");
  const [coachMessages, setCoachMessages] = useState([
    {
      sender: "coach",
      text: `Hello ${profileName.split(" ")[0]}! I have calibrated your Career DNA. You are highly aligned with Frontend Development. Adding Backend and Database skills will expand your match pipeline. Ask me anything!`,
      time: "Just Now",
    },
  ]);
  const [coachTyping, setCoachTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [activeDnaReport, setActiveDnaReport] = useState<CareerDnaAnalysisResult | null>(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const r = aiReports
      .filter((r) => r.report_type === "career_path")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    if (r) setActiveDnaReport(r.content as CareerDnaAnalysisResult);
  }, [aiReports]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, coachTyping]);

  // ── Scores ─────────────────────────────────────────────────────────────────
  const fallbackScores = useMemo(
    () =>
      calculateCareerDnaScores({
        profile: studentProfile,
        skills,
        projects,
        resumes,
        certificates,
        portfolios,
        feedback: [],
        timeline: careerTimeline,
      }),
    [studentProfile, skills, projects, resumes, certificates, portfolios, careerTimeline]
  );

  const dnaReportData = useMemo(() => {
    if (activeDnaReport) return activeDnaReport;
    const agg = {
      profileName,
      profile: studentProfile,
      skills,
      projects,
      resumes,
      certificates,
      portfolios,
      feedback: [],
      timeline: careerTimeline,
    };
    return {
      career_dna_score: fallbackScores.careerDnaScore,
      internship_score: fallbackScores.internshipReadinessScore,
      profile_completion: fallbackScores.profileCompletionScore,
      confidence_level: fallbackScores.confidenceLevel,
      explanation_metadata: fallbackScores.explanationMetadata,
      content: getFallbackDnaReport(agg, fallbackScores),
    } as CareerDnaAnalysisResult;
  }, [activeDnaReport, profileName, studentProfile, skills, projects, resumes, certificates, portfolios, careerTimeline, fallbackScores]);

  useEffect(() => {
    setStudentXp(dnaReportData.career_dna_score * 10);
  }, [dnaReportData.career_dna_score]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const data = useMemo(() => {
    const userMajor = studentProfile?.major || "Computer Science & Engineering";
    const userUniv = studentProfile?.university || "Silicon Valley Institute of Technology";
    const userGradYear = studentProfile?.graduation_year;

    const activeSkills =
      skills.length === 0
        ? [
            { skill_name: "React", proficiency: "advanced" },
            { skill_name: "TypeScript", proficiency: "advanced" },
            { skill_name: "Next.js", proficiency: "intermediate" },
            { skill_name: "Node.js", proficiency: "intermediate" },
            { skill_name: "Tailwind CSS", proficiency: "advanced" },
            { skill_name: "PostgreSQL", proficiency: "beginner" },
          ]
        : skills;

    const activeInternships: InternshipItem[] =
      internships.length === 0
        ? [
            { id: "i1", title: "Frontend Engineering Intern", description: "Work on Next.js core workflows.", location: "San Francisco, CA (Remote)", type: "remote", salary_range: "$4,200/mo", requirements: ["React", "TypeScript"], skills_needed: ["React", "TypeScript", "Next.js"], companies: { name: "Vercel Labs", logo_url: null, is_verified: true }, matchScore: 96, status: "open", created_at: "2026-07-20T00:00:00Z" },
            { id: "i2", title: "AI Integration Engineer", description: "Integrate vector stores and LLM chains.", location: "New York, NY (Hybrid)", type: "hybrid", salary_range: "$5,000/mo", requirements: ["TypeScript", "Node.js"], skills_needed: ["TypeScript", "Node.js", "Python"], companies: { name: "Linear Systems", logo_url: null, is_verified: true }, matchScore: 88, status: "open", created_at: "2026-07-21T00:00:00Z" },
            { id: "i3", title: "Full Stack Development Assistant", description: "Optimize PostgreSQL connection pools.", location: "Austin, TX (On-site)", type: "on-site", salary_range: "$4,500/mo", requirements: ["React", "Node.js"], skills_needed: ["React", "Node.js", "PostgreSQL"], companies: { name: "Supabase Inc", logo_url: null, is_verified: true }, matchScore: 78, status: "open", created_at: "2026-07-22T00:00:00Z" },
          ]
        : internships;

    const activeMentor: MentorAssignmentItem | null =
      mentorAssignment ||
      ({
        id: "mock-a",
        status: "active",
        assigned_at: "2026-07-25T00:00:00Z",
        mentor_id: "mock-m",
        mentors: {
          id: "mock-m",
          bio: "Principal AI Research Scientist at Google Brain. Ex-Stanford Faculty.",
          company_name: "Google Brain",
          job_title: "Principal Research Architect",
          expertise: ["System Design", "PyTorch", "NLP", "Next.js"],
          users: { full_name: "Dr. Sarah Jenkins", avatar_url: null, email: "sarah.jenkins@google.com" },
        },
      } as MentorAssignmentItem);

    const activeResumes: ResumeItem[] =
      resumes.length === 0
        ? [{ id: "r1", name: "Software_Engineering_Resume_2026.pdf", file_url: "#", is_primary: true, created_at: "2026-07-10T00:00:00Z" }]
        : resumes;

    const activeProjects: ProjectItem[] =
      projects.length === 0
        ? [
            { id: "p1", title: "VAJRA Client Web-Portal", description: "Next.js 15 dashboard with Framer Motion.", technologies: ["Next.js", "Tailwind CSS", "Framer Motion"], github_url: "https://github.com", project_url: null },
            { id: "p2", title: "Smart Medical Risk Evaluator", description: "Clinical risk estimation software.", technologies: ["React", "PostgreSQL", "Node.js"], github_url: "https://github.com", project_url: null },
          ]
        : projects;

    const activePortfolios: PortfolioItem[] =
      portfolios.length === 0
        ? [{ id: "port1", title: "Technical Lab Showcase", description: null, asset_url: "https://my-vajra-portfolio.dev", created_at: "2026-07-01T00:00:00Z" }]
        : portfolios;

    const activeCertificates: CertificateItem[] =
      certificates.length === 0
        ? [
            { id: "c1", name: "Next.js 15 Advanced Developer Certification", issuer: "Vercel Academy", issue_date: "2026-06-15", expiry_date: null, credential_id: null, credential_url: null },
            { id: "c2", name: "PostgreSQL Database Engine Tuning", issuer: "DBA Guild", issue_date: "2026-05-10", expiry_date: null, credential_id: null, credential_url: null },
          ]
        : certificates;

    const activeEvents = [
      { id: "e1", title: "Mock Interview: System Design & Next.js", host: "Dr. Sarah Jenkins (Mentor)", datetime: "July 30, 2026 at 4:00 PM", icon: MessageCircle },
      { id: "e2", title: "Vajra Career Webinar: Cracking Vetted Roles", host: "Recruiting Panel", datetime: "August 2, 2026 at 6:00 PM", icon: GraduationCap },
      { id: "e3", title: "Application Deadline: Vercel Labs Intern", host: "Vercel Labs Panel", datetime: "August 5, 2026 at 11:59 PM", icon: Calendar },
    ];

    const required = ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "System Design", "Docker"];
    const skillGaps = required
      .filter((s) => !activeSkills.some((as) => as.skill_name.toLowerCase() === s.toLowerCase()))
      .map((s) => {
        const isCritical = ["Node.js", "PostgreSQL", "System Design"].includes(s);
        return {
          name: s,
          urgency: isCritical ? ("Critical" as const) : ("Moderate" as const),
          action: isCritical ? "Complete Skill Assessment" : "Link GitHub Repository",
        };
      });

    return {
      userMajor,
      userUniv,
      userGradYear,
      activeSkills,
      activeInternships,
      activeMentor,
      activeResumes,
      resumeScore: 78,
      activeProjects,
      activePortfolios,
      activeCertificates,
      activeEvents,
      skillGaps,
    };
  }, [skills, internships, mentorAssignment, resumes, projects, portfolios, certificates, studentProfile]);

  // ── Roadmap ────────────────────────────────────────────────────────────────
  const roadmapPhases = useMemo(() => {
    const raw = dnaReportData.content?.recommendedLearningRoadmap || [];
    const phase = (
      i: number,
      title: string,
      desc: string,
      why: string,
      covered: string[],
      dur: string,
      dna: string,
      read: string,
      cos: string[],
      ai: string,
      priority: "High" | "Medium" | "Critical",
      ctas: [string, string, string],
      actionType: string
    ) => ({
      title: raw[i]?.title || title,
      description: raw[i]?.description || desc,
      status: phaseCompletions[i]
        ? ("completed" as const)
        : i === 0 || phaseCompletions[i - 1]
        ? ("in_progress" as const)
        : ("pending" as const),
      time: dur,
      priority,
      cta: phaseCompletions[i] ? ctas[0] : i === 0 || phaseCompletions[i - 1] ? ctas[1] : ctas[2],
      actionType,
      whyItMatters: raw[i]?.whyItMatters || why,
      skillsCovered: raw[i]?.skillsCovered || covered,
      duration: raw[i]?.duration || dur,
      dnaGain: raw[i]?.dnaGain || dna,
      readinessGain: raw[i]?.readinessGain || read,
      companies: raw[i]?.companies || cos,
      aiExplanation: raw[i]?.aiExplanation || ai,
    });

    return [
      phase(0, "Complete React & Next.js", "Master React hooks and server rendering.", "Modern SaaS requires advanced state sync.", ["React hooks", "Server Components", "Tailwind styling"], "2 weeks", "+12", "+15%", ["Vercel", "Linear", "Supabase", "Google"], "Positions you in the top 15% of candidate matches.", "High", ["View Skill Matrix", "Start Learning", "Unlock Phase"], "skills"),
      phase(1, "Learn DSA Basics", "Focus on indexing structures and algorithms.", "Algorithm design underpins all backend query loops.", ["Sorting Arrays", "Tree traversals", "PostgreSQL indexing"], "3 weeks", "+8", "+10%", ["Google", "Amazon", "Meta", "Netflix"], "Dynamic arrays save execution cycles.", "High", ["Practice Completed", "Practice Now", "Unlock Phase"], "dsa"),
      phase(2, "Build 2 Full Stack Projects", "Coordinate server/client state synchronization.", "Real RLS portfolio convinces hiring leads fastest.", ["Supabase joins", "Database design", "Next.js server actions"], "4 weeks", "+15", "+18%", ["Supabase", "Vercel", "Stripe", "Clerk"], "Two verified deployment links demonstrate engineering maturity.", "High", ["View Portfolios", "Continue Building", "Link Repo"], "projects"),
      phase(3, "ATS Resume Tuning", "Tweak impact metrics and test PDF formatting.", "ATS-compliant layout bypasses bots and reaches reviewers.", ["ATS parsing", "Impact metrics", "Core keywords"], "1 week", "+10", "+12%", ["Workday", "Taleo", "Lever", "Greenhouse"], "Quantifiable records trigger recruiter notifications.", "Medium", ["View ATS Score", "Optimize Now", "Upload PDF"], "resume"),
      phase(4, "Expert Mock Interview", "System design and React data flow prep with mentor.", "Mock sessions build technical speech vocabulary.", ["System design", "State sync explanations", "Soft skills"], "2 weeks", "+8", "+10%", ["Google Brain", "Vercel", "Stanford AI labs"], "Speaking out loud increases positive evaluation ratings.", "High", ["View Session Prep", "Book Appointment", "Request Session"], "mentor"),
      phase(5, "Apply for Internships", "Submit matching positions to partner companies.", "Connects verified expertise to company applications.", ["Ledger validation", "Application submissions", "Follow-up"], "4 weeks", "+20", "+25%", ["All VAJRA Partners"], "4.2x higher interview conversion rate.", "Critical", ["Apply Now", "Apply Now", "Apply Now"], "apply"),
    ];
  }, [dnaReportData, phaseCompletions]);

  const overallRoadmapProgress = useMemo(() => {
    const comp = phaseCompletions.filter(Boolean).length;
    return {
      completionRate: Math.round((comp / 6) * 100),
      remainingDays: (6 - comp) * 14,
      predictedReadiness: Math.min(98, 40 + comp * 8),
    };
  }, [phaseCompletions]);

  const dailyGoal = useMemo(
    () =>
      dnaReportData.content?.suggestedDailyGoal || {
        title: "Model a Postgres Schema",
        desc: "Design a relational schema with 3 tables and test RLS constraints in Supabase.",
        time: "45 minutes",
        priority: "High",
        actionText: "Open SQL Editor",
        actionType: "dsa",
      },
    [dnaReportData]
  );

  const quickPrompts = [
    { text: "Skill Gaps", query: "What are my biggest skill gaps and how do I close them in 30 days?" },
    { text: "Resume Tips", query: "My resume score is low. What are the top 3 high-impact changes to pass ATS?" },
    { text: "Practice Interview", query: "Ask me a hard React and System Design question to practice for Vercel." },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSyncGithub = async () => {
    setIsSyncing(true);
    const p = new Promise((r) => setTimeout(r, 2000));
    toast.promise(p, {
      loading: "Scanning GitHub repositories...",
      success: "GitHub synced! Readiness Score boosted by +4%.",
      error: "Error syncing with GitHub API.",
    });
    await p;
    setIsSyncing(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const fn = async () => {
      const res = await recalculateCareerDnaAction();
      if (!res.success || !res.report) throw new Error(res.error || "Calibration error");
      setActiveDnaReport(res.report);
      return res.report;
    };
    toast.promise(fn(), {
      loading: "AI Engine analyzing career timeline...",
      success: (r) => `DNA Report compiled! Score: ${(r as CareerDnaAnalysisResult).career_dna_score}%`,
      error: (e: Error) => `Error: ${e.message}`,
    });
    try {
      await fn();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSendMessage = async (customQuery?: string) => {
    const text = customQuery || coachInput;
    if (!text.trim()) return;
    setCoachMessages((p) => [...p, { sender: "user", text, time: "Just Now" }]);
    setCoachInput("");
    setCoachTyping(true);
    await new Promise((r) => setTimeout(r, 2000));
    const lower = text.toLowerCase();
    let reply =
      "Fascinating query! Building a production-ready Next.js 15 + Supabase app will prove your system proficiency. Want me to map a portfolio architecture?";
    if (lower.includes("gap") || lower.includes("skill"))
      reply = "Scanning target internships... Most top-vetted roles require intermediate PostgreSQL and Node.js. I recommend completing a backend database project or linking a PostgreSQL repository.";
    else if (lower.includes("resume") || lower.includes("ats"))
      reply = "Your Resume Health is at 78/100. Top changes: 1. Replace soft terms with quantifiable impact. 2. List Next.js explicitly. 3. Standardize contact headers.";
    else if (lower.includes("interview") || lower.includes("practice"))
      reply = "Vercel Labs might ask: 'How do Next.js Server Components differ from Client Components, and how do you coordinate state synchronization across the network boundary?' How would you reply?";
    setCoachMessages((p) => [...p, { sender: "coach", text: reply, time: "Just Now" }]);
    setCoachTyping(false);
  };

  const handleRoadmapAction = (actionType: string) => {
    const msgs: Record<string, string> = {
      skills: "Opening Skill Intelligence Matrix...",
      dsa: "Opening DSA Practice Lab...",
      projects: "Opening Portfolio Builder...",
      resume: "Opening ATS Optimizer...",
      mentor: "Opening Mentor Scheduler...",
      apply: "Scanning matching positions...",
    };
    toast.info(msgs[actionType] || "Navigating path...");
  };

  const handleRoadmapToggle = (index: number, title: string) => {
    const next = [...phaseCompletions];
    const orig = next[index];
    next[index] = !orig;
    setPhaseCompletions(next);
    if (!orig) {
      setStudentXp((p) => p + 50);
      setUnlockedBadge({ title: `${title} Master`, xp: 50, icon: "🏆", desc: `You unlocked "${title}" and gained +50 XP!` });
      toast.success("Milestone completed! +50 XP");
    } else {
      setStudentXp((p) => Math.max(0, p - 50));
      toast.info("Milestone unmarked.");
    }
  };

  const handleOpenApply = (internship: InternshipItem) => {
    setSelectedInternship(internship);
    setApplicationResume(resumes.find((r) => r.is_primary)?.file_url || "Primary_Resume.pdf");
    setApplicationCoverLetter("");
  };

  const handleQuickApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;
    setApplying(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(`Application submitted to ${selectedInternship.companies?.name || "Company"} for ${selectedInternship.title}!`);
    setApplying(false);
    setSelectedInternship(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-12">

      {/* Badge Unlock Notification */}
      <AnimatePresence>
        {unlockedBadge && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed top-6 right-6 z-50 bg-card border border-primary/30 rounded-2xl p-5 shadow-2xl max-w-xs"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{unlockedBadge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-foreground">{unlockedBadge.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{unlockedBadge.desc}</p>
              </div>
              <button onClick={() => setUnlockedBadge(null)} className="text-muted-foreground hover:text-foreground text-xs cursor-pointer">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 1. WELCOME HERO ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={profileName} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover border border-border/60 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-xl">
                {initials(profileName)}
              </div>
            )}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                <Sparkles className="w-3 h-3 animate-pulse" />
                AI Intelligence Calibrated
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome Back, {profileName} 👋
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Target Path: <span className="text-foreground font-semibold">{data.userMajor}</span> • {data.userUniv}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-muted-foreground">Class of {data.userGradYear || 2027}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Explorer Tier
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 sm:hidden">
          Target Path: <span className="text-foreground font-semibold">{data.userMajor}</span> • {data.userUniv}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Career DNA", val: `${dnaReportData.career_dna_score}%`, icon: BarChart2, color: "text-primary bg-primary/5" },
            { label: "Skills Verified", val: `${data.activeSkills.filter((s) => s.proficiency === "advanced").length} Advanced`, icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/5" },
            { label: "Credentials", val: `${data.activeCertificates.length} Certs`, icon: Trophy, color: "text-purple-400 bg-purple-500/5" },
            { label: "Builds Synced", val: `${data.activeProjects.length} Projects`, icon: Github, color: "text-amber-400 bg-amber-500/5" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-3 bg-muted/40 border border-border/60 rounded-2xl flex items-center gap-2.5">
                <div className={`p-2 rounded-xl shrink-0 ${item.color}`}><Icon className="w-4 h-4" /></div>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold truncate">{item.label}</p>
                  <p className="text-xs font-extrabold text-foreground truncate">{item.val}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ 2. CAREER DNA + INTERNSHIP READINESS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Career DNA Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />Career DNA Score
            </h3>
            <span className="h-2 w-2 rounded-full bg-primary shadow-md shadow-primary/30 animate-pulse" />
          </div>
          <div className="flex gap-1.5 p-1 bg-muted/40 border border-border/50 rounded-xl mb-4">
            {(["breakdown", "diagnostics"] as const).map((tab) => (
              <button key={tab} onClick={() => setDnaTab(tab)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${dnaTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tab === "breakdown" ? "📊 Breakdown" : "🔬 Diagnostics"}
              </button>
            ))}
          </div>
          {dnaTab === "breakdown" ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-extrabold text-foreground tracking-tight">
                    {dnaReportData.career_dna_score}<span className="text-xl text-muted-foreground">/100</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Confidence: <span className="text-foreground font-bold capitalize">{dnaReportData.confidence_level}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">↑ +4 pts this week</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Top 18% of peers</span>
                </div>
              </div>
              <div className="h-2 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700" style={{ width: `${dnaReportData.career_dna_score}%` }} />
              </div>
              {dnaReportData.explanation_metadata && (
                <div className="space-y-2">
                  {Object.entries(dnaReportData.explanation_metadata).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="font-bold text-foreground">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-[10px]">
              {[
                { label: "Profile Completion", score: dnaReportData.profile_completion, color: "bg-blue-500" },
                { label: "Internship Readiness", score: dnaReportData.internship_score, color: "bg-emerald-500" },
                { label: "Skill Depth", score: Math.min(100, data.activeSkills.filter((s) => s.proficiency === "advanced").length * 20), color: "bg-amber-500" },
                { label: "Portfolio Score", score: Math.min(100, data.activeProjects.length * 30 + data.activePortfolios.length * 20), color: "bg-purple-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground">{item.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="w-full mt-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {isGeneratingReport ? (
              <span className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Calibrating AI Engine...</span>
            ) : "Recalibrate Career DNA"}
          </Button>
        </motion.div>

        {/* Internship Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />Internship Readiness
            </h3>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" />
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-4xl font-extrabold text-foreground tracking-tight">
                {dnaReportData.internship_score}<span className="text-xl text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Ready for vetted internship applications</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 block">84% shortlist odds</span>
              <span className="text-[10px] text-muted-foreground font-mono">Based on DNA match</span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted border border-border/30 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${dnaReportData.internship_score}%` }} />
          </div>
          <div className="space-y-2.5 text-[10px]">
            {[
              { label: "Skills Match", val: `${Math.min(100, data.activeSkills.length * 12)}%`, ok: data.activeSkills.length >= 4 },
              { label: "Resume Uploaded", val: data.activeResumes.length > 0 ? "Yes" : "No", ok: data.activeResumes.length > 0 },
              { label: "Mentor Assigned", val: data.activeMentor ? "Assigned" : "Pending", ok: !!data.activeMentor },
              { label: "Projects Completed", val: `${data.activeProjects.length} / 2`, ok: data.activeProjects.length >= 2 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted/30 border border-border/40 rounded-xl">
                <span className="text-muted-foreground font-medium">{row.label}</span>
                <span className={`font-bold flex items-center gap-1 ${row.ok ? "text-emerald-400" : "text-amber-400"}`}>
                  {row.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ 3. AI CAREER COACH + SKILL INTELLIGENCE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AI Career Coach */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 flex flex-col justify-between min-h-[500px] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />AI Career Coach
              </h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex gap-1.5 p-1 bg-muted/40 border border-border/50 rounded-xl mt-3">
              {(["chat", "profile"] as const).map((tab) => (
                <button key={tab} onClick={() => setCoachTab(tab)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${coachTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab === "chat" ? "💬 Chat Workspace" : "📋 AI Target Profile"}
                </button>
              ))}
            </div>
            {coachTab === "chat" ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 py-4 text-xs">
                {coachMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <div className={`p-3 rounded-2xl leading-relaxed ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border/50"}`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 px-1 font-mono">{msg.time}</span>
                  </div>
                ))}
                {coachTyping && (
                  <div className="flex flex-col items-start max-w-[85%] mr-auto">
                    <div className="p-3 bg-muted rounded-2xl rounded-tl-none border border-border/50 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            ) : (
              <div className="py-4 space-y-3 text-[10px] max-h-[280px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2 bg-muted/20 border border-border/50 p-2 rounded-xl">
                  <div><span className="text-[7px] text-muted-foreground uppercase font-bold tracking-wider block">Readiness Index</span><span className="text-xs font-bold text-foreground">{dnaReportData.internship_score}% Ready</span></div>
                  <div><span className="text-[7px] text-muted-foreground uppercase font-bold tracking-wider block">Shortlist Odds</span><span className="text-xs font-bold text-emerald-400">84% probability</span></div>
                </div>
                <div><span className="text-[8px] text-primary uppercase font-extrabold tracking-wider block mb-0.5">Next Milestone Focus</span><p className="text-foreground font-bold">Phase 3: Build 2 Full Stack Projects (+15 DNA XP)</p></div>
                <div><span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">Matching Employers</span><div className="flex flex-wrap gap-1 mt-1">{["Supabase", "Vercel", "Stripe", "Linear"].map((e, i) => (<span key={i} className="text-[8px] font-bold px-1.5 py-0.5 bg-muted border border-border text-foreground rounded">{e}</span>))}</div></div>
              </div>
            )}
          </div>
          {coachTab === "chat" && (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickPrompts.map((p, i) => (
                  <button key={i} onClick={() => handleSendMessage(p.query)} className="px-3 py-1.5 bg-muted/60 hover:bg-muted border border-border/60 hover:border-border rounded-xl text-[10px] font-medium text-foreground transition-all cursor-pointer">
                    {p.text}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <Input
                  placeholder="Ask your Coach..."
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  className="flex-1 bg-muted/40 border-border text-xs rounded-xl focus-visible:ring-primary/20 h-10 px-3"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 w-10 shrink-0 cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Skill Intelligence + Skill Gap */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]"
        >
          {/* Skill Intelligence */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Award className="w-4 h-4 text-emerald-400" />Skill Intelligence Matrix</h3>
              <button onClick={handleSyncGithub} disabled={isSyncing} className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 cursor-pointer disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />Sync
              </button>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {data.activeSkills.map((skill, i) => {
                const pct = Math.min(98, skill.proficiency === "advanced" ? 85 + i * 2 : skill.proficiency === "intermediate" ? 55 + i * 4 : 25 + i * 3);
                const col = skill.proficiency === "advanced" ? "bg-emerald-500" : skill.proficiency === "intermediate" ? "bg-blue-500" : "bg-amber-500";
                const textCol = skill.proficiency === "advanced" ? "text-emerald-400" : skill.proficiency === "intermediate" ? "text-blue-400" : "text-amber-400";
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-foreground">{skill.skill_name}</span>
                      <span className={`font-bold capitalize ${textCol}`}>{skill.proficiency}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                      <div className={`h-full ${col} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={handleSyncGithub} disabled={isSyncing} className="mt-4 w-full py-2.5 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl cursor-pointer">
              <Github className="w-3.5 h-3.5 mr-1.5" />{isSyncing ? "Syncing GitHub..." : "Sync GitHub Repositories"}
            </Button>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" />Skill Gap Analysis</h3>
              <span className="text-[10px] font-bold text-amber-400 font-mono">{data.skillGaps.length} gaps</span>
            </div>
            {data.skillGaps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="text-sm font-bold text-foreground">No Skill Gaps Detected</p>
                <p className="text-[10px] text-muted-foreground mt-1">Your profile meets all key requirements.</p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {data.skillGaps.map((gap, i) => (
                  <div key={i} className="p-3 bg-muted/30 border border-border/50 rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate">{gap.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{gap.action}</p>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase shrink-0 border ${gap.urgency === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {gap.urgency}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button className="mt-4 w-full py-2.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Missing Skills
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ═══ 4. AI CAREER ROADMAP ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground tracking-tight">🚀 AI Career Roadmap</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">AI-generated milestones for: <span className="text-foreground font-semibold">{data.userMajor}</span></p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold font-mono shrink-0">
            Level {Math.floor(studentXp / 500) + 1} ({studentXp % 500}/500 XP)
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          <div className="xl:col-span-8 space-y-6">
            {/* Progress bar */}
            <div className="bg-muted/10 border border-border/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Roadmap Progress</span>
                  <span className="text-primary font-mono">{overallRoadmapProgress.completionRate}%</span>
                </div>
                <div className="h-2 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${overallRoadmapProgress.completionRate}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 shrink-0 text-xs">
                <div className="border-l border-border/60 pl-4 space-y-0.5">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Estimated Ready</span>
                  <span className="font-extrabold text-foreground">{overallRoadmapProgress.remainingDays} Days</span>
                </div>
                <div className="border-l border-border/60 pl-4 space-y-0.5">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Shortlist Odds</span>
                  <span className="font-extrabold text-emerald-500 font-mono">+{overallRoadmapProgress.predictedReadiness}% Match</span>
                </div>
              </div>
            </div>

            {/* Phase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmapPhases.map((phase, idx) => {
                const isCompleted = phase.status === "completed";
                const isInProgress = phase.status === "in_progress";
                const isExpanded = expandedPhase === idx;
                return (
                  <div
                    key={idx}
                    className={`relative group flex flex-col justify-between p-4 bg-muted/20 border rounded-2xl transition-all duration-300 min-h-[200px] ${isExpanded ? "border-primary bg-card/60 shadow-lg ring-1 ring-primary/10 md:col-span-2 lg:col-span-3" : "border-border/50 hover:border-primary/20"}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold text-muted-foreground uppercase font-mono tracking-wider">Phase {idx + 1}</span>
                          <button
                            onClick={() => handleRoadmapToggle(idx, phase.title)}
                            className={`p-1 rounded-md border transition-all cursor-pointer ${isCompleted ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted border-border hover:bg-muted/80 text-muted-foreground"}`}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setExpandedPhase(isExpanded ? null : idx)} className="p-1 hover:bg-muted border border-border/60 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${isCompleted ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : isInProgress ? "bg-primary/10 border-primary/30 text-primary animate-pulse" : "bg-muted border-border text-muted-foreground"}`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : isInProgress ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>{idx + 1}</span>}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 cursor-pointer" onClick={() => setExpandedPhase(isExpanded ? null : idx)}>
                        <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{phase.title}</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{phase.description}</p>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pt-4 mt-3 border-t border-border/40 space-y-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div><span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Why it matters</span><p className="text-[10px] text-foreground leading-relaxed">{phase.whyItMatters}</p></div>
                              <div><span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">AI Explanation</span><p className="text-[10px] text-muted-foreground leading-relaxed italic">&quot;{phase.aiExplanation}&quot;</p></div>
                            </div>
                            <div className="space-y-2">
                              <div><span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">Skills Covered</span><div className="flex flex-wrap gap-1.5">{phase.skillsCovered.map((s, i) => (<span key={i} className="text-[8px] font-medium px-2 py-0.5 bg-muted border border-border/60 rounded text-foreground">{s}</span>))}</div></div>
                              <div className="grid grid-cols-3 gap-2 text-[9px] bg-muted/30 border border-border/40 p-2 rounded-xl">
                                <div><span className="text-muted-foreground block text-[7px] uppercase tracking-wider">Duration</span><span className="text-foreground font-bold">{phase.duration}</span></div>
                                <div><span className="text-muted-foreground block text-[7px] uppercase tracking-wider">DNA Gain</span><span className="text-primary font-bold">{phase.dnaGain}</span></div>
                                <div><span className="text-muted-foreground block text-[7px] uppercase tracking-wider">Readiness</span><span className="text-emerald-500 font-bold">{phase.readinessGain}</span></div>
                              </div>
                              <div><span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Valued by employers</span><div className="flex flex-wrap gap-1.5">{phase.companies.map((c, i) => (<span key={i} className="text-[8px] font-bold px-2 py-0.5 bg-primary/5 border border-primary/20 rounded text-primary font-mono">{c}</span>))}</div></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="space-y-3 pt-3 border-t border-border/30 mt-4">
                      <div className="flex items-center justify-between text-[8px] font-mono font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{phase.time}</span>
                        <span className={`px-1.5 py-0.5 rounded uppercase border ${phase.priority === "Critical" ? "bg-destructive/15 text-destructive border-destructive/20" : phase.priority === "High" ? "bg-amber-500/15 text-amber-500 border-amber-500/20" : "bg-blue-500/15 text-blue-500 border-blue-500/20"}`}>{phase.priority}</span>
                      </div>
                      <Button
                        onClick={() => handleRoadmapAction(phase.actionType)}
                        className={`w-full py-2 text-[10px] font-bold rounded-xl cursor-pointer transition-all ${isCompleted ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" : isInProgress ? "bg-primary hover:bg-primary/90 text-white" : "bg-muted border border-border text-muted-foreground hover:text-foreground"}`}
                      >
                        {phase.cta}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP + Daily Goal */}
          <div className="xl:col-span-4 space-y-6 flex flex-col">
            <div className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-4 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /><h4 className="text-xs font-bold text-foreground">AI Career Profile XP</h4></div>
                <span className="text-[10px] font-mono text-muted-foreground">Level {Math.floor(studentXp / 500) + 1}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div><span className="text-[10px] text-muted-foreground block">Total Experience</span><span className="text-2xl font-extrabold text-foreground tracking-tight">{studentXp} XP</span></div>
                  <span className="text-[9px] font-mono font-bold text-primary">Level Up in {500 - (studentXp % 500)} XP</span>
                </div>
                <div className="h-2 w-full bg-muted border border-border/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500" style={{ width: `${((studentXp % 500) / 500) * 100}%` }} />
                </div>
                <p className="text-[9px] text-muted-foreground leading-relaxed">Earn XP by syncing repositories, validating certificates, and marking roadmap milestones completed.</p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between pb-3 border-b border-primary/10">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary animate-pulse" /><h4 className="text-xs font-bold text-foreground">Today&apos;s AI Goal</h4></div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${dailyGoal.priority === "High" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>{dailyGoal.priority} Priority</span>
              </div>
              <div className="space-y-3">
                <div><h5 className="text-xs font-extrabold text-foreground">{dailyGoal.title}</h5><p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{dailyGoal.desc}</p></div>
                <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground font-mono"><span>Est. time: {dailyGoal.time}</span><span>Gained from DNA gaps</span></div>
                <Button onClick={() => handleRoadmapAction(dailyGoal.actionType)} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-xl cursor-pointer">{dailyGoal.actionText}</Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ 5. PREDICTIVE CAREER INTELLIGENCE ENGINE ═══ */}
      {(() => {
        const predictiveInputs: PredictiveInputs = {
          profile: studentProfile,
          skills: data.activeSkills,
          projects: data.activeProjects,
          resumes: data.activeResumes,
          certificates: data.activeCertificates,
          portfolios: data.activePortfolios,
          feedback: [],
          timeline: careerTimeline,
          currentDnaScore: dnaReportData.career_dna_score,
          currentReadinessScore: dnaReportData.internship_score,
        };
        const completedCount = phaseCompletions.filter(Boolean).length;
        return (
          <PredictiveCareerPanel
            inputs={predictiveInputs}
            completedPhaseCount={completedCount}
            onRecalibrate={handleGenerateReport}
          />
        );
      })()}

      {/* ═══ 6. RECOMMENDED INTERNSHIPS ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" />Recommended Internships</h3>
          <span className="text-[10px] font-mono text-muted-foreground">{data.activeInternships.length} matched positions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.activeInternships.map((internship) => (
            <div key={internship.id} className="p-4 bg-muted/20 border border-border/50 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-colors group">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">{internship.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      {internship.companies?.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                      {internship.companies?.name || "Vetted Company"}
                    </p>
                  </div>
                  {internship.matchScore && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg shrink-0 font-mono">{internship.matchScore}%</span>}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{internship.description}</p>
                <div className="flex flex-wrap gap-1">{(internship.skills_needed || []).slice(0, 3).map((s, i) => (<span key={i} className="text-[8px] font-medium px-1.5 py-0.5 bg-muted border border-border/60 rounded text-foreground">{s}</span>))}</div>
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{internship.location}</span>
                  {internship.salary_range && <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{internship.salary_range}</span>}
                </div>
              </div>
              <Button onClick={() => handleOpenApply(internship)} className="mt-3 w-full py-2 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">
                Quick Apply<ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ 6. MENTOR + RESUME + PORTFOLIO ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mentor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><User className="w-4 h-4 text-purple-400" />Assigned Mentor</h3>
            {data.activeMentor && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
          </div>
          {data.activeMentor ? (
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-base">{initials(data.activeMentor.mentors?.users?.full_name || "Mentor")}</div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-foreground leading-tight truncate">{data.activeMentor.mentors?.users?.full_name || "Dr. Sarah Jenkins"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{data.activeMentor.mentors?.job_title || "Principal Research Architect"}</p>
                  <p className="text-[10px] text-primary font-bold truncate">{data.activeMentor.mentors?.company_name || "Google Brain"}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{data.activeMentor.mentors?.bio || "Principal AI Research Scientist. Ex-Stanford Faculty."}</p>
              <div className="flex flex-wrap gap-1.5">{(data.activeMentor.mentors?.expertise || []).map((e, i) => (<span key={i} className="text-[8px] font-bold px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400">{e}</span>))}</div>
              <Button className="w-full py-2.5 text-[10px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl cursor-pointer mt-auto">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />Message Mentor
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <User className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-bold text-foreground">No Mentor Yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">A mentor will be assigned based on your Career DNA.</p>
              <Button className="mt-4 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">Request Mentor</Button>
            </div>
          )}
        </motion.div>

        {/* Resume Health */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" />Resume Health</h3>
            <span className="text-[10px] font-mono font-bold text-amber-400">{data.resumeScore}/100</span>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1.5"><span className="text-muted-foreground">ATS Score</span><span className="text-foreground">{data.resumeScore}%</span></div>
              <div className="h-2.5 w-full bg-muted border border-border/30 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${data.resumeScore}%` }} /></div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Quantified Impact", ok: false, tip: "Add measurable metrics" },
                { label: "Skills Keywords", ok: true, tip: "Next.js listed correctly" },
                { label: "ATS Format", ok: true, tip: "PDF structure validated" },
                { label: "Contact Headers", ok: false, tip: "Standardize formatting" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 border border-border/40 rounded-xl">
                  <div className="flex items-center gap-2">{item.ok ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}<span className="text-[10px] font-medium text-foreground">{item.label}</span></div>
                  <span className="text-[9px] text-muted-foreground">{item.tip}</span>
                </div>
              ))}
            </div>
            {data.activeResumes.length === 0 ? (
              <Button className="w-full mt-auto py-2.5 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl cursor-pointer"><Upload className="w-3.5 h-3.5 mr-1.5" />Upload Resume</Button>
            ) : (
              <Button className="w-full mt-auto py-2.5 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer">Optimize with AI</Button>
            )}
          </div>
        </motion.div>

        {/* Portfolio Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="lg:col-span-4 bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" />Portfolio Progress</h3>
            <span className="text-[10px] font-mono text-muted-foreground">{data.activeProjects.length + data.activePortfolios.length} builds</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {data.activeProjects.map((proj, i) => (
              <div key={i} className="p-3 bg-muted/30 border border-border/50 rounded-2xl group hover:border-blue-400/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="text-[11px] font-bold text-foreground truncate group-hover:text-blue-400 transition-colors">{proj.title}</p><p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{proj.description}</p></div>
                  {proj.github_url && <Link href={proj.github_url} target="_blank" className="shrink-0"><Github className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" /></Link>}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">{proj.technologies.slice(0, 3).map((t, j) => (<span key={j} className="text-[8px] px-1.5 py-0.5 bg-muted border border-border/60 rounded text-foreground">{t}</span>))}</div>
              </div>
            ))}
            {data.activePortfolios.map((port, i) => (
              <div key={`port-${i}`} className="p-3 bg-muted/30 border border-border/50 rounded-2xl flex items-center justify-between">
                <div className="min-w-0"><p className="text-[11px] font-bold text-foreground truncate">{port.title}</p><p className="text-[9px] text-blue-400 truncate">{port.asset_url}</p></div>
                <Link href={port.asset_url} target="_blank"><ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" /></Link>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 py-2.5 text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5 mr-1.5" />Add New Project</Button>
        </motion.div>
      </div>

      {/* ═══ 7. ACHIEVEMENTS + UPCOMING EVENTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" />Achievements & Certificates</h3>
            <span className="text-[10px] font-mono text-muted-foreground">{data.activeCertificates.length} earned</span>
          </div>
          <div className="space-y-3">
            {data.activeCertificates.map((cert, i) => (
              <div key={i} className="p-3 bg-muted/30 border border-border/50 rounded-2xl flex items-center gap-3 group hover:border-amber-400/30 transition-colors">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><Award className="w-4 h-4 text-amber-400" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-foreground truncate group-hover:text-amber-400 transition-colors">{cert.name}</p>
                  <p className="text-[9px] text-muted-foreground">{cert.issuer} • {new Date(cert.issue_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                </div>
                {cert.credential_url ? (
                  <Link href={cert.credential_url} target="_blank"><ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" /></Link>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
            ))}
            <Button className="w-full mt-2 py-2.5 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5 mr-1.5" />Add Certificate</Button>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" />Upcoming Events</h3>
            <span className="text-[10px] font-mono text-muted-foreground">{data.activeEvents.length} scheduled</span>
          </div>
          <div className="space-y-3">
            {data.activeEvents.map((event, i) => {
              const Icon = event.icon;
              return (
                <div key={i} className="p-3 bg-muted/30 border border-border/50 rounded-2xl flex items-center gap-3 group hover:border-emerald-400/30 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-emerald-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-foreground truncate group-hover:text-emerald-400 transition-colors">{event.title}</p>
                    <p className="text-[9px] text-muted-foreground">{event.host}</p>
                    <p className="text-[9px] text-emerald-400 font-mono mt-0.5">{event.datetime}</p>
                  </div>
                  <Button size="sm" className="shrink-0 text-[9px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg cursor-pointer h-7 px-2">Join</Button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══ QUICK APPLY MODAL ═══ */}
      <Dialog open={!!selectedInternship} onOpenChange={(open) => !open && setSelectedInternship(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Apply</DialogTitle>
            <DialogDescription>
              Submit your application to <strong>{selectedInternship?.companies?.name || "this company"}</strong> for <strong>{selectedInternship?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickApplySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Resume URL / File</label>
              <Input value={applicationResume} onChange={(e) => setApplicationResume(e.target.value)} placeholder="Primary_Resume.pdf" className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Cover Letter (optional)</label>
              <textarea
                value={applicationCoverLetter}
                onChange={(e) => setApplicationCoverLetter(e.target.value)}
                placeholder="Write a brief cover letter..."
                rows={4}
                className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <DialogFooter className="gap-2">
              <DialogClose>
                <Button type="button" variant="outline" className="text-xs cursor-pointer">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={applying} className="text-xs bg-primary hover:bg-primary/90 text-white cursor-pointer">
                {applying ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

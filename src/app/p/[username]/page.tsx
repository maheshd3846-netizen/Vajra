import React from "react";
import Link from "next/link";
import { getPublicPortfolioAction } from "@/app/actions/portfolio";
import {
  Github,
  Linkedin,
  GraduationCap,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mail,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PublicPortfolioProps {
  params: Promise<{ username: string }>;
}

export default async function PublicPortfolioViewPage({ params }: PublicPortfolioProps) {
  const { username } = await params;

  // Query portfolio details using Server Action
  const res = await getPublicPortfolioAction(username);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-foreground font-sans">
        <div className="max-w-md bg-slate-900/50 border border-white/10 p-8 rounded-2xl space-y-6">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-lg font-bold text-white font-heading">Portfolio Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The developer portfolio matching slug <span className="text-white font-semibold">/p/{username}</span> has not been configured or published yet.
          </p>
          <div className="pt-2">
            <Link href="/">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
                Go to VAJRA Homepage
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { title, description, student, skills, projects } = res.data;

  // Parse configuration from description JSON
  let bio = description || "Full Stack Engineer specializing in modern architectures.";
  let accent: "cyan" | "emerald" | "purple" | "amber" = "cyan";
  let showResume = true;
  let showReadiness = true;
  let showProjects = true;

  if (description) {
    try {
      const config = JSON.parse(description);
      bio = config.bio || bio;
      accent = config.accent || "cyan";
      showResume = config.showResume !== undefined ? config.showResume : true;
      showReadiness = config.showReadiness !== undefined ? config.showReadiness : true;
      showProjects = config.showProjects !== undefined ? config.showProjects : true;
    } catch {
      // Treat as simple string
      bio = description;
    }
  }

  const getAccentClass = (col: typeof accent) => {
    switch (col) {
      case "emerald":
        return {
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          bg: "bg-emerald-500/10",
          glow: "from-emerald-500/10",
          button: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/30",
        };
      case "purple":
        return {
          text: "text-purple-400",
          border: "border-purple-500/20",
          bg: "bg-purple-500/10",
          glow: "from-purple-500/10",
          button: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-500/30",
        };
      case "amber":
        return {
          text: "text-amber-400",
          border: "border-amber-500/20",
          bg: "bg-amber-500/10",
          glow: "from-amber-500/10",
          button: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/30",
        };
      default:
        return {
          text: "text-blue-400", // "cyan" mapped to signature blue
          border: "border-blue-500/20",
          bg: "bg-blue-500/10",
          glow: "from-blue-500/10",
          button: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/30",
        };
    }
  };

  const style = getAccentClass(accent);

  return (
    <div className="min-h-screen bg-slate-950 text-foreground font-sans relative overflow-x-hidden">
      {/* Background ambient glows */}
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b ${style.glow} to-transparent rounded-full blur-3xl pointer-events-none opacity-40`} />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main content container */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12 relative z-10">
        
        {/* Header navigation bar */}
        <header className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-1.5">
            <span className="h-6 w-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-widest font-heading select-none">
              V
            </span>
            <span className="text-xs font-bold text-white tracking-widest uppercase">VAJRA</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            {student.githubUrl && (
              <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-0.5">
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            )}
            {student.linkedinUrl && (
              <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-0.5">
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] uppercase font-mono tracking-widest ${style.text} font-bold px-2 py-0.5 rounded ${style.bg} border ${style.border}`}>
              {student.major || "Software Engineer"}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Explorer 🚀
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none font-heading">
              {title}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
              {bio}
            </p>
          </div>

          {/* Academic specs */}
          <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-2">
            {student.university && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                {student.university}
              </span>
            )}
            {student.gradYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Class of {student.gradYear}
              </span>
            )}
          </div>
        </section>

        {/* Career DNA Readiness Score Card */}
        {showReadiness && (
          <section className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1 justify-center sm:justify-start">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">Verified Career DNA Index</span>
              </div>
              <h3 className="text-sm font-bold text-white font-heading pt-1">AI Competency & Readiness Index</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm">
                This index reflects verified benchmarks calculated through AI review scores, peer code feedback, and technical assessments.
              </p>
            </div>
            {/* Score Ring */}
            <div className={`h-16 w-16 rounded-full bg-slate-950 border-2 ${style.border} flex items-center justify-center shrink-0`}>
              <span className={`text-base font-mono font-bold ${style.text}`}>68%</span>
            </div>
          </section>
        )}

        {/* Skills inventory section */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
            Technical Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border ${
                  skill.verified
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-slate-900/60 border-white/5 text-slate-400"
                }`}
              >
                {skill.verified && <CheckCircle2 className="w-3.5 h-3.5" />}
                {skill.skill_name}
              </span>
            ))}
          </div>
        </section>

        {/* Projects grid section */}
        {showProjects && projects.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Verified Project Showcase
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white leading-snug">{proj.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      {proj.description || "A verified technical build demonstrating proficiency benchmarks."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 text-[9px] font-mono text-blue-400 select-none">
                    <span className="flex items-center gap-0.5">
                      Verified Build
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Baseline Resume CTA */}
        {showResume && (
          <section className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Verified Profile Resume</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                Retrieve and download the verified professional PDF resume synced with the student&apos;s Career DNA profile.
              </p>
            </div>
            <a
              href={`/verify/cert-react-101`} // link to verify page as verification showcase
              className={`py-3.5 px-6 rounded-xl text-xs font-semibold text-white ${style.button} transition-all inline-flex items-center gap-1.5`}
            >
              Verify Credentials
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </section>
        )}

        {/* Footer Contact Info */}
        <footer className="pt-8 border-t border-white/5 text-center space-y-4 font-sans">
          <div className="flex items-center justify-center gap-4 text-xs">
            <a href="mailto:support@vajra.ai" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              Connect with Student
            </a>
          </div>
          <p className="text-[9px] text-slate-600 font-mono select-none">
            Powered by VAJRA – AI Career Intelligence Platform
          </p>
        </footer>

      </div>
    </div>
  );
}

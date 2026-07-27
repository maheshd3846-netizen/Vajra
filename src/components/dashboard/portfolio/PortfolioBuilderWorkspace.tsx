"use client";

import React, { useState } from "react";
import { publishPortfolioAction } from "@/app/actions/portfolio";
import { toast } from "sonner";
import {
  CheckCircle2,
  Github,
  Linkedin,
  Rocket,
  Loader2,
  Sliders,
  Palette,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SkillItem {
  skill_name: string;
  proficiency: string;
  verified: boolean;
}

interface ProjectItem {
  title: string;
  description: string | null;
}

interface PortfolioBuilderWorkspaceProps {
  profileName: string;
  studentProfile: {
    major: string | null;
    university: string | null;
    github_url: string | null;
    linkedin_url: string | null;
  } | null;
  skills: SkillItem[];
  projects: ProjectItem[];
  existingPortfolio: {
    asset_url: string;
    title: string;
    description: string | null;
  } | null;
}

type AccentColor = "emerald" | "cyan" | "purple" | "amber";

export default function PortfolioBuilderWorkspace({
  profileName,
  studentProfile,
  skills,
  projects,
  existingPortfolio,
}: PortfolioBuilderWorkspaceProps) {
  // Parse existing portfolio configuration JSON if present
  let initialBio = "Passionate Software Engineer specializing in modern frontend architectures and scalable API integrations.";
  let initialAccent: AccentColor = "cyan";
  let initialShowResume = true;
  let initialShowReadiness = true;
  let initialShowProjects = true;

  if (existingPortfolio?.description) {
    try {
      const config = JSON.parse(existingPortfolio.description);
      initialBio = config.bio || initialBio;
      initialAccent = config.accent || initialAccent;
      initialShowResume = config.showResume !== undefined ? config.showResume : true;
      initialShowReadiness = config.showReadiness !== undefined ? config.showReadiness : true;
      initialShowProjects = config.showProjects !== undefined ? config.showProjects : true;
    } catch {
      initialBio = existingPortfolio.description || initialBio;
    }
  }

  // State
  const [slug, setSlug] = useState(existingPortfolio?.asset_url || profileName.toLowerCase().replace(/\s+/g, "-"));
  const [title, setTitle] = useState(existingPortfolio?.title || `${profileName}'s Developer Portfolio`);
  const [bio, setBio] = useState(initialBio);
  const [accent, setAccent] = useState<AccentColor>(initialAccent);
  const [showResume, setShowResume] = useState(initialShowResume);
  const [showReadiness, setShowReadiness] = useState(initialShowReadiness);
  const [showProjects, setShowProjects] = useState(initialShowProjects);
  const [isPublishing, setIsPublishing] = useState(false);

  const getAccentClass = (col: AccentColor) => {
    switch (col) {
      case "emerald":
        return { text: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-500/20", glow: "from-emerald-500/20" };
      case "purple":
        return { text: "text-purple-400", bg: "bg-purple-500", border: "border-purple-500/20", glow: "from-purple-500/20" };
      case "amber":
        return { text: "text-amber-400", bg: "bg-amber-500", border: "border-amber-500/20", glow: "from-amber-500/20" };
      default:
        return { text: "text-blue-400", bg: "bg-blue-500", border: "border-blue-500/20", glow: "from-blue-500/20" }; // "cyan" mapped to signature blue
    }
  };

  const currentAccent = getAccentClass(accent);

  const handlePublish = async () => {
    if (!slug) {
      toast.error("Please provide a custom URL slug.");
      return;
    }

    setIsPublishing(true);
    toast.loading("Compiling portfolio details and publishing website...");

    try {
      // Serialize configuration into description field to bypass migration limits
      const configPayload = JSON.stringify({
        bio,
        accent,
        showResume,
        showReadiness,
        showProjects,
      });

      const res = await publishPortfolioAction(slug, title, configPayload);
      toast.dismiss();

      if (res.success) {
        toast.success("Portfolio successfully published!");
      } else {
        toast.error(res.error || "Failed to publish portfolio.");
      }
    } catch {
      toast.dismiss();
      toast.error("An unexpected error occurred during publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreviewLive = () => {
    const origin = window.location.origin;
    window.open(`${origin}/p/${slug}`, "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Control Center (Col span 5) */}
      <div className="lg:col-span-5 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
            Portfolio Configuration
          </h3>
        </div>

        <div className="space-y-4 font-sans">
          {/* Custom Subdomain Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slugInput" className="text-xs text-slate-300 font-semibold">Custom Slug URL</Label>
            <div className="flex items-center">
              <span className="bg-slate-950 border border-r-0 border-white/10 text-[10px] text-slate-500 p-3 rounded-l-xl select-none font-mono">
                /p/
              </span>
              <Input
                id="slugInput"
                placeholder="subdomain-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                className="rounded-l-none bg-slate-950/50 border-white/10 text-white rounded-r-xl placeholder:text-slate-600 focus-visible:ring-blue-500 text-xs py-5"
              />
            </div>
          </div>

          {/* Portfolio Title */}
          <div className="space-y-1.5">
            <Label htmlFor="titleInput" className="text-xs text-slate-300 font-semibold">Portfolio Site Title</Label>
            <Input
              id="titleInput"
              placeholder="My Portfolio Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950/50 border-white/10 text-white rounded-xl placeholder:text-slate-600 focus-visible:ring-blue-500 text-xs py-5"
            />
          </div>

          {/* Bio Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bioInput" className="text-xs text-slate-300 font-semibold">Short Biography</Label>
            <textarea
              id="bioInput"
              rows={4}
              placeholder="Introduce your skills..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-400" />
              Style Color Accent
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {(["cyan", "emerald", "purple", "amber"] as AccentColor[]).map((col) => (
                <button
                  key={col}
                  onClick={() => setAccent(col)}
                  className={`py-2.5 rounded-xl border text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all ${
                    accent === col
                      ? "bg-blue-500/10 border-blue-500 text-white"
                      : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <Label className="text-xs text-slate-300 font-semibold">Section Visibility Toggles</Label>
            
            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="text-xs font-semibold text-slate-300">Show Verified Projects Grid</span>
              <input
                type="checkbox"
                checked={showProjects}
                onChange={(e) => setShowProjects(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 text-blue-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="text-xs font-semibold text-slate-300">Show Baseline Resume Link</span>
              <input
                type="checkbox"
                checked={showResume}
                onChange={(e) => setShowResume(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 text-blue-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="text-xs font-semibold text-slate-300">Show Interview Readiness Index</span>
              <input
                type="checkbox"
                checked={showReadiness}
                onChange={(e) => setShowReadiness(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 text-blue-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/5 font-sans">
          <button
            onClick={handlePreviewLive}
            className="flex-1 py-3 text-xs font-semibold text-muted-foreground hover:text-white border border-white/10 bg-slate-950 hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 py-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                Publish Portfolio
                <Rocket className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

      </div>

      {/* RIGHT COLUMN: Live Interactive Preview Panel (Col span 7) */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden min-h-[500px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Mock Live Site Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-6 text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span>Previewing: localhost:3000/p/{slug}</span>
        </div>

        {/* Live Site Mock Body */}
        <div className="bg-slate-950 p-6 rounded-xl border border-white/5 space-y-6 select-none font-sans min-h-[420px]">
          
          {/* Site title */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              {profileName.split(" ")[0]}
            </span>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              {studentProfile?.github_url && <Github className="w-3.5 h-3.5 text-slate-400" />}
              {studentProfile?.linkedin_url && <Linkedin className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </div>

          {/* Hero details */}
          <div className="space-y-3">
            <div className="space-y-1">
              <span className={`text-[10px] font-mono tracking-widest ${currentAccent.text} font-bold`}>
                {studentProfile?.major || "Software Engineer"}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {bio}
            </p>
          </div>

          {/* Readiness Gauge */}
          {showReadiness && (
            <div className="p-4 rounded-lg bg-slate-900/50 border border-white/5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono text-slate-500 font-semibold block">AI Career DNA Index</span>
                <span className="text-[10px] text-slate-400">Verified Technical Readiness Score</span>
              </div>
              <span className={`text-xl font-bold font-mono ${currentAccent.text} px-3 py-1 rounded bg-slate-950 border ${currentAccent.border}`}>
                68%
              </span>
            </div>
          )}

          {/* Skills Badges */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-mono text-slate-500 font-semibold block">Technical Strengths</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded text-[9px] font-semibold border ${
                    s.verified
                      ? `bg-emerald-500/10 border-emerald-500/20 text-emerald-400`
                      : "bg-slate-900/60 border-white/10 text-slate-400"
                  }`}
                >
                  {s.verified && <CheckCircle2 className="w-2.5 h-2.5" />}
                  {s.skill_name}
                </span>
              ))}
            </div>
          </div>

          {/* Projects lists */}
          {showProjects && projects.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[9px] uppercase font-mono text-slate-500 font-semibold block">Verified Projects</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-white/5 space-y-1.5">
                    <h4 className="text-[11px] font-bold text-white">{proj.title}</h4>
                    <p className="text-[9px] text-muted-foreground leading-relaxed truncate">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

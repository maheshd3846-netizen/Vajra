"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink, Download, Trophy, Code2, Terminal, Cpu } from "lucide-react";
import type { PublicPortfolioData } from "@/components/portfolio/PortfolioThemeWrapper";

export default function CyberTheme({ data }: { data: PublicPortfolioData }) {
  const { student, skills, projects, certificates, careerDna, generatedContent } = data;
  const content = generatedContent?.content;
  const cfg = generatedContent?.config?.showSections;
  const primaryResume = data.resumes.find((r) => r.is_primary) || data.resumes[0];

  return (
    <div className="min-h-screen bg-[#030712] text-cyan-50 font-mono overflow-x-hidden relative">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="border-b border-cyan-500/20 sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 tracking-widest">{"<"}{student.fullName.split(" ")[0].toLowerCase()}{"_dev />"}</span>
          </div>
          <div className="flex items-center gap-4">
            {student.githubUrl && <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500/50 hover:text-cyan-400 transition-colors"><Github className="w-4 h-4" /></a>}
            {student.linkedinUrl && <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500/50 hover:text-cyan-400 transition-colors"><Linkedin className="w-4 h-4" /></a>}
            {primaryResume && cfg?.resumeDownload && (
              <a href={primaryResume.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-cyan-500/30 text-cyan-400 text-[10px] rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" /> resume.pdf
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20 relative z-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 py-8"
        >
          <div className="text-[10px] text-cyan-500/60 tracking-widest">{"// PROFILE INITIALIZED"}</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            <span className="text-cyan-400">{">"}</span>{" "}
            <span className="text-white">{student.fullName}</span>
          </h1>
          <div className="text-cyan-300/80 text-lg font-light">{content?.tagline || content?.headline || "Full Stack Engineer"}</div>
          <p className="text-sm text-cyan-500/60 max-w-2xl leading-relaxed">{content?.shortBio}</p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 border border-cyan-500/20 rounded-lg p-4 bg-cyan-500/5">
            {student.major && <div><span className="text-[9px] text-cyan-500/40 block">major</span><span className="text-xs text-cyan-300">{student.major}</span></div>}
            {student.university && <div><span className="text-[9px] text-cyan-500/40 block">institution</span><span className="text-xs text-cyan-300">{student.university}</span></div>}
            {student.gradYear && <div><span className="text-[9px] text-cyan-500/40 block">graduation</span><span className="text-xs text-cyan-300">{student.gradYear}</span></div>}
            {careerDna && <div><span className="text-[9px] text-cyan-500/40 block">career_dna</span><span className="text-xs text-cyan-400 font-bold">{careerDna.score}/100</span></div>}
          </div>
        </motion.section>

        {/* Career DNA */}
        {cfg?.dna && careerDna && (
          <section>
            <div className="text-[10px] text-cyan-500/40 mb-4">{"// CAREER_DNA.analyze()"}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-cyan-500/20 rounded-lg p-6 bg-cyan-500/5 text-center">
                <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
                <div className="text-5xl font-black text-cyan-400">{careerDna.score}</div>
                <div className="text-[9px] text-cyan-500/50 mt-1">DNA_SCORE</div>
              </div>
              <div className="border border-cyan-500/20 rounded-lg p-6 bg-cyan-500/5 text-center">
                <Code2 className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                <div className="text-5xl font-black text-blue-400">{careerDna.readinessScore}%</div>
                <div className="text-[9px] text-cyan-500/50 mt-1">READINESS</div>
              </div>
              <div className="border border-cyan-500/20 rounded-lg p-6 bg-cyan-500/5 flex flex-col justify-between">
                <div className="text-[9px] text-cyan-500/40 mb-2">AI_ANALYSIS</div>
                <p className="text-[11px] text-cyan-300/70 leading-relaxed">{content?.careerDnaSummary || "Calibrated AI analysis."}</p>
                <div className="text-[9px] text-cyan-500/40 mt-2 capitalize">confidence: {careerDna.confidenceLevel}</div>
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {cfg?.skills && skills.length > 0 && (
          <section>
            <div className="text-[10px] text-cyan-500/40 mb-4">{"// TECH_STACK.map()"}</div>
            <div className="border border-cyan-500/20 rounded-lg p-6 bg-cyan-500/5">
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className={`text-[10px] font-bold px-3 py-1.5 rounded border font-mono tracking-wide transition-colors ${s.proficiency === "advanced" ? "border-cyan-400/50 text-cyan-400 bg-cyan-400/10" : s.proficiency === "intermediate" ? "border-blue-400/30 text-blue-400/70 bg-blue-400/5" : "border-cyan-500/10 text-cyan-500/30"}`}>
                    {s.skill_name}
                    {s.verified && " ✓"}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {cfg?.projects && projects.length > 0 && (
          <section>
            <div className="text-[10px] text-cyan-500/40 mb-4">{"// PROJECTS.render()"}</div>
            <div className="space-y-4">
              {projects.map((proj, i) => {
                const impact = content?.projectImpacts?.find((p) => p.projectId === proj.id);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="border border-cyan-500/20 rounded-lg p-6 bg-cyan-500/[0.03] hover:border-cyan-400/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                      <div className="flex gap-2">
                        {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-cyan-500/40 hover:text-cyan-400 transition-colors"><Github className="w-4 h-4" /></a>}
                        {proj.project_url && <a href={proj.project_url} target="_blank" rel="noopener noreferrer" className="text-cyan-500/40 hover:text-cyan-400 transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </div>
                    <p className="text-[11px] text-cyan-300/50 leading-relaxed mb-3">{impact?.impactSummary || proj.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {proj.technologies.slice(0, 6).map((t, j) => <span key={j} className="text-[9px] text-cyan-500/50 font-mono border border-cyan-500/20 px-2 py-0.5 rounded">{t}</span>)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Certificates */}
        {cfg?.certificates && certificates.length > 0 && (
          <section>
            <div className="text-[10px] text-cyan-500/40 mb-4">{"// CERTIFICATIONS.verify()"}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((c, i) => (
                <div key={i} className="border border-cyan-500/20 rounded-lg p-4 bg-cyan-500/5 flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{c.name}</p>
                    <p className="text-[9px] text-cyan-500/50">{c.issuer} · {c.issue_date}</p>
                  </div>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="text-cyan-500/40 hover:text-cyan-400">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {cfg?.contact && (
          <section>
            <div className="text-[10px] text-cyan-500/40 mb-4">{"// CONTACT.init()"}</div>
            <div className="border border-cyan-500/20 rounded-lg p-8 bg-cyan-500/5 text-center space-y-4">
              <h2 className="text-xl font-black text-white">{content?.callToAction || "Initialize Connection"}</h2>
              <p className="text-sm text-cyan-300/50">{content?.careerObjective}</p>
              <div className="flex justify-center gap-3">
                {student.githubUrl && <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-cyan-500/30 text-cyan-400 text-xs rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-2"><Github className="w-3.5 h-3.5" />GitHub</a>}
                {student.linkedinUrl && <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-cyan-500 text-black text-xs font-bold rounded hover:bg-cyan-400 transition-colors flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-cyan-500/20 py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-[9px] text-cyan-500/30 font-mono">
          <span>{"// "}{student.fullName.toLowerCase().replace(" ", "_")}{".portfolio"}</span>
          <span>VAJRA_AI · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

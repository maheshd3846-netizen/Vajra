"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink, Download, Trophy, Sparkles, Briefcase, GraduationCap, Calendar, CheckCircle2 } from "lucide-react";
import type { PublicPortfolioData } from "@/components/portfolio/PortfolioThemeWrapper";

export default function ProfessionalTheme({ data }: { data: PublicPortfolioData }) {
  const { student, skills, projects, certificates, careerTimeline, careerDna, generatedContent } = data;
  const content = generatedContent?.content;
  const cfg = generatedContent?.config?.showSections;
  const primaryResume = data.resumes.find((r) => r.is_primary) || data.resumes[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Georgia',serif]">
      {/* Top bar */}
      <div className="bg-slate-900 text-white py-2">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between text-[10px] tracking-widest uppercase">
          <span className="font-sans font-medium text-slate-400">Professional Portfolio</span>
          <span className="font-sans text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> VAJRA Verified</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Profile card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
              <div className="h-16 w-16 rounded-xl bg-amber-400 flex items-center justify-center text-2xl font-black text-slate-900">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">{student.fullName}</h1>
                <p className="text-xs text-slate-400 mt-1">{student.major || "Software Engineer"}</p>
              </div>
              {student.university && (
                <div className="text-xs text-slate-400 flex items-start gap-2 pt-2 border-t border-white/10">
                  <GraduationCap className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                  <span>{student.university}</span>
                </div>
              )}
              {student.gradYear && (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Class of {student.gradYear}
                </div>
              )}
              {(student.cgpa || student.gpa) && (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CGPA {student.cgpa || student.gpa}
                </div>
              )}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {student.githubUrl && (
                  <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-white transition-colors">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {student.linkedinUrl && (
                  <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-white transition-colors">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {primaryResume && cfg?.resumeDownload && (
                  <a href={primaryResume.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-sans">
                    <Download className="w-3.5 h-3.5" /> Download Resume
                  </a>
                )}
              </div>
            </div>

            {/* Skills sidebar */}
            {cfg?.skills && skills.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest">Core Skills</h3>
                {skills.slice(0, 12).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-sans text-slate-700">{s.skill_name}</span>
                    <span className={`text-[8px] font-sans font-bold px-1.5 py-0.5 rounded ${s.proficiency === "advanced" ? "bg-amber-100 text-amber-700" : s.proficiency === "intermediate" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                      {s.proficiency.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Career DNA sidebar */}
            {cfg?.dna && careerDna && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Career DNA
                </h3>
                <div className="text-center py-2">
                  <span className="text-4xl font-black text-slate-900 font-sans">{careerDna.score}</span>
                  <span className="text-slate-400 font-sans text-sm">/100</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${careerDna.score}%` }} />
                </div>
                <p className="text-[9px] font-sans text-slate-500 capitalize">{careerDna.confidenceLevel} confidence</p>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Professional Summary */}
            {cfg?.about && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-8">
                <h2 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Professional Summary
                </h2>
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{content?.headline}</h3>
                <p className="text-sm text-slate-600 leading-loose">
                  {content?.professionalSummary || content?.shortBio}
                </p>
                {content?.careerObjective && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">Career Objective</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">{content.careerObjective}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Projects */}
            {cfg?.projects && projects.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">Project Portfolio</h2>
                {projects.map((proj, i) => {
                  const impact = content?.projectImpacts?.find((p) => p.projectId === proj.id);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700"><Github className="w-4 h-4" /></a>}
                          {proj.project_url && <a href={proj.project_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700"><ExternalLink className="w-4 h-4" /></a>}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">{impact?.impactSummary || proj.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.slice(0, 6).map((t, j) => (
                          <span key={j} className="text-[9px] font-sans font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Certificates */}
            {cfg?.certificates && certificates.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">Certifications & Awards</h2>
                {certificates.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500 font-sans">{c.issuer} · {c.issue_date}</p>
                    </div>
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-sans text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Experience timeline */}
            {cfg?.experience && careerTimeline.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">Career Timeline</h2>
                {careerTimeline.slice(0, 6).map((event, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="shrink-0 text-center">
                      <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 mx-auto" />
                      {i < careerTimeline.length - 1 && <div className="w-px h-full bg-slate-200 mx-auto mt-1" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900">{event.title}</p>
                      {event.description && <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>}
                      <p className="text-[9px] font-sans text-slate-400">{event.start_date}{event.end_date ? ` — ${event.end_date}` : " — Present"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

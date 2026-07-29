"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  ExternalLink,
  Download,
  GraduationCap,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import type { PublicPortfolioData } from "@/components/portfolio/PortfolioThemeWrapper";

export default function MinimalTheme({ data }: { data: PublicPortfolioData }) {
  const { student, skills, projects, certificates, careerDna, generatedContent } = data;
  const content = generatedContent?.content;
  const cfg = generatedContent?.config?.showSections;
  const primaryResume = data.resumes.find((r) => r.is_primary) || data.resumes[0];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-['Inter',sans-serif]">
      {/* Nav */}
      <nav className="border-b border-neutral-100 sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          <span className="text-sm font-black tracking-tight text-neutral-900">{student.fullName}</span>
          <div className="flex items-center gap-6 text-[11px] font-medium text-neutral-400">
            {student.githubUrl && (
              <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
            {student.linkedinUrl && (
              <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            {primaryResume && cfg?.resumeDownload && (
              <a href={primaryResume.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-900 text-white rounded-full text-[10px] font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-1">
                <Download className="w-3 h-3" /> Resume
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-24 space-y-6"
        >
          <div className="space-y-1">
            {student.major && <p className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">{student.major}</p>}
            <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight text-neutral-900">
              {content?.headline?.replace(student.fullName + " — ", "") || student.fullName}
            </h1>
          </div>
          <p className="text-lg text-neutral-500 max-w-2xl leading-relaxed font-light">
            {content?.shortBio || "Software engineer and builder."}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
            {student.university && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{student.university}</span>}
            {student.gradYear && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Class of {student.gradYear}</span>}
            {careerDna && <span className="font-mono font-bold text-neutral-600">DNA {careerDna.score}/100</span>}
          </div>
        </motion.section>

        <hr className="border-neutral-100" />

        {/* About */}
        {cfg?.about && (
          <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">About</h2>
            </div>
            <div className="md:col-span-2 text-sm text-neutral-600 leading-relaxed space-y-4">
              {(content?.aboutMe || content?.professionalSummary || "").split("\n\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        <hr className="border-neutral-100" />

        {/* Skills */}
        {cfg?.skills && skills.length > 0 && (
          <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Skills</h2>
            </div>
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${s.proficiency === "advanced" ? "bg-neutral-900 text-white border-neutral-900" : s.proficiency === "intermediate" ? "bg-neutral-100 text-neutral-700 border-neutral-200" : "text-neutral-400 border-neutral-100"}`}>
                    {s.skill_name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        <hr className="border-neutral-100" />

        {/* Projects */}
        {cfg?.projects && projects.length > 0 && (
          <section className="py-16 space-y-10">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Selected Work</h2>
            {projects.map((proj, i) => {
              const impact = content?.projectImpacts?.find((p) => p.projectId === proj.id);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-neutral-100"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900">{proj.title}</h3>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer"><Github className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-900" /></a>}
                        {proj.project_url && <a href={proj.project_url} target="_blank" rel="noopener noreferrer"><ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-900" /></a>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.slice(0, 4).map((t, j) => <span key={j} className="text-[9px] text-neutral-400 font-mono">{t}</span>)}
                    </div>
                  </div>
                  <div className="md:col-span-2 text-sm text-neutral-500 leading-relaxed">
                    {impact?.impactSummary || proj.description || ""}
                  </div>
                </motion.div>
              );
            })}
          </section>
        )}

        {/* Certificates */}
        {cfg?.certificates && certificates.length > 0 && (
          <section className="py-16 border-t border-neutral-100 space-y-6">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Certifications</h2>
            <div className="space-y-4">
              {certificates.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{c.name}</p>
                    <p className="text-xs text-neutral-400">{c.issuer} · {c.issue_date}</p>
                  </div>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-neutral-400 hover:text-neutral-900 flex items-center gap-1 shrink-0">
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Career DNA */}
        {cfg?.dna && careerDna && (
          <section className="py-16 border-t border-neutral-100">
            <div className="bg-neutral-50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:text-left space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Career DNA</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-neutral-900">{careerDna.score}</span>
                  <span className="text-xl text-neutral-300">/100</span>
                </div>
                <p className="text-xs text-neutral-500 capitalize">{careerDna.confidenceLevel} confidence · {careerDna.readinessScore}% internship ready</p>
              </div>
              <div className="flex-1 text-sm text-neutral-500 leading-relaxed">
                {content?.careerDnaSummary || "AI-calibrated career readiness score."}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        {cfg?.contact && (
          <section className="py-16 border-t border-neutral-100 text-center space-y-4">
            <h2 className="text-2xl font-black text-neutral-900">{content?.callToAction || "Get in touch"}</h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">{content?.futureGoals || ""}</p>
            <div className="flex justify-center gap-3">
              {student.githubUrl && (
                <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all flex items-center gap-2">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {student.linkedinUrl && (
                <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-700 transition-all flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5" /> Connect
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-neutral-100 py-6">
        <div className="max-w-4xl mx-auto px-8 flex items-center justify-between text-[10px] text-neutral-300">
          <span>{student.fullName} · {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" />VAJRA AI</span>
        </div>
      </footer>
    </div>
  );
}

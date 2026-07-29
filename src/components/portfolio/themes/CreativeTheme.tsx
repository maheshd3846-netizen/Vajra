"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink, Download, Trophy, Sparkles, ArrowRight, Star } from "lucide-react";
import type { PublicPortfolioData } from "@/components/portfolio/PortfolioThemeWrapper";

export default function CreativeTheme({ data }: { data: PublicPortfolioData }) {
  const { student, skills, projects, certificates, careerTimeline, careerDna, generatedContent } = data;
  const content = generatedContent?.content;
  const cfg = generatedContent?.config?.showSections;
  const primaryResume = data.resumes.find((r) => r.is_primary) || data.resumes[0];

  const gradients = [
    "from-violet-500 to-fuchsia-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-rose-500",
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden font-['Inter',sans-serif]">
      {/* Hero — full-bleed gradient */}
      <section className="relative min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-fuchsia-900/20 to-neutral-950 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 md:px-16 py-6">
          <span className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            {student.fullName.split(" ")[0]}
          </span>
          <div className="flex items-center gap-4">
            {student.githubUrl && <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>}
            {student.linkedinUrl && <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>}
            {primaryResume && cfg?.resumeDownload && (
              <a href={primaryResume.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-white text-neutral-900 text-xs font-black hover:bg-violet-100 transition-colors flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Resume
              </a>
            )}
          </div>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 max-w-5xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">{student.major} · {student.university}</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight">
            <span className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              {student.fullName}
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-light text-white/50 max-w-2xl leading-relaxed">
            {content?.tagline || "Building with passion and precision."}
          </p>

          {careerDna && (
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent leading-none">{careerDna.score}</p>
                <p className="text-[8px] text-white/30 uppercase tracking-wider mt-1">Career DNA</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-black text-white/70 leading-none">{careerDna.readinessScore}%</p>
                <p className="text-[8px] text-white/30 uppercase tracking-wider mt-1">Readiness</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <p className="text-xs text-white/40 max-w-[180px] leading-relaxed hidden md:block">
                {content?.careerDnaSummary?.slice(0, 80)}...
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {cfg?.contact && (
              <a href="#contact" className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-xl shadow-violet-500/25">
                {content?.callToAction || "Let's Connect"} <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {cfg?.projects && (
              <a href="#projects" className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium text-sm transition-all">
                View Work <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-6 w-px bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* About */}
      {cfg?.about && (
        <section id="about" className="px-8 md:px-16 lg:px-24 py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">About</h2>
            <div className="space-y-4 text-lg text-white/50 leading-relaxed font-light">
              {(content?.aboutMe || content?.professionalSummary || "").split("\n\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {content?.strengths && content.strengths.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4">
                {content.strengths.map((s, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-white/60 border border-white/10 px-3 py-1.5 rounded-full">
                    <Star className="w-3 h-3 text-violet-400" /> {s}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Skills */}
      {cfg?.skills && skills.length > 0 && (
        <section id="skills" className="px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm ${s.proficiency === "advanced" ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-200" : s.proficiency === "intermediate" ? "bg-white/5 border border-white/10 text-white/70" : "border border-white/5 text-white/30 text-xs"}`}
                >
                  {s.skill_name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Projects */}
      {cfg?.projects && projects.length > 0 && (
        <section id="projects" className="px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Selected Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, i) => {
                const impact = content?.projectImpacts?.find((p) => p.projectId === proj.id);
                const grad = gradients[i % gradients.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="group relative border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all"
                  >
                    {/* Gradient bar top */}
                    <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-white leading-tight">{proj.title}</h3>
                        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4 text-white/40 hover:text-white" /></a>}
                          {proj.project_url && <a href={proj.project_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 text-white/40 hover:text-white" /></a>}
                        </div>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {impact?.impactSummary || proj.description || ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {proj.technologies.slice(0, 5).map((t, j) => (
                          <span key={j} className={`text-[9px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${grad} bg-opacity-10 text-white/60 border border-white/5`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* Certificates */}
      {cfg?.certificates && certificates.length > 0 && (
        <section id="certs" className="px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificates.map((c, i) => (
                <div key={i} className="border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors space-y-2">
                  <Trophy className="w-5 h-5 text-fuchsia-400" />
                  <h4 className="text-sm font-bold text-white leading-tight">{c.name}</h4>
                  <p className="text-xs text-white/40">{c.issuer} · {c.issue_date}</p>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-400 hover:text-violet-300 font-medium">
                      View Certificate →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Timeline */}
      {cfg?.experience && careerTimeline.length > 0 && (
        <section id="timeline" className="px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8 max-w-3xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Journey</h2>
            <div className="space-y-6">
              {careerTimeline.slice(0, 7).map((event, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} shrink-0 mt-0.5`} />
                    {i < careerTimeline.length - 1 && <div className="flex-1 w-px bg-white/10 mt-2" />}
                  </div>
                  <div className="pb-6 space-y-1">
                    <h4 className="text-sm font-bold text-white">{event.title}</h4>
                    {event.description && <p className="text-xs text-white/40 leading-relaxed">{event.description}</p>}
                    <p className="text-[9px] text-white/25 font-mono">{event.start_date}{event.end_date ? ` → ${event.end_date}` : " · Ongoing"}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Contact */}
      {cfg?.contact && (
        <section id="contact" className="px-8 md:px-16 lg:px-24 py-32 border-t border-white/5">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-8 max-w-2xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              {content?.callToAction || "Let's Work Together"}
            </h2>
            <p className="text-white/40 leading-relaxed">{content?.futureGoals}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {student.githubUrl && (
                <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-7 py-3.5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm font-medium rounded-2xl transition-all">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {student.linkedinUrl && (
                <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-xl shadow-violet-500/30">
                  <Linkedin className="w-4 h-4" /> Connect on LinkedIn
                </a>
              )}
            </div>
          </motion.div>
        </section>
      )}

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between text-[10px] text-white/20">
          <span>{student.fullName} · {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-violet-400" />Generated by VAJRA AI</span>
        </div>
      </footer>
    </div>
  );
}

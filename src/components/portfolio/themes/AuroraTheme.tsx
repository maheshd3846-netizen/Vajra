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
  Trophy,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import type { PublicPortfolioData } from "@/components/portfolio/PortfolioThemeWrapper";

interface AuroraThemeProps {
  data: PublicPortfolioData;
}

export default function AuroraTheme({ data }: AuroraThemeProps) {
  const { student, skills, projects, certificates, careerTimeline, careerDna, generatedContent } = data;
  const content = generatedContent?.content;
  const config = generatedContent?.config?.showSections;

  const advancedSkills = skills.filter((s) => s.proficiency === "advanced");
  const intermediateSkills = skills.filter((s) => s.proficiency === "intermediate");
  const beginnerSkills = skills.filter((s) => s.proficiency === "beginner");

  const primaryResume = data.resumes.find((r) => r.is_primary) || data.resumes[0];

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans overflow-x-hidden relative">
      {/* Background orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#050816]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[10px] font-black text-white">
              {student.fullName.charAt(0)}
            </div>
            <span className="text-sm font-bold text-white/90">{student.fullName.split(" ")[0]}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/50">
            {[
              config?.about && "About",
              config?.skills && "Skills",
              config?.projects && "Projects",
              config?.certificates && "Certs",
              config?.contact && "Contact",
            ]
              .filter(Boolean)
              .map((item) => (
                <a
                  key={item as string}
                  href={`#${(item as string).toLowerCase()}`}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {item}
                </a>
              ))}
          </div>
          <div className="flex items-center gap-3">
            {student.githubUrl && (
              <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            )}
            {student.linkedinUrl && (
              <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20 relative z-10">

        {/* ─── HERO ─────────────────────────────────────────────── */}
        <section className="min-h-[90vh] flex flex-col justify-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              {student.major || "Software Engineer"} · {student.university || ""}
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
              {content?.headline || student.fullName}
            </h1>

            <p className="text-lg text-white/40 font-light leading-relaxed max-w-2xl">
              {content?.tagline || content?.shortBio || "Building the future, one commit at a time."}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {student.gradYear && (
                <div className="flex items-center gap-1.5 text-white/40">
                  <Calendar className="w-3.5 h-3.5" />
                  Class of {student.gradYear}
                </div>
              )}
              {student.gpa && (
                <div className="flex items-center gap-1.5 text-white/40">
                  <GraduationCap className="w-3.5 h-3.5" />
                  GPA {student.gpa}
                </div>
              )}
              {careerDna && (
                <div className="flex items-center gap-1.5 text-purple-300 font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Career DNA {careerDna.score}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              {primaryResume && config?.resumeDownload && (
                <a
                  href={primaryResume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              )}
              {config?.contact && (
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium rounded-xl transition-all"
                >
                  {content?.callToAction || "Let's Connect"}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        </section>

        {/* ─── CAREER DNA ──────────────────────────────────────── */}
        {config?.dna && careerDna && (
          <motion.section
            id="dna"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Career DNA Score
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-8xl font-black text-white leading-none">{careerDna.score}</span>
                  <div className="pb-2 space-y-1">
                    <span className="text-2xl text-white/40 font-light">/100</span>
                    <p className="text-xs text-purple-300 font-medium capitalize">{careerDna.confidenceLevel} Confidence</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${careerDna.score}%` }}
                  />
                </div>

                <p className="text-sm text-white/50 leading-relaxed">
                  {content?.careerDnaSummary || "AI-calibrated career readiness score."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">Readiness</p>
                    <p className="text-lg font-black text-blue-400">{careerDna.readinessScore}%</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-1">Confidence</p>
                    <p className="text-lg font-black text-purple-400 capitalize">{careerDna.confidenceLevel}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {content?.strengths && content.strengths.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-3">
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" /> Strengths
                    </p>
                    {content.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-2">
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" /> Career Objective
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {content?.careerObjective || "Building towards impactful engineering roles."}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ─── ABOUT ─────────────────────────────────────────────── */}
        {config?.about && (
          <motion.section
            id="about"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16 border-t border-white/5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">About</h2>
                <p className="text-sm text-purple-400 font-medium">{content?.tagline}</p>
              </div>
              <div className="lg:col-span-2 space-y-4 text-white/60 text-sm leading-relaxed">
                {(content?.aboutMe || content?.professionalSummary || "")
                  .split("\n\n")
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ─── SKILLS ──────────────────────────────────────────── */}
        {config?.skills && skills.length > 0 && (
          <motion.section
            id="skills"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16 border-t border-white/5"
          >
            <h2 className="text-3xl font-black text-white mb-8">Skills</h2>
            <div className="space-y-6">
              {advancedSkills.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Advanced</p>
                  <div className="flex flex-wrap gap-2">
                    {advancedSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 text-xs font-semibold text-white bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {intermediateSkills.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Intermediate</p>
                  <div className="flex flex-wrap gap-2">
                    {intermediateSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 text-xs font-medium text-white/60 bg-white/[0.03] border border-white/5 rounded-lg">
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {beginnerSkills.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Learning</p>
                  <div className="flex flex-wrap gap-2">
                    {beginnerSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 text-xs font-medium text-white/30 border border-white/[0.05] rounded-lg">
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ─── PROJECTS ────────────────────────────────────────── */}
        {config?.projects && projects.length > 0 && (
          <motion.section
            id="projects"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16 border-t border-white/5"
          >
            <h2 className="text-3xl font-black text-white mb-8">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, i) => {
                const impact = generatedContent?.content?.projectImpacts?.find(
                  (p) => p.projectId === proj.id
                );
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white leading-tight">{proj.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          {proj.github_url && (
                            <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {proj.project_url && (
                            <a href={proj.project_url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {impact?.impactSummary || proj.description || "A verified technical project."}
                      </p>
                    </div>
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.slice(0, 6).map((tech, j) => (
                          <span key={j} className="text-[9px] font-mono font-bold text-purple-400/70 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ─── CERTIFICATES ────────────────────────────────────── */}
        {config?.certificates && certificates.length > 0 && (
          <motion.section
            id="certs"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16 border-t border-white/5"
          >
            <h2 className="text-3xl font-black text-white mb-8">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2 hover:border-white/20 transition-colors">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white leading-tight">{cert.name}</h4>
                  <p className="text-xs text-white/40">{cert.issuer}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-white/30 font-mono">{cert.issue_date}</p>
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-purple-400 hover:text-purple-300 font-medium">
                        Verify →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── TIMELINE / EXPERIENCE ───────────────────────────── */}
        {config?.experience && careerTimeline.length > 0 && (
          <motion.section
            id="experience"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16 border-t border-white/5"
          >
            <h2 className="text-3xl font-black text-white mb-8">Experience & Timeline</h2>
            <div className="relative space-y-6 pl-6 border-l border-white/10">
              {careerTimeline.slice(0, 8).map((event, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-purple-500/50 border border-purple-500/30" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{event.title}</h4>
                      <span className="text-[8px] font-mono text-purple-400/60 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded capitalize">
                        {event.event_type.replace("_", " ")}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-white/40 leading-relaxed">{event.description}</p>
                    )}
                    <p className="text-[9px] text-white/25 font-mono">
                      {event.start_date} {event.end_date ? `→ ${event.end_date}` : "· Ongoing"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── CONTACT ─────────────────────────────────────────── */}
        {config?.contact && (
          <motion.section
            id="contact"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-16 border-t border-white/5"
          >
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-black text-white">{content?.callToAction || "Let's Connect"}</h2>
              <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                {content?.futureGoals || "Open to internship opportunities and collaborations."}
              </p>
              <div className="flex items-center justify-center gap-4">
                {student.githubUrl && (
                  <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-xs font-medium rounded-xl transition-all">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {student.linkedinUrl && (
                  <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </motion.section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <span>{student.fullName} · {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Generated by VAJRA AI Career Intelligence
          </span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, ShieldCheck, Check, MessageSquare } from "lucide-react";

export default function MentorTeaser() {
  const studentsMock = [
    { name: "Sarah Connor", major: "Cybersecurity", score: "94%", status: "Approved" },
    { name: "John Doe", major: "Software Eng", score: "89%", status: "Reviewing" },
    { name: "Emily Watson", major: "Data Science", score: "91%", status: "Approved" },
  ];

  return (
    <section id="mentors" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <GraduationCap className="w-3.5 h-3.5" />
              Faculty & Industry Portal
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-heading text-foreground leading-tight">
              Empower Mentors. <br />
              Validate Engineering Talent.
            </h2>
            
            <p className="text-muted-foreground font-sans leading-relaxed">
              Faculty advisors and corporate mentors get deep, real-time insight into student skill progressions. Easily review student AI reports, issue verified checkmarks, and route talent directly into corporate pathways.
            </p>

            <ul className="space-y-3 font-sans">
              {[
                "Real-time student progress tracking & code analysis dashboards.",
                "1-Click feedback endorsement backing student portfolio URLs.",
                "Custom invitation pipelines for verified industry recruiters.",
              ].map((bullet, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-0.5 rounded-full bg-primary/15 p-0.5 text-primary">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Visual Dashboard Mock */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card lg:col-span-6 relative w-full overflow-hidden rounded-2xl border-border/70 p-6 shadow-2xl"
          >
            <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            
            {/* Mock Header */}
            <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-foreground font-sans">Student Growth Tracker</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Active Assignments: 12</span>
            </div>

            {/* Mock Table */}
            <div className="space-y-3">
              {studentsMock.map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 p-3.5 transition-colors hover:border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-bold text-xs text-primary">
                      {student.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{student.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{student.major}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{student.score}</p>
                      <p className="text-[9px] text-muted-foreground">Readiness</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
                      student.status === "Approved" 
                        ? "bg-success/10 border-success/20 text-success" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions simulation */}
            <div className="mt-6 flex gap-2 border-t border-border/70 pt-4">
              <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                <ShieldCheck className="w-3.5 h-3.5" />
                Endorse Cohort
              </button>
              <button className="flex items-center justify-center rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-foreground/80 transition-colors hover:bg-muted/70">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}

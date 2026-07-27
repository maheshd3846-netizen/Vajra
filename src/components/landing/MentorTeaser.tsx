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
    <section id="mentors" className="py-24 bg-slate-950/20 relative">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <GraduationCap className="w-3.5 h-3.5" />
              Faculty & Industry Portal
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-heading text-white leading-tight">
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
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="p-0.5 rounded-full bg-blue-500/20 text-blue-400 mt-0.5">
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
            className="lg:col-span-6 w-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-white font-sans">Student Growth Tracker</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Active Assignments: 12</span>
            </div>

            {/* Mock Table */}
            <div className="space-y-3">
              {studentsMock.map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-xs text-blue-400">
                      {student.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{student.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{student.major}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-white">{student.score}</p>
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
            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-[10px] font-semibold text-white transition-colors flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Endorse Cohort
              </button>
              <button className="py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 transition-colors flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}

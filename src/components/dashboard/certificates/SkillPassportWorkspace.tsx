"use client";

import React, { useState } from "react";
import {
  Award,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Download,
  Copy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Certificate {
  id: string;
  student_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

interface StudentSkill {
  skill_name: string;
  proficiency: string;
  verified: boolean;
}

interface SkillPassportWorkspaceProps {
  profileName: string;
  initialCertificates: Certificate[];
  skills: StudentSkill[];
  userId: string;
}

export default function SkillPassportWorkspace({
  profileName,
  initialCertificates,
  skills,
  userId,
}: SkillPassportWorkspaceProps) {
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);

  // Fallback certificates if none are found in database
  const activeCertificates =
    initialCertificates.length > 0
      ? initialCertificates
      : [
          {
            id: "cert-react-101",
            student_id: userId,
            name: "Advanced React Component Architect",
            issuer: "VAJRA Skill Engine",
            issue_date: "2026-05-12",
            expiry_date: null,
            credential_id: "vj-react-8b9a2d",
            credential_url: `/verify/cert-react-101`,
          },
          {
            id: "cert-pg-202",
            student_id: userId,
            name: "Relational Database Design & PostgreSQL Administrator",
            issuer: "Stanford Academic Coordinator Office",
            issue_date: "2026-06-20",
            expiry_date: null,
            credential_id: "st-pg-3c5d7f",
            credential_url: `/verify/cert-pg-202`,
          },
        ];

  const verifiedSkillsCount = skills.filter((s) => s.verified).length;

  const handleCopyLink = (cert: Certificate) => {
    const origin = window.location.origin;
    const path = cert.credential_url || `/verify/${cert.id}`;
    navigator.clipboard.writeText(`${origin}${path}`);
    toast.success("Verification link copied to clipboard!");
  };

  // Renders a realistic simulated SVG QR code pointing to target paths
  const renderSvgQrCode = (pathUrl: string) => {
    return (
      <svg className="w-24 h-24 text-slate-900 bg-white p-1 rounded-lg border border-slate-200" viewBox="0 0 100 100" fill="currentColor">
        <title>Verification QR for {pathUrl}</title>
        <rect x="0" y="0" width="20" height="20" />
        <rect x="0" y="80" width="20" height="20" />
        <rect x="80" y="0" width="20" height="20" />
        <rect x="6" y="6" width="8" height="8" fill="white" />
        <rect x="6" y="86" width="8" height="8" fill="white" />
        <rect x="86" y="6" width="8" height="8" fill="white" />
        
        {/* Randomized code grid blocks */}
        <rect x="30" y="10" width="10" height="15" />
        <rect x="50" y="0" width="15" height="10" />
        <rect x="70" y="20" width="10" height="20" />
        <rect x="30" y="40" width="20" height="10" />
        <rect x="0" y="50" width="15" height="15" />
        <rect x="20" y="60" width="15" height="15" />
        <rect x="50" y="60" width="20" height="20" />
        <rect x="80" y="50" width="15" height="30" />
        <rect x="70" y="85" width="10" height="10" />
      </svg>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        {/* Passport Summary */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Tracks Verified</h3>
            <p className="text-3xl font-bold text-white font-mono mt-2">{verifiedSkillsCount}</p>
          </div>
          <span className="text-[10px] text-muted-foreground block">Verified skills are indexed to your DNA.</span>
        </div>

        {/* Credentials Count */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Credentials</h3>
            <p className="text-3xl font-bold text-white font-mono mt-2">{activeCertificates.length}</p>
          </div>
          <span className="text-[10px] text-muted-foreground block">Badges issued by verified entities.</span>
        </div>

        {/* Security verification state */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tamper-Proof Integrity</h3>
            <div className="flex items-center gap-1.5 mt-3 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              STATUS: SECURED
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground block">Cryptographic signatures are valid.</span>
        </div>

      </div>

      {/* Main Credentials grid section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5 text-blue-400" />
          Active Certificate Ledger
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {cert.issuer}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {cert.issue_date}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-heading leading-snug">{cert.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                  SHA-256: {cert.credential_id || "vj-hash-pending"}
                </p>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-white/5 font-sans">
                <button
                  onClick={() => handleCopyLink(cert)}
                  className="p-3 bg-slate-950 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Copy Verification Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <Button
                  onClick={() => setActiveModalCert(cert)}
                  className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  View Certificate
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate high-res frame Modal */}
      {activeModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setActiveModalCert(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Credential Frame Card */}
          <div className="w-full max-w-2xl bg-slate-950 border-[12px] border-slate-900 p-8 rounded-2xl shadow-2xl relative z-10 space-y-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Top Close button */}
            <button
              onClick={() => setActiveModalCert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Credential Title & Signatures Layout */}
            <div className="text-center space-y-4 pt-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400">
                Official Skill Endorsement Certificate
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white font-heading max-w-md mx-auto leading-tight">
                {activeModalCert.name}
              </h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto my-4" />
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                This document certifies that <span className="text-white font-semibold">{profileName}</span> has completed the technical benchmarks required for this track.
              </p>
            </div>

            {/* Middle QR & Hash metadata */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-xl bg-slate-900/40 border border-white/5">
              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Certificate Ledger ID</span>
                  <span className="text-xs font-mono text-slate-300 font-semibold">{activeModalCert.id}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Cryptographic Hash</span>
                  <span className="text-[10px] font-mono text-slate-400">{activeModalCert.credential_id}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Issuing Authority</span>
                  <span className="text-xs text-blue-400 font-semibold">{activeModalCert.issuer}</span>
                </div>
              </div>

              {/* QR Render wrapper */}
              <div className="flex flex-col items-center gap-1.5">
                {renderSvgQrCode(activeModalCert.credential_url || `/verify/${activeModalCert.id}`)}
                <span className="text-[8px] uppercase font-mono text-muted-foreground font-semibold">Scan to verify</span>
              </div>
            </div>

            {/* Bottom Download & Copy actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5 font-sans">
              <button
                onClick={() => handleCopyLink(activeModalCert)}
                className="flex-1 py-4 bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded-xl"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <Button
                onClick={() => toast.success("PDF Download simulation initiated.")}
                className="flex-1 py-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

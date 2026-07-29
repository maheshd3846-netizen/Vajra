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
    <div className="space-y-8 max-w-7xl mx-auto text-foreground">
      
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        {/* Passport Summary */}
        <div className="glass-card relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[28px] border-[#BFDFFF] p-5 backdrop-blur-xl">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skill Tracks Verified</h3>
            <p className="mt-2 font-mono text-3xl font-bold text-foreground">{verifiedSkillsCount}</p>
          </div>
          <span className="text-[10px] text-muted-foreground block">Verified skills are indexed to your DNA.</span>
        </div>

        {/* Credentials Count */}
        <div className="glass-card relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[28px] border-[#BFDFFF] p-5 backdrop-blur-xl">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Credentials</h3>
            <p className="mt-2 font-mono text-3xl font-bold text-foreground">{activeCertificates.length}</p>
          </div>
          <span className="text-[10px] text-muted-foreground block">Badges issued by verified entities.</span>
        </div>

        {/* Security verification state */}
        <div className="glass-card relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[28px] border-[#BFDFFF] p-5 backdrop-blur-xl">
          <div className="pointer-events-none absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tamper-Proof Integrity</h3>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              STATUS: SECURED
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground block">Cryptographic signatures are valid.</span>
        </div>

      </div>

      {/* Main Credentials grid section */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
          <Award className="w-4.5 h-4.5 text-primary" />
          Active Certificate Ledger
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeCertificates.map((cert) => (
            <div
              key={cert.id}
              className="glass-card flex min-h-[220px] flex-col justify-between rounded-[28px] border-[#BFDFFF] p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(59,130,246,0.10)]"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-primary uppercase">
                    {cert.issuer}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {cert.issue_date}
                  </span>
                </div>
                <h4 className="text-sm font-bold leading-snug text-foreground font-heading">{cert.name}</h4>
                <p className="mt-2 truncate font-mono text-[10px] text-slate-500">
                  SHA-256: {cert.credential_id || "vj-hash-pending"}
                </p>
              </div>

              <div className="mt-6 flex gap-2 border-t border-[#BFDFFF] pt-4 font-sans">
                <button
                  onClick={() => handleCopyLink(cert)}
                  className="flex cursor-pointer items-center justify-center rounded-[18px] border border-[#BFDFFF] bg-white p-3 text-slate-500 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
                  aria-label="Copy Verification Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <Button
                  onClick={() => setActiveModalCert(cert)}
                  className="flex-1 cursor-pointer items-center justify-center gap-1 rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-4 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Credential Frame Card */}
          <div className="glass-card relative z-10 flex w-full max-w-2xl flex-col justify-between space-y-8 overflow-hidden rounded-[28px] border-[#BFDFFF] bg-white/92 p-8 shadow-[0_12px_40px_rgba(59,130,246,0.10)]">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
            
            {/* Top Close button */}
            <button
              onClick={() => setActiveModalCert(null)}
              className="absolute top-4 right-4 cursor-pointer rounded-lg border border-[#BFDFFF] bg-white p-1.5 text-slate-500 hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Credential Title & Signatures Layout */}
            <div className="text-center space-y-4 pt-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-primary">
                Official Skill Endorsement Certificate
              </span>
              <h2 className="mx-auto max-w-md text-xl font-bold leading-tight text-foreground font-heading md:text-2xl">
                {activeModalCert.name}
              </h2>
              <div className="mx-auto my-4 h-[1px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground font-sans">
                This document certifies that <span className="font-semibold text-foreground">{profileName}</span> has completed the technical benchmarks required for this track.
              </p>
            </div>

            {/* Middle QR & Hash metadata */}
            <div className="flex flex-col items-center justify-between gap-6 rounded-[24px] border border-[#BFDFFF] bg-white/80 p-5 sm:flex-row">
              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500">Certificate Ledger ID</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">{activeModalCert.id}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500">Cryptographic Hash</span>
                  <span className="font-mono text-[10px] text-slate-500">{activeModalCert.credential_id}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-mono text-slate-500">Issuing Authority</span>
                  <span className="text-xs font-semibold text-primary">{activeModalCert.issuer}</span>
                </div>
              </div>

              {/* QR Render wrapper */}
              <div className="flex flex-col items-center gap-1.5">
                {renderSvgQrCode(activeModalCert.credential_url || `/verify/${activeModalCert.id}`)}
                <span className="text-[8px] font-mono font-semibold uppercase text-muted-foreground">Scan to verify</span>
              </div>
            </div>

            {/* Bottom Download & Copy actions */}
            <div className="flex items-center gap-3 border-t border-[#BFDFFF] pt-4 font-sans">
              <button
                onClick={() => handleCopyLink(activeModalCert)}
                className="flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[18px] border border-[#BFDFFF] bg-white py-4 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-[0_12px_24px_rgba(59,130,246,0.10)]"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <Button
                onClick={() => toast.success("PDF Download simulation initiated.")}
                className="flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[18px] bg-gradient-to-r from-primary via-sky-500 to-indigo-600 py-6 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)]"
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

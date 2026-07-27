import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Logo Header */}
      <div className="mb-6 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl font-bold font-heading tracking-widest bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
            VAJRA
          </span>
        </Link>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
        {children}
      </div>
    </div>
  );
}

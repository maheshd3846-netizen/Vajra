import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Brand Logo Header */}
      <div className="mb-6 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl font-bold font-heading tracking-widest bg-gradient-to-r from-primary via-indigo-400 to-violet-500 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
            VAJRA
          </span>
        </Link>
      </div>

      {/* Card Container */}
      <div className="glass-card relative z-10 w-full max-w-md rounded-2xl border-border/70 p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

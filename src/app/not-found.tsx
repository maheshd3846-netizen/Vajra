import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center text-foreground font-sans">
      <div className="glass-card max-w-md space-y-6 rounded-3xl border-border/70 p-8 relative overflow-hidden">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <span className="relative z-10 text-5xl font-black font-mono text-primary">404</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading text-foreground">Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            The requested page route does not exist or has been relocated within the VAJRA platform ecosystem.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

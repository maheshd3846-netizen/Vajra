"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("RootError caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center text-foreground font-sans">
      <div className="glass-card max-w-md space-y-6 rounded-3xl border-border/70 p-8 relative overflow-hidden">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground font-heading">Something went wrong</h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            An unexpected systemic error occurred. Our AI telemetry service has logged this event for review.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground pt-1">Reference Digest: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="rounded-xl bg-gradient-to-r from-primary to-violet-500 px-4 py-2.5 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Request
          </Button>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

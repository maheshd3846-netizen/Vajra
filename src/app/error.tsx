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
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center text-white font-sans">
      <div className="max-w-md space-y-6 bg-slate-900 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white font-heading">Something went wrong</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            An unexpected systemic error occurred. Our AI telemetry service has logged this event for review.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 pt-1">Reference Digest: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Request
          </Button>

          <Link
            href="/"
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

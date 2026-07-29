import React from "react";
import { Sparkles } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center text-foreground font-sans">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-2xl font-black shadow-xl shadow-primary/20">
          V
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          VAJRA AI Platform
        </div>
        <p className="text-sm font-semibold text-muted-foreground">Initializing Career Intelligence System...</p>
      </div>
    </div>
  );
}

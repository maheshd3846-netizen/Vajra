import React from "react";
import { Sparkles } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center text-white font-sans">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl animate-pulse" />
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-black relative z-10 shadow-xl shadow-blue-500/20">
          V
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          VAJRA AI Platform
        </div>
        <p className="text-sm font-semibold text-slate-300">Initializing Career Intelligence System...</p>
      </div>
    </div>
  );
}

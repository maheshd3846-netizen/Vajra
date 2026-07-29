import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center text-white font-sans">
      <div className="max-w-md space-y-6 bg-slate-900 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
          <span className="text-5xl font-black font-mono text-blue-400 relative z-10">404</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading text-white">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            The requested page route does not exist or has been relocated within the VAJRA platform ecosystem.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

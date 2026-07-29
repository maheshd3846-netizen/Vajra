import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 antialiased">
      {/* Brand Logo Header */}
      <div className="mb-6 z-10 text-center space-y-1">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-mono text-sm font-black shadow-xs">
            V
          </div>
          <span className="text-lg font-semibold tracking-wider text-foreground font-mono">
            VAJRA
          </span>
        </Link>
        <div>
          <Badge variant="outline" className="text-[10px] uppercase font-mono px-2 py-0">
            Career Intelligence Platform
          </Badge>
        </div>
      </div>

      {/* Card Container */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        {children}
      </div>
    </div>
  );
}

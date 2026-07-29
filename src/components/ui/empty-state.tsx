import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-4 max-w-md mx-auto my-6",
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white font-heading">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

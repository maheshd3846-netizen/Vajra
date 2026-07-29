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
        "glass-card mx-auto my-6 max-w-md space-y-4 rounded-3xl border-border/70 p-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 px-5 py-2.5 text-xs font-semibold text-primary-foreground cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

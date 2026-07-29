import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-border/70 bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

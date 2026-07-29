import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15",
        secondary:
          "bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/15",
        success:
          "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/15",
        warning:
          "bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/15",
        outline:
          "border border-border text-muted-foreground hover:text-foreground",
        ai:
          "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold hover:bg-indigo-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0 animate-pulse" />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

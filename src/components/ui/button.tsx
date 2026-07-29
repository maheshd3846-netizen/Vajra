import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border text-xs font-semibold tracking-wide transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm",
        outline:
          "border-border bg-card text-foreground shadow-xs hover:bg-secondary hover:border-foreground/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20",
        link:
          "border-transparent bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
        accent:
          "border-indigo-500/30 bg-indigo-600 text-white shadow-xs hover:bg-indigo-500",
      },
      size: {
        default: "h-9 px-3.5 py-2 gap-2",
        xs: "h-7 px-2.5 py-1 text-[11px] gap-1.5 rounded-md",
        sm: "h-8 px-3 py-1.5 text-xs gap-1.5",
        lg: "h-11 px-5 py-2.5 text-sm gap-2.5 rounded-xl",
        icon: "size-9 p-0 rounded-lg",
        "icon-sm": "size-7 p-0 rounded-md",
        "icon-lg": "size-11 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

import * as React from "react";

import { cn } from "@/lib/utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="section"
      className={cn(
        "section-card theme-transition overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-10",
        className
      )}
      {...props}
    />
  );
}

export { Section };
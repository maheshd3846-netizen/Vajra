import * as React from "react";

import { cn } from "@/lib/utils";

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "premium-card theme-transition overflow-hidden rounded-[24px] p-5 sm:p-6",
        className
      )}
      {...props}
    />
  );
}

export { Panel };
"use client";

import { IconWindowExpandBottomRightFillDuo18 } from "nucleo-ui-essential-fill-duo-18";
import type { ComponentProps } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function CodeCollapsibleWrapper({
  className,
  children,
  ...props
}: ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      className={cn("group/collapsible relative min-w-0", className)}
      defaultOpen={false}
      {...props}
    >
      <CollapsibleContent
        forceMount
        className="relative h-full min-w-0 overflow-hidden data-[state=closed]:max-h-64 data-[state=open]:max-h-none [&_pre]:mt-0"
      >
        {children}
      </CollapsibleContent>
      {/* Expand trigger with down arrow (icon, not text) */}
      <CollapsibleTrigger className="to-background text-muted-foreground hover:text-foreground absolute inset-x-0 -bottom-1 flex h-16 cursor-pointer items-end justify-end bg-linear-to-b from-transparent via-50% text-sm font-medium transition-colors duration-[0ms] group-data-[state=open]/collapsible:hidden hover:duration-200">
        <div className="bg-background mr-4 mb-4 font-normal flex items-center justify-center">
          {/* Downward arrow (default orientation, 0deg) */}
          <IconWindowExpandBottomRightFillDuo18
            className="w-5 h-5 transition-transform duration-200"
            aria-label="Expand"
            style={{ transform: "rotate(0deg)" }}
          />
        </div>
      </CollapsibleTrigger>
      {/* Collapse trigger with upward arrow (flip vertically 180deg) */}
      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground bg-background absolute right-4 bottom-4 hidden cursor-pointer text-sm font-normal transition-colors duration-[0ms] group-data-[state=open]/collapsible:block hover:duration-200 flex items-center justify-center">
        {/* Upward arrow (flipped vertically, 180deg) */}
        <IconWindowExpandBottomRightFillDuo18
          className="w-5 h-5 transition-transform duration-200"
          aria-label="Collapse"
          style={{ transform: "rotate(180deg)" }}
        />
      </CollapsibleTrigger>
    </Collapsible>
  );
}

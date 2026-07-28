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
      <CollapsibleTrigger
        className={cn(
          "group/trigger z-20 cursor-pointer text-muted-foreground outline-none transition-[background-color,color,transform] duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
          "absolute inset-x-0 bottom-0 flex h-16 items-end justify-end bg-linear-to-b from-transparent via-transparent to-background/95 pr-4 pb-4",
          "data-[state=open]:absolute data-[state=open]:top-auto data-[state=open]:bottom-10 data-[state=open]:mr-4 data-[state=open]:ml-auto data-[state=open]:h-8 data-[state=open]:w-8 data-[state=open]:items-center data-[state=open]:justify-center data-[state=open]:rounded-lg data-[state=open]:border data-[state=open]:border-border/70 data-[state=open]:bg-none data-[state=open]:bg-background/90 data-[state=open]:p-0 data-[state=open]:shadow-sm data-[state=open]:backdrop-blur-md",
        )}
      >
        <IconWindowExpandBottomRightFillDuo18
          aria-hidden="true"
          className="size-5 transition-transform duration-200 ease-out group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
        />
        <span className="sr-only group-data-[state=open]/trigger:hidden">Expand code</span>
        <span className="sr-only hidden group-data-[state=open]/trigger:inline">Collapse code</span>
      </CollapsibleTrigger>

      <CollapsibleContent
        forceMount
        className="relative min-w-0 data-[state=closed]:max-h-64 data-[state=closed]:overflow-clip data-[state=open]:max-h-none data-[state=open]:overflow-visible [&_pre]:mt-0"
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

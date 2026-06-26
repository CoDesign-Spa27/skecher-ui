"use client";

import * as React from "react";
import { CodeIcon } from "@/assets/app-icons/code";
import CopyButton from "@/components/docs/ui/copy-button";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
 
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  IconRefresh2FillDuo18,
  IconWindowPointerFillDuo18,
  IconSquareMinusFillDuo18,
} from "nucleo-ui-essential-fill-duo-18";

interface ComponentWrapperProps extends Omit<React.ComponentProps<"section">, "children"> {
  action?: "replay" | "toggle" | string;
  align?: "center" | "start" | "end";
  children: React.ReactNode;
  code?: React.ReactNode;
  codeString?: string;
  doc?: React.ReactNode;
  previewClassName?: string;
  previewHref?: string;
  title?: string;
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-56 items-center justify-center px-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function CodeDrawer({
  code,
  codeString,
  title,
}: {
  code?: React.ReactNode;
  codeString?: string;
  title: string;
}) {
  return (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button
          aria-label="View source code"
          className="size-7 rounded-md text-muted-foreground shadow-none transition-[color,background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-background/80 hover:text-foreground active:scale-[0.97]"
          tooltipSide="bottom"

          size="icon"
          tooltip="View source"
          variant="ghost"
        >
          <CodeIcon className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto h-[min(82vh,760px)] max-h-[82vh] w-full max-w-6xl overflow-hidden rounded-t-xl border-x bg-background p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-1 sm:px-5">
          <div className="min-w-0">
            <DrawerTitle className="truncate font-raleway text-sm font-medium bg-highlight px-2 rounded-sm py-0.5 ">{title}</DrawerTitle>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {codeString ? <CopyButton code={codeString} className="size-8 rounded-md" /> : null}
            <DrawerClose asChild>
              <Button
                aria-label="Close source drawer"
                className="size-8 rounded-md text-muted-foreground transition-[color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground active:scale-[0.97]"
                size="icon"
                tooltip="Close"
                variant="ghost"
              >
                <IconSquareMinusFillDuo18 className="size-5" />
              </Button>
            </DrawerClose>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-muted/20 scroll-fade-y ">
          {code ? code : <EmptyPanel label="No source added for this example." />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
 
  action,
  children,
  className,
  code,
  codeString,
  doc,
  previewClassName,
  previewHref,
  title = "Component example",
  ...props
}) => {
  const [previewKey, setPreviewKey] = React.useState(0);

  // Preserve the legacy prop while keeping it off the rendered section.
  void action;

  const replayPreview = React.useCallback(() => {
    setPreviewKey((key) => key + 1);
  }, []);

  const actions = (
    <div className="flex min-w-0 items-center gap-1 rounded-lg bg-[#F1F1F1] p-0.5 input-shadow dark:bg-input/30">
      <span className="hidden min-w-0 max-w-32 truncate px-2 font-mono text-[11px] text-muted-foreground lg:block">
        {title}
      </span>
      {previewHref ? (
        <Button
          tooltipSide="bottom"
          aria-label="Open isolated preview"
          asChild
          className="size-7 rounded-md text-muted-foreground shadow-none transition-[color,background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-background/80 hover:text-foreground active:scale-[0.97]"
          size="icon"
          tooltip="Open preview"
          variant="ghost"
        >
          <a href={previewHref} rel="noreferrer" target="_blank">
            <IconWindowPointerFillDuo18 className="size-4" />
          </a>
        </Button>
      ) : null}
      <Button
        aria-label="Replay preview"
        className="size-7 rounded-md text-muted-foreground shadow-none transition-[color,background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-background/80 hover:text-foreground active:scale-[0.97]"
        tooltipSide="bottom"

        onClick={replayPreview}
        size="icon"
        tooltip="Replay preview"
        type="button"
        variant="ghost"
      >
        <IconRefresh2FillDuo18 className="size-4" />
      </Button>
      <CodeDrawer code={code} codeString={codeString} title={title} />
    </div>
  );

  return (
    <section className={cn("w-full h-full", className)} {...props}>
      <div
        aria-label="Component actions"
        className="fixed right-[4.5rem] top-5 z-50 flex h-10 max-w-2xl shrink-0 items-center justify-between gap-1 rounded-xl bg-sidebar px-1 header-shadow"
        role="toolbar"
      >
        {actions}
      </div>

      <div className="relative max-h-[calc(100vh-300px)] w-full bg-background mx-auto h-full flex items-center justify-center rounded-xl component-preview-css ">
        <div
          className={cn(
            "flex min-h-[calc(100vh-300px)] w-full overflow-auto px-4 py-8 sm:px-6 items-center justify-center",
            previewClassName,
          )}
        >
          <div key={previewKey} className="flex min-h-full w-full items-center justify-center h-full">
            {children}
          </div>
        </div>
      </div>
 

      {doc ? <div className="mt-8">{doc}</div> : null}
    </section>
  );
};

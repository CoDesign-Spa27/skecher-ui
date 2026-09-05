"use client";

import { Maximize, Minimize } from "lucide-react";
import { AnimatePresence, motion, type TargetAndTransition, useReducedMotion } from "motion/react";
import {
  IconRefresh2FillDuo18,
  IconWindowPointerFillDuo18,
} from "nucleo-ui-essential-fill-duo-18";
import * as React from "react";

import { CodeIcon } from "@/assets/app-icons/code";
import {
  SuperIslandLayoutProvider,
  useSuperIslandLayout,
} from "@/components/docs/super-island-layout";
import CopyButton from "@/components/docs/ui/copy-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar";

interface ComponentWrapperProps extends Omit<React.ComponentProps<"section">, "children"> {
  action?: "replay" | "toggle" | string;
  align?: "center" | "start" | "end";
  breadcrumbTitle?: string;
  children: React.ReactNode;
  code?: React.ReactNode;
  codeString?: string;
  doc?: React.ReactNode;
  previewClassName?: string;
  previewHref?: string;
  previewInset?: boolean;
  title?: string;
}

const DETAILS_PANEL_MAX_WIDTH = 40 * 16;
const DETAILS_PANEL_VIEWPORT_RATIO = 0.78;

function formatBreadcrumbTitle(title: string) {
  return title
    .replace(/\.[jt]sx?$/i, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => {
      const normalizedWord = word.toLowerCase();

      if (normalizedWord === "ai" || normalizedWord === "ui") {
        return normalizedWord.toUpperCase();
      }

      return normalizedWord.charAt(0).toUpperCase() + normalizedWord.slice(1);
    })
    .join(" ");
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
      <DrawerContent className="mx-auto h-[min(82vh,760px)] max-h-[82vh] w-full max-w-6xl overflow-hidden rounded-t-xl border-x bg-neutral-100 dark:bg-accent p-0">
        <div className="min-h-0 flex-1 overflow-hidden bg-muted/20 scroll-fade-y ">
          <div className="flex shrink-0 items-center gap-1 absolute right-5 top-10">
            {codeString ? <CopyButton code={codeString} className="size-8 rounded-md" /> : null}

          </div>
          {code ? code : <EmptyPanel label="No source added for this example." />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const ComponentWrapperContent: React.FC<ComponentWrapperProps> = ({
  action,
  align = "center",
  breadcrumbTitle,
  children,
  className,
  code,
  codeString,
  doc,
  previewClassName,
  previewHref,
  previewInset = true,
  title = "Component example",
  ...props
}) => {
  const [previewKey, setPreviewKey] = React.useState(0);
  const [detailsPanelWidth, setDetailsPanelWidth] = React.useState(DETAILS_PANEL_MAX_WIDTH);
  const shouldReduceMotion = useReducedMotion();
  const superIslandLayout = useSuperIslandLayout();
  const detailsOpen = Boolean(doc && superIslandLayout?.manualOpen);
  const resolvedBreadcrumbTitle = breadcrumbTitle ?? formatBreadcrumbTitle(title);
  const {state}  = useSidebar();
   
  const layoutTransition =
    shouldReduceMotion || !superIslandLayout?.animated
      ? { duration: 0 }
      : {
          type: "spring" as const,
          bounce: 0,
          duration: superIslandLayout.manualOpen ? 0.34 : 0.28,
        };
  const workbenchAnimation = {
    "--details-gap": detailsOpen ? "12px" : "0px",
    "--details-width": detailsOpen ? `${detailsPanelWidth}px` : "0px",
  } as unknown as TargetAndTransition;

  React.useLayoutEffect(() => {
    const updateDetailsPanelWidth = () => {
      setDetailsPanelWidth(
        Math.min(DETAILS_PANEL_MAX_WIDTH, window.innerWidth * DETAILS_PANEL_VIEWPORT_RATIO),
      );
    };

    updateDetailsPanelWidth();
    window.addEventListener("resize", updateDetailsPanelWidth);
    return () => window.removeEventListener("resize", updateDetailsPanelWidth);
  }, []);

  // Preserve the legacy prop while keeping it off the rendered section.
  void action;

  const replayPreview = React.useCallback(() => {
    setPreviewKey((key) => key + 1);
  }, []);

  const actions = (
    <div className="flex items-center gap-1">
      <div className="flex min-w-0 items-center gap-1 rounded-lg bg-[#F1F1F1] p-0.5 input-shadow dark:bg-input/30">
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
        {doc ? (
          <Button
            aria-expanded={superIslandLayout?.manualOpen ?? false}
            aria-label={
              superIslandLayout?.manualOpen ? "Hide component details" : "Show component details"
            }
            className="size-7 rounded-md shadow-none transition-[color,background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-background/80 hover:text-foreground active:scale-[0.97]"
            onClick={(event) =>
              superIslandLayout?.setManualOpen(!superIslandLayout.manualOpen, {
                animated: event.detail !== 0,
              })
            }
            size="icon"
            tooltip={superIslandLayout?.manualOpen ? "Close" : "Slide"}
            tooltipSide="bottom"
            type="button"
            variant="ghost"
          >
            {superIslandLayout?.manualOpen ? (
              <Minimize className="size-4 font-extrabold" />
            ) : (
              <Maximize className="size-4" />
            )}
          </Button>
        ) : null}
      </div>
      <ModeToggle
        className="size-8 bg-transparent text-muted-foreground shadow-none transition-[color,background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-background/80 hover:text-foreground active:scale-[0.97] border dark:border-neutral-800"
        variant="ghost"
      />
    </div>
  );

  return (
    <section className={cn("h-full min-h-0 w-full", className)} {...props}>
      <motion.div
        animate={workbenchAnimation}
        className="relative grid h-full min-h-0 w-full grid-cols-[minmax(0,1fr)] gap-2 overflow-hidden bg-background px-1   md:grid-cols-[minmax(0,1fr)_var(--details-width)] md:gap-x-[var(--details-gap)] md:gap-y-0 md:pb-3"
        initial={false}
        transition={layoutTransition}
      >
        <div
          data-component-preview
          className={cn(
            "relative col-start-1 row-start-1 flex min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-xl bg-neutral-100 dark:bg-accent/50",
            previewClassName,
          )}
        >
          <header className="relative z-30 flex h-14 shrink-0 items-center justify-between gap-3 rounded-xl bg-none px-3 sm:px-4">
            <motion.div
              animate={state === "collapsed" ? { x: 50, opacity: 0.6 } : { x: 0, opacity: 1 }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 38,
                mass: 0.95,
                duration: 0.36,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap gap-2 text-sm sm:gap-3 sm:text-base">
                  <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink className="font-normal text-muted-foreground" href="/docs">
                      Components
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="shrink-0 text-muted-foreground/70">
                    /
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate font-medium">
                      {resolvedBreadcrumbTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>
      
      
            <div
              aria-label="Component actions"
              className="flex h-10 w-fit shrink-0 items-center rounded-xl bg-sidebar px-1 header-shadow"
              role="toolbar"
            >
              {actions}
            </div>
          </header>

          <div
            className="no-scrollbar min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
            data-component-preview-scroll
          >
            <div
              key={previewKey}
              data-component-preview-content
              className={cn(
                "mx-auto flex h-full min-h-full w-full overflow-visible [align-items:safe_center]",
                align === "center" && "[justify-content:safe_center]",
                align === "start" && "justify-start",
                align === "end" && "justify-end",
              )}
            >
              {children}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-[inherit]"
            data-component-preview-overlay
            ref={superIslandLayout?.setPreviewOverlayRoot}
          />
        </div>

        <AnimatePresence initial={false}>
          {superIslandLayout?.manualOpen ? (
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Dismiss component details"
              className="absolute inset-0 z-40 bg-background/70 backdrop-blur-[2px] md:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
              onClick={(event) =>
                superIslandLayout.setManualOpen(false, { animated: event.detail !== 0 })
              }
              transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
              type="button"
            />
          ) : null}
        </AnimatePresence>

        {doc}
      </motion.div>
    </section>
  );
};

export const ComponentWrapper: React.FC<ComponentWrapperProps> = (props) => (
  <SuperIslandLayoutProvider>
    <ComponentWrapperContent {...props} />
  </SuperIslandLayoutProvider>
);

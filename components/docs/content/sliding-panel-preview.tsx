"use client";

import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useId,
  useRef,
  useState,
} from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { SlidingPanel, type SlidingPanelDirection } from "@/components/ui-components/sliding-panel";
import { cn } from "@/lib/utils";

type PanelIndex = 0 | 1;

type NavigationState = {
  active: PanelIndex;
  direction: SlidingPanelDirection;
  motionEnabled: boolean;
};

const LABELS = ["Overview", "Activity"] as const;
const OVERVIEW_BARS = [34, 58, 45, 76, 62, 88, 70, 96] as const;
const ACTIVITY_ROWS = [82, 68, 76, 58] as const;

function LoadingBar({ className, ...props }: ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton
      aria-hidden="true"
      className={cn("motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

function OverviewSkeleton() {
  return (
    <div
      aria-busy="true"
      className="grid h-full grid-cols-[5rem_minmax(0,1fr)] bg-background sm:grid-cols-[9rem_minmax(0,1fr)]"
    >
      <span className="sr-only">Loading overview</span>

      <aside className="flex flex-col border-r border-border/70 bg-muted/35 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <LoadingBar className="size-7 shrink-0 rounded-lg bg-foreground/12" />
          <LoadingBar className="hidden h-3 w-16 bg-foreground/10 sm:block" />
        </div>

        <div className="mt-7 space-y-3">
          {["w-full", "w-4/5", "w-11/12", "w-3/4"].map((width) => (
            <div className="flex items-center gap-2.5" key={width}>
              <LoadingBar className="size-4 shrink-0 rounded bg-foreground/8" />
              <LoadingBar className={cn("hidden h-2.5 bg-foreground/8 sm:block", width)} />
            </div>
          ))}
        </div>

        <LoadingBar className="mt-auto size-7 rounded-full bg-foreground/10" />
      </aside>

      <main className="min-w-0 overflow-hidden p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <LoadingBar className="h-4 w-28 bg-foreground/12" />
            <LoadingBar className="h-2.5 w-40 bg-foreground/7" />
          </div>
          <LoadingBar className="size-8 rounded-full bg-foreground/8" />
        </div>

        <div className="mt-7 flex h-32 items-end gap-2 border-b border-border/70 pb-px sm:h-40 sm:gap-3">
          {OVERVIEW_BARS.map((height) => (
            <LoadingBar
              className="min-w-0 flex-1 rounded-b-none bg-foreground/9"
              key={height}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {[72, 54, 80].map((width) => (
            <div className="space-y-2" key={width}>
              <LoadingBar className="h-2.5 w-14 bg-foreground/7" />
              <LoadingBar className="h-5 bg-foreground/11" style={{ width: `${width}%` }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div aria-busy="true" className="grid h-full bg-background sm:grid-cols-[minmax(0,1fr)_10rem]">
      <span className="sr-only">Loading activity</span>

      <main className="min-w-0 p-4 sm:p-5">
        <div className="space-y-2">
          <LoadingBar className="h-4 w-28 bg-foreground/12" />
          <LoadingBar className="h-2.5 w-40 bg-foreground/7" />
        </div>

        <div className="mt-7 space-y-5">
          {ACTIVITY_ROWS.map((width, index) => (
            <div className="relative flex gap-3" key={width}>
              {index < ACTIVITY_ROWS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[0.9375rem] top-8 h-[calc(100%+0.5rem)] w-px bg-border/80"
                />
              ) : null}
              <LoadingBar className="relative z-10 size-8 shrink-0 rounded-full bg-foreground/10" />
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <div className="flex items-center gap-2">
                  <LoadingBar className="h-2.5 w-20 bg-foreground/11" />
                  <LoadingBar className="h-2 w-10 bg-foreground/6" />
                </div>
                <LoadingBar className="h-2.5 bg-foreground/8" style={{ width: `${width}%` }} />
                <LoadingBar className="h-2.5 w-3/5 bg-foreground/6" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <aside className="hidden border-l border-border/70 bg-muted/25 p-4 sm:block">
        <LoadingBar className="h-3 w-20 bg-foreground/11" />
        <div className="mt-5 flex -space-x-2">
          {["ava", "ben", "cy", "dia"].map((avatar) => (
            <LoadingBar
              className="size-8 rounded-full border-2 border-background bg-foreground/10"
              key={avatar}
            />
          ))}
        </div>
        <div className="mt-8 space-y-3">
          {[72, 92, 64, 80].map((width) => (
            <div className="space-y-1.5" key={width}>
              <LoadingBar className="h-2 bg-foreground/6" style={{ width: `${width}%` }} />
              <LoadingBar className="h-2.5 w-2/5 bg-foreground/10" />
            </div>
          ))}
        </div>
        <LoadingBar className="mt-8 h-16 w-full bg-foreground/7" />
      </aside>
    </div>
  );
}

const PANELS = [<OverviewSkeleton key="overview" />, <ActivitySkeleton key="activity" />] as const;

export function SlidingPanelPreview() {
  const instanceId = useId();
  const [{ active, direction, motionEnabled }, setNavigation] = useState<NavigationState>({
    active: 0,
    direction: 1,
    motionEnabled: true,
  });
  const [pressedTab, setPressedTab] = useState<PanelIndex | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = (nextTab: PanelIndex, animate: boolean) => {
    setNavigation((current) => {
      if (nextTab === current.active) {
        return current;
      }

      return {
        active: nextTab,
        direction: nextTab > current.active ? 1 : -1,
        motionEnabled: animate,
      };
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: PanelIndex) => {
    let nextTab: PanelIndex | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      nextTab = tab === 0 ? 1 : 0;
    } else if (event.key === "Home") {
      nextTab = 0;
    } else if (event.key === "End") {
      nextTab = 1;
    }

    if (nextTab === null) {
      return;
    }

    event.preventDefault();
    selectTab(nextTab, false);
    tabRefs.current[nextTab]?.focus();
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>, tab: PanelIndex) => {
    if (event.pointerType !== "mouse" || event.button === 0) {
      setNavigation((current) =>
        current.motionEnabled ? current : { ...current, motionEnabled: true },
      );
      setPressedTab(tab);
    }
  };

  const clearPressedTab = () => setPressedTab(null);
  const panelId = `${instanceId}-panel`;

  return (
    <section className="w-full max-w-2xl rounded-2xl bg-muted/45 p-2 text-foreground">
      <div
        aria-label="Loading preview"
        className="relative mb-2 grid h-8 w-fit grid-cols-2 rounded-lg bg-background/70 p-0.5"
        role="tablist"
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-md bg-background shadow-sm",
            motionEnabled
              ? "transition-transform duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none"
              : "transition-none",
            active === 1 ? "translate-x-full" : "translate-x-0",
          )}
        />

        {LABELS.map((label, index) => {
          const tab = index as PanelIndex;
          const selected = active === tab;

          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className={cn(
                "relative z-10 min-w-20 select-none rounded-md px-3 text-xs font-medium text-muted-foreground outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                motionEnabled
                  ? "transition-[color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-colors"
                  : "transition-none",
                selected && "text-foreground",
                pressedTab === tab && "scale-[0.97]",
              )}
              id={`${instanceId}-tab-${tab}`}
              key={label}
              onBlur={clearPressedTab}
              onClick={(event: MouseEvent<HTMLButtonElement>) => selectTab(tab, event.detail > 0)}
              onKeyDown={(event) => handleKeyDown(event, tab)}
              onPointerCancel={clearPressedTab}
              onPointerDown={(event) => handlePointerDown(event, tab)}
              onPointerUp={clearPressedTab}
              ref={(element) => {
                tabRefs.current[tab] = element;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      <SlidingPanel
        activeKey={active}
        aria-labelledby={`${instanceId}-tab-${active}`}
        className="h-[24rem] rounded-xl border border-border/70 bg-background"
        direction={direction}
        id={panelId}
        motionEnabled={motionEnabled}
        role="tabpanel"
      >
        {PANELS[active]}
      </SlidingPanel>
    </section>
  );
}

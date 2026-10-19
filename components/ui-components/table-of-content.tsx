"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

export type DocsTocItem = {
  id: string;
  label: string;
  level: 2 | 3;
  parent: string | null;
};

type DocsTocProps = {
  className?: string;
  /** When provided, renders a selectable outline without tracking page headings. */
  items?: DocsTocItem[];
};

const OFFSET = 120;
const TICK = 7;
const MAJOR = 5;
const SPRING = { type: "spring", stiffness: 520, damping: 42 } as const;
const INSTANT = { duration: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function getScrollRoot(element: HTMLElement | null): HTMLElement | null {
  let ancestor = element?.parentElement;

  while (ancestor) {
    if (
      /(auto|scroll)/.test(getComputedStyle(ancestor).overflowY) &&
      ancestor.scrollHeight > ancestor.clientHeight
    ) {
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  }

  return null;
}

function getReadingLine(root: HTMLElement | null, lastHeading: HTMLElement | null) {
  const start = root ? root.getBoundingClientRect().top + 40 : OFFSET;
  if (!lastHeading) return start;

  const remaining = root
    ? Math.max(0, root.scrollHeight - root.clientHeight - root.scrollTop)
    : Math.max(0, document.documentElement.scrollHeight - window.innerHeight - window.scrollY);
  const lastHeadingAtEnd = lastHeading.getBoundingClientRect().top - remaining;
  const neededShift = Math.max(0, lastHeadingAtEnd - start + 16);
  const runway = (root?.clientHeight ?? window.innerHeight) / 2;

  return start + neededShift * (1 - clamp01(remaining / Math.max(1, runway)));
}

function useItems(enabled: boolean) {
  const pathname = usePathname();
  const [items, setItems] = React.useState<DocsTocItem[]>([]);

  React.useEffect(() => {
    if (!enabled || !pathname) {
      setItems([]);
      return;
    }

    let parent: string | null = null;

    const next = Array.from(document.querySelectorAll<HTMLElement>("[data-toc]"))
      .filter((element) => element.id)
      .map((element): DocsTocItem => {
        const level = element.dataset.toc === "3" ? 3 : 2;
        if (level === 2) parent = element.id;

        return {
          id: element.id,
          label: element.dataset.tocLabel ?? element.textContent?.trim() ?? "",
          level,
          parent: level === 3 ? parent : null,
        };
      });

    setItems(next);
  }, [enabled, pathname]);

  return items;
}

function useTocTracking(
  items: DocsTocItem[],
  standalone: boolean,
  active: string | null,
  railRef: React.RefObject<HTMLUListElement | null>,
  onActiveChange: React.Dispatch<React.SetStateAction<string | null>>,
) {
  const progress = useMotionValue(0);
  const thumbTop = useMotionValue(0);
  const thumbHeight = useMotionValue(0);

  React.useEffect(() => {
    const rail = railRef.current;

    if (!rail || !items.length) {
      if (!standalone) onActiveChange(null);
      progress.set(0);
      thumbHeight.set(0);
      return;
    }

    const root = standalone ? null : getScrollRoot(document.getElementById(items[0].id));

    let frame = 0;

    const update = () => {
      frame = 0;

      const readingLine = getReadingLine(root, document.getElementById(items[items.length - 1].id));
      let current = active ?? items[0].id;

      if (!standalone) {
        current = items[0].id;

        for (const item of items) {
          const heading = document.getElementById(item.id);

          if (heading && heading.getBoundingClientRect().top <= readingLine) {
            current = item.id;
          }
        }

        onActiveChange(current);
      }

      // Match the heading directly; React may not have committed data-active yet.
      const link = Array.from(rail.querySelectorAll<HTMLElement>("[data-toc-id]")).find(
        (element) => element.dataset.tocId === current,
      );

      if (!link) return;

      thumbTop.set(link.getBoundingClientRect().top - rail.getBoundingClientRect().top + 4);
      thumbHeight.set(Math.max(0, link.offsetHeight - 8));

      let through = 1;

      if (!standalone) {
        const index = items.findIndex((item) => item.id === current);
        const heading = document.getElementById(current);
        const next = items[index + 1] ? document.getElementById(items[index + 1].id) : null;

        if (heading && next) {
          const start = heading.getBoundingClientRect().top;
          const end = next.getBoundingClientRect().top;

          through = clamp01((readingLine - start) / Math.max(1, end - start));
        }
      }

      progress.set(
        link.getBoundingClientRect().top -
          rail.getBoundingClientRect().top +
          through * link.offsetHeight,
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(rail);

    if (!standalone) {
      root?.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("scroll", schedule, { passive: true });
    }

    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root?.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items, standalone, active, railRef, onActiveChange, progress, thumbTop, thumbHeight]);

  return { progress, thumbTop, thumbHeight };
}

function TocRuler({
  railRef,
  progress,
  reduceMotion,
}: {
  railRef: React.RefObject<HTMLUListElement | null>;
  progress: ReturnType<typeof useMotionValue<number>>;
  reduceMotion: boolean;
}) {
  const rulerRef = React.useRef<HTMLLIElement>(null);
  const [ticks, setTicks] = React.useState(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 300,
    damping: 40,
  });

  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const measure = () => setTicks(Math.floor(rail.offsetHeight / TICK) + 1);
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(rail);

    return () => observer.disconnect();
  }, [railRef]);

  React.useEffect(() => {
    const source = reduceMotion ? progress : smoothProgress;
    const write = (value: number) => rulerRef.current?.style.setProperty("--head", String(value));

    write(source.get());
    return source.on("change", write);
  }, [progress, smoothProgress, reduceMotion]);

  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const move = (event: PointerEvent) => {
      if (reduceMotion) return;

      rulerRef.current?.style.setProperty(
        "--probe",
        String(event.clientY - rail.getBoundingClientRect().top),
      );
    };

    const leave = () => rulerRef.current?.style.setProperty("--probe", "-999");

    leave();
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerleave", leave);

    return () => {
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerleave", leave);
    };
  }, [railRef, reduceMotion]);

  return (
    <li
      ref={rulerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -start-6 w-4 [--head:0] [--probe:-999]"
    >
      {Array.from({ length: ticks }, (_, index) => index * TICK).map((position, index) => (
        <span
          key={position}
          className="absolute end-0 h-px rounded-full transition-[width] duration-100 ease-out motion-reduce:transition-none"
          style={
            {
              top: position,
              "--y": position,
              "--base": index % MAJOR === 0 ? 8 : 4,
              "--near-head": "max(0, 1 - max(var(--y) - var(--head), var(--head) - var(--y)) / 28)",
              "--near-probe":
                "max(0, 1 - max(var(--y) - var(--probe), var(--probe) - var(--y)) / 24)",
              width:
                "calc(var(--base) * 1px + max(var(--near-head) * 10px, var(--near-probe) * 7px))",
              backgroundColor:
                "color-mix(in oklab, var(--highlight) calc(clamp(0, var(--head) - var(--y), 1) * 100%), var(--muted-foreground))",
            } as React.CSSProperties
          }
        />
      ))}
    </li>
  );
}

export function DocsToc({ className, items: providedItems }: DocsTocProps) {
  const standalone = providedItems !== undefined;
  const scannedItems = useItems(!standalone);
  const items = providedItems ?? scannedItems;

  const [selected, setSelected] = React.useState<string | null>(null);
  const [observedActive, setObservedActive] = React.useState<string | null>(null);

  const active = standalone
    ? (items.find((item) => item.id === selected)?.id ?? items[0]?.id ?? null)
    : observedActive;

  const reduceMotion = Boolean(useReducedMotion());
  const transition = reduceMotion ? INSTANT : SPRING;
  const listRef = React.useRef<HTMLDivElement>(null);
  const railRef = React.useRef<HTMLUListElement>(null);

  const { progress, thumbTop, thumbHeight } = useTocTracking(
    items,
    standalone,
    active,
    railRef,
    setObservedActive,
  );
  const smoothThumbTop = useSpring(thumbTop, { stiffness: 520, damping: 42 });
  const smoothThumbHeight = useSpring(thumbHeight, { stiffness: 520, damping: 42 });

  const sections = React.useMemo(() => {
    const children = new Map<string, DocsTocItem[]>();

    for (const item of items) {
      if (item.level !== 3 || !item.parent) continue;

      const group = children.get(item.parent) ?? [];
      group.push(item);
      children.set(item.parent, group);
    }

    return items
      .filter((item) => item.level === 2)
      .map((item) => ({
        ...item,
        children: children.get(item.id) ?? [],
      }));
  }, [items]);

  const activeItem = items.find((item) => item.id === active);
  const openSection = activeItem?.level === 3 ? activeItem.parent : activeItem?.id;

  React.useEffect(() => {
    if (!active) return;

    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>("[data-active]");
    if (!list || !link) return;

    const top =
      link.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;

    if (top < list.scrollTop + 24 || top > list.scrollTop + list.clientHeight - 48) {
      list.scrollTo({
        top: top - list.clientHeight / 3,
        behavior: reduceMotion ? "instant" : "smooth",
      });
    }
  }, [active, reduceMotion]);

  function navigate(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
    });
    history.replaceState(null, "", `#${id}`);
  }

  function renderLink(item: DocsTocItem) {
    const isActive = item.id === active;

    const props = {
      "data-active": isActive || undefined,
      "data-toc-id": item.id,
      className: cn(
        "relative block w-full py-1.5 text-left text-base",
        "transition-[color] duration-150 ease-out",
        "focus-visible:rounded-sm focus-visible:outline-2",
        "focus-visible:outline-offset-2 focus-visible:outline-ring",
        item.level === 2 ? "ps-3" : "ps-6 font-mono text-sm",
        isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
      ),
    };

    const content = <span className="block truncate">{item.label}</span>;

    return standalone ? (
      <button {...props} type="button" aria-pressed={isActive} onClick={() => setSelected(item.id)}>
        {content}
      </button>
    ) : (
      <a
        {...props}
        href={`#${item.id}`}
        aria-current={isActive ? "location" : undefined}
        onClick={(event) => navigate(event, item.id)}
      >
        {content}
      </a>
    );
  }

  if (!items.length) return null;

  return (
    <nav aria-label="On this page" data-slot="docs-toc" className={cn("flex flex-col", className)}>
      <span className="pb-2 text-sm text-muted-foreground">On this page</span>

      <div
        ref={listRef}
        className="no-scrollbar max-h-[calc(100dvh-10rem)] overflow-y-auto py-1 ps-6"
      >
        <ul ref={railRef} className="relative flex flex-col border-s border-border">
          <TocRuler railRef={railRef} progress={progress} reduceMotion={reduceMotion} />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -start-px z-10 w-[3px] rounded-full bg-highlight"
            style={{
              y: reduceMotion ? thumbTop : smoothThumbTop,
              height: reduceMotion ? thumbHeight : smoothThumbHeight,
            }}
          />

          {sections.map((section) => (
            <li key={section.id}>
              {renderLink(section)}

              <AnimatePresence initial={false}>
                {section.children.length > 0 && openSection === section.id && (
                  <motion.ul
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={transition}
                    className="overflow-hidden"
                  >
                    {section.children.map((child) => (
                      <li key={child.id}>{renderLink(child)}</li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

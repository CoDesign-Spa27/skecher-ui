"use client";

import type { MotionValue } from "motion/react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type SnapTextSpring = {
  damping?: number;
  mass?: number;
  stiffness?: number;
};

export type SnapTextProps = {
  className?: string;
  indent?: number;
  initialIndex?: number;
  itemHeight?: number;
  items?: string[];
  onIndexChange?: (index: number) => void;
  prefix?: ReactNode;
  spring?: SnapTextSpring;
};

type SnapTextRowProps = {
  indent: number;
  index: number;
  item: string;
  itemHeight: number;
  progress: MotionValue<number>;
};

const DEFAULT_ITEMS = [
  "the platform",
  "the Design System",
  "the library",
  "the brand",
  "the conference",
  "the experience",
];

const DEFAULT_SPRING = {
  damping: 30,
  mass: 0.8,
  stiffness: 280,
};

function clampIndex(index: number, itemCount: number) {
  return Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0));
}

function SnapTextRow({ indent, index, item, itemHeight, progress }: SnapTextRowProps) {
  const opacity = useTransform(progress, (latestIndex) => {
    const distance = Math.abs(index - latestIndex);
    return Math.max(0.15, 1 - distance * 0.82);
  });
  const transform = useTransform(progress, (latestIndex) => {
    const distance = Math.abs(index - latestIndex);
    const horizontalOffset = Math.min(distance, 3) * indent;
    const scale = Math.max(0.78, 1 - distance * 0.12);

    return `translate3d(${horizontalOffset}px, 0px, 0px) scale3d(${scale}, ${scale}, 1)`;
  });

  return (
    <motion.li
      className="flex w-max max-w-full origin-left items-center whitespace-nowrap font-semibold leading-none tracking-[-0.04em] text-white"
      style={{ height: itemHeight, opacity, transform }}
    >
      {item}
    </motion.li>
  );
}

export function SnapText({
  className,
  indent = 48,
  initialIndex = 3,
  itemHeight = 104,
  items = DEFAULT_ITEMS,
  onIndexChange,
  prefix,
  spring,
}: SnapTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionHeightRef = useRef(0);
  const activeIndexRef = useRef(clampIndex(initialIndex, items.length));
  const [activeIndex, setActiveIndex] = useState(activeIndexRef.current);
  const scrollIndex = useMotionValue(activeIndexRef.current);
  const viewportHeight = useMotionValue(0);
  const visualItemHeight = useMotionValue(itemHeight);
  const springConfig = useMemo(
    () => ({
      damping: spring?.damping ?? DEFAULT_SPRING.damping,
      mass: spring?.mass ?? DEFAULT_SPRING.mass,
      stiffness: spring?.stiffness ?? DEFAULT_SPRING.stiffness,
    }),
    [spring?.damping, spring?.mass, spring?.stiffness],
  );
  const presentedIndex = useSpring(scrollIndex, springConfig);
  const trackTransform = useTransform(
    [presentedIndex, viewportHeight, visualItemHeight],
    ([latestIndex, latestHeight, latestItemHeight]: number[]) =>
      `translate3d(0px, ${latestHeight / 2 - latestItemHeight / 2 - latestIndex * latestItemHeight}px, 0px)`,
  );

  const commitIndex = useCallback(
    (nextIndex: number) => {
      const clampedIndex = clampIndex(nextIndex, items.length);

      if (clampedIndex === activeIndexRef.current) {
        return;
      }

      activeIndexRef.current = clampedIndex;
      setActiveIndex(clampedIndex);
      onIndexChange?.(clampedIndex);
    },
    [items.length, onIndexChange],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const scrollDriver = scrollRef.current;

    if (!root || !scrollDriver) {
      return;
    }

    const syncSize = () => {
      const nextHeight = root.getBoundingClientRect().height;

      if (nextHeight <= 0) {
        return;
      }

      const previousHeight = sectionHeightRef.current;
      const currentProgress =
        previousHeight > 0 ? scrollDriver.scrollTop / previousHeight : activeIndexRef.current;

      sectionHeightRef.current = nextHeight;
      viewportHeight.set(nextHeight);
      visualItemHeight.set(itemHeight);
      scrollDriver.scrollTop = currentProgress * nextHeight;
      scrollIndex.jump(currentProgress);
      presentedIndex.jump(currentProgress);
    };

    syncSize();
    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(root);

    return () => resizeObserver.disconnect();
  }, [itemHeight, presentedIndex, scrollIndex, viewportHeight, visualItemHeight]);

  useEffect(() => {
    const scrollDriver = scrollRef.current;
    const clampedIndex = clampIndex(activeIndexRef.current, items.length);

    activeIndexRef.current = clampedIndex;
    setActiveIndex(clampedIndex);
    scrollIndex.jump(clampedIndex);
    presentedIndex.jump(clampedIndex);

    if (scrollDriver && sectionHeightRef.current > 0) {
      scrollDriver.scrollTop = clampedIndex * sectionHeightRef.current;
    }
  }, [items.length, presentedIndex, scrollIndex]);

  useEffect(() => {
    if (shouldReduceMotion) {
      presentedIndex.jump(scrollIndex.get());
    }
  }, [presentedIndex, scrollIndex, shouldReduceMotion]);

  useEffect(() => {
    const scrollDriver = scrollRef.current;

    if (!scrollDriver || items.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let closestEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.55 &&
            (!closestEntry || entry.intersectionRatio > closestEntry.intersectionRatio)
          ) {
            closestEntry = entry;
          }
        }

        if (!closestEntry) {
          return;
        }

        const nextIndex = Number((closestEntry.target as HTMLElement).dataset.snapIndex);

        if (Number.isInteger(nextIndex)) {
          commitIndex(nextIndex);
        }
      },
      { root: scrollDriver, threshold: [0.55, 0.75, 1] },
    );

    for (const section of scrollDriver.querySelectorAll("[data-snap-index]")) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [commitIndex, items.length]);

  if (items.length === 0) {
    return null;
  }

  const prefixText = typeof prefix === "string" || typeof prefix === "number" ? `${prefix} ` : "";
  const hasPrefix = prefix !== undefined && prefix !== null && prefix !== false;

  const selectWithKeyboard = (nextIndex: number) => {
    const scrollDriver = scrollRef.current;
    const clampedIndex = clampIndex(nextIndex, items.length);

    if (!scrollDriver || clampedIndex === activeIndexRef.current) {
      return false;
    }

    scrollDriver.scrollTop = clampedIndex * sectionHeightRef.current;
    scrollIndex.jump(clampedIndex);
    presentedIndex.jump(clampedIndex);
    commitIndex(clampedIndex);
    return true;
  };

  return (
    <div
      className={cn(
        "relative h-svh min-h-[520px] w-full overflow-hidden bg-[#171717] font-sans text-[clamp(1.75rem,4vw,4.5rem)] text-white",
        className,
      )}
      ref={rootRef}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] inset-y-0 flex",
          hasPrefix && "gap-[0.24em]",
        )}
      >
        {hasPrefix ? (
          <span className="flex shrink-0 items-center font-semibold leading-none tracking-[-0.04em] text-[#f4f4f4]">
            {prefix}
          </span>
        ) : null}

        <div className="relative min-w-0 flex-1">
          <motion.ul
            className="absolute inset-x-0 top-0 m-0 list-none p-0"
            style={{ transform: trackTransform }}
          >
            {items.map((item, index) => (
              <SnapTextRow
                indent={indent}
                index={index}
                item={item}
                itemHeight={itemHeight}
                key={item}
                progress={presentedIndex}
              />
            ))}
          </motion.ul>
        </div>
      </div>

      <div
        aria-label="Scroll-controlled text sequence"
        aria-orientation="vertical"
        aria-valuemax={items.length - 1}
        aria-valuemin={0}
        aria-valuenow={activeIndex}
        aria-valuetext={`${prefixText}${items[activeIndex]}`}
        className="absolute inset-0 z-10 flex snap-y snap-mandatory flex-col overflow-y-scroll overscroll-y-contain outline-none [scrollbar-width:none] [-ms-overflow-style:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 [&::-webkit-scrollbar]:hidden"
        onKeyDown={(event) => {
          let nextIndex: number | null = null;

          if (event.key === "ArrowDown" || event.key === "PageDown") {
            nextIndex = activeIndexRef.current + 1;
          } else if (event.key === "ArrowUp" || event.key === "PageUp") {
            nextIndex = activeIndexRef.current - 1;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = items.length - 1;
          }

          if (nextIndex !== null && selectWithKeyboard(nextIndex)) {
            event.preventDefault();
          }
        }}
        onScroll={(event) => {
          const sectionHeight = sectionHeightRef.current;

          if (sectionHeight <= 0) {
            return;
          }

          const nextProgress = event.currentTarget.scrollTop / sectionHeight;
          scrollIndex.set(nextProgress);

          if (shouldReduceMotion) {
            presentedIndex.jump(nextProgress);
          }
        }}
        ref={scrollRef}
        role="slider"
        tabIndex={0}
      >
        {items.map((item, index) => (
          <div
            aria-hidden="true"
            className="h-full flex-none snap-start snap-always"
            data-snap-index={index}
            key={item}
          />
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {prefixText}
        {items[activeIndex]}, item {activeIndex + 1} of {items.length}
      </p>
    </div>
  );
}

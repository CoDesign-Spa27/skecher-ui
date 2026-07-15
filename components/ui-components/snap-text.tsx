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
  colors?: readonly string[];
  imageClassName?: string;
  imageFrameClassName?: string;
  images?: readonly string[];
  indent?: number;
  inactiveColor?: string;
  initialIndex?: number;
  itemHeight?: number;
  items?: readonly string[];
  onIndexChange?: (index: number) => void;
  prefix?: ReactNode;
  spring?: SnapTextSpring;
};

type SnapTextRowProps = {
  color: string;
  indent: number;
  inactiveColor: string;
  index: number;
  item: string;
  itemHeight: number;
  progress: MotionValue<number>;
};

type SnapTextImageProps = {
  imageClassName?: string;
  index: number;
  progress: MotionValue<number>;
  shouldReduceMotion: boolean;
  src: string;
};

const DEFAULT_ITEMS = [
  "A signal appears.",
  "The grid wakes up.",
  "Color breaks free.",
  "Gravity lets go.",
  "The impossible forms.",
  "Everything comes alive.",
];

export const DEFAULT_SNAP_TEXT_IMAGES = [
  "/images/snap-text/i1.jpeg",
  "/images/snap-text/i2.jpeg",
  "/images/snap-text/i3.jpeg",
  "/images/snap-text/i4.jpeg",
  "/images/snap-text/i5.jpeg",
  "/images/snap-text/i6.jpeg",
] as const;

export const DEFAULT_SNAP_TEXT_COLORS = [
  "#8CD7C0",
  "#FFD873",
  "#FF5768",
  "#6C89C5",
  "#FF60A8",
  "#F5B2D3",
] as const;

const DEFAULT_SPRING = {
  damping: 30,
  mass: 0.8,
  stiffness: 280,
};

function clampIndex(index: number, itemCount: number) {
  return Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0));
}

function SnapTextImage({
  imageClassName,
  index,
  progress,
  shouldReduceMotion,
  src,
}: SnapTextImageProps) {
  const opacity = useTransform(progress, (latestIndex) =>
    Math.max(0, 1 - Math.abs(index - latestIndex)),
  );
  const transform = useTransform(progress, (latestIndex) => {
    if (shouldReduceMotion) {
      return "translate3d(0px, 0%, 0px) scale3d(1, 1, 1)";
    }

    const signedDistance = index - latestIndex;
    const clampedDistance = Math.max(-1, Math.min(1, signedDistance));
    const scale = 1 - Math.min(Math.abs(signedDistance), 1) * 0.04;

    return `translate3d(0px, ${clampedDistance * 24}%, 0px) scale3d(${scale}, ${scale}, 1)`;
  });

  return (
    <motion.div
      className="absolute inset-0 origin-center will-change-[transform,opacity] [backface-visibility:hidden]"
      style={{ opacity, transform }}
    >
      {/* biome-ignore lint/performance/noImgElement: keeps registry consumers free to use arbitrary local or remote image sources */}
      <img
        alt=""
        className={cn("size-full select-none object-cover", imageClassName)}
        decoding="async"
        draggable={false}
        loading="eager"
        src={src}
      />
    </motion.div>
  );
}

function SnapTextRow({
  color,
  indent,
  inactiveColor,
  index,
  item,
  itemHeight,
  progress,
}: SnapTextRowProps) {
  const opacity = useTransform(progress, (latestIndex) => {
    const distance = Math.abs(index - latestIndex);
    return Math.max(0.24, 1 - distance * 0.68);
  });
  const fillOpacity = useTransform(progress, (latestIndex) =>
    Math.max(0, 1 - Math.abs(index - latestIndex)),
  );
  const outlineOpacity = useTransform(fillOpacity, (latestOpacity) => 1 - latestOpacity);
  const transform = useTransform(progress, (latestIndex) => {
    const distance = Math.abs(index - latestIndex);
    const horizontalOffset = Math.min(distance, 3) * indent;
    const scale = Math.max(0.8, 1 - distance * 0.1);
    const stretch = 1 + Math.sin(Math.min(distance, 1) * Math.PI) * 0.1;

    return `translate3d(${horizontalOffset}px, 0px, 0px) scale3d(${scale * stretch}, ${scale}, 1)`;
  });

  return (
    <motion.li
      aria-label={item}
      className="relative flex w-max max-w-full origin-left items-center whitespace-nowrap font-semibold leading-none tracking-[-0.04em] will-change-transform"
      style={{ height: itemHeight, opacity, transform }}
    >
      <motion.span
        aria-hidden="true"
        className="text-transparent"
        style={{ opacity: outlineOpacity, WebkitTextStroke: `1px ${inactiveColor}` }}
      >
        {item}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 flex items-center"
        style={{ color, opacity: fillOpacity }}
      >
        {item}
      </motion.span>
    </motion.li>
  );
}

export function SnapText({
  className,
  colors = DEFAULT_SNAP_TEXT_COLORS,
  imageClassName,
  imageFrameClassName,
  images = DEFAULT_SNAP_TEXT_IMAGES,
  indent = 32,
  inactiveColor = "#737373",
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
  const safeColors = colors.length > 0 ? colors : DEFAULT_SNAP_TEXT_COLORS;
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

  const hasImagePrefix = images.length > 0;
  const hasPrefix = prefix !== undefined && prefix !== null && prefix !== false && prefix !== "";
  const prefixText =
    hasPrefix && (typeof prefix === "string" || typeof prefix === "number") ? `${prefix} ` : "";
  const activeColor = safeColors[activeIndex % safeColors.length] ?? DEFAULT_SNAP_TEXT_COLORS[0];
  const sequenceNumber = String(activeIndex + 1).padStart(2, "0");
  const sequenceTotal = String(items.length).padStart(2, "0");

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
        "relative h-svh min-h-[520px] w-full overflow-hidden font-sans text-[clamp(1.75rem,4vw,4.5rem)] text-white",
        className,
      )}
      ref={rootRef}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 right-[7%] z-20 font-mono text-[11px] tracking-[0.16em]"
      >
        <span style={{ color: activeColor }}>{sequenceNumber}</span>
        <span className="text-muted-foreground"> / {sequenceTotal}</span>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] inset-y-0 flex",
          (hasImagePrefix || hasPrefix) && "gap-[clamp(0.75rem,2vw,2rem)]",
        )}
      >
        {hasImagePrefix ? (
          <div
            className={cn(
              "relative aspect-[1/2] w-[clamp(4.5rem,10vw,19rem)] shrink-0 self-center overflow-hidden rounded-xl bg-neutral-950",
              imageFrameClassName,
            )}
          >
            {items.map((item, index) => (
              <SnapTextImage
                imageClassName={imageClassName}
                index={index}
                key={`${item}-${images[index % images.length]}`}
                progress={presentedIndex}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
                src={images[index % images.length] ?? DEFAULT_SNAP_TEXT_IMAGES[0]}
              />
            ))}
          </div>
        ) : null}

        {hasPrefix ? (
          <span className="flex shrink-0 items-center font-semibold leading-none tracking-[-0.04em] text-foreground">
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
                color={safeColors[index % safeColors.length] ?? DEFAULT_SNAP_TEXT_COLORS[0]}
                indent={indent}
                inactiveColor={inactiveColor}
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

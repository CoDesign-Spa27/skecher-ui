"use client";

import type { MotionValue } from "motion/react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

export type ScrollRevealPhysics = {
  bounce?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  visualDuration?: number;
};

export type ScrollRevealRange = {
  end?: number;
  start?: number;
};

export type ScrollRevealTextProps = {
  className?: string;
  lines?: readonly string[];
  mutedClassName?: string;
  mutedColor?: string;
  physics?: ScrollRevealPhysics;
  revealClassName?: string;
  revealColor?: string;
  revealRange?: ScrollRevealRange;
  scrollLength?: number;
  scrollHint?: ReactNode;
  scrollHintClassName?: string;
  scrollHintPosition?: "bottom" | "top";
  scrollContainerRef?: RefObject<HTMLElement | null>;
  showScrollHint?: boolean;
  stickyClassName?: string;
  textClassName?: string;
};

type RevealLineProps = {
  index: number;
  line: string;
  lineCount: number;
  mutedClassName?: string;
  mutedColor?: string;
  progress: MotionValue<number>;
  revealClassName?: string;
  revealColor?: string;
  revealEnd: number;
  revealStart: number;
  shouldReduceMotion: boolean;
};

export const DEFAULT_SCROLL_REVEAL_LINES = [
  "Interfaces should not just respond.",
  "They should move with intention.",
  "And make every interaction feel alive.",
] as const;

export const DEFAULT_SCROLL_REVEAL_PHYSICS = {
  damping: 28,
  mass: 0.8,
  stiffness: 200,
} as const;

function RevealLine({
  index,
  line,
  lineCount,
  mutedClassName,
  mutedColor,
  progress,
  revealClassName,
  revealColor,
  revealEnd,
  revealStart,
  shouldReduceMotion,
}: RevealLineProps) {
  const revealRange = revealEnd - revealStart;

  const lineStart = revealStart + (index / lineCount) * revealRange;
  const lineEnd = revealStart + ((index + 1) / lineCount) * revealRange;

  const clipPath = useTransform(
    progress,
    [lineStart, lineEnd],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
    {
      clamp: true,
    },
  );

  return (
    <span className="relative block">
      <span
        className={cn("text-neutral-300 dark:text-neutral-700", mutedClassName)}
        style={mutedColor ? { color: mutedColor } : undefined}
      >
        {line}
      </span>

      <motion.span
        aria-hidden="true"
        className={cn("absolute inset-0 text-foreground", revealClassName)}
        style={{
          clipPath: shouldReduceMotion ? "inset(0 0% 0 0)" : clipPath,
          color: revealColor,
        }}
      >
        {line}
      </motion.span>
    </span>
  );
}

export function ScrollRevealText({
  className,
  lines = DEFAULT_SCROLL_REVEAL_LINES,
  mutedClassName,
  mutedColor,
  physics = DEFAULT_SCROLL_REVEAL_PHYSICS,
  revealClassName,
  revealColor,
  revealRange,
  scrollLength,
  scrollHint = "Scroll to reveal",
  scrollHintClassName,
  scrollHintPosition = "top",
  scrollContainerRef,
  showScrollHint = true,
  stickyClassName,
  textClassName,
}: ScrollRevealTextProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  const safeLines = lines.map((line) => line.trim()).filter(Boolean);

  const resolvedLines = safeLines.length > 0 ? safeLines : [...DEFAULT_SCROLL_REVEAL_LINES];
  const revealStart = Math.min(Math.max(revealRange?.start ?? 0.08, 0), 0.95);
  const revealEnd = Math.min(Math.max(revealRange?.end ?? 0.92, revealStart + 0.05), 1);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /*
   * Smooths tiny trackpad and wheel changes without making
   * the reveal feel delayed.
   */
  const smoothProgress = useSpring(
    scrollYProgress,
    physics.visualDuration !== undefined
      ? {
          bounce: physics.bounce,
          visualDuration: physics.visualDuration,
        }
      : {
          damping: physics.damping ?? DEFAULT_SCROLL_REVEAL_PHYSICS.damping,
          mass: physics.mass ?? DEFAULT_SCROLL_REVEAL_PHYSICS.mass,
          stiffness: physics.stiffness ?? DEFAULT_SCROLL_REVEAL_PHYSICS.stiffness,
        },
  );
  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.12, 0.22], [1, 1, 0]);
  const scrollHintY = useTransform(smoothProgress, [0, 0.22], [0, -8]);

  return (
    <section
      ref={sectionRef}
      aria-label="Scroll-revealed statement"
      className={cn("relative min-h-[240svh] w-full", className)}
      style={scrollLength ? { minHeight: `${Math.max(scrollLength, 100)}svh` } : undefined}
    >
      <div
        className={cn(
          "sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden px-6 py-20 sm:px-10",
          stickyClassName,
        )}
      >
        <p
          className={cn(
            "w-full max-w-6xl text-balance font-sans",
            "text-[clamp(2rem,6vw,5.5rem)]",
            "font-semibold leading-[1.02]",
            "tracking-[-0.04em]",
            textClassName,
          )}
        >
          {resolvedLines.map((line, index) => (
            <RevealLine
              key={line}
              index={index}
              line={line}
              lineCount={resolvedLines.length}
              mutedClassName={mutedClassName}
              mutedColor={mutedColor}
              progress={shouldReduceMotion ? scrollYProgress : smoothProgress}
              revealClassName={revealClassName}
              revealColor={revealColor}
              revealEnd={revealEnd}
              revealStart={revealStart}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </p>

        {showScrollHint && !shouldReduceMotion ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 flex justify-center px-6",
              scrollHintPosition === "top"
                ? "top-[max(1.5rem,env(safe-area-inset-top))]"
                : "bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
            )}
          >
            <motion.div
              aria-hidden="true"
              className={cn(
                "flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pr-3 pl-1.5 text-foreground",
                scrollHintClassName,
              )}
              style={{ opacity: scrollHintOpacity, y: scrollHintY }}
            >
              <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs text-background">
                ↓
              </span>
              <span className="font-mono text-[11px] font-medium tracking-[0.08em]">
                {scrollHint}
              </span>
            </motion.div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

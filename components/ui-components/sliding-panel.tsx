"use client";

import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type { ComponentProps, Key, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SlidingPanelDirection = -1 | 1;

type PanelMotionMode = "slide" | "fade" | "instant";

type PanelMotionState = {
  direction: SlidingPanelDirection;
  mode: PanelMotionMode;
};

export type SlidingPanelProps = Omit<ComponentProps<"div">, "children"> & {
  activeKey: Key;
  children: ReactNode;
  direction?: SlidingPanelDirection;
  motionEnabled?: boolean;
  panelClassName?: string;
  transition?: Transition;
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const DEFAULT_TRANSITION: Transition = {
  duration: 0.22,
  ease: EASE_OUT,
};

const panelVariants: Variants = {
  initial: ({ direction, mode }: PanelMotionState) => ({
    opacity: mode === "instant" ? 1 : 0,
    transform: mode === "slide" ? `translateX(${direction * 100}%)` : "translateX(0%)",
  }),
  animate: ({ mode }: PanelMotionState) => ({
    opacity: 1,
    transform: "translateX(0%)",
    transition:
      mode === "instant"
        ? { duration: 0 }
        : mode === "fade"
          ? { duration: 0.15, ease: EASE_OUT }
          : undefined,
  }),
  exit: ({ direction, mode }: PanelMotionState) => ({
    opacity: mode === "instant" ? 1 : 0,
    transform: mode === "slide" ? `translateX(${-direction * 100}%)` : "translateX(0%)",
    transition:
      mode === "instant"
        ? { duration: 0 }
        : mode === "fade"
          ? { duration: 0.15, ease: EASE_OUT }
          : undefined,
  }),
};

export function SlidingPanel({
  activeKey,
  children,
  className,
  direction = 1,
  motionEnabled = true,
  panelClassName,
  transition = DEFAULT_TRANSITION,
  ...props
}: SlidingPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const mode: PanelMotionMode = !motionEnabled ? "instant" : shouldReduceMotion ? "fade" : "slide";
  const motionState: PanelMotionState = { direction, mode };

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      data-slot="sliding-panel"
      {...props}
    >
      <AnimatePresence custom={motionState} initial={false} mode="sync">
        <motion.div
          animate="animate"
          className={cn("absolute inset-0 h-full w-full", panelClassName)}
          custom={motionState}
          exit="exit"
          initial="initial"
          key={activeKey}
          transition={transition}
          variants={panelVariants}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SlidingPanel;

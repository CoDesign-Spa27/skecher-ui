"use client";

import { useReducedMotion, type Variants } from "motion/react";

import { contentEntrance, reducedEntrance } from "./config";

/** Inside the 30-80ms band where a stagger reads as sequence, not as lag. */
const DEFAULT_STAGGER = 0.09;
/** Mirrors `reducedContentSequence` in config.ts. */
const REDUCED_STAGGER = 0.04;
 
const ITEM_TRANSITION = { duration: 0.58, ease: [0.23, 1, 0.32, 1] } as const;

 
export function useReveal({
  blur = true,
  delay = 0,
  stagger = DEFAULT_STAGGER,
}: {
  blur?: boolean;
  delay?: number;
  stagger?: number;
} = {}) {
  const reduceMotion = useReducedMotion();

  const sequence: Variants = reduceMotion
    ? { hidden: {}, visible: { transition: { staggerChildren: REDUCED_STAGGER } } }
    : { hidden: {}, visible: { transition: { delayChildren: delay, staggerChildren: stagger } } };

  if (reduceMotion) return { item: reducedEntrance, sequence };
  if (blur) return { item: contentEntrance, sequence };

  // Same motion, minus the filter.
  return {
    item: {
      hidden: { opacity: 0, y: -14, },
      visible: { opacity: 1, transition: ITEM_TRANSITION, y: 0 },
    } satisfies Variants,
    sequence,
  };
}

/** Above the fold: nothing to wait for, the page has already arrived. */
export const ON_MOUNT = { animate: "visible", initial: "hidden" } as const;

/** Below it: hold the reveal until the section is actually being looked at. */
export const IN_VIEW = {
  initial: "hidden",
  viewport: { amount: 0.5, once: true },
  whileInView: "visible",
} as const;

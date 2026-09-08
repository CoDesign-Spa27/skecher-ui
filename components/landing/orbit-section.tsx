"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import { HeroOrbit } from "./assets/hero-orbit";
import { IN_VIEW, useReveal } from "./reveal";

/** Trails the raw scroll value just enough to feel weighted rather than pinned. */
const SCROLL_SPRING = { damping: 34, mass: 0.45, stiffness: 110 } as const;

/** Carries the in-view state down to the orbit's parts; holds no motion itself. */
const ORBIT_GROUP: Variants = { hidden: {}, visible: {} };

export function OrbitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // 0 as the section's top reaches the viewport bottom, 1 as its bottom leaves
  // the top: the whole pass through the viewport, not just the entrance.
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
    target: sectionRef,
  });
  const progress = useSpring(scrollYProgress, SCROLL_SPRING);

  // Flattened rather than switched off at the style layer: useReducedMotion is
  // null through SSR, so a conditional style would paint the offset and then
  // snap it away on hydration for exactly the people who asked for less motion.
  const parallax = reduceMotion ? 0 : 1;

  // The orbit travels further than the glow behind it, so the two read as
  // separate depths rather than one flat plate sliding past.
  const orbitShift = useTransform(progress, [0, 1], [72 * parallax, -72 * parallax]);
  const orbitScale = useTransform(
    progress,
    [0, 0.5, 1],
    reduceMotion ? [1, 1, 1] : [0.97, 1.03, 1.06],
  );
  const orbitTransform = useMotionTemplate`translate3d(0, ${orbitShift}px, 0) scale(${orbitScale})`;

  const glowShift = useTransform(progress, [0, 1], [40 * parallax, -40 * parallax]);
  const glowTransform = useMotionTemplate`translate3d(0, ${glowShift}px, 0)`;

  // Shares the site-wide drop-from-above so the copy here reads the same as
  // every other section; the orbit's own parts keep their upward pop.
  const { item: entrance, sequence } = useReveal();

  return (
    <section
      aria-labelledby="orbit-title"
      className={cn(
        "relative isolate overflow-hidden px-[clamp(12px,1.48vw,19px)] text-white",
        "py-[clamp(72px,12vh,148px)]",
        // Black at both seams so the neighbouring sections meet it invisibly,
        // lifting to a soft grey through the middle where the orbit sits.
        // "[background:linear-gradient(180deg,#000_0%,#0d0d0d_16%,#1e1e1e_50%,#0d0d0d_84%,#000_100%)]",
      )}
      ref={sectionRef}
    >
      {/* <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[32%] -z-10 h-[74%] [background:radial-gradient(65%_64%_at_50%_38%,rgb(250_250_255/30%),transparent_79%)]"
        style={{ borderRadius: "50%", transform: glowTransform }}
      />
 */}

      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center text-center">
        <motion.div className="flex flex-col items-center" variants={sequence} {...IN_VIEW}>
          <motion.h2
            className="text-balance font-instrument-serif text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02] font-normal tracking-[-0.02em]"
            id="orbit-title"
            variants={entrance}
          >
            Nothing here just sits there.
          </motion.h2>

          {/* <motion.p
            className="mt-4 max-w-2xl text-pretty font-urbanist text-[15px] leading-relaxed text-white/55 sm:text-base"
            variants={entrance}
          >
            The mark reacts to your pointer. So does everything in the registry &mdash; motion is
            part of the component, not a layer added on top of it.
          </motion.p> */}
        </motion.div>

        {/* Triggered on its own entry, not the copy's: the parts land in
            sequence, and a shared trigger would spend that sequence off-screen
            while the orbit is still below the fold. */}
        <motion.div
          className="mt-[clamp(52px,8vw,104px)] w-[min(44vw,403px)] max-sm:w-[min(72vw,330px)]"
          initial="hidden"
          style={{ transform: orbitTransform }}
          variants={ORBIT_GROUP}
          viewport={{ amount: 0.45, once: true }}
          whileInView="visible"
        >
          <HeroOrbit className="w-full" />
        </motion.div>
      </div>
    </section>
  );
}

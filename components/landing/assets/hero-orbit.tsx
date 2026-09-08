"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { MorphStackMark } from "@/components/docs/content/morph-stack-preview";
import type { MorphStackMotion } from "@/components/ui-components/morph-stack";
import { cn } from "@/lib/utils";

const HERO_MARK_MOTION = {
  back: { active: { x: 0, y: 0, z: -32 } },
  front: { active: { x: 0, y: 0, z: 30 } },
  middle: { active: { x: 0, y: 0, z: 0 } },
  stack: { scale: 1.03 },
} satisfies MorphStackMotion;
 
const ORBIT_STAGE: Variants = { hidden: {}, visible: {} };

 
const BEAT = 0.2;

const PLACE: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", transform: "translate3d(0, 52px, 0) scale(0.9)" },
  visible: (beat: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transform: "translate3d(0, 0px, 0) scale(1)",
    transition: { bounce: 0.3, delay: beat * BEAT, duration: 0.62, type: "spring" },
  }),
};

const PLACE_REDUCED: Variants = {
  hidden: { opacity: 0 },
  visible: (beat: number) => ({
    opacity: 1,
    transition: { delay: beat * 0.05, duration: 0.2, ease: "easeOut" },
  }),
};

const LAYER_CLASS =
  "pointer-events-none absolute top-0 left-1/2 h-[75.6%] w-[77.17%] -translate-x-1/2";
const VIEW_BOX = "0 0 311 127";

export function HeroOrbit({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const place = reduceMotion ? PLACE_REDUCED : PLACE;

  return (
    <motion.div
      aria-hidden="true"
      className={cn("relative aspect-[403/168]", className)}
      variants={ORBIT_STAGE}
    >
 
      <div className={LAYER_CLASS}>
        <motion.svg
          className="block size-full"
          custom={0}
          fill="none"
          variants={place}
          viewBox={VIEW_BOX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="109.114"
            cy="109.114"
            r="109.114"
            stroke="white"
            strokeDasharray="6 8"
            strokeOpacity="0.5"
            strokeWidth="3"
            transform="matrix(0.923349 -0.383963 0.923349 0.383963 -46 66.791)"
          />
        </motion.svg>
      </div>

      <div className={LAYER_CLASS}>
        <motion.svg
          className="block size-full"
          custom={2}
          fill="none"
          variants={place}
          viewBox={VIEW_BOX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M264.751 70.0898C264.751 74.9413 262.173 79.8593 256.875 84.5459C251.576 89.2329 243.594 93.6511 232.902 97.4863C211.519 105.156 183.461 109 155.38 109C127.299 109 99.2419 105.156 77.8589 97.4863C67.1664 93.651 59.1851 89.2329 53.8862 84.5459C48.5878 79.8593 46.0103 74.9413 46.0103 70.0898V61.1445C47.2611 64.5098 49.6787 67.8024 53.2241 70.9385C58.6519 75.7395 66.7611 80.2115 77.522 84.0713C99.0458 91.7917 127.225 95.6435 155.38 95.6436C183.536 95.6436 211.716 91.7917 233.24 84.0713C244.001 80.2115 252.11 75.7395 257.538 70.9385C261.084 67.8016 263.501 64.5077 264.751 61.1416V70.0898Z"
            fill="#E9E9E9"
            stroke="white"
          />
        </motion.svg>
      </div>

      <div className={LAYER_CLASS}>
        <motion.svg
          className="block size-full"
          custom={1}
          fill="none"
          variants={place}
          viewBox={VIEW_BOX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="82.5366"
            cy="82.5366"
            r="82.0366"
            stroke="white"
            transform="matrix(0.941278 -0.337632 0.941278 0.337632 0 55.7344)"
          />
        </motion.svg>
      </div>

      {/* Positioning stays on the wrapper so the mark's own transform is free
          for the animation to drive. */}
      <div className="absolute top-[-17.86%] left-1/2 -translate-x-1/2">
        <motion.div custom={3} variants={place}>
          <MorphStackMark
            className="size-[clamp(65px,7.38vw,95px)] cursor-default"
            interactive={true}
            motion={HERO_MARK_MOTION}
            plateClassName="size-[clamp(65px,7.38vw,95px)]"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

import type { Variants } from "motion/react";

import { publicEnv } from "@/lib/public-env";

const HERO_VIDEO_BASE_URL = `${publicEnv.assetUrl}/skecher-components/edit-video-projects`;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type HeroVideo = {
  id: string;
  index: number;
};

function createVideoRow(row: "top" | "bottom", indexes: readonly number[]): HeroVideo[] {
  return indexes.map((index) => ({
    id: `${row}-${index}`,
    index,
  }));
}

export const TOP_ROW_VIDEOS = createVideoRow("top", [8, 7, 6, 3]);
export const BOTTOM_ROW_VIDEOS = createVideoRow("bottom", [2, 12, 11, 1]);

export function getHeroVideoUrl(index: number) {
  return `${HERO_VIDEO_BASE_URL}/skecher${index}.webm`;
}

export const heroSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.46,
    },
  },
};

export const reducedHeroSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const contentSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const reducedContentSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const headingSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const contentEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: -14,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.58,
      ease: EASE_OUT,
    },
  },
};

export const railEntrance: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.78,
      ease: EASE_OUT,
    },
  },
};

export const wireEntrance: Variants = {
  hidden: {
    clipPath: "inset(0 48% 38% 0)",
    opacity: 0,
    scale: 0.985,
    x: -24,
    y: -16,
  },
  visible: {
    clipPath: "inset(0 0% 0% 0)",
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      delay: 0.18,
      duration: 0.82,
      ease: EASE_OUT,
    },
  },
};

export const reducedWireEntrance: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.08,
      duration: 0.18,
      ease: "easeOut",
    },
  },
};

export const reducedEntrance: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

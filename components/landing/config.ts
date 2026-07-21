import type { Variants } from "motion/react";

const HERO_VIDEO_BASE_URL = "https://assets.skecher-ui.com/skecher-components/edit-video-projects";
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type HeroVideo = {
  id: string;
  index: number;
};

function createVideoRow(row: "top" | "bottom", start: number, end: number): HeroVideo[] {
  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const index = start + offset;

    return {
      id: `${row}-${index}`,
      index,
    };
  });
}

export const TOP_ROW_VIDEOS = createVideoRow("top", 1, 6);
export const BOTTOM_ROW_VIDEOS = createVideoRow("bottom", 7, 12);

export function getHeroVideoUrl(index: number) {
  return `${HERO_VIDEO_BASE_URL}/skecher${index}.mp4`;
}

export function moveLastVideoToFront(videos: HeroVideo[]) {
  const last = videos.at(-1);
  return last ? [last, ...videos.slice(0, -1)] : videos;
}

export function moveFirstVideoToEnd(videos: HeroVideo[]) {
  const [first, ...rest] = videos;
  return first ? [...rest, first] : videos;
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

export const reducedEntrance: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

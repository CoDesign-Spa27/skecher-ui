"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import styles from "./hero.module.css";

const TOP_ROW_VIDEOS = [1, 2, 3, 4, 5, 6].map((index) => ({
  id: `top-${index}`,
  index,
}));
const BOTTOM_ROW_VIDEOS = [7, 8, 9, 10, 11, 12].map((index) => ({
  id: `bottom-${index}`,
  index,
}));
const VIDEO_VERSION = "2026-07";
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const heroSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.46,
    },
  },
};

const reducedHeroSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const contentSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const reducedContentSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const headingSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const contentEntrance: Variants = {
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

const railEntrance: Variants = {
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

const reducedEntrance: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

function BrandMark({ variants }: { variants: Variants }) {
  return (
    <motion.span className={styles.brandMark} variants={variants} aria-hidden="true">
      <Image src="/icon/ligh-full-logo.svg" alt="" width={422} height={91} priority />
    </motion.span>
  );
}

function AmbientVideo({ index, paused }: { index: number; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = () => {
      if (paused || document.hidden) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // Muted inline video is normally allowed; the static frame is the fallback.
      });
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);

    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [paused]);

  return (
    <video
      ref={videoRef}
      className="block size-full object-cover [transform:scale(1.015)_translateZ(0)]"
      src={`/api/component-video/${index}?v=${VIDEO_VERSION}`}
      autoPlay={!paused}
      muted
      loop
      playsInline
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

function VideoCard({ index, paused }: { index: number; paused: boolean }) {
  return (
    <div className="aspect-[408/245] w-[var(--card-width)] flex-none overflow-hidden rounded-[min(21px,1.1vw)] border border-white/10 bg-[#262626] p-[3px] shadow-[0_14px_36px_rgb(0_0_0/20%)]">
      <div className="relative size-full overflow-hidden rounded-[min(17px,0.9vw)] bg-[#171717]">
        <AmbientVideo index={index} paused={paused} />
        <span className={styles.videoShade} aria-hidden="true" />
      </div>
    </div>
  );
}

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [topVideos, setTopVideos] = useState(TOP_ROW_VIDEOS);
  const [bottomVideos, setBottomVideos] = useState(BOTTOM_ROW_VIDEOS);
  const isPaused = Boolean(shouldReduceMotion);
  const entrance = shouldReduceMotion ? reducedEntrance : contentEntrance;

  const rotateTopRow = () => {
    setTopVideos((current) => {
      const last = current.at(-1);
      return last ? [last, ...current.slice(0, -1)] : current;
    });
  };

  const rotateBottomRow = () => {
    setBottomVideos((current) => {
      const [first, ...rest] = current;
      return first ? [...rest, first] : current;
    });
  };

  return (
    <motion.main
      className="relative isolate min-h-svh overflow-hidden bg-[#171717] text-white"
      variants={shouldReduceMotion ? reducedHeroSequence : heroSequence}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.fadedBackground} aria-hidden="true" />

      <motion.section
        className={styles.heroContent}
        aria-labelledby="hero-title"
        variants={shouldReduceMotion ? reducedContentSequence : contentSequence}
      >
        <motion.div
          className={`flex items-center justify-center gap-2 md:gap-[clamp(10px,0.85vw,16px)] ${styles.heroHeadingRow}`}
          variants={headingSequence}
        >
          <BrandMark variants={entrance} />
          <motion.h1
            id="hero-title"
            className="text-balance whitespace-nowrap font-instrument-serif text-[2.85rem] leading-[0.98] font-normal tracking-[-0.035em] min-[421px]:text-[clamp(3rem,14vw,4rem)] md:text-[clamp(4rem,6.67vw,8rem)]"
            variants={entrance}
          >
            Skech the <span className="text-highlight">art</span>
          </motion.h1>
        </motion.div>
        <motion.p
          className={`mt-1.5 max-w-full text-balance text-center font-urbanist text-[clamp(1.65rem,8vw,2.25rem)] leading-[1.02] font-normal tracking-[-0.035em] md:mt-0 md:text-[clamp(2rem,3.34vw,3rem)] md:leading-[0.98] ${styles.heroSubtitle}`}
          variants={entrance}
        >
          Components that contains life.
        </motion.p>

        <motion.div
          className={`mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-8 ${styles.heroActions}`}
          variants={entrance}
        >
          <Button asChild variant="default" className="min-h-11 cursor-pointer px-5 lg:min-h-10">
            <Link href="/docs">Browse Components</Link>
          </Button>

          <Button
            asChild
            variant="secondary"
            disabled
            tooltip="soon"
            className="min-h-11 cursor-pointer px-5 lg:min-h-10"
          >
            <Link
              href="https://github.com/sketch-the-art/sketch-the-art"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      <motion.div
        className="absolute inset-0 -z-30"
        variants={shouldReduceMotion ? reducedEntrance : railEntrance}
        aria-hidden="true"
      >
        <div className={styles.rail}>
          <div
            className={`flex w-max gap-[var(--rail-gap)] ${styles.marqueeRow} ${styles.marqueeUp} ${isPaused ? styles.marqueePaused : ""}`}
            onAnimationIteration={rotateTopRow}
          >
            {topVideos.map((video) => (
              <VideoCard key={video.id} index={video.index} paused={isPaused} />
            ))}
          </div>

          <div
            className={`flex w-max gap-[var(--rail-gap)] ${styles.marqueeRow} ${styles.marqueeDown} ${isPaused ? styles.marqueePaused : ""}`}
            onAnimationIteration={rotateBottomRow}
          >
            {bottomVideos.map((video) => (
              <VideoCard key={video.id} index={video.index} paused={isPaused} />
            ))}
          </div>
        </div>
      </motion.div>

      <div
        className={`pointer-events-none absolute hidden opacity-10 mix-blend-difference lg:block ${styles.edgeTextureTop}`}
        aria-hidden="true"
      >
        <Image
          src="/assets/images/hero-code-texture.png"
          alt=""
          width={866}
          height={984}
          className="max-w-none"
        />
      </div>

      <div
        className={`pointer-events-none absolute hidden opacity-10 mix-blend-difference lg:block ${styles.edgeTextureBottom}`}
        aria-hidden="true"
      >
        <Image
          src="/assets/images/hero-code-texture.png"
          alt=""
          width={866}
          height={984}
          className="max-w-none"
        />
      </div>
    </motion.main>
  );
}

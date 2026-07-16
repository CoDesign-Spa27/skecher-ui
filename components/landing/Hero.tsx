"use client";

import { useReducedMotion } from "motion/react";
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

function BrandMark() {
  return (
    <span className={`${styles.brandMark} ${styles.brandEnter}`} aria-hidden="true">
      <Image src="/icon/ligh-full-logo.svg" alt="" width={422} height={91} priority />
    </span>
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
    <main className="relative isolate min-h-svh overflow-hidden bg-[#171717] text-white">
      <div className="absolute inset-0 -z-30" aria-hidden="true">
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
      </div>

      <div className={styles.fadedBackground} aria-hidden="true" />

      <section
        className="absolute left-1/2 top-[61%] w-[calc(100%-40px)] -translate-x-1/2 -translate-y-1/2 md:top-[45%] md:w-[min(47vw,860px)] md:translate-x-0"
        aria-labelledby="hero-title"
      >
        <div className="flex items-center justify-center gap-2 md:justify-start md:gap-[clamp(10px,0.85vw,16px)]">
          <BrandMark />
          <h1
            id="hero-title"
            className={`text-balance whitespace-nowrap font-instrument-serif text-[2.85rem] leading-[0.98] font-normal tracking-[-0.035em] min-[421px]:text-[clamp(3rem,14vw,4rem)] md:text-[clamp(4rem,6.67vw,8rem)] ${styles.titleEnter}`}
          >
            Skech the <span className="text-highlight">art</span>
          </h1>
        </div>
        <p
          className={`mt-1.5 max-w-full text-balance text-center font-urbanist text-[clamp(1.65rem,8vw,2.25rem)] leading-[1.02] font-normal tracking-[-0.035em] md:mt-0 md:max-w-[min(42vw,797px)] md:text-left md:text-[clamp(2rem,3.34vw,3rem)] md:leading-[0.98] ${styles.subtitleEnter}`}
        >
          Components that contains life.
        </p>

        <div
          className={`mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-8 md:justify-start ${styles.actionsEnter}`}
        >
          <Button asChild variant="default" className="cursor-pointer">
            <Link href="/docs">Browse Components</Link>
          </Button>

          <Button asChild variant="secondary" disabled tooltip="soon" className="cursor-pointer">
            <Link
              href="https://github.com/sketch-the-art/sketch-the-art"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
          </Button>
        </div>
      </section>

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
    </main>
  );
}

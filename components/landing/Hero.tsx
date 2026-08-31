"use client";

import { StarIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { IconGithub } from "nucleo-social-media";
import { useEffect, useRef, useState } from "react";

import { MorphStackMark } from "@/components/docs/content/morph-stack-preview";
import { Button } from "@/components/ui/button";
import type { MorphStackMotion } from "@/components/ui-components/morph-stack";
import { cn } from "@/lib/utils";

import { CurvedWires } from "./assets/curved-wires";
import {
  BOTTOM_ROW_VIDEOS,
  contentEntrance,
  contentSequence,
  getHeroVideoUrl,
  headingSequence,
  heroSequence,
  railEntrance,
  reducedContentSequence,
  reducedEntrance,
  reducedHeroSequence,
  reducedWireEntrance,
  TOP_ROW_VIDEOS,
  wireEntrance,
} from "./config";

const HERO_MARK_MOTION = {
  back: { active: { z: -22 } },
  front: { active: { x: -4, y: 6, z: 20 } },
  stack: { scale: 1.03 },
} satisfies MorphStackMotion;

function BrandMark({ variants }: { variants: Variants }) {
  return (
    <motion.span
      className="relative block size-[clamp(40px,12vw,50px)] flex-[0_0_clamp(40px,12vw,50px)] md:size-[clamp(46px,4.43vw,85px)] md:flex-[0_0_clamp(46px,4.43vw,85px)]"
      variants={variants}
      aria-hidden="true"
    >
      <MorphStackMark
        className="size-[clamp(40px,12vw,50px)] cursor-default md:size-[clamp(46px,4.43vw,85px)]"
        expanded={true}
        motion={HERO_MARK_MOTION}
        plateClassName="size-[clamp(40px,12vw,50px)] md:size-[clamp(46px,4.43vw,85px)]"
      />
    </motion.span>
  );
}

function AmbientVideo({ index, paused }: { index: number; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = async () => {
      if (paused || document.hidden) {
        video.pause();
        return;
      }

      try {
        await video.play();
      } catch {
        // The background remains visible if autoplay is blocked.
      }
    };

    void syncPlayback();

    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [paused]);

  return (
    <div className="relative size-full overflow-hidden bg-[#171717]">
      <video
        ref={videoRef}
        className={cn(
          "block size-full object-cover",
          "[transform:scale(1.015)_translateZ(0)]",
          "transition-opacity duration-500",
          isReady && !hasError ? "opacity-100" : "opacity-0",
        )}
        src={getHeroVideoUrl(index)}
        autoPlay={!paused}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        onCanPlay={() => setIsReady(true)}
        onLoadedData={() => setIsReady(true)}
        onError={(event) => {
          setHasError(true);

          console.error("Hero video failed", {
            index,
            mediaError: event.currentTarget.error,
            src: event.currentTarget.currentSrc,
          });
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

function VideoCard({ index, paused }: { index: number; paused: boolean }) {
  return (
    <div className="aspect-[408/245] w-[220px] flex-none overflow-hidden rounded-[min(21px,1.1vw)] border border-white/10 bg-[#262626] p-[3px] shadow-[0_14px_36px_rgb(0_0_0/20%)] md:w-[min(21.25vw,408px)] [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:w-[min(28vw,240px)]">
      <div className="relative size-full overflow-hidden rounded-[min(17px,0.9vw)] bg-[#171717]">
        <AmbientVideo index={index} paused={paused} />
        <span
          className="absolute inset-0 [background:linear-gradient(180deg,rgb(10_10_10/12%),rgb(10_10_10/34%)),rgb(23_23_23/18%)] shadow-[inset_0_0_0_1px_rgb(0_0_0/18%)]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function VideoSet({
  copy,
  paused,
  videos,
}: {
  copy: "primary" | "duplicate";
  paused: boolean;
  videos: typeof TOP_ROW_VIDEOS;
}) {
  return (
    <div className="flex flex-none gap-[max(4px,0.3vw)] pr-[max(4px,0.3vw)]">
      {videos.map((video) => (
        <VideoCard key={`${video.id}-${copy}`} index={video.index} paused={paused} />
      ))}
    </div>
  );
}

function GitHubButton({ starCount }: { starCount: number }) {
  return (
    <Link
      href="https://github.com/CoDesign-Spa27/skecher-ui"
      target="_blank"
      rel="noreferrer"
      aria-label={`View Skecher UI on GitHub, ${starCount} stars`}
      className={cn(
        "group relative isolate inline-flex min-h-11 cursor-pointer items-stretch overflow-hidden rounded-lg bg-gradient-to-t from-[#0f0f0f] to-[#404040] p-px font-urbanist text-sm font-medium text-white shadow-[0_0_0_1px_#383838] outline-none lg:min-h-10",
        "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] active:duration-100",
        "focus-visible:ring-[3px] focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
      )}
    >
      <span className="flex items-center gap-2 rounded-l-[7px] bg-[#171717] px-3.5">
        <IconGithub
          aria-hidden="true"
          className={cn(
            "size-[18px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-115",
            "motion-reduce:transform-none motion-reduce:transition-none",
          )}
        />
        <span>GitHub</span>
      </span>

      <span className="flex min-w-[3.75rem] items-center justify-center gap-1.5 rounded-r-[7px] bg-[#242424] px-3 tabular-nums">
        <span className="relative size-4" aria-hidden="true">
          <StarIcon
            className={cn(
              "absolute inset-0 size-4 text-white/65 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "[@media(hover:hover)_and_(pointer:fine)]:group-hover:-rotate-12 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-75 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0",
              "motion-reduce:transform-none motion-reduce:transition-opacity",
            )}
          />
          <StarIcon
            className={cn(
              "absolute inset-0 size-4 fill-[#f7d774] text-[#f7d774] opacity-0 [transform:rotate(12deg)_scale(0.75)] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:[transform:rotate(0)_scale(1)]",
              "motion-reduce:transform-none motion-reduce:transition-opacity",
            )}
          />
        </span>
        <span>{starCount}</span>
      </span>
    </Link>
  );
}

export function Hero({ starCount }: { starCount: number }) {
  const shouldReduceMotion = useReducedMotion();
  const isPaused = Boolean(shouldReduceMotion);
  const entrance = shouldReduceMotion ? reducedEntrance : contentEntrance;

  return (
    <motion.div
      className="relative isolate min-h-svh overflow-hidden bg-[#171717] text-white"
      variants={shouldReduceMotion ? reducedHeroSequence : heroSequence}
      initial="hidden"
      animate="visible"
    >
      <div
        className="landing-hero-fade pointer-events-none absolute inset-0 -z-20"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[60px] -left-[110px] z-50 w-[clamp(760px,100vw,1440px)] opacity-[0.36] md:top-[clamp(-120px,-14vw,-120px)] md:left-[clamp(-30px,-4vw,-24px)] md:opacity-[0.52]"
      >
        <motion.div
          animate="visible"
          className="origin-top-left transform-gpu"
          initial="hidden"
          variants={shouldReduceMotion ? reducedWireEntrance : wireEntrance}
        >
          <CurvedWires />
        </motion.div>
      </div>

      <motion.section
        className="absolute top-[61%] left-1/2 z-10 w-[min(calc(100%_-_40px_-_env(safe-area-inset-left)_-_env(safe-area-inset-right)),680px)] -translate-x-1/2 -translate-y-1/2 lg:top-[45%] lg:w-[min(47vw,860px)] lg:max-w-[calc(50%_-_max(20px,env(safe-area-inset-right)))] lg:translate-x-0 [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:top-[58%] [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:w-[min(calc(100%_-_64px_-_env(safe-area-inset-left)_-_env(safe-area-inset-right)),720px)] [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:top-[45%] [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:w-[min(47vw,860px)] [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:max-w-[calc(50%_-_max(20px,env(safe-area-inset-right)))] [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:translate-x-0"
        aria-labelledby="hero-title"
        variants={shouldReduceMotion ? reducedContentSequence : contentSequence}
      >
        <motion.div
          className="flex items-center gap-2 md:gap-[clamp(10px,0.85vw,16px)] justify-start [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:justify-start"
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
          className="mx-auto mt-3 max-w-full text-balance font-urbanist text-[clamp(1rem,6vw,1.5rem)] leading-[1.02] font-normal tracking-[-0.035em] md:mt-0 md:text-[clamp(2rem,3.34vw,3rem)] md:leading-[0.98] lg:mx-0 lg:max-w-[min(42vw,797px)] lg:text-left [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:mx-0 [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:max-w-[min(42vw,797px)] [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:text-left"
          variants={entrance}
        >
          Components that contain life.
        </motion.p>

        <motion.div
          className="mt-6 flex flex-wrap items-center justify-start gap-2 md:mt-8 lg:justify-start [@media(min-width:768px)_and_(max-width:1023px)_and_(max-height:699px)]:justify-start"
          variants={entrance}
        >
          <Button asChild variant="default" className="min-h-11 cursor-pointer px-5 lg:min-h-10">
            <Link href="/docs">Browse Components</Link>
          </Button>

          <GitHubButton starCount={starCount} />
        </motion.div>
      </motion.section>

      <motion.div
        className="absolute inset-0 -z-30"
        variants={shouldReduceMotion ? reducedEntrance : railEntrance}
        aria-hidden="true"
      >
        <div className="absolute -top-[4vh] -left-[485px] flex w-max origin-center -rotate-[29deg] transform-gpu flex-col gap-[max(4px,0.3vw)] opacity-[0.72] will-change-transform md:top-[6.7vh] md:-left-[17vw] md:opacity-100 [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:-top-[2vh] [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:-left-[22vw] [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:opacity-[0.66]">
          <div
            className={cn(
              "flex w-max animate-[landing-marquee-up_72s_linear_infinite] backface-hidden will-change-transform motion-reduce:animate-none",
              isPaused && "[animation-play-state:paused]",
            )}
          >
            <VideoSet copy="primary" videos={TOP_ROW_VIDEOS} paused={isPaused} />
            <VideoSet copy="duplicate" videos={TOP_ROW_VIDEOS} paused={isPaused} />
          </div>

          <div className="-translate-x-[114.4px] md:translate-x-[calc(min(21.25vw,408px)*-0.52)] [@media(min-width:768px)_and_(max-width:1023px)_and_(min-height:700px)]:translate-x-[calc(min(28vw,240px)*-0.52)]">
            <div
              className={cn(
                "flex w-max animate-[landing-marquee-down_72s_linear_infinite] backface-hidden will-change-transform motion-reduce:animate-none",
                isPaused && "[animation-play-state:paused]",
              )}
            >
              <VideoSet copy="primary" videos={BOTTOM_ROW_VIDEOS} paused={isPaused} />
              <VideoSet copy="duplicate" videos={BOTTOM_ROW_VIDEOS} paused={isPaused} />
            </div>
          </div>
        </div>
      </motion.div>

      <div
        className="pointer-events-none absolute top-[10.185%] right-0 hidden h-[44.722%] w-[22.292%] overflow-hidden bg-[url('/assets/images/hero-code-texture.png')] bg-no-repeat opacity-10 mix-blend-difference [background-position:left_-0.62%] [background-size:100%_100.69%] lg:block"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute top-[54.907%] right-0 hidden h-[30.278%] w-[17.188%] overflow-hidden bg-[url('/assets/images/hero-code-texture.png')] bg-no-repeat opacity-10 mix-blend-difference [background-position:left_-0.92%] [background-size:129.7%_148.72%] lg:block"
        aria-hidden="true"
      />
    </motion.div>
  );
}

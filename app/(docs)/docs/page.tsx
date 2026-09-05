"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { usePrefersFineHover } from "@/hooks/use-prefers-fine-hovers";
import { COMPONENT_DOCS } from "@/lib/docs-content";
import { publicEnv } from "@/lib/public-env";

const COVER_BASE_URL = `${publicEnv.assetUrl}/skecher-components/covers`;
const VIDEO_BASE_URL = `${publicEnv.assetUrl}/skecher-components/edit-video-projects`;

const COMPONENT_VIDEOS = COMPONENT_DOCS.map((component) => ({
  ...component,
  coverUrl: `${COVER_BASE_URL}/skecher${component.sketchId}.png`,
  videoUrl: `${VIDEO_BASE_URL}/skecher${component.sketchId}.webm`,
}));

type ComponentVideo = (typeof COMPONENT_VIDEOS)[number];

const PILL_TRANSITION = {
  type: "spring",
  duration: 0.3,
  bounce: 0,
} as const;

// Shared transition for title enter/exit
const TITLE_TRANSITION = {
  duration: 0.22,
  ease: "easeOut",
} as const;

const CARD_REVEAL_EASE = [0.23, 1, 0.32, 1] as const;

function RevealingVideoCard({ component, index }: { component: ComponentVideo; index: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : 16,
        filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, margin: "0px 0px -100px" }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.42,
        delay: shouldReduceMotion ? 0 : (index % 3) * 0.055,
        ease: CARD_REVEAL_EASE,
      }}
    >
      <VideoCard component={component} />
    </motion.div>
  );
}

function VideoCard({ component }: { component: ComponentVideo }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const prefersFineHover = usePrefersFineHover();
  const [shouldMountVideo, setShouldMountVideo] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);

  // Only show the title on hover (isPreviewActive) for fine hover devices
  // Otherwise (touch/focus), always show the title, but *do not* play video unless it's fineHover+hovering
  const showTitle = prefersFineHover ? isPreviewActive || isFocused : true;
  const pillLayoutId = `component-video-pill-${component.slug}`;
  const pillTransition = shouldReduceMotion ? { duration: 0.01 } : PILL_TRANSITION;

  useEffect(() => {
    // Only play video if we are on a fine hover device and user is currently hovering/interacting
    if (!prefersFineHover || !isPreviewActive || !shouldMountVideo) return;

    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [isPreviewActive, shouldMountVideo, prefersFineHover]);

  // Do not reset currentTime; pausing is enough for previews
  const stopVideo = () => {
    const video = videoRef.current;

    if (video) {
      video.pause();
      // No longer resetting currentTime for smoother preview interaction.
    }

    setIsPlaying(false);
  };

  // Only activate preview (video) on fine hover devices.
  const activatePreview = () => {
    setShouldMountVideo(true);
    setIsPreviewActive(true);
  };

  const deactivatePreview = () => {
    setIsPreviewActive(false);
    stopVideo();
  };

  // Pointer events for hover -- fine hover only
  const handlePointerEnter = () => {
    if (!prefersFineHover) return;
    activatePreview();
  };

  const handlePointerLeave = () => {
    if (!prefersFineHover) return;
    deactivatePreview();
  };

  // Keyboard focus should only show the title, not video
  const handleFocus = () => {
    setIsFocused(true);
    // On focus, don't start video. We *could* optionally show a static image or do nothing.
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (isPreviewActive) {
      // If you tab away and were previewing video due to hover, also turn it off.
      deactivatePreview();
    }
  };

  return (
    <Link
      href={`/docs/${component.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <article className="component-preview-css overflow-hidden rounded-xl bg-card p-1 text-card-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <Image
            src={component.coverUrl}
            alt={`${component.title} component preview`}
            fill
            loading="lazy"
            decoding="async"
            unoptimized
            sizes="(min-width: 1280px) 360px, (min-width: 640px) calc(50vw - 48px), calc(100vw - 48px)"
            className={[
              "rounded-xl object-cover transition-opacity duration-200",
              isPlaying ? "opacity-0" : "opacity-100",
            ].join(" ")}
          />

          {shouldMountVideo && prefersFineHover ? (
            <video
              ref={videoRef}
              src={component.videoUrl}
              className={[
                "absolute inset-0 h-full w-full rounded-xl object-cover transition-opacity duration-200",
                isPlaying ? "opacity-100" : "opacity-0",
              ].join(" ")}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${component.title} component video`}
              tabIndex={-1}
              onPlaying={() => setIsPlaying(true)}
              onError={() => {
                setIsPlaying(false);
              }}
            />
          ) : null}

          <LayoutGroup id={`component-video-card-${component.slug}`}>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {showTitle ? (
                  <motion.div
                    key="title-pill"
                    layoutId={pillLayoutId}
                    transition={pillTransition}
                    style={{ borderRadius: 999 }}
                    className=" relative max-w-[calc(100%_-_2rem)] overflow-hidden bg-[#171717] px-4 py-1.5 backdrop-blur-sm border border-neutral-700"
                  >
                    <motion.p
                      key="title"
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : 12,
                        filter: shouldReduceMotion ? "blur(0px)" : "blur(10px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : 12,
                        filter: shouldReduceMotion ? "blur(0px)" : "blur(10px)",
                      }}
                      transition={TITLE_TRANSITION}
                      style={{
                        willChange: "opacity, transform, filter",
                      }}
                      className="relative z-20 truncate text-sm font-medium text-white"
                    >
                      {component.title}
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle-pill"
                    layoutId={pillLayoutId}
                    transition={pillTransition}
                    style={{ borderRadius: 999 }}
                    className=" h-2.5 w-16 bg-[#171717] backdrop-blur-sm border border-neutral-700"
                  />
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>

          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
        </div>
      </article>
    </Link>
  );
}

export default function Page() {
  return (
    <main className="page mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-8 sm:px-8 lg:px-10">
      <section id="components" aria-labelledby="components-title" className="py-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1
              id="components-title"
              className="mt-3 font-raleway text-2xl font-medium tracking-normal text-foreground"
            >
              Skecher made with love, for the love of the game.
            </h1>
          </div>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
          {COMPONENT_VIDEOS.map((component, index) => (
            <RevealingVideoCard key={component.slug} component={component} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

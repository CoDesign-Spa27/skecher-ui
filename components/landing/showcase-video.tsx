"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { getHeroVideoUrl } from "./config";
 
const PRELOAD_MARGIN = "400px";
 
const PLAYBACK_THRESHOLD = 0.15;

 
export function ShowcaseVideo({ className, index }: { className?: string; index: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [source, setSource] = React.useState<string>();
  const [isReady, setIsReady] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || source) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setSource(getHeroVideoUrl(index));
        observer.disconnect();
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, [index, source]);

  React.useEffect(() => {
    const video = videoRef.current;
    // Also re-runs on error, so the observer lets go of the unmounted element.
    if (!video || !source || hasError) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isOnScreen = false;

    // Playback is driven here rather than by the autoplay attribute, so a
    // reduced-motion viewer gets a held first frame instead of a loop.
    const syncPlayback = () => {
      if (!isOnScreen || document.hidden || reducedMotion.matches) {
        video.pause();
        return;
      }
      // Autoplay can still be refused; the held frame is a fine resting state.
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isOnScreen = entries[0].isIntersecting;
        syncPlayback();
      },
      { threshold: PLAYBACK_THRESHOLD },
    );
    observer.observe(video);

    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
    };
  }, [source, hasError]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[#171717]",
        "border border-white/10 shadow-[inset_0_0.5px_0_rgb(255_255_255/12%)]",
        "transition-colors duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/20",
        "motion-reduce:transition-none",
        className,
      )}
      ref={containerRef}
    >
      {source && !hasError ? (
        <video
          aria-hidden="true"
          className={cn(
            "block size-full object-cover",
            // The nudge past 100% hides the seam webm scaling leaves at the edge.
            "[transform:scale(1.015)_translateZ(0)]",
            "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover:[transform:scale(1.06)_translateZ(0)]",
            "motion-reduce:transition-opacity motion-reduce:[transform:none]",
            isReady ? "opacity-100" : "opacity-0",
          )}
          disablePictureInPicture
          loop
          muted
          onCanPlay={() => setIsReady(true)}
          onError={() => setHasError(true)}
          onLoadedData={() => setIsReady(true)}
          playsInline
          preload="metadata"
          ref={videoRef}
          src={source}
          tabIndex={-1}
        />
      ) : null}
 
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_0%,rgb(255_255_255/6%),transparent_70%)]",
          "transition-opacity duration-500",
          isReady && !hasError ? "opacity-0" : "opacity-100",
        )}
      />
    </div>
  );
}

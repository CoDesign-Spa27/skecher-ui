"use client";

/* eslint-disable @next/next/no-img-element */

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type DensityPercent = 20 | 40 | 80 | 120;

type DensityImage = {
  id: string;
  src: string;
  alt: string;
};

type ImageDensityGridProps = {
  images?: DensityImage[];
  options?: DensityPercent[];
  initialPercent?: DensityPercent;
  className?: string;
};

const DEFAULT_OPTIONS: DensityPercent[] = [20, 40, 80, 120];

const DEFAULT_IMAGES: DensityImage[] = Array.from({ length: 40 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    id: `frame-${number}`,
    src: `https://picsum.photos/seed/image-density-grid-${number}/520/640`,
    alt: `Random editorial image ${number}`,
  };
});
 
const tileEase = [0.9, 0.03, 0.69, 0.22] as const;

const tileTransition = {
  type: "tween" as const,
  duration: 0.62,
  ease: tileEase,
};
 
const overlayEase = [0.17, 0.84, 0.44, 1] as const;
const overlayTransition = { duration: 0.3, ease: overlayEase };
const transitionMs = 620;
const layoutStaggerDelay = 0.012;
 

const densityLayout: Record<DensityPercent, { columns: number; gap: string }> = {
  20: { columns: 4, gap: "1.25rem" },
  40: { columns: 5, gap: "1rem" },
  80: { columns: 8, gap: "0.625rem" },
  120: { columns: 10, gap: "0.375rem" },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getDensityLayout(percent: DensityPercent, imageCount: number) {
  const { columns, gap } = densityLayout[percent];

  return {
    columnCount: Math.min(columns, imageCount),
    gap,
  };
}

 
function getTileTransition(index: number, shouldReduceMotion: boolean | null) {
  if (shouldReduceMotion) {
    return { duration: 0.3, ease: tileEase };
  }

  const delay = index * layoutStaggerDelay;

  return {
    layout: { ...tileTransition, delay },
    scale: tileTransition,
    filter: { duration: tileTransition.duration, ease: tileEase },
  };
}

export function ImageDensityGrid({
  images = DEFAULT_IMAGES,
  options = DEFAULT_OPTIONS,
  initialPercent = 120,
  className,
}: ImageDensityGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeImages = images.length > 0 ? images : DEFAULT_IMAGES;
  const safeOptions = options.length > 0 ? options : DEFAULT_OPTIONS;
  const [activePercent, setActivePercent] = useState<DensityPercent>(
    safeOptions.includes(initialPercent) ? initialPercent : safeOptions[0] ?? 40
  );
  const [isRearranging, setIsRearranging] = useState(false);

  const { columnCount, gap } = useMemo(
    () => getDensityLayout(activePercent, safeImages.length),
    [activePercent, safeImages.length]
  );

  useEffect(() => {
    if (safeOptions.includes(activePercent)) {
      return;
    }

    setActivePercent(safeOptions[0] ?? 40);
  }, [activePercent, safeOptions]);

  useEffect(() => {
    if (!isRearranging) {
      return;
    }

    const staggerSpanMs = (safeImages.length - 1) * layoutStaggerDelay * 1000;
    const timeout = window.setTimeout(
      () => setIsRearranging(false),
      shouldReduceMotion ? 180 : transitionMs + staggerSpanMs
    );

    return () => window.clearTimeout(timeout);
  }, [isRearranging, safeImages.length, shouldReduceMotion]);

  function selectPercent(percent: DensityPercent) {
    if (percent === activePercent) {
      return;
    }

    setActivePercent(percent);
    setIsRearranging(true);
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-3 text-white shadow-[0_28px_90px_-54px_rgb(0_0_0/0.95)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
            Image Density
          </p>
          <p className="mt-1 text-sm font-medium text-white/82">
            {safeImages.length} frames · {activePercent}% density
          </p>
        </div>

        <div
          aria-label="Grid percentage"
          className="relative flex rounded-full border border-white/10 bg-white/[0.03] p-1"
          role="group"
        >
          {safeOptions.map((percent) => {
            const isActive = percent === activePercent;

            return (
              <button
                aria-pressed={isActive}
                className={cn(
                  "relative z-10 min-w-11 rounded-full px-2.5 py-1.5 text-xs font-medium outline-none transition-[color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/50",
                  isActive
                    ? "text-neutral-950"
                    : "text-white/52 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white"
                )}
                key={percent}
                onClick={() => selectPercent(percent)}
                type="button"
              >
                {isActive ? (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-white"
                    layoutId="image-density-grid-active-option"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", duration: 0.32, bounce: 0.12 }
                    }
                  />
                ) : null}
                {percent}%
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative isolate px-1 py-8">
 
        <motion.div
          className="relative grid overflow-visible"
          layout
          style={{
            gap,
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
          transition={shouldReduceMotion ? { duration: 0 } : tileTransition}
        >
          {safeImages.map((image, index) => (
            <motion.figure
              animate={{
                filter:
                  isRearranging && !shouldReduceMotion
                    ? "blur(5px) brightness(1.16) saturate(3)"
                    : "blur(0px) brightness(1) saturate(1)",
              }}
              className="relative min-w-0"
              key={image.id}
              transition={overlayTransition}
             
            >
              <motion.div
              
                className="relative min-w-0 origin-center"
                layout
                transition={getTileTransition(index, shouldReduceMotion)}
              >
                <motion.div
                  aria-hidden="true"
                  animate={{
                    opacity: isRearranging && !shouldReduceMotion ? 0.8 : 0,
                  }}
                  className="absolute -inset-2 rounded-xl blur-xl"
                  transition={shouldReduceMotion ? { duration: 0 } : overlayTransition}
                />
                <div className="relative overflow-hidden rounded-lg border border-white/8 bg-white/[0.04] shadow-[0_16px_40px_-30px_rgb(255_255_255/0.45)]">
                  <img
                    alt={image.alt}
                    className="aspect-[4/5] w-full object-cover"
                    decoding="async"
                    draggable={false}
                    loading={index < 8 ? "eager" : "lazy"}
                    src={image.src}
                  />
                </div>
                <figcaption className="mt-1.5 font-mono text-[10px] text-white/35">
                  {String(index + 1).padStart(2, "0")}
                </figcaption>
              </motion.div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ImageDensityGrid;

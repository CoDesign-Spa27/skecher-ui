"use client";

/* eslint-disable @next/next/no-img-element */

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { type PointerEvent, useEffect, useRef, useState } from "react";

type ImageGlideItem = {
  src: string;
  alt: string;
  title: string;
  description?: string;
};

type ImageGlideProps = {
  images?: ImageGlideItem[];
  initialIndex?: number;
  className?: string;
  onIndexChange?: (index: number) => void;
};

const DEFAULT_IMAGES: ImageGlideItem[] = [
  {
    src: "/assets/images/image.jpg",
    alt: "Editorial scene with warm natural light",
    title: "Warm Frame",
    description: "A calm lead image with gentle depth and a soft foreground glow.",
  },
  {
    src: "/assets/images/image2.jpg",
    alt: "Cinematic image with layered composition",
    title: "Soft Focus",
    description: "A balanced crop that keeps the motion quiet and readable.",
  },
  {
    src: "/assets/images/image3.jpg",
    alt: "Detailed image with rich texture",
    title: "Textured Light",
    description: "Pointer movement nudges the surface without stealing attention.",
  },
  {
    src: "/assets/images/image4.jpg",
    alt: "Wide image with natural contrast",
    title: "Open Field",
    description: "The active image settles fast so selection still feels immediate.",
  },
  {
    src: "/assets/images/image5.jpg",
    alt: "Image with muted tones and a clean composition",
    title: "Quiet Tone",
    description: "A thumbnail rail gives the component a compact gallery rhythm.",
  },
  {
    src: "/assets/images/image6.jpg",
    alt: "Image with warm highlights and depth",
    title: "Late Glow",
    description: "The interaction is decorative, so it backs off for reduced motion.",
  },
];

const easeOut = [0.23, 1, 0.32, 1] as const;
const sweepEase = [0.77, 0, 0.175, 1] as const;
const sweepMs = 560;
const hoverIntentMs = 70;
const pointerSpring = {
  stiffness: 130,
  damping: 20,
  mass: 0.4,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ImageGlide({
  images = DEFAULT_IMAGES,
  initialIndex = 0,
  className,
  onIndexChange,
}: ImageGlideProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeImages = images.length > 0 ? images : DEFAULT_IMAGES;
  const initialSafeIndex = Math.min(Math.max(initialIndex, 0), safeImages.length - 1);
  const [activeIndex, setActiveIndex] = useState(initialSafeIndex);
  const [previousImage, setPreviousImage] = useState<ImageGlideItem | null>(null);
  const [sweepKey, setSweepKey] = useState(0);
  const activeImage = safeImages[activeIndex] ?? safeImages[0];
  const hoverIntentRef = useRef<number | null>(null);

  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  const smoothImageX = useSpring(imageX, pointerSpring);
  const smoothImageY = useSpring(imageY, pointerSpring);
  const smoothGlowX = useSpring(glowX, pointerSpring);
  const smoothGlowY = useSpring(glowY, pointerSpring);
  const smoothGlowOpacity = useSpring(glowOpacity, {
    stiffness: 220,
    damping: 26,
    mass: 0.5,
  });
  const imageTransform = useMotionTemplate`translate3d(${smoothImageX}px, ${smoothImageY}px, 0px)`;
  const glowTransform = useMotionTemplate`translate3d(${smoothGlowX}px, ${smoothGlowY}px, 0px) translate(-50%, -50%)`;

  useEffect(() => {
    setActiveIndex((currentIndex) => Math.min(currentIndex, safeImages.length - 1));
  }, [safeImages.length]);

  useEffect(() => {
    return () => {
      if (hoverIntentRef.current) {
        window.clearTimeout(hoverIntentRef.current);
      }
    };
  }, []);

  function selectImage(index: number) {
    if (index === activeIndex) {
      return;
    }

    setPreviousImage(activeImage);
    setActiveIndex(index);
    setSweepKey((key) => key + 1);
    onIndexChange?.(index);
  }

  function clearHoverIntent() {
    if (!hoverIntentRef.current) {
      return;
    }

    window.clearTimeout(hoverIntentRef.current);
    hoverIntentRef.current = null;
  }

  function scheduleHoverSelect(index: number, pointerType: string) {
    if (pointerType === "touch" || index === activeIndex) {
      return;
    }

    clearHoverIntent();
    hoverIntentRef.current = window.setTimeout(() => {
      selectImage(index);
      hoverIntentRef.current = null;
    }, hoverIntentMs);
  }

  useEffect(() => {
    if (!previousImage) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setPreviousImage(null);
      },
      shouldReduceMotion ? 180 : sweepMs,
    );

    return () => window.clearTimeout(timer);
  }, [previousImage, shouldReduceMotion]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (shouldReduceMotion || event.pointerType === "touch") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const progressX = x / rect.width - 0.5;
    const progressY = y / rect.height - 0.5;

    imageX.set(progressX * -10);
    imageY.set(progressY * -8);
    glowX.set(x);
    glowY.set(y);
    glowOpacity.set(1);
  }

  function resetPointerFrame() {
    imageX.set(0);
    imageY.set(0);
    glowOpacity.set(0);
  }

  return (
    <div className={cn("mx-auto w-full max-w-2xl", className)}>
      <figure className="space-y-1">
        <div className="relative p-1 rounded-lg">
          <div
            className="relative isolate aspect-[16/10] rounded-lg overflow-hidden "
            onPointerLeave={resetPointerFrame}
            onPointerMove={handlePointerMove}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                animate={{ opacity: 1, filter: "blur(0px)" }}
                className="absolute inset-0"
                initial={{
                  opacity: shouldReduceMotion ? 0 : 1,
                  filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                }}
                key={activeImage.src}
                style={{
                  transform: shouldReduceMotion ? "none" : imageTransform,
                  willChange: shouldReduceMotion ? "opacity, filter" : "opacity, filter, transform",
                }}
                transition={{ duration: shouldReduceMotion ? 0.16 : 0.2, ease: easeOut }}
              >
                <img
                  alt={activeImage.alt}
                  className="h-full w-full object-cover rounded-lg"
                  decoding="async"
                  draggable={false}
                  src={activeImage.src}
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {previousImage && !shouldReduceMotion ? (
                <motion.div
                  animate={{ clipPath: "inset(0 0 0 100%)" }}
                  className="absolute inset-0 z-[2]"
                  exit={{ opacity: 0 }}
                  initial={{ clipPath: "inset(0 0 0 0%)" }}
                  key={`${previousImage.src}-${sweepKey}`}
                  style={{ willChange: "clip-path" }}
                  transition={{ duration: sweepMs / 1000, ease: sweepEase }}
                >
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    decoding="async"
                    draggable={false}
                    src={previousImage.src}
                  />
                  <div className="absolute inset-0 bg-black/12" />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {previousImage && !shouldReduceMotion ? (
                <motion.div
                  aria-hidden="true"
                  animate={{ transform: "translate3d(142%, 0, 0) skewX(-9deg)", opacity: 0 }}
                  className="pointer-events-none absolute -inset-y-12 left-0 z-[3] w-[46%]"
                  initial={{ transform: "translate3d(-62%, 0, 0) skewX(-9deg)", opacity: 1 }}
                  key={`glimm-sweep-${sweepKey}`}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 0.10) 13%, rgb(20 20 20 / 0.86) 36%, rgb(160 160 160 / 0.34) 50%, rgb(255 255 255 / 0.24) 58%, rgb(38 38 38 / 0.72) 69%, transparent 100%)",
                    filter: "blur(12px) saturate(0)",
                    mixBlendMode: "screen",
                    willChange: "transform, opacity",
                  }}
                  transition={{
                    transform: { duration: sweepMs / 1000, ease: sweepEase },
                    opacity: { delay: 0.28, duration: 0.14, ease: easeOut },
                  }}
                >
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                  <div className="absolute inset-y-0 left-[46%] w-8 bg-white/8 blur-xl" />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="absolute inset-0 z-[4] bg-[linear-gradient(180deg,transparent_48%,rgb(0_0_0/0.72)_100%)]" />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-[5] size-56 rounded-full bg-white/10 blur-2xl"
              style={{
                opacity: smoothGlowOpacity,
                transform: shouldReduceMotion ? "translate3d(0, 0, 0)" : glowTransform,
                willChange: shouldReduceMotion ? "opacity" : "opacity, transform",
              }}
            />
            <figcaption className="absolute inset-x-0 bottom-0 z-[6] flex items-end justify-between gap-4 p-4 text-white">
              <div className="min-w-0">
                <p className="font-mono text-sm uppercase tracking-[0.18em] text-white/55">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(safeImages.length).padStart(2, "0")}
                </p>
                <h3 className="mt-1 truncate text-lg font-medium tracking-normal">
                  {activeImage.title}
                </h3>
                {activeImage.description ? (
                  <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-white/68">
                    {activeImage.description}
                  </p>
                ) : null}
              </div>
            </figcaption>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2" role="group" aria-label="Image choices">
          {safeImages.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-label={`Show ${image.title}`}
                aria-pressed={isActive}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-[8px] border-0 bg-muted outline-none transition-[opacity,transform,border-color] duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ",
                  " ",
                  isActive
                    ? " opacity-100"
                    : "opacity-44 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-85",
                )}
                key={image.src}
                onClick={() => selectImage(index)}
                onPointerEnter={(event) => scheduleHoverSelect(index, event.pointerType)}
                onPointerLeave={clearHoverIntent}
                type="button"
              >
                <img
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-active:scale-[0.98]"
                  decoding="async"
                  draggable={false}
                  src={image.src}
                />
                {isActive ? (
                  <motion.span
                    className="absolute inset-0  "
                    layoutId="image-glide-active"
                    transition={{ type: "spring", duration: 0.32, bounce: 0.12 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </figure>
    </div>
  );
}

export default ImageGlide;

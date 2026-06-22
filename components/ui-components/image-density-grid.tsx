"use client";

/* eslint-disable @next/next/no-img-element */

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const densityLayout: Record<DensityPercent, { columns: number; gap: string }> =
{
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

function getTileTransition(
  index: number,
  shouldReduceMotion: boolean | null
) {
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
    safeOptions.includes(initialPercent)
      ? initialPercent
      : safeOptions[0] ?? 40
  );

  const [isRearranging, setIsRearranging] = useState(false);

  const controlsRef = useRef<HTMLDivElement | null>(null);

  const optionRefs = useRef<
    Partial<Record<DensityPercent, HTMLButtonElement | null>>
  >({});

  const targetX = useMotionValue(0);
  const targetWidth = useMotionValue(0);

  const x = useSpring(targetX, {
    stiffness: 420,
    damping: 34,
    mass: 0.8,
  });

  const width = useSpring(targetWidth, {
    stiffness: 420,
    damping: 34,
    mass: 0.8,
  });

  const velocity = useVelocity(x);

  const scaleX = useTransform(
    velocity,
    [-1200, 0, 1200],
    [1.45, 1, 1.45]
  );

  const blur = useTransform(velocity, [-1200, 0, 1200], [3, 0, 3]);

  const filter = useMotionTemplate`blur(${blur}px)`;

  const { columnCount, gap } = useMemo(
    () => getDensityLayout(activePercent, safeImages.length),
    [activePercent, safeImages.length]
  );

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    const activeButton = optionRefs.current[activePercent];

    if (!controls || !activeButton) return;

    const controlsRect = controls.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    targetX.set(activeRect.left - controlsRect.left);
    targetWidth.set(activeRect.width);
  }, [activePercent, targetX, targetWidth]);

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
        "mx-auto flex h-[clamp(20rem,calc(100svh-23rem),40rem)] max-h-full min-h-0 min-w-0 w-full max-w-6xl flex-col overflow-hidden",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-center gap-4">
        {/* <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
            Image Density
          </p>

          <p className="mt-1 text-sm font-medium text-white/82">
            {safeImages.length} frames · {activePercent}% density
          </p>
        </div> */}

        <div
          ref={controlsRef}
          aria-label="Grid percentage"
          className="relative flex gap-2"
          role="group"
        >
          <motion.span
            aria-hidden="true"
            style={{
              x,
              width,
              scaleX,
              filter,
            }}
            className="pointer-events-none absolute left-0 top-0 h-full origin-center rounded-md bg-white"
          />

          {safeOptions.map((percent) => {
            const isActive = percent === activePercent;

            return (
              <button
                key={percent}
                ref={(node) => {
                  optionRefs.current[percent] = node;
                }}
                aria-pressed={isActive}
                className={cn(
                  "relative z-10 min-w-11 rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none transition-[color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/50",
                  isActive
                    ? "text-neutral-950"
                    : "text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-neutral-400"
                )}
                onClick={() => selectPercent(percent)}
                type="button"
              >
                {percent}%
              </button>
            );
          })}
        </div>
      </div>

      <div className="no-scrollbar relative isolate min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-1 py-8">
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
              key={image.id}
              animate={{
                filter:
                  isRearranging && !shouldReduceMotion
                    ? "blur(5px) brightness(1.16) saturate(3)"
                    : "blur(0px) brightness(1) saturate(1)",
              }}
              className="relative min-w-0"
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
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : overlayTransition
                  }
                />

                <div className="relative overflow-hidden rounded-md border border-white/8 bg-white/[0.04]">
                  <img
                    alt={image.alt}
                    className="aspect-[4/5] w-full object-cover"
                    decoding="async"
                    draggable={false}
                    height={640}
                    loading={index < 8 ? "eager" : "lazy"}
                    src={image.src}
                    width={520}
                  />
                </div>

                
              </motion.div>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default ImageDensityGrid;

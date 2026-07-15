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
  useCallback,
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

  /**
   * Show or hide the density controls.
   */
  showControls?: boolean;

  /**
   * Optional heading above the controls.
   */
  title?: string;

  /**
   * Limits the height of the image area.
   * Leave undefined to allow the grid to grow naturally.
   *
   * Example:
   * gridMaxHeight="42rem"
   */
  gridMaxHeight?: string;

  /**
   * Adds internal padding around the component.
   */
  padded?: boolean;
};

const DEFAULT_OPTIONS: DensityPercent[] = [20, 40, 80, 120];

const DEFAULT_IMAGES: DensityImage[] = Array.from(
  { length: 40 },
  (_, index) => {
    const number = String(index + 1).padStart(2, "0");

    return {
      id: `frame-${number}`,
      src: `https://picsum.photos/seed/image-density-grid-${number}/520/640`,
      alt: `Random editorial image ${number}`,
    };
  },
);

const tileEase = [0.9, 0.03, 0.69, 0.22] as const;
const overlayEase = [0.17, 0.84, 0.44, 1] as const;

const tileTransition = {
  type: "tween" as const,
  duration: 0.62,
  ease: tileEase,
};

const overlayTransition = {
  duration: 0.3,
  ease: overlayEase,
};

const transitionMs = 620;
const layoutStaggerDelay = 0.012;

const densityLayout: Record<
  DensityPercent,
  {
    desktopColumns: number;
    tabletColumns: number;
    mobileColumns: number;
    gap: string;
  }
> = {
  20: {
    desktopColumns: 4,
    tabletColumns: 3,
    mobileColumns: 2,
    gap: "clamp(0.75rem, 1.5vw, 1.25rem)",
  },
  40: {
    desktopColumns: 5,
    tabletColumns: 4,
    mobileColumns: 2,
    gap: "clamp(0.625rem, 1.25vw, 1rem)",
  },
  80: {
    desktopColumns: 8,
    tabletColumns: 5,
    mobileColumns: 3,
    gap: "clamp(0.375rem, 0.9vw, 0.625rem)",
  },
  120: {
    desktopColumns: 10,
    tabletColumns: 6,
    mobileColumns: 4,
    gap: "clamp(0.25rem, 0.65vw, 0.375rem)",
  },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getTileTransition(
  index: number,
  shouldReduceMotion: boolean | null,
) {
  if (shouldReduceMotion) {
    return {
      duration: 0,
    };
  }

  const delay = index * layoutStaggerDelay;

  return {
    layout: {
      ...tileTransition,
      delay,
    },
  };
}

export function ImageDensityGrid({
  images = DEFAULT_IMAGES,
  options = DEFAULT_OPTIONS,
  initialPercent = 120,
  className,
  showControls = true,
  title = "Image density",
  gridMaxHeight,
  padded = true,
}: ImageDensityGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const safeImages = images.length > 0 ? images : DEFAULT_IMAGES;
  const safeOptions = options.length > 0 ? options : DEFAULT_OPTIONS;

  const fallbackPercent = safeOptions[0] ?? 40;

  const [activePercent, setActivePercent] = useState<DensityPercent>(
    safeOptions.includes(initialPercent) ? initialPercent : fallbackPercent,
  );

  const [isRearranging, setIsRearranging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
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
    [-1200, -250, 0, 250, 1200],
    [1.35, 1.12, 1, 1.12, 1.35],
  );

  const blur = useTransform(
    velocity,
    [-1200, -250, 0, 250, 1200],
    [2.5, 0.8, 0, 0.8, 2.5],
  );

  const filter = useMotionTemplate`blur(${blur}px)`;

  const activeLayout = densityLayout[activePercent];

  const columnCount = useMemo(() => {
    let columns = activeLayout.desktopColumns;

    if (containerWidth > 0 && containerWidth < 640) {
      columns = activeLayout.mobileColumns;
    } else if (containerWidth > 0 && containerWidth < 1024) {
      columns = activeLayout.tabletColumns;
    }

    return Math.max(1, Math.min(columns, safeImages.length));
  }, [activeLayout, containerWidth, safeImages.length]);

  const updateActiveIndicator = useCallback(() => {
    const controls = controlsRef.current;
    const activeButton = optionRefs.current[activePercent];

    if (!controls || !activeButton) {
      return;
    }

    const controlsRect = controls.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    targetX.set(activeRect.left - controlsRect.left);
    targetWidth.set(activeRect.width);
  }, [activePercent, targetWidth, targetX]);

  useLayoutEffect(() => {
    updateActiveIndicator();
  }, [updateActiveIndicator, safeOptions]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      requestAnimationFrame(updateActiveIndicator);
    });

    resizeObserver.observe(root);

    return () => resizeObserver.disconnect();
  }, [updateActiveIndicator]);

  useEffect(() => {
    if (safeOptions.includes(activePercent)) {
      return;
    }

    setActivePercent(fallbackPercent);
  }, [activePercent, fallbackPercent, safeOptions]);

  useEffect(() => {
    if (!isRearranging) {
      return;
    }

    const staggerSpanMs =
      Math.max(0, safeImages.length - 1) *
      layoutStaggerDelay *
      1000;

    const timeout = window.setTimeout(
      () => setIsRearranging(false),
      shouldReduceMotion ? 0 : transitionMs + staggerSpanMs,
    );

    return () => window.clearTimeout(timeout);
  }, [isRearranging, safeImages.length, shouldReduceMotion]);

  function selectPercent(percent: DensityPercent) {
    if (percent === activePercent) {
      return;
    }

    setActivePercent(percent);

    if (!shouldReduceMotion) {
      setIsRearranging(true);
    }
  }

  return (
    <section
      ref={rootRef}
      className={cn(
        "relative w-full min-w-0 overflow-hidden",
        padded && "p-4 sm:p-5 md:p-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-5 md:gap-6">
        {showControls && (
          <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              ref={controlsRef}
              aria-label="Image grid density"
              className="relative grid w-full grid-cols-4 gap-1 rounded-lg border bg-muted/40 p-1 sm:w-auto"
              role="group"
            >
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 left-0 top-1 rounded-md text-background bg-foreground shadow-sm"
                style={{
                  x,
                  width,
                  scaleX: shouldReduceMotion ? 1 : scaleX,
                  filter: shouldReduceMotion ? "none" : filter,
                }}
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
                      "relative z-10 min-w-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium outline-none",
                      "transition-[color,transform] duration-150",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      "active:scale-[0.97]",
                      isActive
                        ? "text-background"
                        : "hover:text-foreground",
                    )}
                    onClick={() => selectPercent(percent)}
                    type="button"
                  >
                    {percent}%
                  </button>
                );
              })}
            </div>
          </header>
        )}

        <div
          className={cn(
            "min-h-0 min-w-0",
            gridMaxHeight && "overflow-y-auto overscroll-contain",
          )}
          style={{
            maxHeight: gridMaxHeight,
          }}
        >
          <motion.div
            layout
            className="grid min-w-0 items-start"
            style={{
              gap: activeLayout.gap,
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
            transition={
              shouldReduceMotion
                ? {
                  duration: 0,
                }
                : tileTransition
            }
          >
            {safeImages.map((image, index) => (
              <motion.figure
                key={image.id}
                layout
                className="relative min-w-0"
                transition={getTileTransition(index, shouldReduceMotion)}
              >
                <motion.div
                  animate={{
                    filter:
                      isRearranging && !shouldReduceMotion
                        ? "blur(3px) brightness(1.08) saturate(2.35)"
                        : "blur(0px) brightness(1) saturate(1)",
                    scale:
                      isRearranging && !shouldReduceMotion
                        ? 0.985
                        : 1,
                  }}
                  className="relative min-w-0 origin-center"
                  transition={overlayTransition}
                >
                

                  <div className="relative overflow-hidden rounded-lg border bg-muted">
                    <img
                      alt={image.alt}
                      className="aspect-[4/5] h-auto w-full select-none object-cover"
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
    </section>
  );
}

export default ImageDensityGrid;
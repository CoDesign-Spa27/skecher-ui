"use client";

import {
  animate,
  type MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type WheelCarouselItem = {
  id: string;
  content: ReactNode;
  label?: string;
};

export type WheelCarouselProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  items: readonly WheelCarouselItem[];
  autoRotateSpeed?: number;
  cardClassName?: string;
  cardHeight?: number;
  cardWidth?: number;
  dragSensitivity?: number;
  direction?: "left" | "right";
  initialIndex?: number;
  maxBlur?: number;
  maxMotionBlur?: number;
  /** Scale applied below the `sm` breakpoint. Desktop always renders at full size. */
  mobileScale?: number;
  motionBlurExitDelay?: number;
  motionBlurExitDuration?: number;
  onActiveIndexChange?: (index: number) => void;
  pauseOnHover?: boolean;
  paused?: boolean;
  radius?: number;
  spring?: {
    damping?: number;
    mass?: number;
    stiffness?: number;
  };
};

const wrap = (value: number, length: number) => ((value % length) + length) % length;

export function WheelCarousel({
  "aria-label": ariaLabel = "3D carousel",
  autoRotateSpeed = 10,
  cardClassName,
  cardHeight = 380,
  cardWidth = 280,
  className,
  direction = "left",
  dragSensitivity = 0.35,
  initialIndex = 0,
  items,
  maxBlur = 12,
  maxMotionBlur = 40,
  mobileScale = 0.68,
  motionBlurExitDelay = 0.7,
  motionBlurExitDuration = 1.2,
  onActiveIndexChange,
  pauseOnHover = true,
  paused = false,
  radius = 560,
  spring = {
    damping: 90,
    mass: 1,
    stiffness: 200,
  },
  ...props
}: WheelCarouselProps) {
  const itemCount = items.length;
  const safeItemCount = Math.max(itemCount, 1);
  const angleStep = itemCount > 0 ? 360 / itemCount : 0;
  const reduceMotion = useReducedMotion();
  const rotation = useMotionValue(-wrap(initialIndex, safeItemCount) * angleStep);
  const smoothRotation = useSpring(rotation, spring);
  const rotationVelocity = useVelocity(smoothRotation);
  const smoothVelocity = useSpring(rotationVelocity, {
    stiffness: 200,
    damping: 30,
  });
  const dragging = useRef(false);
  const hovered = useRef(false);
  const travelDirection = useRef(direction === "left" ? -1 : 1);
  const lastActiveIndex = useRef(wrap(initialIndex, safeItemCount));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    travelDirection.current = direction === "left" ? -1 : 1;
  }, [direction]);

  useAnimationFrame((_, delta) => {
    if (
      itemCount < 2 ||
      paused ||
      reduceMotion ||
      dragging.current ||
      (pauseOnHover && hovered.current)
    ) {
      return;
    }
    const seconds = delta / 1000;
    const rotationChange = autoRotateSpeed * travelDirection.current * seconds;
    rotation.set(rotation.get() + rotationChange);
  });

  useMotionValueEvent(smoothRotation, "change", (latest) => {
    if (itemCount === 0) {
      return;
    }
    const next = wrap(Math.round(-latest / angleStep), itemCount);
    if (next !== lastActiveIndex.current) {
      lastActiveIndex.current = next;
      onActiveIndexChange?.(next);
    }
  });

  const rotateBy = (steps: number) => {
    if (itemCount < 2) {
      return;
    }
    rotation.set(rotation.get() - steps * angleStep);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      rotateBy(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      rotation.set(0);
    } else if (event.key === "End") {
      event.preventDefault();
      rotation.set(-(itemCount - 1) * angleStep);
    }
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <section
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={cn(
        "relative flex min-h-96 w-full items-center justify-center overflow-hidden outline-none perspective-[5000px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[32rem]",
        className,
      )}
      onBlur={() => {
        hovered.current = false;
      }}
      onFocus={() => {
        hovered.current = true;
      }}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        hovered.current = true;
      }}
      onMouseLeave={() => {
        hovered.current = false;
      }}
      // The carousel surface receives focus for its arrow-key controls.
      // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard-operated carousel region
      tabIndex={0}
      {...props}
    >
      <motion.div
        className={cn(
          "relative origin-center touch-none select-none [scale:var(--wheel-mobile-scale)] sm:[scale:1]",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPan={(_event, info) => {
          const delta = info.delta.x * dragSensitivity;
          if (delta > 0) {
            travelDirection.current = 1;
          } else if (delta < 0) {
            travelDirection.current = -1;
          }
          rotation.set(rotation.get() + delta);
        }}
        onPanStart={() => {
          dragging.current = true;
          setIsDragging(true);
        }}
        onPanEnd={() => {
          dragging.current = false;
          setIsDragging(false);
        }}
        style={
          {
            height: cardHeight,
            rotateY: smoothRotation,
            transformStyle: "preserve-3d",
            width: cardWidth,
            "--wheel-mobile-scale": mobileScale,
          } as CSSProperties
        }
      >
        {items.map((item, index) => (
          <WheelCarouselCard
            angle={angleStep * index}
            cardClassName={cardClassName}
            index={index}
            isDragging={isDragging}
            item={item}
            itemCount={itemCount}
            key={item.id}
            maxBlur={maxBlur}
            maxMotionBlur={maxMotionBlur}
            motionBlurExitDelay={motionBlurExitDelay}
            motionBlurExitDuration={motionBlurExitDuration}
            radius={radius}
            rotation={smoothRotation}
            velocity={smoothVelocity}
          />
        ))}
      </motion.div>

      <p className="sr-only">Use the left and right arrow keys to move between slides.</p>
    </section>
  );
}

type WheelCarouselCardProps = {
  angle: number;
  cardClassName?: string;
  index: number;
  isDragging: boolean;
  item: WheelCarouselItem;
  itemCount: number;
  maxBlur: number;
  maxMotionBlur: number;
  motionBlurExitDelay: number;
  motionBlurExitDuration: number;
  radius: number;
  rotation: MotionValue<number>;
  velocity: MotionValue<number>;
};

function WheelCarouselCard({
  angle,
  cardClassName,
  index,
  isDragging,
  item,
  itemCount,
  maxBlur,
  maxMotionBlur,
  motionBlurExitDelay,
  motionBlurExitDuration,
  radius,
  rotation,
  velocity,
}: WheelCarouselCardProps) {
  const angleStep = 360 / itemCount;
  const distance = useTransform(rotation, (current) => {
    const frontIndex = wrap(Math.round(-current / angleStep), itemCount);
    const direct = Math.abs(index - frontIndex);
    return Math.min(direct, itemCount - direct);
  });

  const positionBlur = useTransform(distance, (value) => {
    if (value <= 1) {
      return 0;
    }
    const furthest = Math.max(Math.floor(itemCount / 2), 1);
    const availableSteps = Math.max(furthest - 1, 1);
    const progress = (value - 1) / availableSteps;
    return progress * maxBlur;
  });

  const motionBlur = useMotionValue(0);

  useMotionValueEvent(velocity, "change", (currentVelocity) => {
    if (!isDragging) {
      return;
    }
    const speed = Math.abs(currentVelocity);
    const blur = Math.min(speed / 70, maxMotionBlur);
    motionBlur.set(blur);
  });

  useEffect(() => {
    if (isDragging) {
      return;
    }
    const controls = animate(motionBlur, 0, {
      delay: motionBlurExitDelay,
      duration: motionBlurExitDuration,
      ease: [0.23, 1, 0.32, 1],
    });
    return () => {
      controls.stop();
    };
  }, [isDragging, motionBlur, motionBlurExitDelay, motionBlurExitDuration]);

  const totalBlur = useTransform(
    [positionBlur, motionBlur],
    ([depthBlur, velocityBlur]) => Number(depthBlur) + Number(velocityBlur),
  );

  const filter = useTransform(totalBlur, (blur) => `blur(${blur}px)`);

  return (
    <motion.div
      aria-label={item.label ?? `Slide ${index + 1} of ${itemCount}`}
      aria-roledescription="slide"
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[var(--wheel-card-radius,1rem)] ",
        cardClassName,
      )}
      role="group"
      style={{
        filter,
        transform: `
          rotateY(${angle}deg)
          translateZ(${radius}px)
        `,
      }}
    >
      {item.content}
    </motion.div>
  );
}

export default WheelCarousel;

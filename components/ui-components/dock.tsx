"use client";

import {
  type MotionStyle,
  type MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface DockProps {
  items: readonly DockItem[];
  ariaLabel?: string;
  baseSize?: number;
  className?: string;
  colors?: DockColors;
  influence?: number;
  layout?: DockLayout;
  maxSize?: number;
  motion?: DockMotion;
}

export type DockSpring = {
  bounce?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  visualDuration?: number;
};

export type DockColors = {
  focusRing?: string;
  highlight?: string;
  icon?: string;
  item?: string;
  surface?: string;
};

export type DockLayout = {
  gap?: number;
  height?: number;
  iconScale?: number;
  itemRadius?: number;
  padding?: number;
  radius?: number;
};

export type DockMotion = {
  highlightSpring?: DockSpring;
  jelly?: number;
  sizeSpring?: DockSpring;
  tapScale?: number;
  visibilitySpring?: DockSpring;
};

type PhysicalSpring = Required<Pick<DockSpring, "damping" | "mass" | "stiffness">>;
type DockButtonStyle = MotionStyle & { "--tw-ring-color"?: string };

const DEFAULT_SIZE_SPRING = {
  mass: 0.1,
  stiffness: 170,
  damping: 14,
} satisfies PhysicalSpring;

const DEFAULT_HIGHLIGHT_SPRING = {
  mass: 0.22,
  stiffness: 200,
  damping: 20,
} satisfies PhysicalSpring;

const DEFAULT_VISIBILITY_SPRING = {
  mass: 1,
  stiffness: 200,
  damping: 25,
} satisfies PhysicalSpring;

const DEFAULT_LAYOUT = {
  gap: 12,
  height: 40,
  iconScale: 0.55,
  itemRadius: 12,
  padding: 8,
  radius: 16,
} satisfies Required<DockLayout>;

function resolveSpring(spring: DockSpring | undefined, fallback: PhysicalSpring) {
  if (spring?.visualDuration !== undefined || spring?.bounce !== undefined) {
    return {
      bounce: spring.bounce ?? 0,
      visualDuration: spring.visualDuration ?? 0.35,
    };
  }

  return {
    damping: spring?.damping ?? fallback.damping,
    mass: spring?.mass ?? fallback.mass,
    stiffness: spring?.stiffness ?? fallback.stiffness,
  };
}

export function Dock({
  items,
  ariaLabel = "Dock",
  baseSize = 44,
  className = "",
  colors,
  influence = 140,
  layout,
  maxSize = 80,
  motion: motionConfig,
}: DockProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // The DOM node of the currently hovered/focused button. A ref, not state,
  // so sweeping the mouse never triggers a React re-render.
  const activeRef = useRef<HTMLButtonElement | null>(null);

  const mouseX = useMotionValue(Infinity);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const targetW = useMotionValue(baseSize);
  const targetH = useMotionValue(baseSize);
  const targetOpacity = useMotionValue(0);

  const resolvedLayout = { ...DEFAULT_LAYOUT, ...layout };
  const highlightSpringConfig = resolveSpring(
    motionConfig?.highlightSpring,
    DEFAULT_HIGHLIGHT_SPRING,
  );
  const visibilitySpringConfig = resolveSpring(
    motionConfig?.visibilitySpring,
    DEFAULT_VISIBILITY_SPRING,
  );
  const xSpring = useSpring(targetX, highlightSpringConfig);
  const ySpring = useSpring(targetY, highlightSpringConfig);
  const wSpring = useSpring(targetW, highlightSpringConfig);
  const hSpring = useSpring(targetH, highlightSpringConfig);
  const opacitySpring = useSpring(targetOpacity, visibilitySpringConfig);

  const x = reduceMotion ? targetX : xSpring;
  const y = reduceMotion ? targetY : ySpring;
  const width = reduceMotion ? targetW : wSpring;
  const height = reduceMotion ? targetH : hSpring;
  const opacity = reduceMotion ? targetOpacity : opacitySpring;
  const handleActivate = useCallback((element: HTMLButtonElement | null) => {
    activeRef.current = element;
  }, []);

  useAnimationFrame(() => {
    const el = activeRef.current;
    const container = containerRef.current;
    if (!el || !container || !el.isConnected) {
      activeRef.current = null;
      targetOpacity.set(0);
      return;
    }
    const cb = container.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    targetX.set(b.left - cb.left);
    targetY.set(b.top - cb.top);
    targetW.set(b.width);
    targetH.set(b.height);
    targetOpacity.set(1);
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto flex items-end bg-neutral-200 shadow-2xl shadow-black/40 backdrop-blur-md dark:bg-neutral-900",
        className,
      )}
      role="toolbar"
      aria-label={ariaLabel}
      style={{
        backgroundColor: colors?.surface,
        borderRadius: resolvedLayout.radius,
        gap: resolvedLayout.gap,
        height: resolvedLayout.height,
        padding: resolvedLayout.padding,
      }}
      onMouseMove={(event) => mouseX.set(event.clientX)}
      onMouseLeave={() => {
        mouseX.set(Infinity);
        activeRef.current = null;
      }}
      // Clear only when focus leaves the dock entirely, so keyboard
      // tabbing slides the highlight instead of dropping it.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          activeRef.current = null;
        }
      }}
    >
      {/* The single highlight. It lives behind every button and is positioned
          purely by motion values — never mounted/unmounted, never projected,
          so it can't flicker against the icons in either direction. */}
      <motion.div
        aria-hidden
        style={{
          x,
          y,
          width,
          height,
          opacity,
          backgroundColor: colors?.highlight,
          borderRadius: resolvedLayout.itemRadius,
        }}
        className="pointer-events-none absolute left-0 top-0 z-20 bg-neutral-300 shadow-lg shadow-black/20 dark:bg-neutral-700"
      />

      {items.map((item) => (
        <DockButton
          key={item.id}
          item={item}
          mouseX={mouseX}
          baseSize={baseSize}
          maxSize={maxSize}
          influence={influence}
          colors={colors}
          iconScale={resolvedLayout.iconScale}
          itemRadius={resolvedLayout.itemRadius}
          jelly={motionConfig?.jelly ?? 0.08}
          onActivate={handleActivate}
          sizeSpring={motionConfig?.sizeSpring}
          tapScale={motionConfig?.tapScale ?? 0.88}
        />
      ))}
    </div>
  );
}

function DockButton({
  item,
  mouseX,
  baseSize,
  maxSize,
  influence,
  colors,
  iconScale,
  itemRadius,
  jelly,
  onActivate,
  sizeSpring,
  tapScale,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
  baseSize: number;
  maxSize: number;
  influence: number;
  colors?: DockColors;
  iconScale: number;
  itemRadius: number;
  jelly: number;
  onActivate: (el: HTMLButtonElement | null) => void;
  sizeSpring?: DockSpring;
  tapScale: number;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const restingSize = useMotionValue(baseSize);
  const expandedSize = useMotionValue(maxSize);
  const influenceDistance = useMotionValue(influence);

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return x - (bounds.x + bounds.width / 2);
  });

  const targetSize = useTransform(
    [distance, restingSize, expandedSize, influenceDistance],
    ([latestDistance, latestBaseSize, latestMaxSize, latestInfluence]: number[]) => {
      const proximity = 1 - Math.min(Math.abs(latestDistance) / latestInfluence, 1);
      return latestBaseSize + (latestMaxSize - latestBaseSize) * proximity;
    },
  );

  useEffect(() => {
    restingSize.set(baseSize);
    expandedSize.set(maxSize);
    influenceDistance.set(Math.max(influence, 1));
  }, [baseSize, expandedSize, influence, influenceDistance, maxSize, restingSize]);

  const sizeSpringConfig = resolveSpring(sizeSpring, DEFAULT_SIZE_SPRING);
  // Size is owned solely by this spring — nothing competes with it.
  const size = useSpring(reduceMotion ? restingSize : targetSize, sizeSpringConfig);

  // Subtle "jelly" squish from how fast the icon is growing/shrinking.
  const sizeVelocity = useVelocity(size);
  const iconScaleX = useTransform(
    sizeVelocity,
    [-500, 0, 500],
    reduceMotion ? [1, 1, 1] : [1 - jelly, 1, 1 + jelly],
  );
  const iconScaleY = useTransform(
    sizeVelocity,
    [-500, 0, 500],
    reduceMotion ? [1, 1, 1] : [1 + jelly * 0.75, 1, 1 - jelly * 0.5],
  );
  const buttonStyle: DockButtonStyle = {
    width: size,
    height: size,
    backgroundColor: colors?.item,
    borderRadius: itemRadius,
    color: colors?.icon,
    "--tw-ring-color": colors?.focusRing,
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      style={buttonStyle}
      onClick={item.onClick}
      onHoverStart={() => onActivate(ref.current)}
      onFocus={() => onActivate(ref.current)}
      whileTap={reduceMotion ? undefined : { scale: tapScale }}
      // Transparent + z-10 so the shared highlight shows through behind it.
      className="group relative grid place-items-center bg-neutral-400 text-zinc-200 outline-none ring-cyan-400/70 transition-colors focus-visible:ring-2 dark:bg-neutral-800"
      aria-label={item.label}
    >
      <motion.span
        style={{
          scaleX: iconScaleX,
          scaleY: iconScaleY,
          transformOrigin: "center",
          width: `${iconScale * 100}%`,
          height: `${iconScale * 100}%`,
        }}
        className="pointer-events-none z-30 flex items-center justify-center"
      >
        {item.icon}
      </motion.span>
    </motion.button>
  );
}

"use client";

import {
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
import { useRef } from "react";

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface DockProps {
  items: DockItem[];
  baseSize?: number;
  maxSize?: number;
  influence?: number;
  className?: string;
}

const SIZE_SPRING = {
  mass: 0.1,
  stiffness: 170,
  damping: 14,
} as const;

const HIGHLIGHT_SPRING = {
  mass: 0.22,
  stiffness: 200,
  damping: 20,
} as const;

export function Dock({
  items,
  baseSize = 44,
  maxSize = 80,
  influence = 140,
  className = "",
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

  const xSpring = useSpring(targetX, HIGHLIGHT_SPRING);
  const ySpring = useSpring(targetY, HIGHLIGHT_SPRING);
  const wSpring = useSpring(targetW, HIGHLIGHT_SPRING);
  const hSpring = useSpring(targetH, HIGHLIGHT_SPRING);
  const opacitySpring = useSpring(targetOpacity, { stiffness: 200, damping: 25 });

  const x = reduceMotion ? targetX : xSpring;
  const y = reduceMotion ? targetY : ySpring;
  const width = reduceMotion ? targetW : wSpring;
  const height = reduceMotion ? targetH : hSpring;
  const opacity = reduceMotion ? targetOpacity : opacitySpring;

  useAnimationFrame(() => {
    const el = activeRef.current;
    const container = containerRef.current;
    if (!el || !container) {
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
      className={`relative mx-auto flex items-end gap-3 h-10 rounded-2xl bg-neutral-200 dark:bg-neutral-900 px-2 py-2 shadow-2xl shadow-black/40 backdrop-blur-md ${className}`}
      role="toolbar"
      aria-label="Dock"
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
        style={{ x, y, width, height, opacity }}
        className="pointer-events-none absolute left-0 top-0 z-20 rounded-xl bg-neutral-300 dark:bg-neutral-700 shadow-lg shadow-black/20"
      />

      {items.map((item) => (
        <DockButton
          key={item.id}
          item={item}
          mouseX={mouseX}
          baseSize={baseSize}
          maxSize={maxSize}
          influence={influence}
          onActivate={(el) => (activeRef.current = el)}
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
  onActivate,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
  baseSize: number;
  maxSize: number;
  influence: number;
  onActivate: (el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const restingSize = useMotionValue(baseSize);

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return influence + 1;
    return x - (bounds.x + bounds.width / 2);
  });

  const targetSize = useTransform(
    distance,
    [-influence, 0, influence],
    [baseSize, maxSize, baseSize],
    { clamp: true },
  );

  // Size is owned solely by this spring — nothing competes with it.
  const size = useSpring(reduceMotion ? restingSize : targetSize, SIZE_SPRING);

  // Subtle "jelly" squish from how fast the icon is growing/shrinking.
  const sizeVelocity = useVelocity(size);
  const iconScaleX = useTransform(
    sizeVelocity,
    [-500, 0, 500],
    reduceMotion ? [1, 1, 1] : [0.92, 1, 1.08],
  );
  const iconScaleY = useTransform(
    sizeVelocity,
    [-500, 0, 500],
    reduceMotion ? [1, 1, 1] : [1.06, 1, 0.96],
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ width: size, height: size }}
      onClick={item.onClick}
      onHoverStart={() => onActivate(ref.current)}
      onFocus={() => onActivate(ref.current)}
      whileTap={{ scale: 0.88 }}
      // Transparent + z-10 so the shared highlight shows through behind it.
      className="group relative grid place-items-center rounded-xl bg-neutral-400 dark:bg-neutral-800 text-zinc-200 outline-none ring-cyan-400/70 transition-colors focus-visible:ring-2"
      aria-label={item.label}
    >
      <motion.span
        style={{ scaleX: iconScaleX, scaleY: iconScaleY, transformOrigin: "center" }}
        className="pointer-events-none flex z-30 size-[55%] items-center justify-center"
      >
        {item.icon}
      </motion.span>
    </motion.button>
  );
}

"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type InteractiveGridHeroEffects = {
  /** Cell opacity at the strongest point of the pointer response. */
  activeOpacity?: number;
  /** Maximum corner radius, in pixels. */
  cornerRadius?: number;
  /** Maximum inset applied to an active cell, as a percentage. */
  inset?: number;
  /** Cell opacity outside the pointer response. */
  restingOpacity?: number;
};

export type InteractiveGridHeroSpring = {
  bounce?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  visualDuration?: number;
};

export type InteractiveGridHeroProps = {
  /** Approximate resting size of each square, in pixels. */
  cellSize?: number;
  className?: string;
  effects?: InteractiveGridHeroEffects;
  /** Space between cells, in pixels. */
  gap?: number;
  interactive?: boolean;
  /** Radius of the cursor response, measured in grid cells. */
  proximity?: number;
  spring?: InteractiveGridHeroSpring;
};

type GridMetrics = {
  cellSize: number;
  columns: number;
  rows: number;
};

type GridCellProps = {
  effects: Required<InteractiveGridHeroEffects>;
  centerX: number;
  centerY: number;
  pointerActive: MotionValue<number>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  radius: number;
};

const DEFAULT_CELL_SIZE = 72;
const DEFAULT_PROXIMITY = 4.35;
const DEFAULT_GAP = 4;
const DEFAULT_EFFECTS = {
  activeOpacity: 1,
  cornerRadius: 20,
  inset: 5.5,
  restingOpacity: 0.72,
} satisfies Required<InteractiveGridHeroEffects>;
const DEFAULT_SPRING = {
  damping: 38,
  mass: 1,
  stiffness: 520,
} satisfies Required<Pick<InteractiveGridHeroSpring, "damping" | "mass" | "stiffness">>;
const INITIAL_METRICS: GridMetrics = {
  cellSize: DEFAULT_CELL_SIZE,
  columns: 12,
  rows: 10,
};

function getGridMetrics(
  width: number,
  height: number,
  targetCellSize: number,
  gap: number,
): GridMetrics {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const columns = Math.max(1, Math.ceil((safeWidth + gap) / (targetCellSize + gap)));
  const cellSize = Math.max(1, (safeWidth - gap * (columns - 1)) / columns);
  const rows = Math.max(1, Math.ceil((safeHeight + gap) / (cellSize + gap)));

  return { cellSize, columns, rows };
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveSpring(spring: InteractiveGridHeroSpring | undefined) {
  if (spring?.visualDuration !== undefined || spring?.bounce !== undefined) {
    return {
      bounce: spring.bounce ?? 0,
      visualDuration: spring.visualDuration ?? 0.3,
    };
  }

  return {
    damping: spring?.damping ?? DEFAULT_SPRING.damping,
    mass: spring?.mass ?? DEFAULT_SPRING.mass,
    stiffness: spring?.stiffness ?? DEFAULT_SPRING.stiffness,
  };
}

function GridCell({
  centerX,
  centerY,
  effects,
  pointerActive,
  pointerX,
  pointerY,
  radius,
}: GridCellProps) {
  const influence = useTransform(() => {
    const distance = Math.hypot(pointerX.get() - centerX, pointerY.get() - centerY);
    const proximity = Math.max(0, 1 - distance / radius);

    return smoothstep(proximity) * pointerActive.get();
  });
  const clipPath = useTransform(
    influence,
    (value) => `inset(${value * effects.inset}% round ${value * effects.cornerRadius}px)`,
  );
  const opacity = useTransform(influence, [0, 1], [effects.restingOpacity, effects.activeOpacity]);

  return (
    <motion.div
      className="rounded-sm border-r border-b border-border/70 bg-background"
      style={{ clipPath, opacity }}
    />
  );
}

export function InteractiveGridHero({
  cellSize: targetCellSize = DEFAULT_CELL_SIZE,
  className,
  effects,
  gap = DEFAULT_GAP,
  interactive = true,
  proximity = DEFAULT_PROXIMITY,
  spring,
}: InteractiveGridHeroProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const pointerActive = useMotionValue(0);
  const smoothPointerActive = useSpring(pointerActive, resolveSpring(spring));
  const shouldReduceMotion = useReducedMotion();
  const activeValue = shouldReduceMotion ? pointerActive : smoothPointerActive;
  const [metrics, setMetrics] = React.useState(INITIAL_METRICS);
  const resolvedEffects = {
    activeOpacity: clamp(effects?.activeOpacity ?? DEFAULT_EFFECTS.activeOpacity, 0, 1),
    cornerRadius: Math.max(0, effects?.cornerRadius ?? DEFAULT_EFFECTS.cornerRadius),
    inset: Math.max(0, effects?.inset ?? DEFAULT_EFFECTS.inset),
    restingOpacity: clamp(effects?.restingOpacity ?? DEFAULT_EFFECTS.restingOpacity, 0, 1),
  };
  const resolvedGap = Math.max(0, gap);

  React.useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateMetrics = () => {
      const rect = container.getBoundingClientRect();
      setMetrics(
        getGridMetrics(rect.width, rect.height, Math.max(32, targetCellSize), resolvedGap),
      );
    };

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(container);
    updateMetrics();

    return () => resizeObserver.disconnect();
  }, [resolvedGap, targetCellSize]);

  React.useEffect(() => {
    if (!interactive) {
      pointerActive.set(0);
    }
  }, [interactive, pointerActive]);

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        !interactive ||
        event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      pointerX.set(event.clientX - rect.left);
      pointerY.set(event.clientY - rect.top);
      pointerActive.set(1);
    },
    [interactive, pointerActive, pointerX, pointerY],
  );

  const handlePointerLeave = React.useCallback(() => {
    pointerActive.set(0);
  }, [pointerActive]);

  const cellCount = metrics.columns * metrics.rows;
  const cells = React.useMemo(
    () =>
      Array.from({ length: cellCount }, (_, index) => ({
        centerX: ((index % metrics.columns) + 0.5) * metrics.cellSize,
        centerY: (Math.floor(index / metrics.columns) + 0.5) * metrics.cellSize,
        id: `${Math.floor(index / metrics.columns)}-${index % metrics.columns}`,
      })),
    [cellCount, metrics.cellSize, metrics.columns],
  );
  const responseRadius = metrics.cellSize * Math.max(1, proximity);

  return (
    <div
      aria-hidden="true"
      className={cn("relative isolate min-h-svh w-full overflow-hidden bg-accent p-5", className)}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={containerRef}
    >
      <div
        className="absolute inset-0 grid content-start"
        style={{
          gap: `${resolvedGap}px`,
          gridAutoRows: `${metrics.cellSize}px`,
          gridTemplateColumns: `repeat(${metrics.columns}, ${metrics.cellSize}px)`,
        }}
      >
        {cells.map((cell) => (
          <GridCell
            centerX={cell.centerX}
            centerY={cell.centerY}
            effects={resolvedEffects}
            key={cell.id}
            pointerActive={activeValue}
            pointerX={pointerX}
            pointerY={pointerY}
            radius={responseRadius}
          />
        ))}
      </div>
    </div>
  );
}

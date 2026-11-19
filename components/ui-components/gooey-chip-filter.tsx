"use client";

import { AnimatePresence, motion, type Transition, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type GooeyChipItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
};

export type GooeyChipFilterProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  items: readonly GooeyChipItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  label?: string;
  selectedColor?: string;
  selectedForeground?: string;
};

type Rect = { x: number; y: number; w: number; h: number };
type BridgeShape = Rect & { key: string; axis: "x" | "y" };

// The goo threshold is tuned so chips separated by these gaps never fuse on
// their own: only an animated bridge joins them.
const GAP_X = 8;
const GAP_Y = 14;
const BRIDGE_OVERLAP = 14;
const BRIDGE_INSET = 6;
const MIN_VERTICAL_OVERLAP = 20;
const GOO_PAD = 16;

// Chip height is h-9 and the icon slot is centred at pl-2.5 + 8px = 18px,
// so a circle of CHIP_H centred on the icon fits the pill's left cap exactly.
const CHIP_H = 36;

// Fill in: a droplet pops out of the icon, then pours rightward into the pill.
const fillIn: Transition = {
  scale: { type: "spring", stiffness: 700, damping: 46, mass: 0.6 },
  width: { type: "spring", stiffness: 520, damping: 44, mass: 0.8, delay: 0.05 },
};
// Fill out: the pill drains back into the icon, then the droplet shrinks away inside it.
const fillOut: Transition = {
  width: { duration: 0.18, ease: [0.55, 0, 0.45, 1] },
  scale: { duration: 0.12, ease: [0.4, 0, 1, 1], delay: 0.13 },
};

const chipBase =
  "relative inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pr-3.5 pl-2.5 text-sm font-medium leading-none";

function sameRects(a: Record<string, Rect>, b: Record<string, Rect>) {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => {
    const p = a[key];
    const q = b[key];
    return q && p.x === q.x && p.y === q.y && p.w === q.w && p.h === q.h;
  });
}

function isHorizontalNeighbour(a: Rect, b: Rect) {
  const gap = b.x - (a.x + a.w);
  return Math.abs(a.y - b.y) < 1 && gap >= 0 && gap <= GAP_X + 1;
}

function isVerticalNeighbour(a: Rect, b: Rect) {
  const gap = b.y - (a.y + a.h);
  const overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  return gap >= 0 && gap <= GAP_Y + 1 && overlap >= MIN_VERTICAL_OVERLAP;
}

/** Bridges between every pair of touching selected chips: left/right and top/bottom. */
/** Bridges between every pair of touching selected chips: left/right and top/bottom. */
function getBridges(ids: readonly string[], rects: Record<string, Rect>): BridgeShape[] {
  const bridges: BridgeShape[] = [];
  for (const aId of ids) {
    const a = rects[aId];
    if (!a) continue;
    for (const bId of ids) {
      const b = rects[bId];
      if (!b || aId === bId) continue;
      if (isHorizontalNeighbour(a, b)) {
        bridges.push({
          key: `${aId}|${bId}`,
          axis: "x",
          x: a.x + a.w - BRIDGE_OVERLAP,
          y: a.y,
          w: b.x - (a.x + a.w) + BRIDGE_OVERLAP * 2,
          h: a.h,
        });
      } else if (isVerticalNeighbour(a, b)) {
        const left = Math.max(a.x, b.x) + BRIDGE_INSET;
        const right = Math.min(a.x + a.w, b.x + b.w) - BRIDGE_INSET;
        bridges.push({
          key: `${aId}|${bId}`,
          axis: "y",
          x: left,
          y: a.y + a.h - BRIDGE_OVERLAP,
          w: right - left,
          h: b.y - (a.y + a.h) + BRIDGE_OVERLAP * 2,
        });
      }
    }
  }
  return bridges;
}

export function GooeyChipFilter({
  items,
  value,
  defaultValue = [],
  onValueChange,
  label = "Filters",
  selectedColor = "var(--foreground)",
  selectedForeground = "var(--background)",
  className,
  style,
  ...props
}: GooeyChipFilterProps) {
  const filterId = `goo-chip-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const reduceMotion = useReducedMotion() ?? false;

  const [internalValue, setInternalValue] = useState<readonly string[]>(defaultValue);
  const selectedIds = value ?? internalValue;
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const listRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<string, HTMLElement>());
  const [rects, setRects] = useState<Record<string, Rect>>({});

  const measure = useCallback(() => {
    const next: Record<string, Rect> = {};
    for (const [id, node] of chipRefs.current) {
      next[id] = {
        x: node.offsetLeft,
        y: node.offsetTop,
        w: node.offsetWidth,
        h: node.offsetHeight,
      };
    }
    setRects((prev) => (sameRects(prev, next) ? prev : next));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the items change.
  useLayoutEffect(() => {
    measure();
  }, [measure, items]);

  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  const toggle = (id: string) => {
    const next = selected.has(id)
      ? selectedIds.filter((current) => current !== id)
      : [...selectedIds, id];
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const bridges = getBridges(
    items.filter((item) => selected.has(item.id)).map((item) => item.id),
    rects,
  );
  const listStyle = { columnGap: GAP_X, rowGap: GAP_Y } satisfies CSSProperties;

  return (
    <div
      className={cn("relative isolate", className)}
      style={{ ...style, ["--goo-fill" as string]: selectedColor }}
      {...props}
    >
      <GooFilter id={filterId} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ inset: -GOO_PAD, padding: GOO_PAD, filter: `url(#${filterId})` }}
      >
        <div className={"relative flex flex-wrap"} style={listStyle}>
          {items.map((item) => {
            const isSelected = selected.has(item.id);

            return (
              <div className={chipBase} key={item.id}>
                <motion.span
                  animate={
                    isSelected
                      ? { scale: 1, width: rects[item.id]?.w ?? "100%" }
                      : { scale: 0, width: CHIP_H }
                  }
                  className="absolute top-0 left-0 h-full rounded-full"
                  initial={false}
                  style={{
                    backgroundColor: "var(--goo-fill)",
                    transformOrigin: `${CHIP_H / 2}px 50%`,
                  }}
                  transition={reduceMotion ? { duration: 0 } : isSelected ? fillIn : fillOut}
                />
                <ChipContent ghost item={item} selected={isSelected} reduceMotion={reduceMotion} />
              </div>
            );
          })}

          <AnimatePresence initial={false}>
            {bridges.map((bridge) => (
              <Bridge bridge={bridge} key={bridge.key} reduceMotion={reduceMotion} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* biome-ignore lint/a11y/useSemanticElements: fieldset's min-content sizing breaks flex-wrap. */}
      <div
        aria-label={label}
        className={"relative flex flex-wrap"}
        ref={listRef}
        role="group"
        style={listStyle}
      >
        {items.map((item) => {
          const isSelected = selected.has(item.id);

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                chipBase,
                "cursor-pointer select-none outline-none transition-[color,background-color,box-shadow] duration-200",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-50",
                !isSelected &&
                  "text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] hover:bg-muted hover:text-foreground",
              )}
              disabled={item.disabled}
              key={item.id}
              onClick={() => toggle(item.id)}
              ref={(node) => {
                if (node) chipRefs.current.set(item.id, node);
                else chipRefs.current.delete(item.id);
              }}
              style={isSelected ? { color: selectedForeground } : undefined}
              type="button"
            >
              <ChipContent item={item} selected={isSelected} reduceMotion={reduceMotion} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const mergeAlong: Transition = { type: "spring", stiffness: 560, damping: 48, delay: 0.08 };
const mergeAcross: Transition = { type: "spring", stiffness: 440, damping: 42, delay: 0.13 };
const splitAcross: Transition = { duration: 0.1, ease: [0.4, 0, 1, 1] };
const splitAlong: Transition = { duration: 0.16, ease: [0.4, 0, 0.2, 1], delay: 0.06 };

/**
 * Liquid neck between two touching selected chips, on either axis.
 * Merge: a thin strand shoots across, then swells. Split: it pinches, then snaps back.
 */
function Bridge({ bridge, reduceMotion }: { bridge: BridgeShape; reduceMotion: boolean }) {
  const horizontal = bridge.axis === "x";
  const thin = horizontal ? { scaleX: 0, scaleY: 0.3 } : { scaleX: 0.3, scaleY: 0 };
  const instant: Transition = { duration: 0 };
  const merge: Transition = reduceMotion
    ? instant
    : horizontal
      ? { scaleX: mergeAlong, scaleY: mergeAcross }
      : { scaleX: mergeAcross, scaleY: mergeAlong };
  const split: Transition = reduceMotion
    ? instant
    : horizontal
      ? { scaleX: splitAlong, scaleY: splitAcross }
      : { scaleX: splitAcross, scaleY: splitAlong };

  return (
    <motion.span
      animate={{ scaleX: 1, scaleY: 1, transition: merge }}
      className="absolute"
      exit={{ ...thin, transition: split }}
      initial={thin}
      style={{
        left: bridge.x,
        top: bridge.y,
        width: bridge.w,
        height: bridge.h,
        backgroundColor: "var(--goo-fill)",
      }}
    />
  );
}

function ChipContent({
  item,
  selected,
  ghost = false,
  reduceMotion,
}: {
  item: GooeyChipItem;
  selected: boolean;
  ghost?: boolean;
  reduceMotion: boolean;
}) {
  const fade: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.23, 1, 0.32, 1] };

  return (
    <span className={cn("contents", ghost && "[&>*]:invisible")}>
      <span className="relative grid size-4 shrink-0 place-items-center [&_svg]:size-4">
        {ghost ? null : (
          <AnimatePresence initial={false} mode="popLayout">
            {selected ? (
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 grid place-items-center"
                exit={{ opacity: 0, scale: 0.6 }}
                initial={{ opacity: 0, scale: 0.6 }}
                key="check"
                transition={fade}
              >
                <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
                  <motion.path
                    animate={{ pathLength: 1 }}
                    d="M3.5 8.5 6.5 11.5 12.5 4.5"
                    initial={{ pathLength: reduceMotion ? 1 : 0 }}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.28, delay: 0.06, ease: "easeOut" }
                    }
                  />
                </svg>
              </motion.span>
            ) : (
              <motion.span
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="absolute inset-0 grid place-items-center"
                exit={{ opacity: 0, scale: 0.6, rotate: -45 }}
                initial={{ opacity: 0, scale: 0.6, rotate: 45 }}
                key="idle"
                transition={fade}
              >
                {item.icon ?? (
                  <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
                    <path
                      d="M8 3.5v9M3.5 8h9"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth={1.75}
                    />
                  </svg>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        )}
      </span>
      <span>{item.label}</span>
      {item.count !== undefined ? (
        <span className={cn("tabular-nums", !ghost && "opacity-60")}>{item.count}</span>
      ) : null}
    </span>
  );
}

function GooFilter({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id={id}
          width="140%"
          x="-20%"
          y="-50%"
        >
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="5" />
          <feColorMatrix
            in="blur"
            result="goo"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
          />
          <feGaussianBlur in="goo" result="shadowBlur" stdDeviation="4" />
          <feOffset dy="3" in="shadowBlur" result="shadowOffset" />
          <feColorMatrix
            in="shadowOffset"
            result="shadow"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"
          />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="goo" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export default GooeyChipFilter;

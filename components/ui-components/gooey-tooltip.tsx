"use client";

import { motion, type Transition, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";

export type GooeyTooltipProps = Omit<ComponentPropsWithoutRef<"button">, "content"> & {
  /** Tooltip body. Keep it short: a label or a hint. */
  content: ReactNode;
  /** Trigger content, usually an icon or a short label. */
  children: ReactNode;
  side?: Side;
  /** Gap between the trigger and the tooltip, in CSS pixels. */
  offset?: number;
  /** Fill shared by the trigger and the tooltip so they can melt together. */
  color?: string;
  /** Text color on top of the fill. */
  foreground?: string;
  /** Corner radius of the trigger shape. Large values give a pill or circle. */
  radius?: number;
  /** Hover delay before opening, in milliseconds. */
  delay?: number;
};

const DIRECTIONS: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const NUB = 10; // diameter of the drip that settles as the tooltip's pointer
// Open: the droplet travels on a lively spring. Its length along the travel
// axis springs out faster than its width, so it leaves as a long, narrow drip
// and spreads into the tooltip as it lands. The tail is softer, so it trails.
const travelOpen: Transition = { type: "spring", stiffness: 520, damping: 36, mass: 0.7 };
const alongOpen: Transition = { type: "spring", stiffness: 620, damping: 38, mass: 0.7 };
const acrossOpen: Transition = { type: "spring", stiffness: 360, damping: 30, mass: 0.7 };
const tailOpen: Transition = { type: "spring", stiffness: 260, damping: 26, mass: 0.7 };
// Close: firmer, fully damped springs drain it straight back without wobble.
const travelClose: Transition = { type: "spring", stiffness: 640, damping: 52, mass: 0.7 };
const shapeClose: Transition = { type: "spring", stiffness: 700, damping: 54, mass: 0.7 };
const tailClose: Transition = { type: "spring", stiffness: 760, damping: 56, mass: 0.7 };

export function GooeyTooltip({
  content,
  children,
  side = "top",
  offset = 14,
  color = "var(--foreground)",
  foreground = "var(--background)",
  radius = 9999,
  delay = 60,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: GooeyTooltipProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `goo-tip-${id}`;
  const tooltipId = `goo-tip-content-${id}`;
  const reduceMotion = useReducedMotion() ?? false;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState({ w: 0, h: 0 });
  const [tip, setTip] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const triggerNode = triggerRef.current;
    const tipNode = tipRef.current;
    if (!triggerNode || !tipNode) return;
    const measure = () => {
      setTrigger({ w: triggerNode.offsetWidth, h: triggerNode.offsetHeight });
      setTip({ w: tipNode.offsetWidth, h: tipNode.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(triggerNode);
    observer.observe(tipNode);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback((wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), wait);
  }, []);
  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setOpen(false);
  }, []);

  // Geometry, relative to the trigger's center.
  const dir = DIRECTIONS[side];
  const vertical = dir.y !== 0;
  const triggerHalf = vertical ? trigger.h / 2 : trigger.w / 2;
  const tipHalf = vertical ? tip.h / 2 : tip.w / 2;
  const tipDistance = triggerHalf + offset + tipHalf;
  const nubDistance = triggerHalf + offset;
  const drop = Math.max(8, Math.min(trigger.w, trigger.h) * 0.45);
  const restDistance = Math.max(0, triggerHalf - drop / 2 - 2);
  const ready = trigger.w > 0 && tip.w > 0;

  // The goo layer needs a real box around everything it draws, or the filter clips it.
  const pad = Math.max(tip.w, tip.h) + offset + 24;
  const cx = pad + trigger.w / 2;
  const cy = pad + trigger.h / 2;
  const at = (distance: number) => ({ x: dir.x * distance, y: dir.y * distance });

  const rest = at(restDistance);
  const final = at(tipDistance);
  const nubRest = at(Math.max(0, triggerHalf - NUB / 2 - 2));
  const nubFinal = at(nubDistance);

  const instant: Transition = { duration: 0 };
  const along = vertical ? "height" : "width";
  const across = vertical ? "width" : "height";
  const travelTransition = reduceMotion ? instant : open ? travelOpen : travelClose;
  const shapeTransition: Transition = reduceMotion
    ? instant
    : open
      ? { [along]: alongOpen, [across]: acrossOpen, borderRadius: acrossOpen }
      : shapeClose;
  const tailTransition = reduceMotion ? instant : open ? tailOpen : tailClose;

  const end = open ? final : rest;
  const blobShape = open
    ? { width: tip.w, height: tip.h, borderRadius: Math.min(tip.h / 2, 14) }
    : { width: drop, height: drop, borderRadius: drop / 2 };

  return (
    <span className={cn("relative inline-flex", open && "z-20")}>
      <GooFilter id={filterId} />

      {ready ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: -pad,
            top: -pad,
            width: trigger.w + pad * 2,
            height: trigger.h + pad * 2,
            filter: `url(#${filterId})`,
          }}
        >
          <span
            className="absolute"
            style={{
              left: cx - trigger.w / 2,
              top: cy - trigger.h / 2,
              width: trigger.w,
              height: trigger.h,
              borderRadius: Math.min(radius, trigger.w / 2, trigger.h / 2),
              backgroundColor: color,
            }}
          />
          <motion.span
            animate={{ x: open ? nubFinal.x : nubRest.x, y: open ? nubFinal.y : nubRest.y }}
            className="absolute rounded-full"
            initial={false}
            style={{
              left: cx - NUB / 2,
              top: cy - NUB / 2,
              width: NUB,
              height: NUB,
              backgroundColor: color,
            }}
            transition={tailTransition}
          />
          <motion.span
            animate={{ x: end.x, y: end.y }}
            className="absolute size-0"
            initial={{ x: rest.x, y: rest.y }}
            style={{ left: cx, top: cy }}
            transition={travelTransition}
          >
            <motion.span
              animate={blobShape}
              className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"
              initial={{ width: drop, height: drop, borderRadius: drop / 2 }}
              style={{ backgroundColor: color }}
              transition={shapeTransition}
            />
          </motion.span>
        </span>
      ) : null}

      <button
        aria-describedby={open ? tooltipId : undefined}
        className={cn(
          "relative inline-flex size-10 items-center justify-center outline-none [&_svg]:size-[18px]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        onBlur={(event) => {
          hide();
          onBlur?.(event);
        }}
        onFocus={(event) => {
          show(0);
          onFocus?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") hide();
          onKeyDown?.(event);
        }}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") show(delay);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          hide();
          onPointerLeave?.(event);
        }}
        ref={triggerRef}
        style={{ color: foreground, borderRadius: radius, ...style }}
        type="button"
        {...props}
      >
        {children}
      </button>

      {/* Crisp tooltip text, revealed as the droplet lands. */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-10"
        style={{ transform: `translate(calc(-50% + ${final.x}px), calc(-50% + ${final.y}px))` }}
      >
        <motion.div
          animate={
            open
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : { opacity: 0, scale: 0.94, filter: "blur(3px)" }
          }
          className="whitespace-nowrap px-3 py-1.5 text-xs font-medium leading-tight"
          id={tooltipId}
          initial={false}
          ref={tipRef}
          role="tooltip"
          style={{ color: foreground }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : open
                ? { duration: 0.18, delay: 0.07, ease: [0.23, 1, 0.32, 1] }
                : { duration: 0.06 }
          }
        >
          {content}
        </motion.div>
      </div>
    </span>
  );
}

function GooFilter({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <defs>
        <filter colorInterpolationFilters="sRGB" id={id}>
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="5" />
          <feColorMatrix
            in="blur"
            result="goo"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
          />
          <feGaussianBlur in="goo" result="shadowBlur" stdDeviation="4" />
          <feOffset dy="3" in="shadowBlur" result="shadowOffset" />
          <feColorMatrix
            in="shadowOffset"
            result="shadow"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.2 0"
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

export default GooeyTooltip;

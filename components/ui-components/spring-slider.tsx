"use client";

import NumberFlow from "@number-flow/react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type SpringSliderProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange" | "children"
> & {
  defaultValue?: number;
  disabled?: boolean;
  /** Page Up / Page Down jump. Defaults to ten steps. */
  largeStep?: number;
  max?: number;
  min?: number;
  onValueChange?: (value: number) => void;
  /** Tooltip body. Return anything; the default rolls the number with NumberFlow. */
  renderTooltip?: (value: number) => ReactNode;
  step?: number;
  /** Dot count under the track. `false` hides them. */
  ticks?: number | false;
  value?: number;
  /** Spoken value, when the number alone is not the point. */
  valueText?: (value: number) => string;
};

/** Follows the pointer closely enough to feel direct. */
const DRAG_SPRING = { damping: 44, mass: 0.4, stiffness: 400 } as const;
/** Carries visible overshoot, so a snap to a tick lands with weight. */
const SETTLE_SPRING = { damping: 26, mass: 0.5, stiffness: 200 } as const;
/** Still a spring, so the same code path runs; just over before it is seen. */
const REDUCED_SPRING = { damping: 80, mass: 0.2, stiffness: 3000 } as const;

const TOOLTIP_EASE = [0.23, 1, 0.32, 1] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function SpringSlider({
  className,
  defaultValue,
  disabled = false,
  largeStep,
  max = 100,
  min = 0,
  onValueChange,
  renderTooltip,
  step = 1,
  ticks,
  value,
  valueText,
  ...props
}: SpringSliderProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const labelId = useId();

  const snap = useCallback(
    (raw: number) => {
      const steps = Math.round((raw - min) / step);
      return clamp(Number((min + steps * step).toFixed(10)), min, max);
    },
    [max, min, step],
  );

  const [uncontrolled, setUncontrolled] = useState(() => snap(defaultValue ?? min));
  const isControlled = value !== undefined;
  const current = snap(isControlled ? value : uncontrolled);

  const [isDragging, setIsDragging] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  // The thumb is a circle the height of the rail, so one measurement gives both
  // its diameter and the distance it may travel.
  const [rail, setRail] = useState({ size: 0, travel: 0 });

  useLayoutEffect(() => {
    const element = railRef.current;
    if (!element) return;

    const measure = () => {
      const { height, width } = element.getBoundingClientRect();
      setRail({ size: height, travel: Math.max(width - height, 0) });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();

    return () => observer.disconnect();
  }, []);

  const target = useMotionValue(0);
  const springConfig = reduceMotion ? REDUCED_SPRING : isDragging ? DRAG_SPRING : SETTLE_SPRING;
  const offset = useSpring(target, springConfig);

  const fraction = max === min ? 0 : (current - min) / (max - min);

  useEffect(() => {
    const next = fraction * rail.travel;
    // Jump rather than spring the very first time, so the thumb does not fly in
    // from zero on mount or after a resize.
    if (offset.getPrevious() === undefined || rail.travel === 0) offset.jump(next);
    target.set(next);
  }, [fraction, rail.travel, offset, target]);

  // The fill is a full-width pill slid left behind the track's own rounded clip,
  // so its right cap tracks the thumb without a width or clip-path animation.
  const fillTransform = useMotionTemplate`translateX(${useTransform(
    offset,
    (position) => position - rail.travel,
  )}px)`;
  const thumbTransform = useMotionTemplate`translateX(${offset}px)`;
  const tooltipTransform = useMotionTemplate`translateX(calc(${useTransform(
    offset,
    (position) => position + rail.size / 2,
  )}px - 50%))`;

  const commit = useCallback(
    (raw: number) => {
      const next = snap(raw);
      if (!isControlled) setUncontrolled(next);
      if (next !== current) onValueChange?.(next);
    },
    [current, isControlled, onValueChange, snap],
  );

  const valueAtPointer = useCallback(
    (clientX: number) => {
      const element = railRef.current;
      if (!element) return current;

      const rect = element.getBoundingClientRect();
      const usable = Math.max(rect.width - rect.height, 1);
      // Measured from the thumb's centre, which starts half a thumb in.
      const ratio = clamp((clientX - rect.left - rect.height / 2) / usable, 0, 1);
      return min + ratio * (max - min);
    },
    [current, max, min],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    setIsDragging(true);
    commit(valueAtPointer(event.clientX));
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;
    commit(valueAtPointer(event.clientX));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const jump = largeStep ?? step * 10;

    const next = {
      ArrowDown: current - step,
      ArrowLeft: current - step,
      ArrowRight: current + step,
      ArrowUp: current + step,
      End: max,
      Home: min,
      PageDown: current - jump,
      PageUp: current + jump,
    }[event.key];

    if (next === undefined) return;
    event.preventDefault();
    commit(next);
  };

  // Fraction digits follow the step, so a 0.25 step does not print as an integer.
  const numberFormat = useMemo(() => {
    const text = String(step);
    const point = text.indexOf(".");
    const digits = point === -1 ? 0 : Math.min(text.length - point - 1, 4);
    return { maximumFractionDigits: digits, minimumFractionDigits: digits };
  }, [step]);

  const stepCount = Math.floor((max - min) / step) + 1;
  const tickCount =
    ticks === false ? 0 : (ticks ?? (stepCount >= 2 && stepCount <= 9 ? stepCount : 5));
  const activeTick = tickCount > 1 ? Math.round(fraction * (tickCount - 1)) : 0;

  const isTooltipOpen = !disabled && (isDragging || isPeeking);

  return (
    <div className={cn("w-full select-none", disabled && "opacity-50", className)} {...props}>
      <div className="relative">
        <AnimatePresence>
          {isTooltipOpen ? (
            <motion.div
              animate={{ filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-0 z-10 mb-3 origin-bottom"
              exit={{
                filter: reduceMotion ? "blur(0px)" : "blur(6px)",
                opacity: 0,
                scale: reduceMotion ? 1 : 0.92,
                y: reduceMotion ? 0 : 8,
              }}
              initial={{
                filter: reduceMotion ? "blur(0px)" : "blur(6px)",
                opacity: 0,
                scale: reduceMotion ? 1 : 0.92,
                y: reduceMotion ? 0 : 8,
              }}
              style={{ transform: tooltipTransform }}
              transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: TOOLTIP_EASE }}
            >
              <div
                className={cn(
                  "grid h-14 min-w-16 place-items-center rounded-[1.35rem] px-4",
                  "bg-white text-[1.6rem] leading-none font-semibold text-neutral-700 tabular-nums",
                  "shadow-[0_1px_2px_rgb(0_0_0/6%),0_10px_24px_-8px_rgb(0_0_0/18%)]",
                  "dark:bg-[#242424] dark:text-neutral-100 dark:shadow-[0_1px_2px_rgb(0_0_0/40%),0_12px_28px_-8px_rgb(0_0_0/60%)]",
                )}
              >
                {renderTooltip ? (
                  renderTooltip(current)
                ) : (
                  // NumberFlow reads the motion preference itself, and
                  // `willChange` matters here: the value retargets on every
                  // pointer move while dragging.
                  <NumberFlow format={numberFormat} value={current} willChange />
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div
          aria-disabled={disabled || undefined}
          aria-labelledby={props["aria-label"] ? undefined : labelId}
          aria-orientation="horizontal"
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={current}
          aria-valuetext={valueText?.(current)}
          className={cn(
            "relative h-16 w-full touch-none p-1 rounded-full outline-none",
            "bg-white shadow-[inset_0_0_0_1px_rgb(0_0_0/5%),inset_0_2px_4px_rgb(0_0_0/6%)]",
            "dark:bg-[#131313] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/8%),inset_0_2px_5px_rgb(0_0_0/50%)]",
            "",
            disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
          )}
          onKeyDown={handleKeyDown}
          onPointerCancel={endDrag}
          onPointerDown={handlePointerDown}
          onPointerLeave={() => setIsPeeking(false)}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onBlur={() => setIsPeeking(false)}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible")) setIsPeeking(true);
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setIsPeeking(true);
          }}
          role="slider"
          tabIndex={disabled ? -1 : 0}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full" ref={railRef}>
            <motion.div
              aria-hidden="true"
              className={cn(
                "absolute inset-y-[0px] left-0 w-full rounded-full",
                "bg-[linear-gradient(180deg,#fdf3ad_0%,#f9e37f_58%,#f6dc69_100%)]",
                " ",
              )}
              style={{ transform: fillTransform }}
            />

            <motion.div
              animate={{ scale: isDragging && !reduceMotion ? 1.04 : 1 }}
              aria-hidden="true"
              className={cn(
                "absolute top-0 left-0 aspect-square h-full rounded-full",
                "bg-[radial-gradient(120%_120%_at_50%_18%,#f8de55_0%,#f0cb1f_52%,#e3b70c_100%)]",
                "shadow-[inset_0_1px_0_rgb(255_255_255/55%),0_2px_6px_rgb(190_150_0/38%),0_1px_2px_rgb(0_0_0/12%)]",
              )}
              style={{ transform: thumbTransform }}
              transition={SETTLE_SPRING}
            />
          </div>
        </div>
      </div>

      {tickCount > 0 ? (
        <div aria-hidden="true" className="relative mt-3.5 h-1.5">
          {Array.from({ length: tickCount }, (_, index) => {
            const tickFraction = tickCount === 1 ? 0 : index / (tickCount - 1);
            return (
              <motion.span
                animate={{
                  backgroundColor: index === activeTick ? "#f0cb1f" : "#c9c9c9",
                  scale: index === activeTick ? 1.15 : 1,
                }}
                className="absolute top-0 left-0 block size-1.5 rounded-full"
                key={tickFraction}
                style={{ x: rail.size / 2 + tickFraction * rail.travel - 3 }}
                transition={{ duration: reduceMotion ? 0.1 : 0.22, ease: TOOLTIP_EASE }}
              />
            );
          })}
        </div>
      ) : null}

      <span className="sr-only" id={labelId}>
        Value
      </span>
    </div>
  );
}

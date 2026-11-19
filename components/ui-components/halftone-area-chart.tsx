"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type HalftoneAreaPoint = {
  label: string;
  value: number;
};

export type HalftoneAreaChartProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  data: readonly HalftoneAreaPoint[];
  /** Plot height in CSS pixels, excluding the axis labels. */
  height?: number;
  /** Dot colors from the faint baseline to the dense edge under the line. */
  colors?: readonly string[];
  /** Grid pitch in CSS pixels. */
  cellSize?: number;
  /** How much the dots thin out toward the baseline, 0 to 1. */
  fade?: number;
  /** Intl number format for the headline value and the accessible table. */
  format?: Format;
  /** Locale used for number formatting. */
  locales?: Intl.LocalesArgument;
  /** Accessible name for the chart. */
  label?: string;
  /** Name of the series, used in the accessible data table. */
  seriesName?: string;
};

const LUT_SIZE = 40;
const FONT = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const TOP_ROOM = 0.14; // share of the plot kept free above the highest value
const REVEAL_SECONDS = 1.1;
const GUIDE_STIFFNESS = 320;
const GUIDE_DAMPING = 2 * Math.sqrt(GUIDE_STIFFNESS); // critically damped: glides, never overshoots

// Flow wake tuning, in CSS pixels per second.
const STIR_RADIUS = 64;
const GLYPH_START = 60;
const GLYPH_FULL = 420;
const DISPLACE = 0.009;
const SPLIT = 0.4;
const DIFFUSE = 7;
const DECAY = 1.8;

const defaultFormat: Format = { notation: "compact", maximumFractionDigits: 1 };
const changeFormat: Format = {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function toRgb(ctx: CanvasRenderingContext2D, color: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function buildPalette(colors: readonly string[]) {
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe || colors.length === 0) return Array.from({ length: LUT_SIZE }, () => "#888");
  const stops = colors.map((color) => toRgb(probe, color));
  return Array.from({ length: LUT_SIZE }, (_, index) => {
    const t = (index / (LUT_SIZE - 1)) * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(t));
    const from = stops[Math.max(0, i)];
    const to = stops[Math.min(stops.length - 1, i + 1)];
    const f = stops.length === 1 ? 0 : t - i;
    const mix = (k: number) => Math.round(from[k] + (to[k] - from[k]) * f);
    return `rgb(${mix(0)} ${mix(1)} ${mix(2)})`;
  });
}

/** Rounds a maximum up to a tidy 1, 2, 2.5, or 5 step so the chart has headroom. */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

/** Fritsch–Carlson tangents: a smooth curve that never overshoots the data. */
function monotoneTangents(ys: ArrayLike<number>) {
  const n = ys.length;
  const m = new Float64Array(n);
  if (n < 2) return m;
  const d = new Float64Array(n - 1);
  for (let k = 0; k < n - 1; k++) d[k] = ys[k + 1] - ys[k];
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2;
  for (let k = 0; k < n - 1; k++) {
    if (d[k] === 0) {
      m[k] = 0;
      m[k + 1] = 0;
      continue;
    }
    const a = m[k] / d[k];
    const b = m[k + 1] / d[k];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[k] = t * a * d[k];
      m[k + 1] = t * b * d[k];
    }
  }
  return m;
}

function sampleCurve(ys: ArrayLike<number>, m: ArrayLike<number>, t: number) {
  const n = ys.length;
  if (n === 0) return 0;
  if (n === 1) return ys[0];
  const k = Math.min(n - 2, Math.max(0, Math.floor(t)));
  const u = clamp01(t - k);
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * ys[k] +
    (u3 - 2 * u2 + u) * m[k] +
    (-2 * u3 + 3 * u2) * ys[k + 1] +
    (u3 - u2) * m[k + 1]
  );
}

function strokeFor(fx: number, fy: number) {
  let angle = Math.atan2(-fy, fx);
  if (angle < 0) angle += Math.PI;
  return ["-", "/", "|", "\\"][Math.round(angle / (Math.PI / 4)) % 4];
}

/**
 * An area chart drawn as a halftone. Scrubbing rolls the headline value, snaps a marker to
 * the nearest point, lights a column of dots as the guide, and stirs the dots
 * into ASCII strokes along the cursor's path.
 */
export function HalftoneAreaChart({
  data,
  height = 360,
  colors = ["#f6b08c", "#f0602a"],
  cellSize = 9,
  fade = 0.82,
  format = defaultFormat,
  locales = "en-US",
  label = "Area chart",
  seriesName = "Value",
  className,
  ...props
}: HalftoneAreaChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  activeRef.current = activeIndex;

  const values = useMemo(() => data.map((point) => Math.max(0, point.value)), [data]);
  const maxValue = niceMax(Math.max(0, ...values) / (1 - TOP_ROOM));
  const valueKey = values.join(",");
  const colorKey = colors.join("|");
  const count = data.length;

  const xAt = (index: number) => (count < 2 ? width / 2 : (index / (count - 1)) * width);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(plot);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const plot = plotRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!plot || !canvas || !ctx || width === 0) return;

    const palette = buildPalette(colorKey.split("|"));
    const targets = valueKey ? valueKey.split(",").map(Number) : [];
    const n = targets.length;
    const shown = new Float64Array(targets);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.max(2, Math.round(width / cellSize) + 1);
    const rows = Math.max(2, Math.round(height / cellSize) + 1);
    const pitchX = width / (cols - 1);
    const pitchY = height / (rows - 1);
    const topY = new Float32Array(cols);
    const flowX = new Float32Array(cols * rows);
    const flowY = new Float32Array(cols * rows);
    const buckets: number[][] = Array.from({ length: LUT_SIZE }, () => []);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, inside: false, fresh: true };

    // The guide glides on a critically damped spring and fades in and out.
    const guide = { x: -1, v: 0, alpha: 0 };
    const marker = markerRef.current;
    let reveal = reduceMotion ? 1 : 0;
    let frame = 0;
    let last = performance.now();
    let visible = true;

    const stepFlow = (dt: number) => {
      const follow = 1 - Math.exp(-dt * 20);
      const nx = pointer.x + (pointer.tx - pointer.x) * follow;
      const ny = pointer.y + (pointer.ty - pointer.y) * follow;
      const ease = 1 - Math.exp(-dt * 14);
      pointer.vx += ((nx - pointer.x) / dt - pointer.vx) * ease;
      pointer.vy += ((ny - pointer.y) / dt - pointer.vy) * ease;
      pointer.x = nx;
      pointer.y = ny;

      const speed = Math.min(2400, Math.hypot(pointer.vx, pointer.vy));
      const stirring = pointer.inside && speed > 4 && !reduceMotion;
      const inject = 1 - Math.exp(-dt * 16);
      const decay = Math.exp(-dt * DECAY);
      const diffuse = 1 - Math.exp(-dt * DIFFUSE);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          let fx = flowX[i];
          let fy = flowY[i];
          const l = col > 0 ? i - 1 : i;
          const r = col < cols - 1 ? i + 1 : i;
          const u = row > 0 ? i - cols : i;
          const d = row < rows - 1 ? i + cols : i;
          fx += ((flowX[l] + flowX[r] + flowX[u] + flowX[d]) / 4 - fx) * diffuse;
          fy += ((flowY[l] + flowY[r] + flowY[u] + flowY[d]) / 4 - fy) * diffuse;
          if (stirring) {
            const dx = col * pitchX - pointer.x;
            const dy = row * pitchY - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < STIR_RADIUS) {
              const falloff = smoothstep(1 - dist / STIR_RADIUS);
              const split = dist > 0.001 ? (speed * SPLIT) / dist : 0;
              fx += (pointer.vx + dx * split - fx) * falloff * inject;
              fy += (pointer.vy + dy * split - fy) * falloff * inject;
            }
          }
          fx *= decay;
          fy *= decay;
          if (Math.abs(fx) < 0.5 && Math.abs(fy) < 0.5) {
            fx = 0;
            fy = 0;
          }
          flowX[i] = fx;
          flowY[i] = fy;
        }
      }
    };

    const draw = (now: number) => {
      const dt = Math.max(0.001, Math.min(0.05, (now - last) / 1000));
      last = now;
      reveal = Math.min(1, reveal + dt / REVEAL_SECONDS);

      // Values glide to new data instead of jumping.
      const glide = reduceMotion ? 1 : 1 - Math.exp(-dt * 9);
      for (let k = 0; k < n; k++) shown[k] += (targets[k] - shown[k]) * glide;
      const tangents = monotoneTangents(shown);

      for (let col = 0; col < cols; col++) {
        const xNorm = col / (cols - 1);
        // The area sweeps up from the baseline, left to right.
        const local = smoothstep(reveal * 1.35 - xNorm * 0.35);
        const eased = 1 - (1 - local) ** 3;
        const value = n === 0 ? 0 : sampleCurve(shown, tangents, xNorm * (n - 1));
        topY[col] = height - (Math.max(0, value) / maxValue) * height * eased;
      }

      stepFlow(dt);

      const active = activeRef.current;
      if (active !== null) {
        const target = n < 2 ? width / 2 : (active / (n - 1)) * width;
        if (guide.x < 0 || guide.alpha < 0.01 || reduceMotion) {
          guide.x = target;
          guide.v = 0;
        } else {
          guide.v += (GUIDE_STIFFNESS * (target - guide.x) - GUIDE_DAMPING * guide.v) * dt;
          guide.x += guide.v * dt;
        }
      }
      const fadeTo = active !== null ? 1 : 0;
      guide.alpha = reduceMotion
        ? fadeTo
        : guide.alpha + (fadeTo - guide.alpha) * (1 - Math.exp(-dt * 14));
      const showGuide = guide.x >= 0 && guide.alpha > 0.01;

      // Where the curve sits under the guide, between grid columns.
      const guideCol = Math.min(cols - 1, Math.max(0, guide.x / pitchX));
      const c0 = Math.floor(guideCol);
      const c1 = Math.min(cols - 1, c0 + 1);
      const guideTop = topY[c0] + (topY[c1] - topY[c0]) * (guideCol - c0);

      if (marker) {
        marker.style.opacity = String(showGuide ? guide.alpha : 0);
        marker.style.transform = `translate(${guide.x}px, ${guideTop}px) translate(-50%, -50%) scale(${0.4 + 0.6 * guide.alpha})`;
      }

      ctx.clearRect(0, 0, width, height);
      for (const bucket of buckets) bucket.length = 0;
      const strokeCells: number[] = [];
      const density = new Float32Array(cols * rows);

      for (let row = 0; row < rows; row++) {
        const y = row * pitchY;
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const depth = y - topY[col];
          const span = Math.max(1, height - topY[col]);
          // Soft halftone edge at the line, thinning toward the baseline.
          const edge = smoothstep((depth + pitchY * 0.6) / (pitchY * 1.6));
          const v = edge * (1 - fade * smoothstep(depth / span));
          density[i] = v;
          if (v < 0.03) continue;
          if (flowX[i] !== 0 || flowY[i] !== 0) strokeCells.push(i);
          buckets[Math.min(LUT_SIZE - 1, Math.floor(v * LUT_SIZE))].push(i);
        }
      }

      const maxR = Math.min(pitchX, pitchY) * 0.44;
      const position = (i: number) => {
        const col = i % cols;
        const row = (i - col) / cols;
        let ox = flowX[i] * DISPLACE;
        let oy = flowY[i] * DISPLACE;
        const length = Math.hypot(ox, oy);
        const limit = pitchX * 0.6;
        if (length > limit) {
          ox *= limit / length;
          oy *= limit / length;
        }
        return [col * pitchX + ox, row * pitchY + oy] as const;
      };
      const morphOf = (i: number) =>
        smoothstep((Math.hypot(flowX[i], flowY[i]) - GLYPH_START) / (GLYPH_FULL - GLYPH_START));

      // Area dots, batched by shade.
      for (let b = 0; b < LUT_SIZE; b++) {
        const bucket = buckets[b];
        if (bucket.length === 0) continue;
        ctx.fillStyle = palette[b];
        ctx.beginPath();
        for (const i of bucket) {
          const [x, y] = position(i);
          // Dots near the guide shrink smoothly to open a lane for it.
          const lane = showGuide
            ? 1 - guide.alpha * (1 - smoothstep(Math.abs(x - guide.x) / (pitchX * 1.25)))
            : 1;
          const r = maxR * Math.sqrt((b + 0.5) / LUT_SIZE) * (1 - morphOf(i)) * lane;
          if (r < 0.3) continue;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Guide: a column of dots drawn at the guide's exact position, so it glides
      // between grid columns. Lit inside the area, faint pinpricks above it.
      if (showGuide) {
        ctx.globalAlpha = guide.alpha;
        ctx.fillStyle = palette[LUT_SIZE - 1];
        ctx.beginPath();
        const span = Math.max(1, height - guideTop);
        for (let row = 0; row < rows; row++) {
          const y = row * pitchY;
          const depth = y - guideTop;
          const edge = smoothstep((depth + pitchY * 0.6) / (pitchY * 1.6));
          const v = edge * (1 - fade * smoothstep(depth / span));
          const r = v > 0.03 ? maxR * Math.max(0.55, Math.sqrt(v)) : maxR * 0.22;
          ctx.moveTo(guide.x + r, y);
          ctx.arc(guide.x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Stirred dots become strokes that point along the current.
      if (strokeCells.length > 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const i of strokeCells) {
          const morph = morphOf(i);
          if (morph < 0.02) continue;
          const [x, y] = position(i);
          ctx.globalAlpha = morph;
          ctx.fillStyle =
            palette[Math.min(LUT_SIZE - 1, Math.floor(Math.max(density[i], 0.6) * LUT_SIZE))];
          ctx.font = `600 ${pitchY * (0.85 + 0.35 * morph)}px ${FONT}`;
          ctx.fillText(strokeFor(flowX[i], flowY[i]), x, y + pitchY * 0.04);
        }
        ctx.globalAlpha = 1;
      }

      frame = visible ? requestAnimationFrame(draw) : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = plot.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.tx = x;
      pointer.ty = y;
      if (pointer.fresh) {
        pointer.x = x;
        pointer.y = y;
        pointer.vx = 0;
        pointer.vy = 0;
        pointer.fresh = false;
      }
      pointer.inside = true;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.fresh = true;
    };

    plot.addEventListener("pointermove", onPointerMove);
    plot.addEventListener("pointerleave", onPointerLeave);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && frame === 0) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    });
    intersection.observe(plot);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      plot.removeEventListener("pointermove", onPointerMove);
      plot.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [cellSize, colorKey, fade, height, maxValue, reduceMotion, valueKey, width]);

  const indexFromClientX = (clientX: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || count === 0) return null;
    const t = clamp01((clientX - rect.left) / rect.width);
    return Math.round(t * (count - 1));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (count === 0) return;
    const current = activeIndex ?? count - 1;
    const next =
      event.key === "ArrowLeft"
        ? Math.max(0, current - 1)
        : event.key === "ArrowRight"
          ? Math.min(count - 1, current + 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? count - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
  };

  const labelStep = Math.max(1, Math.ceil(count / Math.max(1, Math.floor(width / 64))));
  const formatter = new Intl.NumberFormat(locales, format);
  const formatValue = (value: number) => formatter.format(value);

  // The headline follows the scrubbed point, and rests on the latest one.
  const shownIndex = activeIndex ?? count - 1;
  const shown = data[shownIndex];
  const previous = shownIndex > 0 ? data[shownIndex - 1] : undefined;
  const change =
    shown && previous && previous.value !== 0
      ? (shown.value - previous.value) / previous.value
      : null;

  return (
    <div className={cn("relative w-full select-none", className)} {...props}>
      <div aria-hidden="true" className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <NumberFlow
            className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"
            format={format}
            locales={locales}
            value={shown?.value ?? 0}
            willChange
          />
        </div>
        {change !== null && previous ? (
          <p className="shrink-0 pb-1.5 text-right text-sm tabular-nums">
            <NumberFlow
              className={cn(
                "font-medium",
                change > 0 && "text-emerald-600 dark:text-emerald-400",
                change < 0 && "text-red-600 dark:text-red-400",
              )}
              format={changeFormat}
              locales={locales}
              value={change}
            />
            <span className="text-muted-foreground"> vs {previous.label}</span>
          </p>
        ) : null}
      </div>

      <div
        aria-label={`${label}. Use the arrow keys to read each point.`}
        aria-valuemax={Math.max(0, count - 1)}
        aria-valuemin={0}
        aria-valuenow={activeIndex ?? Math.max(0, count - 1)}
        aria-valuetext={(() => {
          const point = data[activeIndex ?? count - 1];
          return point ? `${point.label}: ${formatValue(point.value)}` : undefined;
        })()}
        className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        onBlur={() => setActiveIndex(null)}
        onFocus={() => setActiveIndex((current) => current ?? Math.max(0, count - 1))}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setActiveIndex(null)}
        onPointerMove={(event) => {
          const next = indexFromClientX(event.clientX);
          if (next !== activeIndex) setActiveIndex(next);
        }}
        ref={plotRef}
        role="slider"
        style={{ height }}
        tabIndex={0}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <canvas className="block" ref={canvasRef} />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 size-2.5 rounded-full opacity-0 ring-[3px] ring-background will-change-transform"
          ref={markerRef}
          style={{ backgroundColor: colors[colors.length - 1] }}
        />
      </div>

      <div aria-hidden="true" className="relative mt-3 h-4 text-xs text-muted-foreground">
        {data.map((point, index) =>
          (index % labelStep === 0 && count - 1 - index >= labelStep / 2) || index === count - 1 ? (
            <span
              className={cn(
                "absolute whitespace-nowrap tabular-nums transition-colors",
                index === activeIndex && "text-foreground",
                index === 0
                  ? "translate-x-0"
                  : index === count - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2",
              )}
              key={point.label}
              style={{ left: xAt(index) }}
            >
              {point.label}
            </span>
          ) : null,
        )}
      </div>

      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">{seriesName}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{formatValue(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HalftoneAreaChart;

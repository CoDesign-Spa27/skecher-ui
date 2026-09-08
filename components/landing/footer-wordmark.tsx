"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const WORDMARK = "Skecher UI";

/** Fill inside the spotlight. */
const EMBER = "#f2591f";
/** The edge runs hotter than the fill, which is what makes it read as lit. */
const EMBER_EDGE = "#ff9d5e";
 
const SPOT_GRADIENT =
  "radial-gradient(circle var(--spot-r) at var(--spot-x) var(--spot-y), #000 0%, #000 38%, transparent 100%)";

const spotlightMask = {
  WebkitMaskImage: SPOT_GRADIENT,
  maskImage: SPOT_GRADIENT,
} as const;
 
const GLYPHS = cn(
  "block px-[clamp(12px,1.6vw,24px)] text-center",
  "font-instrument-serif text-[clamp(3.6rem,15.5vw,13rem)] leading-[0.78] tracking-[-0.03em] whitespace-nowrap",
);

const LIT_LAYER = cn(
  "pointer-events-none absolute inset-0 opacity-0",
  "transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "group-data-[lit=true]:opacity-100",
  "motion-reduce:transition-none",
);
 
export function FooterWordmark() {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Touch reports a phantom hover on tap; there is no pointer to follow, so
    // the effect simply does not exist there.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frameId = 0;
      host.style.setProperty("--spot-x", `${pointerX}px`);
      host.style.setProperty("--spot-y", `${pointerY}px`);
    };

    const handleMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      // Coalesced to one write per frame: pointermove outruns paint otherwise.
      if (frameId === 0) frameId = window.requestAnimationFrame(paint);
    };

    const handleEnter = (event: PointerEvent) => {
      handleMove(event);
      // Placed before it is revealed, so the spotlight never fades up at a
      // stale position and slides across to meet the cursor.
      paint();
      host.dataset.lit = "true";
    };

    const handleLeave = () => {
      host.dataset.lit = "false";
    };

    host.addEventListener("pointerenter", handleEnter);
    host.addEventListener("pointermove", handleMove, { passive: true });
    host.addEventListener("pointerleave", handleLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      host.removeEventListener("pointerenter", handleEnter);
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="relative overflow-hidden">
      <div
        className="group relative translate-y-[16%]"
        data-lit="false"
        ref={hostRef}
        style={
          {
            "--spot-r": "clamp(110px, 13vw, 210px)",
            "--spot-x": "50%",
            "--spot-y": "50%",
          } as React.CSSProperties
        }
      >
        <span
          className={cn(
            GLYPHS,
            "bg-gradient-to-b from-white/[0.16] to-white/[0.02] bg-clip-text text-transparent",
          )}
        >
          {WORDMARK}
        </span>

        <span className={cn(GLYPHS, LIT_LAYER)} style={{ ...spotlightMask, color: EMBER }}>
          {WORDMARK}
        </span>

        <span
          className={cn(GLYPHS, LIT_LAYER)}
          style={{
            ...spotlightMask,
            WebkitTextFillColor: "transparent",
            WebkitTextStrokeColor: EMBER_EDGE,
            WebkitTextStrokeWidth: "1px",
            filter: `drop-shadow(0 0 14px ${EMBER}aa)`,
          }}
        >
          {WORDMARK}
        </span>
      </div>
    </div>
  );
}

"use client";

import { Dithering, type DitheringProps } from "@paper-design/shaders-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type DitherCreditCardColors = {
  accent?: string;
  background?: string;
  details?: string;
  foreground?: string;
};

export type DitherCreditCardContent = {
  brandName?: string;
  cardNumber?: string;
  cardholder?: string;
};

export type DitherCreditCardDither = {
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  scale?: number;
  shape?: DitheringProps["shape"];
  size?: number;
  speed?: number;
  type?: DitheringProps["type"];
};

export type DitherCreditCardPhysicsMode = "tilt" | "magnetic" | "zero-gravity";

export type DitherCreditCardSpring = {
  bounce?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  visualDuration?: number;
};

export type DitherCreditCardPhysics = {
  glare?: number;
  lift?: number;
  magnetism?: number;
  mode?: DitherCreditCardPhysicsMode;
  perspective?: number;
  scale?: number;
  spring?: DitherCreditCardSpring;
  tilt?: number;
};

export type DitherCreditCardProps = {
  ariaLabel?: string;
  className?: string;
  colors?: DitherCreditCardColors;
  content?: DitherCreditCardContent;
  dither?: DitherCreditCardDither;
  interactive?: boolean;
  physics?: DitherCreditCardPhysics;
  /** @deprecated Use `interactive` to enable or disable the complete physics system. */
  tilt?: boolean;
};

const CARD_DOTS = ["dot-1", "dot-2", "dot-3", "dot-4"];
const DEFAULT_PHYSICS = {
  glare: 0.28,
  lift: 8,
  magnetism: 14,
  mode: "tilt",
  perspective: 1200,
  scale: 1,
  spring: {
    bounce: 0.08,
    visualDuration: 0.32,
  },
  tilt: 7,
} satisfies Required<DitherCreditCardPhysics>;
const DEFAULT_COLORS = {
  accent: "#ffc831",
  background: "#faa200",
  details: "#5f5f5f",
  foreground: "#ffffff",
} satisfies Required<DitherCreditCardColors>;
const DEFAULT_CONTENT = {
  brandName: "Skecher-ui",
  cardNumber: "4325 2535",
  cardholder: "@roohbuilds",
} satisfies Required<DitherCreditCardContent>;
const DEFAULT_DITHER = {
  offsetX: 0.6,
  offsetY: 0.46,
  rotation: 8,
  scale: 2.52,
  shape: "wave",
  size: 2,
  speed: 0.26,
  type: "8x8",
} satisfies Required<DitherCreditCardDither>;

const SHADER_STYLE = { width: "100%", height: "100%" } as const;

function resolveSpring(spring: DitherCreditCardSpring) {
  if (spring.visualDuration !== undefined || spring.bounce !== undefined) {
    return {
      bounce: spring.bounce ?? 0,
      visualDuration: spring.visualDuration ?? 0.32,
    };
  }

  return {
    damping: spring.damping ?? 22,
    mass: spring.mass ?? 0.8,
    stiffness: spring.stiffness ?? 180,
  };
}

function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointer = () => setHasFinePointer(query.matches);

    updatePointer();
    query.addEventListener("change", updatePointer);

    return () => query.removeEventListener("change", updatePointer);
  }, []);

  return hasFinePointer;
}

function SkecherMark({ accent, foreground }: { accent: string; foreground: string }) {
  return (
    <svg width="41" height="39" viewBox="0 0 41 39" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="39" rx="10" fill={foreground} />
      <path
        d="M5.29221 15.9984C5.56471 15.5953 6.13438 15.4456 6.62038 15.6493L29.1293 25.0859C29.6153 25.2897 30.185 25.1399 30.4575 24.7369L36.4991 15.7999C36.9561 15.1239 36.3153 14.2553 35.4349 14.3575L27.0571 15.3291C26.7476 15.365 26.4755 15.5233 26.3149 15.761L16.4275 30.3865C16.0495 30.9456 15.1552 30.9772 14.6985 30.4476L7.14633 21.6888L4.38808 18.5339C4.11343 18.2198 4.08075 17.7904 4.30612 17.457L5.29221 15.9984Z"
        fill={accent}
      />
    </svg>
  );
}

function VisaMark({ color }: { color: string }) {
  return (
    <svg aria-label="Visa" className="h-auto w-full" role="img" viewBox="0 0 69 23">
      <text
        fill={color}
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="26"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="-1.7"
        x="0"
        y="22"
      >
        VISA
      </text>
    </svg>
  );
}

export function DitherCreditCard({
  ariaLabel,
  className,
  colors,
  content,
  dither,
  interactive = true,
  physics,
  tilt = true,
}: DitherCreditCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasFinePointer = useFinePointer();
  const [isHovered, setIsHovered] = useState(false);
  const pointerBoundsRef = useRef<DOMRect | null>(null);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const xTarget = useMotionValue(0);
  const yTarget = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const glareXTarget = useMotionValue(0);
  const glareYTarget = useMotionValue(0);
  const glareOpacityTarget = useMotionValue(0);
  const resolvedColors = { ...DEFAULT_COLORS, ...colors };
  const resolvedContent = { ...DEFAULT_CONTENT, ...content };
  const resolvedDither = { ...DEFAULT_DITHER, ...dither };
  const resolvedPhysics = {
    ...DEFAULT_PHYSICS,
    ...physics,
    spring: { ...DEFAULT_PHYSICS.spring, ...physics?.spring },
  };
  const spring = resolveSpring(resolvedPhysics.spring);
  const rotateX = useSpring(rotateXTarget, spring);
  const rotateY = useSpring(rotateYTarget, spring);
  const x = useSpring(xTarget, spring);
  const y = useSpring(yTarget, spring);
  const scale = useSpring(scaleTarget, spring);
  const glareX = useSpring(glareXTarget, spring);
  const glareY = useSpring(glareYTarget, spring);
  const glareOpacity = useSpring(glareOpacityTarget, {
    bounce: 0,
    visualDuration: 0.2,
  });
  const physicsEnabled = interactive && tilt && hasFinePointer && !shouldReduceMotion;
  const lastFourDigits = resolvedContent.cardNumber.replace(/\D/g, "").slice(-4);
  const resolvedAriaLabel =
    ariaLabel ??
    `${resolvedContent.brandName} Visa card${lastFourDigits ? ` ending in ${lastFourDigits}` : ""}`;

  const resetPhysics = useCallback(() => {
    pointerBoundsRef.current = null;
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    xTarget.set(0);
    yTarget.set(0);
    scaleTarget.set(1);
    glareXTarget.set(0);
    glareYTarget.set(0);
    glareOpacityTarget.set(0);
  }, [
    glareOpacityTarget,
    glareXTarget,
    glareYTarget,
    rotateXTarget,
    rotateYTarget,
    scaleTarget,
    xTarget,
    yTarget,
  ]);

  useEffect(() => {
    if (!physicsEnabled) {
      setIsHovered(false);
      resetPhysics();
    }
  }, [physicsEnabled, resetPhysics]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!physicsEnabled || event.pointerType !== "mouse") return;

      const bounds = pointerBoundsRef.current ?? event.currentTarget.getBoundingClientRect();
      pointerBoundsRef.current = bounds;

      const normalizedX = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
      );
      const normalizedY = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      const mode = resolvedPhysics.mode;
      const rotationFactor = mode === "magnetic" ? 0.45 : 1;
      const magnetismFactor = mode === "tilt" ? 0 : mode === "zero-gravity" ? 1.35 : 1;
      const liftFactor = mode === "zero-gravity" ? 1.45 : 1;

      rotateXTarget.set(normalizedY * resolvedPhysics.tilt * -rotationFactor);
      rotateYTarget.set(normalizedX * resolvedPhysics.tilt * rotationFactor);
      xTarget.set(normalizedX * resolvedPhysics.magnetism * magnetismFactor);
      yTarget.set(
        normalizedY * resolvedPhysics.magnetism * magnetismFactor -
          resolvedPhysics.lift * liftFactor,
      );
      glareXTarget.set(normalizedX * 88);
      glareYTarget.set(normalizedY * 56);
    },
    [
      glareXTarget,
      glareYTarget,
      physicsEnabled,
      resolvedPhysics.lift,
      resolvedPhysics.magnetism,
      resolvedPhysics.mode,
      resolvedPhysics.tilt,
      rotateXTarget,
      rotateYTarget,
      xTarget,
      yTarget,
    ],
  );

  return (
    <motion.article
      aria-label={resolvedAriaLabel}
      className={cn(
        "relative isolate aspect-[121/73] w-full max-w-[605px] origin-center overflow-hidden rounded-[clamp(24px,7.6%,6px)] border border-neutral-300/70 [backface-visibility:hidden] [container-type:inline-size] [transform-style:preserve-3d]",
        className,
      )}
      onPointerEnter={(event) => {
        if (physicsEnabled && event.pointerType === "mouse") {
          pointerBoundsRef.current = event.currentTarget.getBoundingClientRect();
          setIsHovered(true);
          const liftFactor = resolvedPhysics.mode === "zero-gravity" ? 1.45 : 1;
          yTarget.set(resolvedPhysics.lift * -liftFactor);
          scaleTarget.set(resolvedPhysics.scale);
          glareOpacityTarget.set(resolvedPhysics.glare);
        }
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        resetPhysics();
      }}
      onPointerMove={handlePointerMove}
      style={{
        backgroundColor: resolvedColors.background,
        rotateX,
        rotateY,
        scale,
        transformPerspective: resolvedPhysics.perspective,
        willChange: isHovered ? "transform" : "auto",
        x,
        y,
      }}
    >
      <Dithering
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        width={1280}
        height={720}
        colorBack={resolvedColors.background}
        colorFront={resolvedColors.foreground}
        shape={resolvedDither.shape}
        type={resolvedDither.type}
        size={resolvedDither.size}
        speed={shouldReduceMotion ? 0 : resolvedDither.speed}
        scale={resolvedDither.scale}
        rotation={resolvedDither.rotation}
        offsetX={resolvedDither.offsetX}
        offsetY={resolvedDither.offsetY}
        style={SHADER_STYLE}
      />

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[28%] z-[5] rounded-full mix-blend-soft-light"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${resolvedColors.foreground} 68%, transparent) 0%, transparent 64%)`,
          opacity: glareOpacity,
          x: glareX,
          y: glareY,
        }}
      />

      <div
        className="absolute left-[7.27%] top-[8.77%] z-10 flex items-center gap-[clamp(7px,2cqw,12px)]"
        style={{ color: resolvedColors.foreground }}
      >
        <span className="block w-[clamp(28px,6.78cqw,41px)] shrink-0">
          <SkecherMark accent={resolvedColors.accent} foreground={resolvedColors.foreground} />
        </span>
        <span className="whitespace-nowrap text-[clamp(20px,4.96cqw,30px)] leading-none font-semibold">
          {resolvedContent.brandName}
        </span>
      </div>

      <span className="absolute right-[7.1%] top-[11.5%] z-10 w-[11.4%] min-w-12">
        <VisaMark color={resolvedColors.foreground} />
      </span>

      <p
        className="absolute bottom-[10.25%] left-[7.27%] z-10 m-0 flex items-center gap-[clamp(5px,1.15cqw,7px)] font-sans text-[clamp(15px,3.97cqw,24px)] font-semibold leading-none tracking-[-0.02em]"
        style={{ color: resolvedColors.details }}
      >
        <span aria-hidden="true" className="flex gap-[clamp(4px,1cqw,6px)]">
          {CARD_DOTS.map((dot) => (
            <span className="size-[clamp(5px,1.32cqw,8px)] rounded-full bg-current" key={dot} />
          ))}
        </span>
        <span>{resolvedContent.cardNumber}</span>
      </p>

      <p
        className="absolute bottom-[10.25%] right-[7.1%] z-10 m-0 font-sans text-[clamp(15px,3.97cqw,24px)] font-semibold leading-none tracking-[-0.035em]"
        style={{ color: resolvedColors.details }}
      >
        {resolvedContent.cardholder}
      </p>
    </motion.article>
  );
}

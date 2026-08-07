"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ComponentProps, type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

export type MorphStackSpring = {
  bounce?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
  visualDuration?: number;
};

export type MorphStackTransform = {
  x?: number;
  y?: number;
  z?: number;
};

export type MorphStackLayerMotion = {
  active?: MorphStackTransform;
  resting?: MorphStackTransform;
};

export type MorphStackMotion = {
  back?: MorphStackLayerMotion & {
    activeOpacity?: number;
    restingOpacity?: number;
  };
  delays?: {
    back?: number;
    front?: number;
    middle?: number;
  };
  front?: MorphStackLayerMotion;
  middle?: MorphStackLayerMotion;
  perspective?: number;
  reducedMotionStrength?: number;
  springs?: {
    back?: MorphStackSpring;
    front?: MorphStackSpring;
    middle?: MorphStackSpring;
    stack?: MorphStackSpring;
  };
  stack?: {
    rotateX?: number;
    rotateZ?: number;
    scale?: number;
  };
};

export type MorphStackProps = {
  /** Any renderable plate, such as an image, inline SVG, or custom component. */
  backPlate: ReactNode;
  className?: string;
  /** Controls the expanded state. Leave undefined to use fine-pointer hover. */
  expanded?: boolean;
  /** Any renderable plate, such as an image, inline SVG, or custom component. */
  frontPlate: ReactNode;
  interactive?: boolean;
  /** Any renderable plate, such as an image, inline SVG, or custom component. */
  middlePlate: ReactNode;
  motion?: MorphStackMotion;
  onExpandedChange?: (expanded: boolean) => void;
};

type PlateLayerProps = ComponentProps<typeof motion.div> & {
  layer: number;
};

const DEFAULT_MOTION = {
  perspective: 900,
  reducedMotionStrength: 0.25,
  stack: {
    rotateX: 58,
    rotateZ: -42,
    scale: 1.06,
  },
  front: {
    active: {
      x: -14,
      y: 20,
      z: 72,
    },
    resting: {
      x: 4,
      y: 0,
      z: 12,
    },
  },
  middle: {
    active: {
      x: 0,
      y: 0,
      z: 0,
    },
    resting: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  back: {
    active: {
      x: 0,
      y: 0,
      z: -76,
    },
    activeOpacity: 1,
    resting: {
      x: 0,
      y: 0,
      z: -4,
    },
    restingOpacity: 0,
  },
  delays: {
    back: 0.2,
    front: 0.1,
    middle: 0,
  },
} satisfies Required<Omit<MorphStackMotion, "springs">>;

const DEFAULT_SPRINGS = {
  stack: {
    type: "spring",
    stiffness: 320,
    damping: 20,
    mass: 0.65,
  },
  front: {
    type: "spring",
    stiffness: 420,
    damping: 24,
    mass: 0.6,
  },
  middle: {
    type: "spring",
    stiffness: 360,
    damping: 30,
    mass: 0.65,
  },
  back: {
    type: "spring",
    stiffness: 300,
    damping: 27,
    mass: 0.7,
  },
} as const;

function canFineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function PlateLayer({ children, className, layer, style, ...props }: PlateLayerProps) {
  return (
    <motion.div
      {...props}
      className={cn("col-start-1 row-start-1", className)}
      style={{
        ...style,
        zIndex: layer,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}

function resolveSpring(defaultSpring: MorphStackSpring, spring: MorphStackSpring | undefined) {
  if (spring?.visualDuration !== undefined || spring?.bounce !== undefined) {
    return {
      bounce: spring.bounce ?? 0,
      type: "spring" as const,
      visualDuration: spring.visualDuration ?? 0.3,
    };
  }

  return {
    ...defaultSpring,
    ...spring,
    type: "spring" as const,
  };
}

function resolveLayerMotion(
  defaults: {
    active: Required<MorphStackTransform>;
    resting: Required<MorphStackTransform>;
  },
  motion: MorphStackLayerMotion | undefined,
) {
  return {
    active: {
      x: motion?.active?.x ?? defaults.active.x,
      y: motion?.active?.y ?? defaults.active.y,
      z: motion?.active?.z ?? defaults.active.z,
    },
    resting: {
      x: motion?.resting?.x ?? defaults.resting.x,
      y: motion?.resting?.y ?? defaults.resting.y,
      z: motion?.resting?.z ?? defaults.resting.z,
    },
  };
}

function clampOpacity(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function MorphStack({
  backPlate,
  className,
  expanded,
  frontPlate,
  interactive = true,
  middlePlate,
  motion: motionConfig,
  onExpandedChange,
}: MorphStackProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const isExpanded = expanded ?? (interactive && hovered);
  const reducedMotionStrength = Math.min(
    1,
    Math.max(0, motionConfig?.reducedMotionStrength ?? DEFAULT_MOTION.reducedMotionStrength),
  );
  const strength = shouldReduceMotion ? reducedMotionStrength : 1;
  const stack = { ...DEFAULT_MOTION.stack, ...motionConfig?.stack };
  const front = resolveLayerMotion(DEFAULT_MOTION.front, motionConfig?.front);
  const middle = resolveLayerMotion(DEFAULT_MOTION.middle, motionConfig?.middle);
  const back = {
    ...resolveLayerMotion(DEFAULT_MOTION.back, motionConfig?.back),
    activeOpacity: clampOpacity(
      motionConfig?.back?.activeOpacity ?? DEFAULT_MOTION.back.activeOpacity,
    ),
    restingOpacity: clampOpacity(
      motionConfig?.back?.restingOpacity ?? DEFAULT_MOTION.back.restingOpacity,
    ),
  };
  const delays = { ...DEFAULT_MOTION.delays, ...motionConfig?.delays };
  const springs = {
    back: resolveSpring(DEFAULT_SPRINGS.back, motionConfig?.springs?.back),
    front: resolveSpring(DEFAULT_SPRINGS.front, motionConfig?.springs?.front),
    middle: resolveSpring(DEFAULT_SPRINGS.middle, motionConfig?.springs?.middle),
    stack: resolveSpring(DEFAULT_SPRINGS.stack, motionConfig?.springs?.stack),
  };

  function handlePointerEnter() {
    if (!interactive || !canFineHover()) return;

    setHovered(true);
    onExpandedChange?.(true);
  }

  function handlePointerLeave() {
    setHovered(false);
    if (hovered) {
      onExpandedChange?.(false);
    }
  }

  return (
    <motion.div
      className={cn(
        "relative flex h-96 w-96 items-center justify-center",
        interactive && "cursor-pointer",
        className,
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: Math.max(1, motionConfig?.perspective ?? DEFAULT_MOTION.perspective) }}
    >
      <motion.div
        animate={{
          rotateX: isExpanded ? stack.rotateX * strength : 0,
          rotateZ: isExpanded ? stack.rotateZ * strength : 0,
          scale: isExpanded ? 1 + (stack.scale - 1) * strength : 1,
        }}
        className="relative grid place-items-center"
        style={{
          transformOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
        transition={springs.stack}
      >
        <PlateLayer
          animate={{
            opacity: isExpanded ? back.activeOpacity : back.restingOpacity,
            x: isExpanded ? back.active.x * strength : back.resting.x,
            y: isExpanded ? back.active.y * strength : back.resting.y,
            z: isExpanded ? back.active.z * strength : back.resting.z,
          }}
          layer={1}
          transition={{ ...springs.back, delay: isExpanded ? delays.back : 0 }}
        >
          {backPlate}
        </PlateLayer>

        <PlateLayer
          animate={{
            x: isExpanded ? middle.active.x * strength : middle.resting.x,
            y: isExpanded ? middle.active.y * strength : middle.resting.y,
            z: isExpanded ? middle.active.z * strength : middle.resting.z,
          }}
          layer={2}
          transition={{ ...springs.middle, delay: isExpanded ? delays.middle : 0 }}
        >
          {middlePlate}
        </PlateLayer>

        <PlateLayer
          animate={{
            x: isExpanded ? front.active.x * strength : front.resting.x,
            y: isExpanded ? front.active.y * strength : front.resting.y,
            z: isExpanded ? front.active.z * strength : front.resting.z,
          }}
          layer={3}
          transition={{ ...springs.front, delay: isExpanded ? delays.front : 0 }}
        >
          {frontPlate}
        </PlateLayer>
      </motion.div>
    </motion.div>
  );
}

export default MorphStack;

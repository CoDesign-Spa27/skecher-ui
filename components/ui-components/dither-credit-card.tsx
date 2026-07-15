"use client";

import { Dithering } from "@paper-design/shaders-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type DitherCreditCardProps = {
  className?: string;
};

const CARD_DOTS = ["dot-1", "dot-2", "dot-3", "dot-4"];

const RESTING_TRANSFORM = "perspective(1200px) translate3d(0px, 0px, 0px) rotateX(0deg)";
const HOVER_TRANSFORM = "perspective(1200px) translate3d(0px, -8px, 18px) rotateX(-7deg)";
const SHADER_STYLE = { width: "100%", height: "100%" } as const;

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

function SkecherMark() {
  return (
    <svg width="41" height="39" viewBox="0 0 41 39" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="39" rx="10" fill="white" />
      <path
        d="M5.29221 15.9984C5.56471 15.5953 6.13438 15.4456 6.62038 15.6493L29.1293 25.0859C29.6153 25.2897 30.185 25.1399 30.4575 24.7369L36.4991 15.7999C36.9561 15.1239 36.3153 14.2553 35.4349 14.3575L27.0571 15.3291C26.7476 15.365 26.4755 15.5233 26.3149 15.761L16.4275 30.3865C16.0495 30.9456 15.1552 30.9772 14.6985 30.4476L7.14633 21.6888L4.38808 18.5339C4.11343 18.2198 4.08075 17.7904 4.30612 17.457L5.29221 15.9984Z"
        fill="#FFC831"
      />
    </svg>
  );
}

function VisaMark() {
  return (
    <svg aria-label="Visa" className="h-auto w-full" role="img" viewBox="0 0 69 23">
      <text
        fill="white"
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

export function DitherCreditCard({ className }: DitherCreditCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasFinePointer = useFinePointer();
  const [isHovered, setIsHovered] = useState(false);
  const shouldTilt = hasFinePointer && !shouldReduceMotion && isHovered;

  return (
    <motion.article
      animate={{ transform: shouldTilt ? HOVER_TRANSFORM : RESTING_TRANSFORM }}
      aria-label="Skecher UI Visa card ending in 2535"
      className={cn(
        "relative isolate aspect-[121/73] w-full max-w-[605px] origin-bottom overflow-hidden rounded-[clamp(24px,7.6%,6px)] border border-neutral-300/70 bg-[#faa200] [backface-visibility:hidden] [container-type:inline-size] [transform-style:preserve-3d]",
        className,
      )}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" && hasFinePointer && !shouldReduceMotion) {
          setIsHovered(true);
        }
      }}
      onPointerLeave={() => setIsHovered(false)}
      style={{ willChange: shouldTilt ? "transform" : "auto" }}
      transition={{
        type: "spring",
        duration: shouldTilt ? 0.26 : 0.2,
        bounce: 0,
      }}
    >
      <Dithering
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        width={1280}
        height={720}
        colorBack="#faa200"
        colorFront="#ffffff"
        shape="wave"
        type="8x8"
        size={2}
        speed={shouldReduceMotion ? 0 : 0.26}
        scale={2.52}
        rotation={8}
        offsetX={0.6}
        offsetY={0.46}
        style={SHADER_STYLE}
      />

      <div className="absolute left-[7.27%] top-[8.77%] z-10 flex items-center gap-[clamp(7px,2cqw,12px)] text-white">
        <span className="block w-[clamp(28px,6.78cqw,41px)] shrink-0">
          <SkecherMark />
        </span>
        <span className="whitespace-nowrap text-[clamp(20px,4.96cqw,30px)] leading-none font-semibold">
          Skecher-ui
        </span>
      </div>

      <span className="absolute right-[7.1%] top-[11.5%] z-10 w-[11.4%] min-w-12">
        <VisaMark />
      </span>

      <p className="absolute bottom-[10.25%] left-[7.27%] z-10 m-0 flex items-center gap-[clamp(5px,1.15cqw,7px)] font-sans text-[clamp(15px,3.97cqw,24px)] font-semibold leading-none tracking-[-0.02em] text-[#5f5f5f]">
        <span aria-hidden="true" className="flex gap-[clamp(4px,1cqw,6px)]">
          {CARD_DOTS.map((dot) => (
            <span className="size-[clamp(5px,1.32cqw,8px)] rounded-full bg-current" key={dot} />
          ))}
        </span>
        <span>4325 2535</span>
      </p>

      <p className="absolute bottom-[10.25%] right-[7.1%] z-10 m-0 font-sans text-[clamp(15px,3.97cqw,24px)] font-semibold leading-none tracking-[-0.035em] text-[#5f5f5f]">
        @roohbuilds
      </p>
    </motion.article>
  );
}

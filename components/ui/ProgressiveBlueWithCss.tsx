"use client";

import type React from "react";

import { cn } from "@/lib/utils";

type BlurEdge = "top" | "bottom";

type CSSVariables = React.CSSProperties & Record<`--${string}`, string | number>;

export interface ProgressiveScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  blurClassName?: string;
  blurHeight?: string;
  blurLevels?: number[];
  edges?: BlurEdge[];
}

interface ProgressiveBlurStackProps {
  edge: BlurEdge;
  height: string;
  blurLevels: number[];
  className?: string;
}

function formatPercentage(value: number) {
  return `${Math.min(value, 100)}%`;
}

function createLayerMask(index: number, total: number, edge: BlurEdge) {
  const direction = edge === "top" ? "to top" : "to bottom";
  const step = 100 / total;

  const start = index * step;
  const middle = (index + 1) * step;
  const end = (index + 2) * step;
  const fadeEnd = (index + 3) * step;

  // Strongest final layer.
  if (index === total - 1) {
    return `linear-gradient(
      ${direction},
      transparent ${formatPercentage(start)},
      #000 100%
    )`;
  }

  // Second-to-last layer reaches the edge without fading out.
  if (index === total - 2) {
    return `linear-gradient(
      ${direction},
      transparent ${formatPercentage(start)},
      #000 ${formatPercentage(middle)},
      #000 100%
    )`;
  }

  return `linear-gradient(
    ${direction},
    transparent ${formatPercentage(start)},
    #000 ${formatPercentage(middle)},
    #000 ${formatPercentage(end)},
    transparent ${formatPercentage(fadeEnd)}
  )`;
}

function ProgressiveBlurStack({ edge, height, blurLevels, className }: ProgressiveBlurStackProps) {
  const normalizedBlurLevels = blurLevels.length ? blurLevels : [0];
  const totalLayers = normalizedBlurLevels.length;
  const firstBlur = normalizedBlurLevels[0] ?? 0;
  const lastBlur = normalizedBlurLevels[totalLayers - 1] ?? firstBlur;
  const middleBlurLevels = normalizedBlurLevels.slice(1, -1);

  return (
    <div
      aria-hidden="true"
      data-edge={edge}
      className={cn("progressive-blur-stack", className)}
      style={
        {
          "--progressive-blur-height": height,
          "--progressive-blur-start-value": `${firstBlur}px`,
          "--progressive-blur-start-mask": createLayerMask(0, totalLayers, edge),
          "--progressive-blur-end-value": `${lastBlur}px`,
          "--progressive-blur-end-mask": createLayerMask(totalLayers - 1, totalLayers, edge),
        } as CSSVariables
      }
    >
      {middleBlurLevels.map((blur, index) => {
        const blurIndex = index + 1;

        return (
          <div
            key={`${edge}-${blurIndex}-${blur}`}
            className="progressive-blur-layer"
            style={
              {
                "--progressive-blur-value": `${blur}px`,
                "--progressive-blur-mask": createLayerMask(blurIndex, totalLayers, edge),
                "--progressive-blur-index": blurIndex + 1,
              } as CSSVariables
            }
          />
        );
      })}
    </div>
  );
}

export function ProgressiveScrollArea({
  children,
  className,
  viewportClassName,
  blurClassName,
  blurHeight = "96px",
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
  edges = ["top", "bottom"],
  ...props
}: ProgressiveScrollAreaProps) {
  return (
    <div className={cn("progressive-scroll-area", className)} {...props}>
      <div className={cn("progressive-scroll-viewport no-scrollbar", viewportClassName)}>
        {children}
      </div>

      {edges.includes("top") ? (
        <ProgressiveBlurStack
          edge="top"
          height={blurHeight}
          blurLevels={blurLevels}
          className={blurClassName}
        />
      ) : null}

      {edges.includes("bottom") ? (
        <ProgressiveBlurStack
          edge="bottom"
          height={blurHeight}
          blurLevels={blurLevels}
          className={blurClassName}
        />
      ) : null}
    </div>
  );
}

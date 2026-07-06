"use client";

import type React from "react";

import { cn } from "@/lib/utils";

export interface ProgressiveBlurProps {
  className?: string;
  height?: string;
  width?: string;
  position?: "top" | "bottom" | "left" | "right" | "both";
  blurLevels?: number[];
  children?: React.ReactNode;
}

export function ProgressiveBlur({
  className,
  height = "30%",
  width = "30%",
  position = "bottom",
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32, 64],
}: ProgressiveBlurProps) {
  const divElements = Array(blurLevels.length - 2).fill(null);
  const isHorizontal = position === "left" || position === "right";
  const fullMask =
    "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)";

  return (
    <div
      className={cn(
        "gradient-blur pointer-events-none absolute z-10",
        position === "top"
          ? "top-0"
          : position === "bottom"
            ? "bottom-0"
            : position === "left"
              ? "left-0"
              : position === "right"
                ? "right-0"
                : "inset-y-0",
        isHorizontal ? "inset-y-0" : "inset-x-0",
        className,
      )}
      style={{
        height: isHorizontal || position === "both" ? "100%" : height,
        width: isHorizontal ? width : undefined,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          backdropFilter: `blur(${blurLevels[0]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[0]}px)`,
          maskImage:
            position === "bottom"
              ? "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
              : position === "top"
                ? "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
                : position === "left"
                  ? "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
                  : position === "right"
                    ? "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
                    : fullMask,
          WebkitMaskImage:
            position === "bottom"
              ? "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
              : position === "top"
                ? "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
                : position === "left"
                  ? "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
                  : position === "right"
                    ? "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)"
                    : fullMask,
        }}
      />

      {divElements.map((_, index) => {
        const blurIndex = index + 1;
        const startPercent = blurIndex * 12.5;
        const midPercent = (blurIndex + 1) * 12.5;
        const endPercent = (blurIndex + 2) * 12.5;

        const maskGradient =
          position === "bottom"
            ? `linear-gradient(to bottom, rgba(0,0,0,0) ${startPercent}%, rgba(0,0,0,1) ${midPercent}%, rgba(0,0,0,1) ${endPercent}%, rgba(0,0,0,0) ${
                endPercent + 12.5
              }%)`
            : position === "top"
              ? `linear-gradient(to top, rgba(0,0,0,0) ${startPercent}%, rgba(0,0,0,1) ${midPercent}%, rgba(0,0,0,1) ${endPercent}%, rgba(0,0,0,0) ${
                  endPercent + 12.5
                }%)`
              : position === "left"
                ? `linear-gradient(to right, rgba(0,0,0,0) ${startPercent}%, rgba(0,0,0,1) ${midPercent}%, rgba(0,0,0,1) ${endPercent}%, rgba(0,0,0,0) ${
                    endPercent + 12.5
                  }%)`
                : position === "right"
                  ? `linear-gradient(to left, rgba(0,0,0,0) ${startPercent}%, rgba(0,0,0,1) ${midPercent}%, rgba(0,0,0,1) ${endPercent}%, rgba(0,0,0,0) ${
                      endPercent + 12.5
                    }%)`
                  : fullMask;

        return (
          <div
            key={`blur-${blurLevels[blurIndex]}`}
            className="absolute inset-0"
            style={{
              zIndex: index + 2,
              backdropFilter: `blur(${blurLevels[blurIndex]}px)`,
              WebkitBackdropFilter: `blur(${blurLevels[blurIndex]}px)`,
              maskImage: maskGradient,
              WebkitMaskImage: maskGradient,
            }}
          />
        );
      })}

      <div
        className="absolute inset-0"
        style={{
          zIndex: blurLevels.length,
          backdropFilter: `blur(${blurLevels[blurLevels.length - 1]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[blurLevels.length - 1]}px)`,
          maskImage:
            position === "bottom"
              ? "linear-gradient(to bottom, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
              : position === "top"
                ? "linear-gradient(to top, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
                : position === "left"
                  ? "linear-gradient(to right, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
                  : position === "right"
                    ? "linear-gradient(to left, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
                    : fullMask,
          WebkitMaskImage:
            position === "bottom"
              ? "linear-gradient(to bottom, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
              : position === "top"
                ? "linear-gradient(to top, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
                : position === "left"
                  ? "linear-gradient(to right, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
                  : position === "right"
                    ? "linear-gradient(to left, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)"
                    : fullMask,
        }}
      />
    </div>
  );
}

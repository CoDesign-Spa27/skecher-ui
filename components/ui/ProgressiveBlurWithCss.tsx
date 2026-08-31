"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type BlurEdge = "top" | "bottom";

type CSSVariables = React.CSSProperties & Record<`--${string}`, string | number>;
type DataAttributes = Record<`data-${string}`, string | number | boolean | undefined>;

const DEFAULT_BLUR_LEVELS = [8, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5] as const;

export interface ProgressiveScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  blurClassName?: string;
  blurHeight?: number | string;
  blurLevels?: readonly number[];
  edges?: readonly BlurEdge[];
  viewportClassName?: string;
  viewportProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className"> &
    DataAttributes;
  viewportRef?: React.Ref<HTMLDivElement>;
}

interface ProgressiveBlurStackProps {
  blurLevels: readonly number[];
  className?: string;
  edge: BlurEdge;
  height: number | string;
}

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function ProgressiveBlurStack({ blurLevels, className, edge, height }: ProgressiveBlurStackProps) {
  const levels = [...new Set(blurLevels.length ? blurLevels : DEFAULT_BLUR_LEVELS)];

  return (
    <div
      aria-hidden="true"
      className={cn("progressive-css-blur", className)}
      data-edge={edge}
      style={
        {
          "--progressive-css-blur-height": toCssSize(height),
        } as CSSVariables
      }
    >
      <div className="progressive-css-blur-strips">
        {levels.map((blur, index) => (
          <div
            className={cn(
              "progressive-css-blur-strip",
              index === 0
                ? "progressive-css-blur-strip-strongest"
                : "progressive-css-blur-strip-soft progressive-css-blur-strip-overlap",
            )}
            key={`${edge}-${blur}`}
            style={{
              backdropFilter: `blur(${Math.max(0, blur)}px)`,
              WebkitBackdropFilter: `blur(${Math.max(0, blur)}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProgressiveScrollArea({
  blurClassName,
  blurHeight = 100,
  blurLevels = DEFAULT_BLUR_LEVELS,
  children,
  className,
  edges = ["top", "bottom"],
  viewportClassName,
  viewportProps,
  viewportRef,
  ...props
}: ProgressiveScrollAreaProps) {
  const viewportElement = React.useRef<HTMLDivElement | null>(null);
  const [visibleEdges, setVisibleEdges] = React.useState({ top: false, bottom: false });
  const { onScroll, ...restViewportProps } = viewportProps ?? {};

  const updateVisibleEdges = React.useCallback(() => {
    const viewport = viewportElement.current;
    if (!viewport) return;

    const nextEdges = {
      top: viewport.scrollTop > 1,
      bottom: viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1,
    };

    setVisibleEdges((currentEdges) =>
      currentEdges.top === nextEdges.top && currentEdges.bottom === nextEdges.bottom
        ? currentEdges
        : nextEdges,
    );
  }, []);

  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportElement.current = node;

      if (typeof viewportRef === "function") {
        viewportRef(node);
      } else if (viewportRef) {
        viewportRef.current = node;
      }
    },
    [viewportRef],
  );

  React.useLayoutEffect(() => {
    const viewport = viewportElement.current;
    if (!viewport) return;

    updateVisibleEdges();

    const resizeObserver = new ResizeObserver(updateVisibleEdges);
    const mutationObserver = new MutationObserver(updateVisibleEdges);

    resizeObserver.observe(viewport);
    mutationObserver.observe(viewport, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateVisibleEdges]);

  return (
    <div
      className={cn("progressive-css-scroll-area", className)}
      {...props}
      data-blur-bottom={visibleEdges.bottom}
      data-blur-top={visibleEdges.top}
    >
      <div
        {...restViewportProps}
        className={cn("progressive-css-scroll-viewport no-scrollbar", viewportClassName)}
        onScroll={(event) => {
          updateVisibleEdges();
          onScroll?.(event);
        }}
        ref={setViewportRef}
      >
        {children}
      </div>

      {edges.includes("top") ? (
        <ProgressiveBlurStack
          blurLevels={blurLevels}
          className={cn(visibleEdges.top && "progressive-css-blur-visible", blurClassName)}
          edge="top"
          height={blurHeight}
        />
      ) : null}

      {edges.includes("bottom") ? (
        <ProgressiveBlurStack
          blurLevels={blurLevels}
          className={cn(visibleEdges.bottom && "progressive-css-blur-visible", blurClassName)}
          edge="bottom"
          height={blurHeight}
        />
      ) : null}
    </div>
  );
}

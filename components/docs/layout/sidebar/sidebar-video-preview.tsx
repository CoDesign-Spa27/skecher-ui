"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { usePrefersFineHover } from "@/hooks/use-prefers-fine-hovers";
import { publicEnv } from "@/lib/public-env";
import type { SidebarItemProps } from "@/types/docs/sidebar-types";

const COVER_BASE_URL = `${publicEnv.assetUrl}/skecher-components/covers`;
const VIDEO_BASE_URL = `${publicEnv.assetUrl}/skecher-components/edit-video-projects`;

const PREVIEW_TRANSITION = {
  duration: 0.16,
  ease: [0.23, 1, 0.32, 1],
} as const;

const PREVIEW_EXIT_TRANSITION = {
  duration: 0.12,
  ease: [0.23, 1, 0.32, 1],
} as const;

const PREVIEW_POSITION_TRANSITION = {
  duration: 0.18,
  ease: [0.77, 0, 0.175, 1],
} as const;

const PREVIEW_HEIGHT = 224;
const PREVIEW_WIDTH = 320;
const PREVIEW_GAP = 16;
const VIEWPORT_GUTTER = 16;

type SidebarVideoPreviewProps = {
  anchorX: number;
  anchorY: number;
  item: Pick<SidebarItemProps, "sketchId" | "title"> | null;
};

export function SidebarVideoPreview({ anchorX, anchorY, item }: SidebarVideoPreviewProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const prefersFineHover = usePrefersFineHover();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  if (!portalRoot || !prefersFineHover) {
    return null;
  }

  const sketchId = item?.sketchId;
  const mediaTransition = shouldReduceMotion ? { duration: 0.1 } : PREVIEW_TRANSITION;
  const maxPreviewTop = Math.max(
    VIEWPORT_GUTTER,
    window.innerHeight - PREVIEW_HEIGHT - VIEWPORT_GUTTER,
  );
  const previewTop = Math.min(
    Math.max(anchorY - PREVIEW_HEIGHT / 2, VIEWPORT_GUTTER),
    maxPreviewTop,
  );
  const maxPreviewLeft = Math.max(
    VIEWPORT_GUTTER,
    window.innerWidth - PREVIEW_WIDTH - VIEWPORT_GUTTER,
  );
  const previewLeft = Math.min(Math.max(anchorX + PREVIEW_GAP, VIEWPORT_GUTTER), maxPreviewLeft);

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-60 hidden md:block">
      <AnimatePresence initial={false}>
        {item && sketchId ? (
          <motion.aside
            animate={{
              filter: "blur(0px)",
              opacity: 1,
              transform: `translate3d(${previewLeft}px, ${previewTop}px, 0)`,
            }}
            className="header-shadow w-80 overflow-hidden rounded-xl bg-sidebar p-1 text-sidebar-foreground will-change-[filter,opacity,transform]"
            data-sidebar-video-preview=""
            data-sketch-id={sketchId}
            exit={{
              filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
              opacity: 0,
              transition: shouldReduceMotion ? { duration: 0.1 } : PREVIEW_EXIT_TRANSITION,
            }}
            initial={{
              filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
              opacity: 0,
              transform: `translate3d(${previewLeft}px, ${previewTop}px, 0)`,
            }}
            key="sidebar-video-preview"
            transition={{
              filter: mediaTransition,
              opacity: mediaTransition,
              transform: shouldReduceMotion ? { duration: 0 } : PREVIEW_POSITION_TRANSITION,
            }}
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <AnimatePresence initial={false}>
                <motion.video
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  autoPlay
                  className="absolute inset-0 size-full object-cover will-change-[opacity,filter]"
                  exit={{
                    opacity: 0,
                    filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                    transition: shouldReduceMotion ? { duration: 0.1 } : PREVIEW_EXIT_TRANSITION,
                  }}
                  initial={{
                    opacity: 0,
                    filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                  }}
                  key={sketchId}
                  loop
                  muted
                  playsInline
                  poster={`${COVER_BASE_URL}/skecher${sketchId}.png`}
                  preload="metadata"
                  src={`${VIDEO_BASE_URL}/skecher${sketchId}.webm`}
                  tabIndex={-1}
                  transition={mediaTransition}
                />
              </AnimatePresence>
              <div className="absolute inset-0 rounded-[inherit] ring-1 ring-black/10 ring-inset dark:ring-white/10" />
            </div>

            <div className="flex h-6 items-center justify-between gap-3 px-1 text-xs">
              {/* <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    className="truncate font-medium"
                    exit={{
                      opacity: 0,
                      filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                      transition: shouldReduceMotion ? { duration: 0.1 } : PREVIEW_EXIT_TRANSITION,
                    }}
                    initial={{
                      opacity: 0,
                      filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                    }}
                    key={item.title}
                    transition={mediaTransition}
                  >
                    {item.title}
                  </motion.span>
                </AnimatePresence> */}
              <span className="shrink-0 tabular-nums text-muted-foreground">Sketch {sketchId}</span>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>,
    portalRoot,
  );
}

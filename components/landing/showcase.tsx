"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { IN_VIEW, useReveal } from "./reveal";
import { ShowcaseVideo } from "./showcase-video";
 
const SHOWCASE_VIDEOS = [
  { className: "col-span-2 row-span-2 lg:col-span-2", index: 21 },
  { className: "col-span-1 row-span-1", index: 22 },
  { className: "col-span-1 row-span-1", index: 19 },
  { className: "col-span-1 row-span-1", index: 14 },
  { className: "col-span-1 row-span-1 lg:col-span-2", index: 10 },
] as const;

export function Showcase() {
  const { item, sequence } = useReveal();
  // No blur on the tiles: an animated filter across five video surfaces costs
  // far more than the same reveal over a heading.
  const { item: tileItem, sequence: tileSequence } = useReveal({ blur: false, stagger: 0.06 });

  return (
    <section
      aria-labelledby="showcase-title"
      className="relative bg-black px-[clamp(12px,1.48vw,19px)] py-[clamp(56px,9vh,120px)] text-white"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <motion.div
          className="flex flex-col gap-6 pb-[clamp(28px,4vw,52px)] sm:flex-row sm:items-end sm:justify-between"
          variants={sequence}
          {...IN_VIEW}
        >
          <motion.div className="w-full" variants={item}>
            <h2
              className="text-balance font-instrument-serif text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02] font-normal tracking-[-0.02em]"
              id="showcase-title"
            >
              <span className="font-sans text-highlight font-bold">25+</span> Components in motion
            </h2>
            <p className="mt-3 text-pretty font-urbanist text-[15px] leading-relaxed text-white/50 sm:text-base">
              A look at what ships in the registry. Every interaction has a live preview and its
              full source in the docs.
            </p>
          </motion.div>

          <motion.div className="shrink-0 self-start sm:self-auto" variants={item}>
            <Link
              className={cn(
                "group inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-lg px-4 sm:self-auto",
                "bg-white/[0.04] font-urbanist text-sm font-medium text-white/80",
                "shadow-[inset_0_0.5px_0_rgb(255_255_255/12%)] backdrop-blur-md outline-none",
                "transition-[color,border-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "hover:border-white/20 hover:text-white active:scale-[0.97] active:duration-100",
                "focus-visible:ring-[3px] focus-visible:ring-white/35",
                "motion-reduce:transform-none motion-reduce:transition-none",
              )}
              href="/docs"
            >
              Browse all components
              <span
                aria-hidden="true"
                className={cn(
                  "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-0.5",
                  "motion-reduce:transform-none motion-reduce:transition-none",
                )}
              >
                &rarr;
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className={cn(
            "grid grid-cols-2 auto-rows-[clamp(116px,27vw,196px)] gap-3",
            "lg:h-[clamp(520px,64vh,760px)] lg:auto-rows-auto lg:grid-cols-3 lg:grid-rows-3 lg:gap-4",
          )}
          variants={tileSequence}
          {...IN_VIEW}
        >
          {SHOWCASE_VIDEOS.map((video) => (
            <motion.div className={video.className} key={video.index} variants={tileItem}>
              <ShowcaseVideo className="h-full w-full" index={video.index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

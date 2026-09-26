"use client";

import { StarIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { IconGithub } from "nucleo-social-media";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HeroCodeShader } from "./assets/hero-code-shader";
// biome-ignore lint/correctness/noUnusedImports: Kept while the orbit artwork is temporarily disabled in the hero composition.
import { HeroOrbit } from "./assets/hero-orbit";
import { InstallCommand } from "./install-command";
import { LandingNav } from "./navbar";
import { ON_MOUNT, useReveal } from "./reveal";

// biome-ignore lint/correctness/noUnusedVariables: Kept as the texture fallback while the shader artwork is active.
function CodeTexture() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute top-[42.05%] left-0 flex h-[66.24%] w-[15.35%] items-center justify-center opacity-5">
        <div className="h-[90.89%] w-[110.03%] flex-none rotate-90 bg-[url('/assets/images/hero-code-texture.png')] bg-[length:100%_125.02%] bg-[position:left_-0.77%] bg-no-repeat" />
      </div>

      <div className="absolute top-[41.83%] left-[33%] flex h-[66.24%] w-[15.92%] items-center justify-center  opacity-10">
        <div className="h-[112.85%] w-[88.61%] flex-none rotate-90 bg-[url('/assets/images/hero-code-texture.png')] bg-[length:100%_100.69%] bg-[position:left_-0.62%] bg-no-repeat" />
      </div>

      <div className="absolute top-[44.68%] right-[6.5%] flex h-[63.35%] w-[15.73%] items-center justify-center opacity-10">
        <div className="h-[90.89%] w-[110.03%] flex-none -scale-y-100 rotate-90 bg-[url('/assets/images/hero-code-texture.png')] bg-[length:100%_125.02%] bg-[position:left_-0.77%] bg-no-repeat" />
      </div>
    </div>
  );
}

function GitHubButton({ starCount }: { starCount: number }) {
  return (
    <Link
      href="https://github.com/CoDesign-Spa27/skecher-ui"
      target="_blank"
      rel="noreferrer"
      aria-label={`View Skecher UI on GitHub, ${starCount} stars`}
      className={cn(
        "group relative isolate border border-neutral-800 inline-flex min-h-11 cursor-pointer items-stretch overflow-hidden rounded-lg bg-gradient-to-t from-[#0f0f0f] to-[#404040] font-urbanist text-sm font-medium text-white  lg:min-h-10",
        "transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] active:duration-100",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
      )}
    >
      <span className="flex items-center gap-2 rounded-l-[7px] bg-[#171717] px-3.5">
        <IconGithub
          aria-hidden="true"
          className={cn(
            "size-[18px] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-115",
            "motion-reduce:transform-none motion-reduce:transition-none",
          )}
        />
      </span>

      <span className="flex min-w-[3.75rem] items-center justify-center gap-1.5 rounded-r-[7px] bg-[#242424] px-3 tabular-nums">
        <span className="relative size-4" aria-hidden="true">
          <StarIcon
            className={cn(
              "absolute inset-0 size-4 text-white/65 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "[@media(hover:hover)_and_(pointer:fine)]:group-hover:-rotate-12 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-75 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0",
              "motion-reduce:transform-none motion-reduce:transition-opacity",
            )}
          />
          <StarIcon
            className={cn(
              "absolute inset-0 size-4 fill-[#f7d774] text-[#f7d774] opacity-0 [transform:rotate(12deg)_scale(0.75)] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:[transform:rotate(0)_scale(1)]",
              "motion-reduce:transform-none motion-reduce:transition-opacity",
            )}
          />
        </span>
        <span>{starCount}</span>
      </span>
    </Link>
  );
}

export function Hero({ starCount }: { starCount: number }) {
  // Above the fold, so it plays on arrival. The delay lets the nav land first.
  const { item, sequence } = useReveal({ delay: 0.18 });

  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-svh overflow-hidden bg-black px-[clamp(12px,1.48vw,19px)] pt-[clamp(12px,2.25vh,18px)] pb-[clamp(16px,2.625vh,21px)] text-white"
    >
      <div className="relative flex min-h-[calc(100svh-clamp(28px,4.875vh,39px))] flex-col overflow-hidden rounded-[clamp(18px,2.03vw,26px)] bg-[#171717] shadow-[inset_0_0.5px_0_rgb(255_255_255/18%),0_-0.5px_0.5px_0.5px_rgb(255_255_255/25%)]">
        {/* <CodeTexture /> */}

        {/* A light source above the panel, so the title sits in the bright part
            and the plate at the bottom reads as the far end of the same room. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[72%] [background:radial-gradient(115%_70%_at_50%_-12%,rgb(255_255_255/8%),transparent_62%)]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[45.47%] [background:linear-gradient(179.27deg,rgb(23_23_23/0%)_2.11%,rgb(23_23_23/60%)_48.18%,#171717_94.25%)]"
          aria-hidden="true"
        />

        <HeroCodeShader className="absolute inset-x-0 bottom-0 z-[3] h-[50%]" />

        <LandingNav />

        {/* Centred in the space the nav leaves, then biased upward so the plate
            at the bottom keeps its room. */}
        <motion.div
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-[clamp(40px,13vh,132px)] text-center"
          variants={sequence}
          {...ON_MOUNT}
        >
          <motion.h1
            id="hero-title"
            className="text-balance whitespace-nowrap font-instrument-serif text-[clamp(3.4rem,10vw,8rem)] leading-[0.98] font-normal tracking-[-0.02em]"
            variants={item}
          >
            Skech the art
          </motion.h1>

          <motion.p
            className="mt-[clamp(10px,1.4vw,20px)] text-balance font-urbanist text-xl leading-[1.1] font-normal text-white/55 sm:max-w-none sm:text-2xl md:text-3xl"
            variants={item}
          >
            Motion Components, that contains life.
          </motion.p>

          {/* A real box, not `display:contents`: transform and opacity do not
              apply to a contents box, so the reveal would silently no-op. */}
          <motion.div
            className="mt-[clamp(16px,1.8vw,24px)] flex w-full justify-center"
            variants={item}
          >
            <InstallCommand />
          </motion.div>

          <motion.div
            className="mt-[clamp(20px,2.2vw,30px)] flex flex-wrap items-center justify-center gap-2.5"
            variants={item}
          >
            <Button
              asChild
              className="min-h-11 cursor-pointer px-5 font-urbanist text-[15px] shadow-none transition-[filter,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:brightness-105 active:scale-[0.97] active:duration-100 motion-reduce:transform-none motion-reduce:transition-none lg:min-h-10"
            >
              <Link href="/docs">Browse Components</Link>
            </Button>

            <GitHubButton starCount={starCount} />
          </motion.div>
        </motion.div>

        {/* <HeroOrbit className="absolute top-[71.1%] left-1/2 z-[4] w-[min(44vw,403px)] -translate-x-1/2 max-sm:w-[min(72vw,330px)]" /> */}
      </div>
    </section>
  );
}

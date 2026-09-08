"use client";
import { motion } from "motion/react";

import CopyButton from "@/components/docs/ui/copy-button";
import { cn } from "@/lib/utils";

const REGISTRY_PATH = "CoDesign-Spa27/skecher-ui/apple-mail-tabs";
export const INSTALL_COMMAND = `npx shadcn@latest add ${REGISTRY_PATH}`;

const GROW_RATIO = 0.04;
const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

const SURFACE_VARIANTS = {
  hovered: { transform: `scaleX(${1 + GROW_RATIO})` },
  rest: { transform: "scaleX(1)" },
};

export function InstallCommand({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "group relative isolate flex w-full max-w-md items-center gap-2 py-1.5 pr-1.5 pl-3.5",
        className,
      )}
      // Explicit, not inherited: inside the hero's reveal group this would
      // otherwise pick up "visible" as its animate state, and the surface would
      // have nothing to return to when the pointer leaves.
      animate="rest"
      initial="rest"
      whileHover="hovered"
    >
      <motion.div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-xl",
          "bg-white/[0.1] backdrop-blur-md",
          "transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "group-hover:border-white/[0.18]",
          "motion-reduce:transform-none motion-reduce:transition-none",
        )}
        transition={spring}
        variants={SURFACE_VARIANTS}
      />

      <span aria-hidden="true" className="select-none font-mono text-[13px] text-white/30">
        $
      </span>

      <code
        className={cn(
          "min-w-0 flex-1 overflow-x-auto py-1 text-left font-mono text-[12.5px] leading-none whitespace-nowrap text-white/55 sm:text-[13px]",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        npx shadcn@latest add <span className="text-white/90">{REGISTRY_PATH}</span>
      </code>

      <CopyButton
        ariaLabel="Copy install command"
        className="size-8 shrink-0 rounded-lg text-white/70 hover:bg-white/10! hover:text-white"
        code={INSTALL_COMMAND}
      />
    </motion.div>
  );
}

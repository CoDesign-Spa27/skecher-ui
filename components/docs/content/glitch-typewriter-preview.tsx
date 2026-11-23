"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { GlitchTypewriter } from "@/components/ui-components/glitch-typewriter";

const lines = [
  "Every word lands with weight.",
  "Typed light, settled bold.",
  "Glitch once, then hold still.",
];

const modes = [
  { id: "auto", label: "Auto" },
  { id: "manual", label: "Type" },
] as const;

export function GlitchTypewriterPreview() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  return (
    <div className="flex w-full max-w-2xl flex-col gap-10 px-6 py-16 sm:px-10">
      <div className="relative grid w-fit grid-cols-2 rounded-full bg-muted p-1 text-sm">
        {/* One pill that slides between two equal halves, so there is no
            shared-layout projection to go wrong inside a scrolled or scaled page. */}
        <motion.span
          animate={{ x: mode === "auto" ? "0%" : "100%" }}
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm"
          initial={false}
          transition={{ type: "spring", stiffness: 520, damping: 40 }}
        />
        {modes.map((item) => (
          <button
            aria-pressed={mode === item.id}
            className="relative z-10 min-w-16 rounded-full px-3.5 py-1 font-medium text-muted-foreground transition-colors aria-pressed:text-foreground"
            key={item.id}
            onClick={() => setMode(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <GlitchTypewriter
        className="min-h-[2.4em] text-4xl leading-[1.15] tracking-tight text-foreground sm:text-5xl"
        key={mode}
        mode={mode}
        placeholder="Type something…"
        text={lines}
      />
    </div>
  );
}

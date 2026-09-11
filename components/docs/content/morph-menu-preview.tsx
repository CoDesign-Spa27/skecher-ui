"use client";

import { useState } from "react";

import { MorphMenu, type MorphMenuDirection } from "@/components/ui-components/morph-menu";

const DIRECTION_OPTIONS: ReadonlyArray<{
  value: MorphMenuDirection;
  label: string;
  symbol: string;
}> = [
  { value: "top-left", label: "Top left", symbol: "↖" },
  { value: "top", label: "Top", symbol: "↑" },
  { value: "top-right", label: "Top right", symbol: "↗" },
  { value: "left", label: "Left", symbol: "←" },
  { value: "center", label: "Center", symbol: "•" },
  { value: "right", label: "Right", symbol: "→" },
  { value: "bottom-left", label: "Bottom left", symbol: "↙" },
  { value: "bottom", label: "Bottom", symbol: "↓" },
  { value: "bottom-right", label: "Bottom right", symbol: "↘" },
];

export function MorphMenuPreview() {
  const [direction, setDirection] = useState<MorphMenuDirection>("center");

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex min-h-[420px] w-full max-w-xl items-center justify-center">
        <MorphMenu direction={direction} />
      </div>

      <fieldset className="w-full max-w-lg">
        <legend className="mb-3 w-full text-center text-sm font-medium text-muted-foreground">
          Morph direction
        </legend>

        <div className="grid grid-cols-3 gap-2">
          {DIRECTION_OPTIONS.map((option) => {
            const selected = direction === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setDirection(option.value)}
                className={`flex h-9 items-center justify-center gap-2 rounded-full border px-2 text-xs transition-colors sm:text-sm ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <span aria-hidden="true">{option.symbol}</span>
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

"use client";

import { useState } from "react";

import { GooeyChipFilter, type GooeyChipItem } from "@/components/ui-components/gooey-chip-filter";

const items: GooeyChipItem[] = [
  { id: "design", label: "Design", count: 24 },
  { id: "engineering", label: "Engineering", count: 41 },
  { id: "product", label: "Product", count: 12 },
  { id: "marketing", label: "Marketing", count: 9 },
  { id: "remote", label: "Remote", count: 33 },
  { id: "full-time", label: "Full-time", count: 52 },
  { id: "contract", label: "Contract", count: 7 },
];

export function GooeyChipFilterPreview() {
  const [value, setValue] = useState<string[]>(["engineering", "product"]);

  return (
    <div className="w-full max-w-xl px-6 py-10 sm:px-10">
      <GooeyChipFilter
        items={items}
        label="Filter open roles"
        onValueChange={setValue}
        value={value}
      />

      <button
        className="mt-6 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-0"
        disabled={value.length === 0}
        onClick={() => setValue([])}
        type="button"
      >
        Clear filters
      </button>
    </div>
  );
}

"use client";

import { Bookmark, Copy, PenLine, Share2, Trash2 } from "lucide-react";

import { GooeyTooltip } from "@/components/ui-components/gooey-tooltip";

const actions = [
  { label: "Edit", content: "Edit post", icon: PenLine },
  { label: "Copy", content: "Copy link", icon: Copy },
  { label: "Save", content: "Save for later", icon: Bookmark },
  { label: "Share", content: "Share", icon: Share2 },
  { label: "Delete", content: "Move to trash", icon: Trash2 },
];

export function GooeyTooltipPreview() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center px-6">
      <div className="flex items-center gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <GooeyTooltip aria-label={action.label} content={action.content} key={action.label}>
              <Icon aria-hidden="true" />
            </GooeyTooltip>
          );
        })}
      </div>
    </div>
  );
}

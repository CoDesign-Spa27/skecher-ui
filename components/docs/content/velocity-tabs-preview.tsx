"use client";

import { useState } from "react";

import { type VelocityTab, VelocityTabs } from "@/components/ui-components/velocity-tabs";

const TABS = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "Activity",
    value: "activity",
  },
  {
    label: "Settings",
    value: "settings",
  },
] as const satisfies readonly VelocityTab<string>[];

const PANEL_COPY = {
  overview: {
    description: "A clear snapshot of the workspace and its latest changes.",
    title: "Workspace overview",
  },
  activity: {
    description: "Recent edits, comments, and handoffs from your team.",
    title: "Team activity",
  },
  settings: {
    description: "Manage permissions, notifications, and workspace preferences.",
    title: "Workspace settings",
  },
} as const;

type TabValue = keyof typeof PANEL_COPY;

export function VelocityTabsPreview() {
  const [value, setValue] = useState<TabValue>("overview");
  const panel = PANEL_COPY[value];

  return (
    <div className="w-full max-w-md">
      <VelocityTabs
        aria-label="Workspace sections"
        onValueChange={setValue}
        tabs={TABS}
        value={value}
      />

      <div aria-live="polite" className="px-1 pt-6">
        <p className="text-sm font-medium text-foreground">{panel.title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{panel.description}</p>
      </div>
    </div>
  );
}

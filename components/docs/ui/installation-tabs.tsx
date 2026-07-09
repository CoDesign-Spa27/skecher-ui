"use client";

import type * as React from "react";

import { SuperIsland } from "@/components/docs/super-island";

interface InstallationTabsProps {
  cliCommands: string[];
  dependencies?: string[];
  manualSteps?: React.ReactNode;
  componentName?: string;
  componentDescription?: string;
  importName?: string;
  files?: {
    path: string;
    description?: string;
  }[];
}

function InstallationTabs({
  cliCommands,
  dependencies = [],
  manualSteps,
  componentName,
  componentDescription,
  importName,
  files,
}: InstallationTabsProps) {
  return (
    <SuperIsland
      cliCommands={cliCommands}
      componentDescription={componentDescription}
      componentName={componentName}
      dependencies={dependencies}
      files={files}
      importName={importName}
      manualSteps={manualSteps}
    />
  );
}

export { InstallationTabs };

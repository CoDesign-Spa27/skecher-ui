"use client";

import { BunIcon, NpmIcon, PnpmIcon, YarnIcon } from "@/assets/code-block/icons";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";

import CopyButton from "./copy-button";

type PackageManager = "npm" | "yarn" | "bun" | "pnpm";

interface CliBlockProps {
  commands: string[];
}

const packageCommands: Record<PackageManager, string> = {
  npm: "npx shadcn@latest add",
  yarn: "yarn shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
  pnpm: "pnpm dlx shadcn@latest add",
};

function CliBlock({ commands }: CliBlockProps) {
  const { packageManager, setConfig } = useConfig();
  const command = `${packageCommands[packageManager]} ${commands.join(" ")}`;

  return (
    <Tabs
      defaultValue="npm"
      value={packageManager}
      onValueChange={(value) => setConfig({ packageManager: value as PackageManager })}
    >
      <div className="dark:bg-primary-foreground group flex min-w-0 max-w-full flex-col rounded-[8px] bg-[#F5F5F5] p-1">
        <div className="flex min-w-0 flex-row items-center justify-between gap-2 pr-1 pb-1">
          <div className="no-scrollbar min-w-0 flex-1 overflow-x-auto">
            <TabsList
              className={"header-shadow  rounded-sm"}
              indicatorClassName={cn(
                packageManager === "npm" && "rounded-sm border border-[#C3292F]!",
                packageManager === "yarn" && "rounded-sm border border-[#3592BD]!",
                packageManager === "bun" && "rounded-sm border border-primary!",
                packageManager === "pnpm" && "rounded-sm border border-[#FAAF18]!",
              )}
            >
              <TabsTab
                className="h-5! gap-2 px-1.5 hover:bg-transparent! data-active:text-[#C3292F] data-active:header-shadow"
                value="npm"
              >
                <NpmIcon className="size-3" />
                npm
              </TabsTab>
              <TabsTab
                className="h-5! gap-2 px-1.5 hover:bg-transparent! data-active:text-[#3592BD]"
                value="yarn"
              >
                <YarnIcon className="size-3" />
                yarn
              </TabsTab>
              <TabsTab
                className="data-active:text-primary h-5! gap-2 px-1.5 hover:bg-transparent!"
                value="bun"
              >
                <BunIcon className="size-3" />
                bun
              </TabsTab>
              <TabsTab
                className="h-5! gap-2 px-1.5 hover:bg-transparent! data-active:text-[#FAAF18]"
                value="pnpm"
              >
                <PnpmIcon className="size-3" />
                pnpm
              </TabsTab>
            </TabsList>
          </div>
          <CopyButton className="-mt-1 shrink-0" code={command} source="install_command" />
        </div>
        <div className="overflow-x-auto break-all bg-background text-muted-foreground rounded-[5px] border p-3 text-[13px]">
          {(Object.keys(packageCommands) as PackageManager[]).map((manager) => (
            <TabsPanel className="font-mono text-xs" key={manager} value={manager}>
              <span className="text-highlight">{packageCommands[manager]}</span>{" "}
              {commands.join(" ")}
            </TabsPanel>
          ))}
        </div>
      </div>
    </Tabs>
  );
}

export { CliBlock };

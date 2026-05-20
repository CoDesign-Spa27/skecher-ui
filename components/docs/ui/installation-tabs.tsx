"use client";

import * as React from "react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { useConfig } from "@/hooks/use-config";
import { CliBlock } from "./cli-block";
import { CommandBlock } from "./command-block";

interface InstallationTabsProps {
    cliCommands: string[];
    dependencies?: string[];
    manualSteps?: React.ReactNode;
}

function InstallationTabs({
    cliCommands,
    dependencies = [],
    manualSteps,
}: InstallationTabsProps) {
    const { installationType, setConfig } = useConfig();

    return (
        <Tabs
            className="min-w-0 w-full max-w-full"
            value={installationType}
            onValueChange={(value) => setConfig({ installationType: value as "cli" | "manual" })}
        >
            <TabsList variant="underline" className="mb-2">
                <TabsTab value="cli">CLI</TabsTab>
                <TabsTab value="manual">Manual</TabsTab>
            </TabsList>
            <TabsPanel className="min-w-0 w-full max-w-full" value="cli">
                <CliBlock commands={cliCommands} />
            </TabsPanel>
            <TabsPanel className="min-w-0 w-full max-w-full" value="manual">
                <ol className="min-w-0 space-y-5">
                    {dependencies.length > 0 ? (
                        <li className="min-w-0 space-y-2">
                            <h4 className="text-sm font-medium text-foreground">
                                <span className="mr-2 text-muted-foreground">1.</span>
                                Install dependencies
                            </h4>
                            <CommandBlock commands={dependencies} />
                        </li>
                    ) : null}
                    {manualSteps ? (
                        <li className="min-w-0 space-y-2">
                            <h4 className="text-sm font-medium text-foreground">
                                <span className="mr-2 text-muted-foreground">
                                    {dependencies.length > 0 ? "2." : "1."}
                                </span>
                                Add the component code
                            </h4>
                            {manualSteps}
                        </li>
                    ) : null}
                </ol>
            </TabsPanel>
        </Tabs>
    );
}

export { InstallationTabs };

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { IconEyeOpenFillDuo18 } from 'nucleo-ui-essential-fill-duo-18';
import { CodeIcon } from "@/assets/app-icons/code";
import CopyButton from "../docs/ui/copy-button";
type ComponentWrapperTab = "preview" | "code";

interface ComponentWrapperProps extends Omit<React.ComponentProps<"section">, "children"> {
    action?: "replay" | "toggle" | string;
    align?: "center" | "start" | "end";
    children: React.ReactNode;
    code?: React.ReactNode;
    codeString?: string;
    doc?: React.ReactNode;
    previewClassName?: string;
    title?: string;
}

const TABS: Array<{
    key: ComponentWrapperTab;
    label: string;
    icon: React.ReactNode;
}> = [
    { key: "preview", label: "Preview", icon: <IconEyeOpenFillDuo18 className="size-3.5" /> },
    { key: "code", label: "Code", icon: <CodeIcon className="size-5" /> },
];

function EmptyPanel({ label }: { label: string }) {
    return (
        <div className="flex h-full items-center justify-center px-6 text-sm text-muted-foreground">
            {label}
        </div>
    );
}

function AnimatedIcon({ tabKey }: { tabKey: ComponentWrapperTab }) {
    const tab = TABS.find((t) => t.key === tabKey);
    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={tabKey}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 0.18 } }}
                exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.18 } }}
                className="flex items-center justify-center w-full h-full"
                style={{ willChange: "opacity, filter" }}
            >
                {tab?.icon}
            </motion.div>
        </AnimatePresence>
    );
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
    align = "center",
    children,
    className,
    code,
    codeString,
    doc,
    previewClassName,
    title = "Component example",
    ...props
}) => {
    const [showTab, setShowTab] = React.useState<ComponentWrapperTab>("preview");
    // Keyboard & pointer event helpers for tab switching accessibility & usability
    const handleFocus = (tab: ComponentWrapperTab) => setShowTab(tab);

    const handleClick = (tab: ComponentWrapperTab) => setShowTab(tab);
    const handleMouseDown = () => { };
    const handleMouseUp = () => { };

    return (
        <section className={cn("my-6 w-full", className)} {...props}>
            <div className="rounded-lg bg-muted/60 p-1 header-shadow dark:bg-sidebar/80">
                <div className="flex flex-col gap-3 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background/90 text-foreground overflow-hidden">
                            <AnimatedIcon tabKey={showTab} />
                        </div>
                        <span className="truncate font-mono text-xs">{title}</span>
                    </div>
                    <ul className="flex space-x-2 rounded-lg mb-1 w-fit p-0.5 header-shadow">
                        {TABS.map((tab) => {
                            const isActive = showTab === tab.key;
                            const TabIcon = tab.icon;
                            return (
                                <motion.li
                                    layout
                                    className={cn(
                                        "relative cursor-pointer px-2 py-1 text-sm outline-hidden transition-colors flex items-center gap-1.5 rounded-md",
                                        isActive
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                    tabIndex={0}
                                    key={tab.key}
                                    onFocus={() => handleFocus(tab.key)}
                                    onClick={() => handleClick(tab.key)}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    style={{ outline: "none" }}
                                >
                                    {isActive ? (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute inset-0 rounded-md bg-black/5 dark:bg-white/10 header-shadow"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    ) : null}
                                    {TabIcon}
                                    <span className="relative z-10 text-inherit">{tab.label}</span>
                                </motion.li>
                            );
                        })}
                    </ul>
                </div>

                <div className="h-80 overflow-hidden rounded-md border border-border/80 bg-background sm:h-[calc(100vh-300px)]">
                    {showTab === "preview" && (
                        <div className="h-full">
                            <div
                                className={cn(
                                    "flex h-full w-full overflow-auto px-4 py-6 sm:px-6",
                                    align === "center" && "items-center justify-center",
                                    align === "start" && "items-start justify-start",
                                    align === "end" && "items-end justify-end",
                                    previewClassName,
                                )}
                            >
                                <div className="flex h-full w-full items-center justify-center">
                                    {children}
                                </div>
                            </div>
                        </div>
                    )}

                    {showTab === "code" && (
                        <div className="h-full overflow-hidden relative">
                            {codeString && <CopyButton code={codeString} className="absolute top-2 right-2 z-10" />}
                            {code ? code : <EmptyPanel label="No source added for this example." />}
                        </div>
                    )}
                </div>
            </div>
            {doc ? (
                <div className="mt-8">
                    {doc}
                </div>
            ) : null}
        </section>
    );
};

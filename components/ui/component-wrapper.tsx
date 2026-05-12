"use client";
import React, { useState, ReactNode, useRef } from "react";
import { motion } from "motion/react";
import clsx from "clsx";

interface ComponentWrapperProps {
    action?: "replay" | "toggle" | string;
    children: React.ReactNode;
    className?: string;
    code?: ReactNode;
    doc?: ReactNode;
}

const TABS = [
    { key: "preview", label: "Preview" },
    { key: "code", label: "Code" },
    { key: "doc", label: "Doc" }
];

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
    children,
    className = "",
    code,
    doc,
}) => {
    // Two-states: "activeTab" is the real tab, "hoverTab" is the one shown on hover unless overridden by click
    const [activeTab, setActiveTab] = useState<"preview" | "code" | "doc">("preview");
    const [hoverTab, setHoverTab] = useState<"preview" | "code" | "doc" | null>(null);
    const clickLockRef = useRef<boolean>(false);

    const showTab = hoverTab && !clickLockRef.current ? hoverTab : activeTab;

    const handleMouseOver = (tabKey: "preview" | "code" | "doc") => {
        if (!clickLockRef.current) setHoverTab(tabKey);
    };

    const handleMouseLeave = () => {
        setHoverTab(null);
    };

    const handleClick = (tabKey: "preview" | "code" | "doc") => {
        setActiveTab(tabKey);
        clickLockRef.current = true;
        setHoverTab(null);
    };

    const handleMouseDown = (tabKey: "preview" | "code" | "doc") => {
        // When mouse is down, clicking: lock the tab
        clickLockRef.current = true;
    };

    const handleMouseUp = () => {
        // Mouse up releases lock, but stays on the last clicked tab
        clickLockRef.current = false;
    };

    const handleFocus = (tabKey: "preview" | "code" | "doc") => {
        setActiveTab(tabKey);
        clickLockRef.current = true;
        setHoverTab(null);
    };

    return (
        <div className={`flex flex-col w-full h-full ${className} rounded-lg px-0.5 my-4`}>
            <ul className="flex space-x-2 mb-2 rounded-lg p-1 w-fit header-shadow">
                {TABS.map((tab) => {
                    const isActive = showTab === tab.key;
                    return (
                        <motion.li
                            layout
                            className={clsx(
                                "relative cursor-pointer px-2 py-1 text-sm outline-hidden transition-colors",
                                isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                            tabIndex={0}
                            key={tab.key}
                            onFocus={() => handleFocus(tab.key as "preview" | "code" | "doc")}
                            onMouseOver={() => handleMouseOver(tab.key as "preview" | "code" | "doc")}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(tab.key as "preview" | "code" | "doc")}
                            onMouseDown={() => handleMouseDown(tab.key as "preview" | "code" | "doc")}
                            onMouseUp={handleMouseUp}
                            style={{ outline: "none" }}
                        >
                            {isActive ? (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute inset-0 rounded-md bg-black/5 dark:bg-white/10 header-shadow"
                                />
                            ) : null}
                            <span className="relative text-inherit">{tab.label}</span>
                        </motion.li>
                    );
                })}
            </ul>
            <div className="flex-1 w-full h-full header-shadow rounded-lg p-4">
                {showTab === "preview" && (
                    <div className="flex flex-col items-center justify-center w-full h-full ">
                        {children}
                    </div>
                )}
                {showTab === "code" && code}
                {showTab === "doc" && doc}
            </div>
        </div>
    );
};
 
"use client";

import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    useVelocity,
} from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type VelocityTab<T extends string> = {
    disabled?: boolean;
    label: ReactNode;
    value: T;
};

export type VelocityTabsProps<T extends string> = {
    "aria-label"?: string;
    className?: string;
    defaultValue?: T;
    indicatorClassName?: string;
    onValueChange?: (value: T) => void;
    tabClassName?: string;
    tabs: readonly VelocityTab<T>[];
    value?: T;
};

const SPRING = {
    damping: 34,
    mass: 0.8,
    stiffness: 420,
} as const;

function getInitialValue<T extends string>(tabs: readonly VelocityTab<T>[], defaultValue?: T) {
    if (
        defaultValue !== undefined &&
        tabs.some((tab) => tab.value === defaultValue && !tab.disabled)
    ) {
        return defaultValue;
    }

    return tabs.find((tab) => !tab.disabled)?.value;
}

export function VelocityTabs<T extends string>({
    "aria-label": ariaLabel = "Choose a view",
    className,
    defaultValue,
    indicatorClassName,
    onValueChange,
    tabClassName,
    tabs,
    value,
}: VelocityTabsProps<T>) {
    const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(() =>
        getInitialValue(tabs, defaultValue),
    );
    const shouldReduceMotion = useReducedMotion();
    const selectedValue = value ?? uncontrolledValue;
    const requestedIndex = tabs.findIndex((tab) => tab.value === selectedValue && !tab.disabled);
    const selectedIndex =
        requestedIndex >= 0 ? requestedIndex : tabs.findIndex((tab) => !tab.disabled);
    const motionIndex = Math.max(0, selectedIndex);

    const targetIndex = useMotionValue(motionIndex);
    const springIndex = useSpring(targetIndex, SPRING);
    const velocity = useVelocity(springIndex);
    const x = useTransform(springIndex, (index) => `${index * 100}%`);
    const scaleX = useTransform(
        velocity,
        [-12, -3, 0, 3, 12],
        [1.25, 1.08, 1, 1.08, 1.25],
    );

    const blur = useTransform(
        velocity,
        [-12, -3, 0, 3, 12],
        [1.5, 0.4, 0, 0.4, 1.5],
    );
    const filter = useTransform(blur, (amount) => `blur(${amount}px)`);

    useEffect(() => {
        targetIndex.set(motionIndex);
    }, [motionIndex, targetIndex]);

    if (tabs.length === 0) {
        return null;
    }

    function selectTab(tab: VelocityTab<T>, index: number) {
        if (tab.disabled || tab.value === selectedValue) {
            return;
        }

        if (value === undefined) {
            setUncontrolledValue(tab.value);
        }

        targetIndex.set(index);
        onValueChange?.(tab.value);
    }

    return (
        <fieldset
            aria-label={ariaLabel}
            className={cn("relative grid min-w-0 w-full rounded-lg border bg-accent p-1", className)}
            style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
            {selectedIndex >= 0 ? (
                <motion.span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute inset-y-1 left-1 rounded-md bg-primary shadow-sm",
                        indicatorClassName,
                    )}
                    style={{
                        filter: shouldReduceMotion ? "none" : filter,
                        scaleX: shouldReduceMotion ? 1 : scaleX,
                        width: `calc((100% - 8px) / ${tabs.length})`,
                        x,
                    }}
                />
            ) : null}

            {tabs.map((tab, tabIndex) => {
                const isActive = tabIndex === selectedIndex && !tab.disabled;

                return (
                    <button
                        aria-pressed={isActive}
                        className={cn(
                            "relative z-10 min-w-0 rounded-md px-3 py-1.5 text-sm font-medium outline-none",
                            "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                            tabClassName,
                        )}
                        disabled={tab.disabled}
                        key={tab.value}
                        onClick={() => selectTab(tab, tabIndex)}
                        type="button"
                    >
                        <span className="block truncate">{tab.label}</span>
                    </button>
                );
            })}
        </fieldset>
    );
}

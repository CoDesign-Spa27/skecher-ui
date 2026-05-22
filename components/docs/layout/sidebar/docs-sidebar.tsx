"use client";

import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { SIDEBAR_OPTIONS } from "@/constants/sidebar-options";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DocsSidebarHeader from "./sidebar-header";
import { motion, Transition } from "motion/react";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { click004Sound } from "@/lib/click-004";
// Faster animation: increase stiffness, lower damping
const FAST_SPRING = { type: "easeInOut", duration: 0.1 };

export function DocsSidebar({
    ...props
}: ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    // each item gets individual hover state
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    // Prepare the sound effect hook
    const [playClick] = useSound(click004Sound, { hoverSound: true });

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <Sidebar className="z-50 font-raleway" {...props} variant="floating">
            <DocsSidebarHeader />
            <SidebarContent className="mt-2">
                <SidebarMenu>
                    {SIDEBAR_OPTIONS.map((item, idx) => {
                        if (item?.type === "section") {
                            return (
                                <SidebarMenuItem key={item?.title}>
                                    <div className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        {item.title}
                                    </div>
                                </SidebarMenuItem>
                            );
                        }

                        const isActive = pathname === item?.url;
                        const isHovered = hoveredIdx === idx;

                        // Wrap sound play on mouse enter
                        const handleMouseEnter = () => {
                            setHoveredIdx(idx);
                            playClick();
                        };

                        return (
                            <SidebarMenuItem key={item?.title}>
                                <SidebarMenuButton
                                    asChild
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    isActive={isActive}
                                    className={cn(
                                        "border border-transparent relative",
                                    )}
                                >
                                    <Link href={item?.url ?? "#"} onClick={handleLinkClick} className="relative flex items-center">
                                        {/* The animated horizontal line */}
                                        <motion.hr
                                            key={item?.title}
                                            initial={{ width: 0 }}
                                            animate={{ width: isHovered ? 45 : 32 }}  
                                            transition={FAST_SPRING as Transition}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 border-t-2 border-highlight"
                                            style={{
                                                borderTopWidth: 1,
                                                borderColor: "var(--color-highlight, #FF773B)",
                                            }}
                                        />

                                        {/* The indicator dot - optional, kept for visual */}
                                        <motion.div
                                            key={item?.title}
                                            initial={{ x: 0 }}
                                            animate={{ x: isHovered ? 13 : 0 }}
                                            transition={FAST_SPRING as Transition}
                                            className="absolute left-0 top-0 w-1.5 h-1.5 bg-highlight ml-8 mt-[12px]"
                                        />

                                        {/* Animated shifting label */}
                                        <motion.div
                                            className="flex flex-col items-center"
                                            style={{
                                                paddingLeft: isHovered ? 53 : 40,
                                                transition: "padding-left 0.1s",
                                            }}
                                            animate={{
                                                paddingLeft: isHovered ? 53 : 40
                                            }}
                                            transition={FAST_SPRING as Transition}
                                        >
                                            <span className="font-semibold text-center">{item?.title}</span>
                                            {item?.badge && (
                                                <Badge variant={item?.badge?.variant}>
                                                    <span
                                                        className={cn(
                                                            item?.badge?.sparkles && "sparkles-bg"
                                                        )}
                                                    >
                                                        {item?.badge?.label}
                                                    </span>
                                                </Badge>
                                            )}
                                        </motion.div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>
            {/* <SidebarFooter>
                <SidebarMenuButton
                    variant="outline"
                    className="border border-dashed flex justify-center text-xs"
                />
            </SidebarFooter> */}
        </Sidebar>
    );
}

"use client";

import { motion, type Transition, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SIDEBAR_OPTIONS } from "@/constants/sidebar-options";
import { cn } from "@/lib/utils";

import DocsSidebarHeader from "./sidebar-header";
import { SidebarVideoPreview } from "./sidebar-video-preview";

const FAST_SPRING: Transition = { type: "spring", stiffness: 600, damping: 30 };
const ITEM_HOVER_SPRING: Transition = { type: "spring", stiffness: 700, damping: 30 };
const REDUCED_MOTION_TRANSITION: Transition = { duration: 0.12 };

type HoveredSidebarItem = {
  anchorX: number;
  anchorY: number;
  idx: number;
};

export function DocsSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState<HoveredSidebarItem | null>(null);
  const hoveredIdx = hoveredSidebarItem?.idx ?? null;
  const hoveredItem = hoveredIdx === null ? null : (SIDEBAR_OPTIONS[hoveredIdx] ?? null);
  const previewItem = hoveredItem?.sketchId ? hoveredItem : null;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="z-50 font-raleway" {...props} variant="floating">
      <DocsSidebarHeader />
      <SidebarContent
        blurHeight={120}
        containerClassName="mt-2 h-[calc(100svh-4rem)] flex-none md:h-[calc(100svh-5.25rem)]"
      >
        <SidebarMenu onMouseLeave={() => setHoveredSidebarItem(null)}>
          {SIDEBAR_OPTIONS.map((item, idx) => {
            if (item?.type === "section") {
              return (
                <SidebarMenuItem key={item?.title} onMouseEnter={() => setHoveredSidebarItem(null)}>
                  <div
                    className={cn(
                      "flex items-baseline gap-2 px-3 pb-2 text-sm font-semibold text-sidebar-foreground/75",
                      idx === 0 ? "pt-3" : "pt-6",
                    )}
                  >
                    <span>{item.title}</span>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground/70">
                      {item.count}
                    </span>
                  </div>
                </SidebarMenuItem>
              );
            }

            const isActive = pathname === item?.url;
            const isHovered = hoveredIdx === idx;
            const opacity = isActive ? 1 : hoveredIdx !== null ? (isHovered ? 1 : 0.3) : 0.55;
            const x = shouldReduceMotion ? 0 : isActive ? 8 : isHovered ? 6 : 0;

            return (
              <SidebarMenuItem key={item?.title}>
                <SidebarMenuButton
                  asChild
                  onMouseEnter={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const itemContent = event.currentTarget.querySelector<HTMLElement>(
                      "[data-sidebar-item-content]",
                    );
                    const contentBounds = itemContent?.getBoundingClientRect() ?? bounds;
                    const pendingHoverOffset = isActive || shouldReduceMotion ? 0 : 6;

                    setHoveredSidebarItem({
                      anchorX: contentBounds.right + pendingHoverOffset,
                      anchorY: bounds.top + bounds.height / 2,
                      idx,
                    });
                  }}
                  isActive={isActive}
                  className={cn("border border-transparent relative")}
                >
                  <Link
                    href={item?.url ?? "#"}
                    onClick={handleLinkClick}
                    className="relative flex items-center"
                  >
                    <motion.hr
                      initial={{ width: 0 }}
                      animate={{ width: isHovered || isActive ? 20 : 15 }}
                      transition={shouldReduceMotion ? REDUCED_MOTION_TRANSITION : FAST_SPRING}
                      className="absolute left-0 top-1/2 -translate-y-1/2 border-t-2 border-highlight"
                      style={{
                        borderTopWidth: 1,
                        borderColor: "var(--color-highlight, #FF773B)",
                      }}
                    />

                    <motion.div
                      initial={{ x: 0 }}
                      animate={{ x: isHovered || isActive ? 12 : 0 }}
                      transition={shouldReduceMotion ? REDUCED_MOTION_TRANSITION : FAST_SPRING}
                      className="absolute left-0 top-0 w-1.5 h-1.5 bg-highlight ml-4 mt-[12px] rounded-full"
                    />

                    <motion.div
                      animate={{ opacity, x }}
                      className="flex items-center gap-2 pl-6 active:scale-[0.97]"
                      data-sidebar-item-content=""
                      initial={false}
                      style={{ transformOrigin: "left center" }}
                      transition={
                        shouldReduceMotion ? REDUCED_MOTION_TRANSITION : ITEM_HOVER_SPRING
                      }
                    >
                      <span className="font-semibold text-center">{item?.title}</span>
                      {item?.badge && (
                        <Badge className="font-bold rounded-sm bg-highlight p-0 text-[10px] px-1">
                          {item?.badge?.label}
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
      <SidebarVideoPreview
        anchorX={hoveredSidebarItem?.anchorX ?? 0}
        anchorY={hoveredSidebarItem?.anchorY ?? 0}
        item={previewItem}
      />
      {/* <SidebarFooter>
                <SidebarMenuButton
                    variant="outline"
                    className="border border-dashed flex justify-center text-xs"
                />
            </SidebarFooter> */}
    </Sidebar>
  );
}

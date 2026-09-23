"use client";

import { AnimatePresence, motion, type Transition, useReducedMotion } from "motion/react";
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
import { SIDEBAR_CATEGORIES, SIDEBAR_CATEGORIES_OPTIONS } from "@/constants/sidebar-options";
import type { SidebarCategory, SidebarItemProps } from "@/types/docs/sidebar-types";

import DocsSidebarHeader from "./sidebar-header";
import { SidebarVideoPreview } from "./sidebar-video-preview";

const FAST_SPRING: Transition = { type: "spring", stiffness: 600, damping: 30 };
const ITEM_HOVER_SPRING: Transition = { type: "spring", stiffness: 700, damping: 30 };
const REDUCED_MOTION_TRANSITION: Transition = { duration: 0.12 };

type CategoryFilter = "All" | SidebarCategory;

const CATEGORY_FILTERS: CategoryFilter[] = ["All", ...SIDEBAR_CATEGORIES_OPTIONS];

function generateCharacterKeys(text: string) {
  const characterCount: Record<string, number> = {};

  return Array.from(text).map((character) => {
    characterCount[character] = (characterCount[character] ?? 0) + 1;

    return {
      character,
      key: `${character}-${characterCount[character]}`,
    };
  });
}

function MorphText({ children, reduceMotion }: { children: string; reduceMotion: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {generateCharacterKeys(children).map(({ character, key }) => (
        <motion.span
          key={key}
          layout={!reduceMotion}
          layoutId={reduceMotion ? undefined : `sidebar-filter-${key}`}
          className="inline-block text-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion
              ? { type: "tween", duration: 0.12 }
              : {
                  type: "spring",
                  duration: 0.25,
                  bounce: 0,
                  opacity: { type: "spring", duration: 0.2, bounce: 0 },
                }
          }
        >
          {character === " " ? "\u00A0" : character}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

type HoveredSidebarItem = {
  anchorX: number;
  anchorY: number;
  item: SidebarItemProps;
};

export function DocsSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const shouldReduceMotion = useReducedMotion();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState<HoveredSidebarItem | null>(null);

  const visibleCategories = SIDEBAR_CATEGORIES.filter(
    (category) => categoryFilter === "All" || category.title === categoryFilter,
  );
  const nextCategoryFilter =
    CATEGORY_FILTERS[(CATEGORY_FILTERS.indexOf(categoryFilter) + 1) % CATEGORY_FILTERS.length];

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderLink = (item: SidebarItemProps) => {
    const isActive = pathname === item.url;
    const isHovered = hoveredSidebarItem?.item.url === item.url;
    const hasHoveredItem = hoveredSidebarItem !== null;
    const opacity = isActive ? 1 : hasHoveredItem ? (isHovered ? 1 : 0.3) : 0.55;
    const x = shouldReduceMotion ? 0 : isActive ? 8 : isHovered ? 6 : 0;

    return (
      <SidebarMenuItem key={item.url}>
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
              item,
            });
          }}
          isActive={isActive}
          className="relative border border-transparent"
        >
          <Link
            href={item.url ?? "#"}
            onClick={handleLinkClick}
            className="relative flex items-center"
          >
            <motion.hr
              initial={{ width: 0 }}
              animate={{ width: isHovered || isActive ? 20 : 15 }}
              transition={shouldReduceMotion ? REDUCED_MOTION_TRANSITION : FAST_SPRING}
              className="absolute left-0 top-1/2 -translate-y-1/2 border-t-2 border-highlight"
              style={{ borderTopWidth: 1, borderColor: "var(--color-highlight, #FF773B)" }}
            />
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: isHovered || isActive ? 12 : 0 }}
              transition={shouldReduceMotion ? REDUCED_MOTION_TRANSITION : FAST_SPRING}
              className="absolute left-0 top-0 ml-4 mt-[12px] size-1.5 rounded-full bg-highlight"
            />
            <motion.div
              animate={{ opacity, x }}
              className="flex items-center gap-2 pl-6 active:scale-[0.96]"
              data-sidebar-item-content=""
              initial={false}
              style={{ transformOrigin: "left center" }}
              transition={shouldReduceMotion ? REDUCED_MOTION_TRANSITION : ITEM_HOVER_SPRING}
            >
              <span className="text-center font-semibold">{item.title}</span>
              {item.badge && (
                <Badge className="rounded-sm bg-highlight px-1 py-0 text-[10px] font-bold">
                  {item.badge.label}
                </Badge>
              )}
            </motion.div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="z-50 font-raleway" {...props} variant="floating">
      <DocsSidebarHeader />
      <div className="px-3 py-3">
        <button
          type="button"
          onClick={() => setCategoryFilter(nextCategoryFilter)}
          aria-label={`Showing ${categoryFilter} categories. Click to show ${nextCategoryFilter}.`}
          className="inline-flex h-8 items-center rounded-md px-2 text-sm font-semibold text-sidebar-foreground/70 outline-none transition-[background-color,color,box-shadow,transform] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-[0.96]"
        >
          <MorphText reduceMotion={Boolean(shouldReduceMotion)}>{categoryFilter}</MorphText>
        </button>
      </div>
      <SidebarContent
        blurHeight={120}
        containerClassName="h-[calc(100svh-8.25rem)] flex-none md:h-[calc(100svh-9.5rem)]"
      >
        <SidebarMenu onMouseLeave={() => setHoveredSidebarItem(null)}>
          <div className="px-2 pt-3 pb-1">
            {renderLink({ title: "Introduction", url: "/docs" })}
          </div>
          {visibleCategories.map((category) => (
            <div key={category.title}>
              <SidebarMenuItem onMouseEnter={() => setHoveredSidebarItem(null)}>
                <div className="flex items-baseline gap-2 px-3 pb-2 pt-5 text-sm font-semibold text-sidebar-foreground/75">
                  <span>{category.title}</span>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground/70">
                    {category.items.length}
                  </span>
                </div>
              </SidebarMenuItem>
              {category.items.map(renderLink)}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarVideoPreview
        anchorX={hoveredSidebarItem?.anchorX ?? 0}
        anchorY={hoveredSidebarItem?.anchorY ?? 0}
        item={hoveredSidebarItem?.item.sketchId ? hoveredSidebarItem.item : null}
      />
    </Sidebar>
  );
}

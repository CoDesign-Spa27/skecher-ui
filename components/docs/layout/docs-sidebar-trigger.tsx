"use client";

import type { ReactNode } from "react";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const SIDEBAR_TRIGGER_LAYOUT_ID = "docs-sidebar-trigger";

const SIDEBAR_TRIGGER_TRANSITION: Transition = {
  type: "tween",
  duration: 0.25,
  ease: [0.23, 1, 0.32, 1],
};

function AnimatedSidebarTrigger({ className }: { className?: string }) {
  return (
    <motion.div
      layout
      layoutId={SIDEBAR_TRIGGER_LAYOUT_ID}
      transition={SIDEBAR_TRIGGER_TRANSITION}
      className={cn("z-50", className)}
    >
      <SidebarTrigger className="header-shadow size-auto cursor-pointer p-2" />
    </motion.div>
  );
}

export function DocsSidebarTriggerInSidebar() {
  const { open, isMobile } = useSidebar();

  if (!open || isMobile) {
    return null;
  }

  return <AnimatedSidebarTrigger className="shrink-0" />;
}

export function DocsSidebarTriggerInInset() {
  const { open, isMobile } = useSidebar();

  if (open && !isMobile) {
    return null;
  }

  return <AnimatedSidebarTrigger className="absolute left-6 top-6" />;
}

export function DocsSidebarTriggerLayoutGroup({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LayoutGroup id="docs-sidebar-trigger">{children}</LayoutGroup>
  );
}

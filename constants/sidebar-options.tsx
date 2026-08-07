import { COMPONENT_DOCS } from "@/lib/docs-content";
import type { SidebarItemProps } from "@/types/docs/sidebar-types";

export const SIDEBAR_OPTIONS: SidebarItemProps[] = [
  {
    title: "Intro",
    url: "/docs",
  },
  {
    title: "Components",
    type: "section",
  },
  ...COMPONENT_DOCS.map((page) => ({
    badge: page.sidebarBadge,
    title: page.title,
    url: `/docs/${page.slug}`,
  })),
];

import type { SidebarItemProps } from "@/types/docs/sidebar-types";
import { COMPONENT_NAV_ITEMS, DOCS_PAGES } from "@/lib/docs-content";

export const SIDEBAR_OPTIONS: SidebarItemProps[] = [
  {
    title: "Home",
    url: "/docs",
  },
  ...DOCS_PAGES.map((page) => ({
    title: page.title,
    url: `/docs/${page.slug}`,
  })),
  ...COMPONENT_NAV_ITEMS,
];

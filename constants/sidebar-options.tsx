import { COMPONENT_DOCS } from "@/lib/docs-content";
import type { SidebarItemProps } from "@/types/docs/sidebar-types";

export const SIDEBAR_OPTIONS: SidebarItemProps[] = [
  {
    title: "Components",
    type: "section",
  },
  ...COMPONENT_DOCS.map((page) => ({
    title: page.title,
    url: `/docs/${page.slug}`,
  })),
];


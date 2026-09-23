import type { ComponentProps, ReactNode } from "react";

import type { Badge } from "@/components/ui/badge";

interface SidebarBadgeProps {
  label?: string;
  variant: NonNullable<ComponentProps<typeof Badge>["variant"]>;
  sparkles?: boolean;
}

interface SidebarItemProps {
  title: string;
  sketchId?: number;
  url?: string;
  badge?: SidebarBadgeProps;
  count?: number;
  icon?: ReactNode;
  type?: "link" | "section";
}

type SidebarCategory = "Shaders" | "Carousels" | "Interfaces" | "Arts";

export type { SidebarBadgeProps, SidebarCategory, SidebarItemProps };

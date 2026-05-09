import type { SidebarItemProps } from "@/types/docs/sidebar-types";
import { LucideBarChart2 } from "lucide-react";

export const SIDEBAR_OPTIONS: SidebarItemProps[] = [
  {
    title: "Button",
    url: "/docs/bar-charts",
    icon: <LucideBarChart2 size={16} />,
  },
  {
    title: "Input",
    url: "/docs/animated-bar-charts",
    icon: <LucideBarChart2 size={16} />,
  },
];

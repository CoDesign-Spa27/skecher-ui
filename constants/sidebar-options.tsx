
import { SidebarOptionsProps } from "@/types/docs/sidebar-types";
import {
  LucideHome,
  LucideBook,
  LucideBarChart2,
} from "lucide-react";

export const SIDEBAR_OPTIONS: SidebarOptionsProps = {
  gettingStarted: [
    {
      title: "Getting Started",
      url: "/docs",
      items: [
        {
          title: "Introduction",
          url: "/docs",
          icon: <LucideHome size={16} />,
        },
        {
          title: "Prerequisites",
          url: "/docs/prerequisites",
          icon: <LucideBook size={16} />,
        },
      ],
    },
  ],
  components: [
    {
      title: "All Components",
      url: "#",
      items: [
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
      ],
    },
  ],
};

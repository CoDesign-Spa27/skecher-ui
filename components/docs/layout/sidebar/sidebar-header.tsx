import Image from "next/image";
import Link from "next/link";

import { MorphStackMark } from "@/components/docs/content/morph-stack-preview";
import { DocsSidebarTriggerInSidebar } from "@/components/docs/layout/docs-sidebar-trigger";
import { SidebarHeader } from "@/components/ui/sidebar";
import type { MorphStackMotion } from "@/components/ui-components/morph-stack";
import { Logo, LogoMark } from "@/components/brand/logo";

const SIDEBAR_MARK_MOTION = {
  back: { active: { z: -12 } },
  front: {
    active: { x: -2, y: 3, z: 12 },
    resting: { x: 0, y: 0, z: 0 },
  },
  stack: { scale: 1.02 },
} satisfies MorphStackMotion;

const DocsSidebarHeader = () => {
  return (
    <SidebarHeader className="h-14 justify-center px-2">
      <div className="flex items-center px-1">
        <Link
          href="/"
          aria-label="Skecher UI home"
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
        
          <LogoMark className="h-8 w-8" />
          <span className="font-instrument-serif text-3xl leading-none text-white">
            Skecher-ui
          </span>
        </Link>
        <DocsSidebarTriggerInSidebar />
      </div>
    </SidebarHeader>
  );
};

export default DocsSidebarHeader;

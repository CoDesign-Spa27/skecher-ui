import Image from "next/image";
import Link from "next/link";

import { MorphStackMark } from "@/components/docs/content/morph-stack-preview";
import { DocsSidebarTriggerInSidebar } from "@/components/docs/layout/docs-sidebar-trigger";
import { SidebarHeader } from "@/components/ui/sidebar";
import type { MorphStackMotion } from "@/components/ui-components/morph-stack";

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
          <MorphStackMark
            className="size-9 shrink-0"
            motion={SIDEBAR_MARK_MOTION}
            plateClassName="size-9"
          />
          <span className="relative block h-8 w-[118px] overflow-hidden" aria-hidden="true">
            <Image
              src="/icon/dark-full-logo.svg"
              alt=""
              className="absolute top-0 left-[-30px] hidden h-8 w-[148px] max-w-none dark:block"
              unoptimized
              width={150}
              height={32}
            />
            <Image
              src="/icon/ligh-full-logo.svg"
              alt=""
              className="absolute top-0 left-[-30px] block h-8 w-[148px] max-w-none dark:hidden"
              unoptimized
              width={150}
              height={32}
            />
          </span>
        </Link>
        <DocsSidebarTriggerInSidebar />
      </div>
    </SidebarHeader>
  );
};

export default DocsSidebarHeader;

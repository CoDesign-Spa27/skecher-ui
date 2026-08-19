"use client";

import Image from "next/image";
import { IconUnorderedListFill18 } from "nucleo-ui-essential-fill-18";
import {
  IconBellFillDuo18,
  IconBookmarkFillDuo18,
  IconCloudFillDuo18,
  IconGear2FillDuo18,
  IconHouse5FillDuo18,
  IconLifeRingFillDuo18,
  IconMsgsFillDuo18,
  IconUserFillDuo18,
  IconUserLaptopFillDuo18,
} from "nucleo-ui-essential-fill-duo-18";

import {
  ExpandableMobileNav,
  type ExpandableMobileNavEntry,
} from "@/components/ui-components/expandable-mobile-nav";

const expandedNavItems: readonly ExpandableMobileNavEntry[] = [
  { id: "profile", label: "Profile", icon: IconUserFillDuo18 },
  { id: "messages", label: "Messages", icon: IconMsgsFillDuo18 },
  { id: "saved", label: "Saved", icon: IconBookmarkFillDuo18 },
  { id: "help", label: "Help", icon: IconLifeRingFillDuo18 },
];

function ProfileCard() {
  return (
    <div className="mx-2 mt-2 rounded-xl bg-muted/70 p-2.5">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Image
            src="/pfp.png"
            alt="Sandeep Singh's profile"
            width={48}
            height={48}
            className="size-12 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/10"
          />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-muted"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">Sandeep Singh</p>
          <p className="truncate text-xs text-muted-foreground">@sandeepsingh</p>
        </div>

        <span className="rounded-md bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm">
          Personal
        </span>
      </div>

      <div className="mt-2 rounded-lg bg-background/70 px-2.5 py-2">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Manage your account, preferences, and personal information.
        </p>
      </div>
    </div>
  );
}

const navItems: readonly ExpandableMobileNavEntry[] = [
  { id: "user", label: "User", icon: IconUserLaptopFillDuo18 },
  { id: "dashboard", label: "Dashboard", icon: IconHouse5FillDuo18 },
  { id: "notifications", label: "Notifications", icon: IconBellFillDuo18 },
  { id: "settings", label: "Settings", icon: IconGear2FillDuo18 },
  { id: "security", label: "Security", icon: IconCloudFillDuo18 },
  {
    id: "more",
    label: "More",
    icon: IconUnorderedListFill18,
  },
];

export function ExpandableMobileNavPreview() {
  return (
    <ExpandableMobileNav
      navItems={navItems}
      expandedPanel={{
        triggerId: "more",
        navItems: expandedNavItems,
      }}
      nestedExpandedPanel={{
        triggerId: "profile",
        content: <ProfileCard />,
      }}
    />
  );
}

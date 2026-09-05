"use client";

import { Monitor, X } from "lucide-react";
import { useState } from "react";

export function MobileDesktopNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-labelledby="mobile-desktop-notice-title"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-60 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-border bg-sidebar p-3 text-sidebar-foreground md:hidden"
      role="note"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
        <Monitor aria-hidden="true" className="size-5" />
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-sm font-semibold" id="mobile-desktop-notice-title">
          Desktop view recommended
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          You can browse on mobile, but component previews work best on a larger screen.
        </p>
      </div>

      <button
        aria-label="Dismiss desktop view recommendation"
        className="-m-1 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        onClick={() => setIsVisible(false)}
        type="button"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </aside>
  );
}

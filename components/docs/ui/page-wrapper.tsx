"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isComponentWorkbench =
    pathname.startsWith("/docs/") && pathname !== "/docs/project-showcase";

  return (
    <div className="relative h-full overflow-hidden bg-background pt-2">
      <div
        className={cn(
          "no-scrollbar h-full overflow-auto sm:overscroll-none",
          !isComponentWorkbench && "pt-16",
        )}
      >
        {children}
      </div>
    </div>
  );
};

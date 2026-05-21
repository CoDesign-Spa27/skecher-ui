import { SidebarHeader } from "@/components/ui/sidebar";
import Link from "next/link";
import React from "react";
import { DarkLogo } from "@/public/icon/dark-logo-full";
import { LightLogo } from "@/public/icon/light-logo-full";
import { DocsSidebarTriggerInSidebar } from "@/components/docs/layout/docs-sidebar-trigger";

const DocsSidebarHeader = () => {
    return (
        <SidebarHeader className="h-14 justify-center px-2">
            <div className="flex items-center px-1">
                <Link href="/" className="min-w-0 flex-1">
                    <span className="doto block text-2xl font-black tracking-tighter">
                        <DarkLogo className="hidden w-44 dark:block" />
                        <LightLogo className="block w-44 dark:hidden" />
                    </span>
                </Link>
                <DocsSidebarTriggerInSidebar />
            </div>
        </SidebarHeader>
    );
};

export default DocsSidebarHeader;
 
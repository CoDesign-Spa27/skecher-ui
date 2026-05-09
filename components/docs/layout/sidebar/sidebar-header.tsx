import { SidebarHeader } from "@/components/ui/sidebar";
import Link from "next/link";
import React from "react";
import { DarkLogo } from "@/public/icon/dark-logo-full";
import { LightLogo } from "@/public/icon/light-logo-full";

const DocsSidebarHeader = () => {
    return (
        <SidebarHeader className="border-b h-14 justify-center px-2">
            <Link href="/">
                <div className="flex items-center gap-2 px-2">
                    <span className="doto text-2xl font-black tracking-tighter">
                        <DarkLogo className="w-44 hidden dark:block" />
                        <LightLogo className="w-44 block dark:hidden" />
                    </span>
                </div>
            </Link>
        </SidebarHeader>
    );
};

export default DocsSidebarHeader;

"use client";

import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { SIDEBAR_OPTIONS } from "@/constants/sidebar-options";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DocsSidebarHeader from "./sidebar-header";

export function DocsSidebar({
    ...props
}: ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <Sidebar className="z-50 font-raleway" {...props} variant="floating">
            <DocsSidebarHeader />
            <SidebarContent className="mt-2">
                <SidebarMenu>
                    {SIDEBAR_OPTIONS.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    className={cn(
                                        "border border-transparent",
                                        isActive &&
                                            "shadow-[inset_0px_0px_0px_1px_#fff] dark:shadow-[inset_0px_0px_0px_0px_#000] border"
                                    )}
                                > 
                                    <Link href={item.url} onClick={handleLinkClick}>
                                        <hr className="absolute left-0 -translate-y-1/2 my-2 border-t border-highlight w-10" />
                                        <div className="absolute left-0 top-0 w-2 h-2 bg-highlight ml-8 mt-3" />
                                        <div className="flex flex-col items-center pl-10">
                                            <span className="font-semibold text-center">{item.title}</span>
                                            {item.badge && (
                                                <Badge variant={item.badge.variant}>
                                                    <span
                                                        className={cn(
                                                            item.badge.sparkles && "sparkles-bg"
                                                        )}
                                                    >
                                                        {item.badge.label}
                                                    </span>
                                                </Badge>
                                            )}
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>
            {/* <SidebarFooter>
                <SidebarMenuButton
                    variant="outline"
                    className="border border-dashed flex justify-center text-xs"
                />
            </SidebarFooter> */}
        </Sidebar>
    );
}

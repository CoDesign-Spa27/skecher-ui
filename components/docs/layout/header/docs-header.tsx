"use client";

import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
 
import { ModeToggle } from "@/components/ui/mode-toggle";
 

const DocsHeader = () => {
 
    const {state, isMobile} = useSidebar();
    const isCollapsed = state === "collapsed";
    return (
        <header
            className={cn(
                "absolute left-1/2 top-5 transform -translate-x-1/2 rounded-xl flex h-12 shrink-0 items-center justify-between gap-2 px-4 bg-sidebar border-0 border-sidebar-border z-50 header-shadow w-[calc(100%-5rem)] max-w-5xl",
           
                isMobile ? "mx-2" : (isCollapsed ? "ml-2" : "mr-2")
            )}
        >
       
            <div className="flex items-center gap-2">
                <ModeToggle />
                <Link href="https://legions.dev" target="_blank">
                    <Button variant="outline" className={cn("h-7 cursor-pointer")}>
                        <span className="text-xs">Creator</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
};

export default DocsHeader;

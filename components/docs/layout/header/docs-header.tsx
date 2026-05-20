"use client";

import React from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Input } from "@/components/ui/input";
import { IconMagnifierFillDuo18 } from 'nucleo-ui-essential-fill-duo-18';

const DocsHeader = () => {
 
    const {state, isMobile} = useSidebar();
    const isCollapsed = state === "collapsed";
    return (
        <header
            className={cn(
                "absolute left-1/2 top-5 transform -translate-x-1/2 rounded-xl flex h-10 shrink-0 items-center justify-between gap-1 px-1 bg-sidebar border-0 border-sidebar-border z-50 header-shadow w-[calc(100%-7rem)] max-w-xl",
           
                isMobile ? "mx-2" : (isCollapsed ? "ml-2" : "mr-2")
            )}
        >
            <Input icon={<IconMagnifierFillDuo18 className="size-4" />} className="input-shadow h-8 w-full border-none bg-[#F1F1F1] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg " placeholder="Search" />
      
                <ModeToggle  />
        </header>
    );
};

export default DocsHeader;

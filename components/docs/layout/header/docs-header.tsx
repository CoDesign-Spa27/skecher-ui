"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Input } from "@/components/ui/input";
import { IconMagnifierFillDuo18 } from 'nucleo-ui-essential-fill-duo-18';

const DocsHeader = () => {
    return (
        <header
            className={cn(
                "fixed right-5 top-5 z-50 flex h-10 shrink-0 items-center justify-between gap-1 rounded-xl bg-sidebar px-1 header-shadow "
            )}
            >
            {/* <div className="min-w-0 flex-1">
                <Input icon={<IconMagnifierFillDuo18 className="size-4" />} className="input-shadow h-8 w-full border-none bg-[#F1F1F1] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg " placeholder="Search" />
            </div> */}

            <ModeToggle  />
        </header>
    );
};

export default DocsHeader;

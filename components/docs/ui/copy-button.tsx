"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconTasks2FillDuo18 } from 'nucleo-ui-essential-fill-duo-18';
import { IconFiles2FillDuo18 } from 'nucleo-ui-essential-fill-duo-18';
import { motion, AnimatePresence } from "motion/react";

const CheckIcon = <IconTasks2FillDuo18 className="size-5" />;
const CopyIcon = <IconFiles2FillDuo18 className="size-5" />;

function AnimatedIcon({ copied }: { copied: boolean }) {
    return (
        <AnimatePresence mode="popLayout">
            <motion.span
                key={copied ? "check" : "copy"}
                data-slot="copy-button-icon"
                initial={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scale: 0, opacity: 0.4, filter: 'blur(4px)' }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center w-full h-full"
                style={{ willChange: "opacity, filter" }}
            >
                {copied ? CheckIcon : CopyIcon}
            </motion.span>
        </AnimatePresence>
    );
}


const CopyButton = ({
    code,
    withBlurBg,
    className,
}: {
    code: string;
    withBlurBg?: boolean;
    className?: string;
}) => {
    const [copied, setCopied] = React.useState(false);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const copy = React.useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setCopied(false);
        }, 1000);
    }, [code]);

    return (
        <Button
            tooltip={copied ? "Copied" : "Copy"}

            className={cn(
                "h-8 w-8 rounded active:scale-90 dark:hover:bg-[#232323]!",
                withBlurBg && "bg-background",
                className,
            )}
            variant="ghost"
            size="icon"
            onClick={copy}
        >
            <AnimatedIcon copied={copied} />
        </Button>
    );
};

export default CopyButton;

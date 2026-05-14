"use client";

import { Button } from "@/components/ui/button";
import { useClipboard } from "@mantine/hooks";
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
    const { copied, copy } = useClipboard({ timeout: 1000 });

    return (
        <Button
            className={cn(
                "h-8 w-8 rounded active:scale-90 dark:hover:bg-[#232323]!",
                withBlurBg && "bg-background",
                className,
            )}
            variant="ghost"
            size="icon"
            onClick={() => copy(code)}
        >
            <AnimatedIcon copied={copied} />
        </Button>
    );
};

export default CopyButton;
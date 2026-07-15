"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  // SVG size reduced: width/height to 12px, fitting for a smaller toggle
  return (
    <Button
      aria-label="Toggle theme"
      className={cn("relative size-8 min-h-0 min-w-0 rounded-lg p-0 input-shadow", className)}
      onClick={toggleTheme}
      size="icon"
      type="button"
      variant={variant}
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 0 : 1,
          rotate: theme === "dark" ? -90 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="absolute"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 18 18">
          <title>Light mode</title>
          <path
            d="M5 9C5 6.7909 6.79084 5 9 5V13C6.79084 13 5 11.2091 5 9Z"
            fill="currentColor"
          ></path>
          <path
            d="M1 9C1 4.58179 4.58168 1 9 1V5C6.79084 5 5 6.7909 5 9C5 11.2091 6.79084 13 9 13V17C4.58168 17 1 13.4182 1 9Z"
            fill="currentColor"
            fillOpacity="0.4"
            data-color="color-2"
          ></path>
          <path
            d="M13 9C13 6.7909 11.2092 5 9 5V13C11.2092 13 13 11.2091 13 9Z"
            fill="currentColor"
            fillOpacity="0.4"
            data-color="color-2"
          ></path>
          <path
            d="M17 9C17 4.58179 13.4183 1 9 1V5C11.2092 5 13 6.7909 13 9C13 11.2091 11.2092 13 9 13V17C13.4183 17 17 13.4182 17 9Z"
            fill="currentColor"
          ></path>
        </svg>
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 0 : 90,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="absolute"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 18 18">
          <title>Dark mode</title>
          <path
            d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
            fill="currentColor"
            fillOpacity="0.3"
            data-color="color-2"
          ></path>
          <path d="M9 6V12C10.657 12 12 10.657 12 9C12 7.343 10.657 6 9 6Z" fill="#F7F8F8"></path>
          <path
            d="M9 12C7.343 12 6 10.657 6 9C6 7.343 7.343 6 9 6V1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25V12Z"
            fill="#F7F8F8"
          ></path>
          <path
            d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z"
            stroke="#F7F8F8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          ></path>
        </svg>
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

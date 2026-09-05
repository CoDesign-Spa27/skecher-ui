"use client";

import {
  Archive,
  type LucideIcon,
  Megaphone,
  MessageSquareText,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type AppleMailTab<T extends string = string> = {
  activeClassName?: string;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  value: T;
};

export type AppleMailTabsProps<T extends string = string> = Omit<
  ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> & {
  activeTabClassName?: string;
  "aria-label"?: string;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  tabClassName?: string;
  tabs?: readonly AppleMailTab<T>[];
  value?: T;
};

export const appleMailTabs = [
  {
    activeClassName: "bg-[#0a84ff] text-white",
    icon: UserRound,
    label: "Primary",
    value: "primary",
  },
  {
    activeClassName: "bg-[#30d158] text-[#09280f]",
    icon: ShoppingCart,
    label: "Transactions",
    value: "transactions",
  },
  {
    activeClassName: "bg-[#bf5af2] text-white",
    icon: MessageSquareText,
    label: "Updates",
    value: "updates",
  },
  {
    activeClassName: "bg-[#ff9f0a] text-[#2b1900]",
    icon: Megaphone,
    label: "Promotions",
    value: "promotions",
  },
  {
    activeClassName: "bg-[#ff375f] text-white",
    icon: Archive,
    label: "All Mail",
    value: "all-mail",
  },
] as const satisfies readonly AppleMailTab[];

export type AppleMailTabValue = (typeof appleMailTabs)[number]["value"];

const CLOSED_WIDTH = 102;

const ICON_SIZE = 28;

const CONTENT_GAP = 14;

const ICON_CENTER = CLOSED_WIDTH / 2;

const LABEL_LEFT = ICON_CENTER + ICON_SIZE / 2 + CONTENT_GAP;

const PILL_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.8,
} as const;

const LABEL_TRANSITION = {
  duration: 0.22,
  ease: [0.23, 1, 0.32, 1],
} as const;

function getInitialValue<T extends string>(tabs: readonly AppleMailTab<T>[], defaultValue?: T) {
  if (defaultValue && tabs.some((tab) => tab.value === defaultValue && !tab.disabled)) {
    return defaultValue;
  }

  return tabs.find((tab) => !tab.disabled)?.value;
}

export function AppleMailTabs<T extends string = AppleMailTabValue>({
  "aria-label": ariaLabel = "Mail categories",
  activeTabClassName,
  className,
  defaultValue,
  onValueChange,
  tabClassName,
  tabs = appleMailTabs as unknown as readonly AppleMailTab<T>[],
  value,
  ...props
}: AppleMailTabsProps<T>) {
  const reduceMotion = useReducedMotion();

  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(() =>
    getInitialValue(tabs, defaultValue ?? ("updates" as T)),
  );

  const labelRefs = useRef(new Map<T, HTMLSpanElement>());

  const [labelWidths, setLabelWidths] = useState<Map<T, number>>(() => new Map());

  // Re-measure labels when callers replace the tab definitions.
  // biome-ignore lint/correctness/useExhaustiveDependencies: The rendered labels change with tabs.
  useLayoutEffect(() => {
    const widths = new Map<T, number>();

    labelRefs.current.forEach((element, key) => {
      widths.set(key, element.getBoundingClientRect().width);
    });

    setLabelWidths(widths);
  }, [tabs]);

  const selectedValue = value ?? uncontrolledValue;

  const selectedTab =
    tabs.find((tab) => tab.value === selectedValue && !tab.disabled) ??
    tabs.find((tab) => !tab.disabled);

  if (!tabs.length) {
    return null;
  }

  function selectTab(tab: AppleMailTab<T>) {
    if (tab.disabled || tab.value === selectedTab?.value) {
      return;
    }

    if (value === undefined) {
      setUncontrolledValue(tab.value);
    }

    onValueChange?.(tab.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, tabIndex: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const enabledIndexes = tabs.reduce<number[]>((indexes, tab, index) => {
      if (!tab.disabled) {
        indexes.push(index);
      }

      return indexes;
    }, []);

    if (!enabledIndexes.length) {
      return;
    }

    const currentPosition = enabledIndexes.indexOf(tabIndex);

    let nextIndex = enabledIndexes[0];

    if (event.key === "Home") {
      nextIndex = enabledIndexes[0];
    }

    if (event.key === "End") {
      nextIndex = enabledIndexes.at(-1) ?? enabledIndexes[0];
    }

    if (event.key === "ArrowLeft") {
      nextIndex =
        enabledIndexes[(currentPosition - 1 + enabledIndexes.length) % enabledIndexes.length];
    }

    if (event.key === "ArrowRight") {
      nextIndex = enabledIndexes[(currentPosition + 1) % enabledIndexes.length];
    }

    const nextTab = tabs[nextIndex];

    const nextButton = event.currentTarget.parentElement?.children.item(nextIndex);

    if (nextTab && nextButton instanceof HTMLButtonElement) {
      nextButton.focus();
      selectTab(nextTab);
    }
  }

  return (
    <div className={cn("no-scrollbar w-full overflow-x-auto", className)} {...props}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className="flex min-w-max items-center gap-3"
      >
        {tabs.map((tab, tabIndex) => {
          const Icon = tab.icon;

          const isActive = tab.value === selectedTab?.value;

          const labelWidth = labelWidths.get(tab.value) ?? 0;

          const activeWidth = CLOSED_WIDTH + CONTENT_GAP + labelWidth;

          return (
            <motion.button
              key={tab.value}
              type="button"
              role="tab"
              aria-label={tab.label}
              aria-selected={isActive}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              initial={false}
              animate={{
                width: isActive ? activeWidth : CLOSED_WIDTH,
              }}
              transition={
                reduceMotion
                  ? {
                      duration: 0,
                    }
                  : PILL_TRANSITION
              }
              onClick={() => selectTab(tab)}
              onKeyDown={(event) => handleKeyDown(event, tabIndex)}
              className={cn(
                "relative h-[60px] shrink-0 overflow-hidden rounded-full outline-none",

                "transition-[background-color,color] duration-200 ease-out",

                "focus-visible:ring-2",
                "focus-visible:ring-white/90",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-[#1d1d1f]",

                "disabled:cursor-not-allowed",
                "disabled:opacity-40",

                isActive
                  ? "bg-[#817bc5] text-white"
                  : [
                      "bg-[#28282a] text-[#9b9b9f]",
                      "hover:bg-[#303033]",
                      "hover:text-[#b8b8bc]",
                      "active:bg-[#343437]",
                    ],

                tabClassName,

                isActive && tab.activeClassName,

                isActive && activeTabClassName,
              )}
            >
              <span
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    left-0
                    flex
                    w-[102px]
                    items-center
                    justify-center
                  "
              >
                <Icon aria-hidden="true" className="size-7 shrink-0" strokeWidth={2.5} />
              </span>

              <motion.span
                ref={(element) => {
                  if (element) {
                    labelRefs.current.set(tab.value, element);
                  } else {
                    labelRefs.current.delete(tab.value);
                  }
                }}
                aria-hidden={!isActive}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,

                  x: isActive ? 0 : 18,

                  filter: isActive ? "blur(0px)" : "blur(7px)",
                }}
                transition={
                  reduceMotion
                    ? {
                        duration: 0,
                      }
                    : {
                        ...LABEL_TRANSITION,

                        delay: isActive ? 0.04 : 0,
                      }
                }
                style={{
                  left: LABEL_LEFT,
                }}
                className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    flex
                    items-center
                    whitespace-nowrap
                    text-[26px]
                    font-semibold
                    tracking-[-0.02em]
                  "
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

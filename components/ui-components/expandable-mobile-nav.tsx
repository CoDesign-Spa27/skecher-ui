"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface ExpandableMobileNavItem {
  id: string;
  label: React.ReactNode;
  ariaLabel?: string;
  icon: React.ElementType;
  panelContent?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onSelect?: () => void;
  type?: "item";
}

export interface ExpandableMobileNavSeparator {
  id: string;
  type: "separator";
}

export type ExpandableMobileNavEntry = ExpandableMobileNavItem | ExpandableMobileNavSeparator;

export interface ExpandableMobileNavPanel {
  triggerId: string;
  navItems?: readonly ExpandableMobileNavEntry[];
  content?: React.ReactNode;
  className?: string;
  navClassName?: string;
}

export interface ExpandableMobileNavClassNames {
  shell?: string;
  item?: string;
  activeItem?: string;
  label?: string;
  panel?: string;
  panelNav?: string;
  panelItem?: string;
  activePanelItem?: string;
  separator?: string;
}

export interface ExpandableMobileNavLayout {
  iconSize?: number;
  panelIconSize?: number;
  gap?: number;
  collapsedPadding?: number;
  expandedPadding?: number;
  labelGap?: number;
}

export interface ExpandableMobileNavProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "onChange" | "defaultValue"> {
  navItems: readonly ExpandableMobileNavEntry[];
  expandedPanel?: ExpandableMobileNavPanel;
  nestedExpandedPanel?: ExpandableMobileNavPanel;
  hideExpandedPanel?: boolean;
  hideNestedPanel?: boolean;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  onItemSelect?: (item: ExpandableMobileNavItem) => void;
  classNames?: ExpandableMobileNavClassNames;
  layout?: ExpandableMobileNavLayout;
  closeOnOutsideClick?: boolean;
}

const SHELL_PADDING = 4;
const BUTTON_VERTICAL_PADDING = 8;
const SEPARATOR_WIDTH = 9;

function isNavItem(entry: ExpandableMobileNavEntry): entry is ExpandableMobileNavItem {
  return entry.type !== "separator";
}

function getItemAriaLabel(item: ExpandableMobileNavItem) {
  return item.ariaLabel ?? (typeof item.label === "string" ? item.label : undefined);
}

function AnimatedPanel({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      initial={{
        height: 0,
        opacity: 0,
        filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
      }}
      animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
      exit={{
        height: 0,
        opacity: 0,
        filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0.15 }
          : {
              height: { type: "spring", duration: 0.3, bounce: 0.2 },
              opacity: { duration: 0.15 },
              filter: {
                duration: 0.15,
                ease: [0.23, 1, 0.32, 1],
              },
            }
      }
      className={cn("overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

function PanelNavItems({
  navItems,
  value,
  onValueChange,
  expandedTriggerId,
  expandedPanelId,
  iconSize,
  classNames,
  navClassName,
}: {
  navItems: readonly ExpandableMobileNavEntry[];
  value: string | null;
  onValueChange: (item: ExpandableMobileNavItem) => void;
  expandedTriggerId?: string;
  expandedPanelId?: string;
  iconSize: number;
  classNames?: ExpandableMobileNavClassNames;
  navClassName?: string;
}) {
  if (!navItems.length) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-1 p-2 text-sm", classNames?.panelNav, navClassName)}>
      {navItems.map((entry) => {
        if (!isNavItem(entry)) {
          return (
            <hr
              key={entry.id}
              className={cn("col-span-full h-px border-0 bg-border", classNames?.separator)}
            />
          );
        }

        const Icon = entry.icon;
        const isActive = value === entry.id;
        const controlsExpandedPanel = entry.id === expandedTriggerId;

        return (
          <button
            key={entry.id}
            type="button"
            disabled={entry.disabled}
            onClick={() => onValueChange(entry)}
            aria-label={getItemAriaLabel(entry)}
            aria-expanded={controlsExpandedPanel ? isActive : undefined}
            aria-controls={controlsExpandedPanel && isActive ? expandedPanelId : undefined}
            data-state={isActive ? "open" : "closed"}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
              isActive && "bg-muted text-foreground",
              classNames?.panelItem,
              isActive && classNames?.activePanelItem,
              entry.className,
            )}
          >
            <Icon aria-hidden="true" size={iconSize} />
            <span>{entry.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StructuredExpandedPanel({
  expandedPanel,
  nestedExpandedPanel,
  hideNestedPanel,
  expandedPanelId,
  nestedExpandedPanelId,
  panelIconSize,
  classNames,
  onItemSelect,
}: {
  expandedPanel: ExpandableMobileNavPanel;
  nestedExpandedPanel?: ExpandableMobileNavPanel;
  hideNestedPanel: boolean;
  expandedPanelId: string;
  nestedExpandedPanelId: string;
  panelIconSize: number;
  classNames?: ExpandableMobileNavClassNames;
  onItemSelect?: (item: ExpandableMobileNavItem) => void;
}) {
  const [expandedValue, setExpandedValue] = React.useState<string | null>(null);
  const [nestedValue, setNestedValue] = React.useState<string | null>(null);
  const nestedPanelOpen =
    !hideNestedPanel &&
    Boolean(nestedExpandedPanel) &&
    expandedValue === nestedExpandedPanel?.triggerId;

  const handleExpandedItemSelect = (item: ExpandableMobileNavItem) => {
    const nextValue = expandedValue === item.id ? null : item.id;
    setExpandedValue(nextValue);
    if (nextValue !== nestedExpandedPanel?.triggerId) setNestedValue(null);
    item.onSelect?.();
    onItemSelect?.(item);
  };

  const handleNestedItemSelect = (item: ExpandableMobileNavItem) => {
    setNestedValue((currentValue) => (currentValue === item.id ? null : item.id));
    item.onSelect?.();
    onItemSelect?.(item);
  };

  return (
    <AnimatedPanel
      id={expandedPanelId}
      className={cn("w-0 min-w-full", classNames?.panel, expandedPanel.className)}
    >
      {expandedPanel.content}

      <AnimatePresence initial={false}>
        {nestedPanelOpen && nestedExpandedPanel ? (
          <AnimatedPanel
            key={nestedExpandedPanel.triggerId}
            id={nestedExpandedPanelId}
            className={nestedExpandedPanel.className}
          >
            {nestedExpandedPanel.content}
            <PanelNavItems
              navItems={nestedExpandedPanel.navItems ?? []}
              value={nestedValue}
              onValueChange={handleNestedItemSelect}
              iconSize={panelIconSize}
              classNames={classNames}
              navClassName={nestedExpandedPanel.navClassName}
            />
          </AnimatedPanel>
        ) : null}
      </AnimatePresence>

      <PanelNavItems
        navItems={expandedPanel.navItems ?? []}
        value={expandedValue}
        onValueChange={handleExpandedItemSelect}
        expandedTriggerId={hideNestedPanel ? undefined : nestedExpandedPanel?.triggerId}
        expandedPanelId={nestedExpandedPanelId}
        iconSize={panelIconSize}
        classNames={classNames}
        navClassName={expandedPanel.navClassName}
      />
    </AnimatedPanel>
  );
}

export function ExpandableMobileNav({
  navItems,
  expandedPanel,
  nestedExpandedPanel,
  hideExpandedPanel = false,
  hideNestedPanel = false,
  value,
  defaultValue = null,
  onValueChange,
  onItemSelect,
  classNames,
  layout,
  closeOnOutsideClick = true,
  className,
  style,
  "aria-label": ariaLabel = "Mobile navigation",
  ...props
}: ExpandableMobileNavProps) {
  const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue);
  const containerRef = React.useRef<HTMLElement>(null);
  const expandedPanelId = React.useId();
  const nestedExpandedPanelId = React.useId();
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;
  const iconSize = layout?.iconSize ?? 20;
  const panelIconSize = layout?.panelIconSize ?? 18;
  const gap = layout?.gap ?? 8;
  const collapsedPadding = layout?.collapsedPadding ?? 8;
  const expandedPadding = layout?.expandedPadding ?? 16;
  const labelGap = layout?.labelGap ?? 8;

  const setActiveValue = React.useCallback(
    (nextValue: string | null) => {
      if (!isControlled) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const activeItem = React.useMemo(
    () =>
      navItems.find(
        (entry): entry is ExpandableMobileNavItem => isNavItem(entry) && entry.id === activeValue,
      ) ?? null,
    [activeValue, navItems],
  );

  const collapsedToolbarWidth = React.useMemo(() => {
    const itemsWidth = navItems.reduce((width, entry) => {
      if (!isNavItem(entry)) return width + SEPARATOR_WIDTH;
      return width + iconSize + collapsedPadding * 2;
    }, 0);
    const gapsWidth = Math.max(0, navItems.length - 1) * gap;

    return SHELL_PADDING * 2 + itemsWidth + gapsWidth;
  }, [collapsedPadding, gap, iconSize, navItems]);

  const toolbarHeight = SHELL_PADDING * 2 + iconSize + BUTTON_VERTICAL_PADDING * 2;
  const structuredPanelOpen =
    !hideExpandedPanel && Boolean(expandedPanel) && activeValue === expandedPanel?.triggerId;
  const customPanelOpen =
    !hideExpandedPanel && !structuredPanelOpen && Boolean(activeItem?.panelContent);

  React.useEffect(() => {
    if (!closeOnOutsideClick) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setActiveValue(null);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [closeOnOutsideClick, setActiveValue]);

  const handleItemClick = (item: ExpandableMobileNavItem) => {
    if (item.disabled) return;

    setActiveValue(activeValue === item.id ? null : item.id);
    item.onSelect?.();
    onItemSelect?.(item);
  };

  const buttonVariants = {
    initial: {
      gap: 0,
      paddingLeft: collapsedPadding,
      paddingRight: collapsedPadding,
    },
    animate: (isActive: boolean) => ({
      gap: isActive ? labelGap : 0,
      paddingLeft: isActive ? expandedPadding : collapsedPadding,
      paddingRight: isActive ? expandedPadding : collapsedPadding,
    }),
  };

  const labelVariants = {
    initial: { width: 0, opacity: 0, transform: "translateY(-10px)" },
    animate: { width: "auto", opacity: 1, transform: "translateY(0px)" },
    exit: { width: 0, opacity: 0, transform: "translateY(-10px)" },
  };

  return (
    <nav
      ref={containerRef}
      aria-label={ariaLabel}
      className={cn("relative", className)}
      style={{ width: collapsedToolbarWidth, height: toolbarHeight, ...style }}
      {...props}
    >
      <motion.div
        className={cn(
          "absolute bottom-0 left-1/2 flex w-max -translate-x-1/2 flex-col overflow-hidden rounded-xl bg-background p-1 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] dark:shadow-[0px_2px_3px_-1px_rgba(255,255,255,0.02),0px_1px_0px_0px_rgba(255,255,255,0.02),0px_0px_0px_1px_rgba(255,255,255,0.08)]",
          classNames?.shell,
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") setActiveValue(null);
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          {structuredPanelOpen && expandedPanel ? (
            <StructuredExpandedPanel
              key={expandedPanel.triggerId}
              expandedPanel={expandedPanel}
              nestedExpandedPanel={nestedExpandedPanel}
              hideNestedPanel={hideNestedPanel}
              expandedPanelId={expandedPanelId}
              nestedExpandedPanelId={nestedExpandedPanelId}
              panelIconSize={panelIconSize}
              classNames={classNames}
              onItemSelect={onItemSelect}
            />
          ) : customPanelOpen && activeItem?.panelContent ? (
            <AnimatedPanel
              key={activeItem.id}
              id={expandedPanelId}
              className={cn("w-0 min-w-full", classNames?.panel)}
            >
              {activeItem.panelContent}
            </AnimatedPanel>
          ) : null}
        </AnimatePresence>

        <div className="flex" style={{ gap }}>
          {navItems.map((entry) => {
            if (!isNavItem(entry)) {
              return (
                <hr
                  key={entry.id}
                  className={cn("mx-1 w-px self-stretch border-0 bg-border", classNames?.separator)}
                />
              );
            }

            const Icon = entry.icon;
            const isActive = activeValue === entry.id;
            const controlsPanel =
              !hideExpandedPanel &&
              (entry.id === expandedPanel?.triggerId || Boolean(entry.panelContent));

            return (
              <motion.button
                key={entry.id}
                type="button"
                variants={buttonVariants}
                initial={false}
                animate="animate"
                custom={isActive}
                disabled={entry.disabled}
                onClick={() => handleItemClick(entry)}
                aria-label={getItemAriaLabel(entry)}
                aria-expanded={controlsPanel ? isActive : undefined}
                aria-controls={controlsPanel && isActive ? expandedPanelId : undefined}
                data-state={isActive ? "open" : "closed"}
                transition={{
                  delay: 0.1,
                  duration: 0.3,
                  ease: [0.08, 0.82, 0.17, 1],
                }}
                className={cn(
                  "relative flex items-center whitespace-nowrap rounded-xl py-2 text-sm font-medium transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? cn("bg-muted text-primary", classNames?.activeItem)
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  classNames?.item,
                  entry.className,
                )}
              >
                <Icon aria-hidden="true" size={iconSize} />
                <AnimatePresence initial={false}>
                  {isActive ? (
                    <motion.span
                      key="label"
                      variants={labelVariants}
                      initial={{ ...labelVariants.initial, filter: "blur(8px)" }}
                      animate={{ ...labelVariants.animate, filter: "blur(0px)" }}
                      exit={{ ...labelVariants.exit, filter: "blur(8px)" }}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                        ease: [0.08, 0.82, 0.17, 1],
                      }}
                      className={cn("overflow-hidden", classNames?.label)}
                    >
                      <span className="block pl-2">{entry.label}</span>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}

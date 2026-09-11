"use client";

import { Plus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import useMeasure from "react-use-measure";

export type MorphMenuDirection =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left"
  | "center";

export type MorphMenuItem = {
  id: string;
  title: string;
  description: string;
};

export type MorphMenuProps = {
  direction?: MorphMenuDirection;
  eyebrow?: string;
  title?: string;
  items?: readonly MorphMenuItem[];
  menuWidth?: number;
  triggerIcon?: ReactNode;
  closeIcon?: ReactNode;
  triggerLabel?: string;
  closeLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onItemSelect?: (item: MorphMenuItem) => void;
  className?: string;
};

const DEFAULT_ITEMS: readonly MorphMenuItem[] = [
  {
    id: "project",
    title: "New project",
    description: "Start something from scratch",
  },
  {
    id: "document",
    title: "New document",
    description: "Create a blank document",
  },
  {
    id: "import",
    title: "Import",
    description: "Bring something into your workspace",
  },
];

const TRIGGER_SIZE = 56;

const DIRECTION_OFFSETS: Record<MorphMenuDirection, readonly [number, number]> = {
  "top-left": [-1, -1],
  top: [-0.5, -1],
  "top-right": [0, -1],
  right: [0, -0.5],
  "bottom-right": [0, 0],
  bottom: [-0.5, 0],
  "bottom-left": [-1, 0],
  left: [-1, -0.5],
  center: [-0.5, -0.5],
};

const MORPH_SPRING = {
  type: "spring",
  duration: 0.3,
  bounce: 0,
} as const;

const REDUCED_MORPH_TRANSITION = { duration: 0 } as const;

const CONTENT_TRANSITION = {
  duration: 0.2,
  ease: [0.23, 1, 0.32, 1],
} as const;

const PRESS_CLASSES =
  "transition-[background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transform-none";

export function MorphMenu({
  direction = "center",
  eyebrow = "Create new",
  title = "What would you like to add?",
  items = DEFAULT_ITEMS,
  menuWidth = 360,
  triggerIcon = <Plus className="size-5" />,
  closeIcon = <X className="size-4" />,
  triggerLabel = "Open create menu",
  closeLabel = "Close create menu",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onItemSelect,
  className,
}: MorphMenuProps) {
  const instanceId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [measureRef, bounds] = useMeasure();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const open = controlledOpen ?? uncontrolledOpen;
  const morphTransition = shouldReduceMotion ? REDUCED_MORPH_TRANSITION : MORPH_SPRING;
  const contentTransform = shouldReduceMotion ? "none" : "translateY(4px)";
  const iconLayoutId = `${instanceId}-bloom-icon`;
  const contentId = `${instanceId}-bloom-menu-content`;

  const width = bounds.width || TRIGGER_SIZE;
  const height = bounds.height || TRIGGER_SIZE;
  const [horizontalOffset, verticalOffset] = DIRECTION_OFFSETS[direction];
  const x = (width - TRIGGER_SIZE) * horizontalOffset;
  const y = (height - TRIGGER_SIZE) * verticalOffset;

  function setOpen(nextOpen: boolean) {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  function selectItem(item: MorphMenuItem) {
    onItemSelect?.(item);
    setOpen(false);
  }

  return (
    <div className={`relative size-14 shrink-0 ${className ?? ""}`}>
      <motion.div
        initial={false}
        animate={{
          width,
          height,
          transform: `translate3d(${x}px, ${y}px, 0)`,
        }}
        transition={morphTransition}
        className="absolute left-0 top-0 overflow-hidden rounded-2xl bg-background text-foreground border"
      >
        <div
          ref={measureRef}
          style={{ width: open ? menuWidth : TRIGGER_SIZE }}
          className={`relative ${open ? "" : "h-14"}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {!open ? (
              <motion.div
                key="trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={CONTENT_TRANSITION}
                className="size-14"
              >
                <button
                  type="button"
                  aria-expanded={false}
                  aria-controls={contentId}
                  aria-label={triggerLabel}
                  onClick={() => setOpen(true)}
                  className={`flex size-full items-center justify-center ${PRESS_CLASSES}`}
                >
                  <motion.span
                    layoutId={iconLayoutId}
                    transition={morphTransition}
                    className="block"
                  >
                    {triggerIcon}
                  </motion.span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                id={contentId}
                initial={{ opacity: 0, transform: contentTransform, filter: "blur(8px)" }}
                animate={{ opacity: 1, transform: "none", filter: "blur(0px)" }}
                exit={{ opacity: 0, transform: contentTransform, filter: "blur(8px)" }}
                transition={CONTENT_TRANSITION}
                className="w-full px-2 py-2"
              >
                <div className="flex items-start justify-between px-2 pt-2">
                  <div>
                    <p className="text-sm text-neutral-400">{eyebrow}</p>

                    <h2 className="mt-1 text-xl font-medium">{title}</h2>
                  </div>

                  <button
                    type="button"
                    aria-label={closeLabel}
                    onClick={() => setOpen(false)}
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ${PRESS_CLASSES}`}
                  >
                    <motion.span
                      layoutId={iconLayoutId}
                      transition={morphTransition}
                      className="block"
                    >
                      {closeIcon}
                    </motion.span>
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {items.map((item) => (
                    <BloomItem key={item.id} item={item} onSelect={selectItem} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default MorphMenu;

function BloomItem({
  item,
  onSelect,
}: {
  item: MorphMenuItem;
  onSelect: (item: MorphMenuItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`block w-full rounded-2xl bg-accent border px-4 py-3 text-left hover:bg-white/[0.1] ${PRESS_CLASSES}`}
    >
      <div className="text-sm font-medium">{item.title}</div>

      <div className="mt-0.5 text-xs text-neutral-400">{item.description}</div>
    </button>
  );
}

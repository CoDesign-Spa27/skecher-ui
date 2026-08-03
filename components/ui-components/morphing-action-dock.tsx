"use client";

import { Compass, Feather, FlameKindling, type LucideIcon, Moon } from "lucide-react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

type DockDirection = -1 | 0 | 1;

type DockItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  eyebrow: string;
  paragraph: string;
  cue: string;
};

type MorphingActionDockProps = {
  items?: DockItem[];
  className?: string;
  defaultActiveId?: string;
};

const DOCK_ITEMS: DockItem[] = [
  {
    id: "signal",
    label: "Signal",
    icon: Compass,
    tone: "from-zinc-900 via-zinc-800 to-zinc-700",
    eyebrow: "Clear Direction",
    paragraph:
      "A good interface reduces the number of things a person has to keep in their head. It points gently, removes hesitation, and lets the next action feel obvious without being loud.",
    cue: "Structure the next step",
  },
  {
    id: "craft",
    label: "Craft",
    icon: Feather,
    tone: "from-neutral-900 via-neutral-800 to-stone-700",
    eyebrow: "Quiet Detail",
    paragraph:
      "The details that make software feel expensive are usually small: the right easing, a button that answers the finger, a surface that appears from where your eye already is.",
    cue: "Tune the invisible parts",
  },
  {
    id: "energy",
    label: "Energy",
    icon: FlameKindling,
    tone: "from-slate-900 via-zinc-800 to-neutral-700",
    eyebrow: "Motion With Intent",
    paragraph:
      "Animation should explain a state change, not decorate a delay. When motion has a job, it makes the product feel quicker, more spatial, and easier to trust.",
    cue: "Use motion as feedback",
  },
  {
    id: "calm",
    label: "Calm",
    icon: Moon,
    tone: "from-black via-neutral-800 to-zinc-700",
    eyebrow: "Lower The Noise",
    paragraph:
      "The strongest components know when to disappear. They hold their shape, avoid surprise, and give people a place to rest while they decide what to do next.",
    cue: "Keep the surface steady",
  },
];

const spring = {
  type: "spring" as const,
  duration: 0.46,
  bounce: 0.16,
};

const contentSpring = {
  type: "spring" as const,
  duration: 0.5,
  bounce: 0,
};

const fastOut = [0.4, 0, 0.2, 1] as const;
const bgShadow =
  "shadow-[0px_32px_64px_-16px_transparent,0px_16px_32px_-8px_transparent,0px_8px_16px_-4px_transparent,0px_4px_8px_-2px_transparent,0px_-8px_16px_-1px_transparent,0px_2px_4px_-1px_transparent,0px_0px_0px_1px_transparent,inset_0px_0px_0px_1px_rgba(0,0,0,0.1),inset_0px_1px_0px_rgb(0,0,0,0.15)] dark:bg-neutral-900 dark:shadow-[0px_32px_64px_-16px_transparent,0px_16px_32px_-8px_transparent,0px_8px_16px_-4px_transparent,0px_4px_8px_-2px_transparent,0px_-8px_16px_-1px_transparent,0px_2px_4px_-1px_transparent,0px_0px_0px_1px_transparent,inset_0px_0px_0px_1px_rgba(255,255,255,0.1),inset_0px_1px_0px_rgb(255,255,255,0.15)]";

const contentVariants = {
  enter: (direction: DockDirection) => ({
    opacity: 0,
    x: direction === 0 ? 0 : direction > 0 ? "110%" : "-110%",
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: DockDirection) => ({
    opacity: 0,
    x: direction === 0 ? 0 : direction > 0 ? "-110%" : "110%",
  }),
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function MorphingActionDock({
  items = DOCK_ITEMS,
  className,
  defaultActiveId = DOCK_ITEMS[0]?.id,
}: MorphingActionDockProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(defaultActiveId);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [direction, setDirection] = useState<DockDirection>(1);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeItem?.id),
  );

  function setActiveById(id: string, source: "pointer" | "keyboard" | "press") {
    const nextIndex = items.findIndex((item) => item.id === id);

    if (nextIndex === -1 || id === activeId) {
      return;
    }

    if (source === "keyboard" || shouldReduceMotion) {
      setDirection(0);
    } else {
      setDirection(nextIndex > activeIndex ? 1 : -1);
    }

    setActiveId(id);
  }

  function setPointerActive(id: string) {
    setActiveById(id, "pointer");
  }

  function togglePinned(id: string) {
    setActiveById(id, "press");
    setPinnedId((current) => (current === id ? null : id));
  }

  function clearPointerActive() {
    if (pinnedId) {
      setActiveById(pinnedId, "pointer");
      return;
    }

    setIsDockOpen(false);
    setActiveById(defaultActiveId, "pointer");
  }

  if (!activeItem) {
    return null;
  }

  const contentDirection = shouldReduceMotion ? 0 : direction;

  return (
    <MotionConfig transition={contentSpring}>
      <LayoutGroup>
        <div
          className={cn("relative flex h-fit w-fit items-center justify-center", className)}
          onFocusCapture={() => setIsDockOpen(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget) && !pinnedId) {
              clearPointerActive();
            }
          }}
          onPointerEnter={() => setIsDockOpen(true)}
          onPointerLeave={clearPointerActive}
        >
          <div className="relative flex flex-col items-center">
            <AnimatePresence initial={false}>
              {isDockOpen || pinnedId ? (
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className=" absolute bottom-12 mb-3 overflow-hidden header-shadow rounded-lg text-foreground p-1.5"
                  exit={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 8,
                    scale: shouldReduceMotion ? 1 : 0.98,
                  }}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 8,
                    scale: shouldReduceMotion ? 1 : 0.98,
                  }}
                  layout
                  layoutId="morphing-action-dock-tray"
                  style={{ transformOrigin: "50% 100%" }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.16, ease: fastOut }
                      : {
                          opacity: { duration: 0.18, ease: fastOut },
                          y: spring,
                          scale: spring,
                          layout: spring,
                        }
                  }
                >
                  <motion.div
                    aria-hidden="true"
                    className={cn("absolute inset-0 rounded-lg bg-background opacity-18 blur-xl")}
                    layoutId="morphing-action-dock-glow"
                  />
                  <AnimatePresence custom={contentDirection} initial={false} mode="popLayout">
                    <motion.div
                      animate="center"
                      className="relative w-80 p-3 will-change-transform"
                      custom={contentDirection}
                      exit="exit"
                      initial="enter"
                      key={activeItem.id}
                      transition={
                        shouldReduceMotion ? { duration: 0.12, ease: fastOut } : contentSpring
                      }
                      variants={contentVariants}
                    >
                      <motion.p
                        animate={{ opacity: 1, y: 0 }}
                        className="text-balance text-sm leading-6 text-foreground/75"
                        initial={{
                          opacity: 0,
                          y: shouldReduceMotion ? 0 : 5,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0.12 : 0.17,
                          delay: shouldReduceMotion ? 0 : 0.025,
                          ease: fastOut,
                        }}
                      >
                        {activeItem.paragraph}
                      </motion.p>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div
              className={cn(
                "relative rounded-xl border border-border/70  p-1 shadow-[0_24px_80px_-48px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl",
              )}
            >
              <motion.div
                aria-hidden="true"
                animate={{
                  transform: `translate3d(${activeIndex * 42}px, 0, 0)`,
                }}
                className={cn(
                  "absolute top-1 bottom-1 rounded-lg  shadow-[0_12px_36px_-18px_rgb(0_0_0/0.8)]",
                  bgShadow,
                )}
                style={{ left: 4, width: 38, willChange: "transform" }}
                transition={shouldReduceMotion ? { duration: 0 } : spring}
              />
              <div className="relative flex items-center gap-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeItem.id;
                  const isItemPinned = pinnedId === item.id;

                  return (
                    <button
                      aria-label={`Show ${item.label} paragraph${isItemPinned ? ", pinned" : ""}`}
                      aria-pressed={isItemPinned}
                      className={cn(
                        "relative z-10 flex size-[38px] items-center justify-center rounded-lg outline-none transition-[color,transform,opacity] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border border-border/50",
                        isActive
                          ? `text-foreground `
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      key={item.id}
                      onClick={() => togglePinned(item.id)}
                      onFocus={() => setActiveById(item.id, "keyboard")}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "touch") {
                          setPointerActive(item.id);
                        }
                      }}
                      type="button"
                    >
                      <Icon className="size-4" strokeWidth={2.25} />
                      <span className="sr-only">{item.label}</span>
                      {isItemPinned ? (
                        <span className="absolute bottom-1 size-1 rounded-full bg-background/80" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

export default MorphingActionDock;

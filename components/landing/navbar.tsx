"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { IconGithub } from "nucleo-social-media";
import * as React from "react";

import { LogoMark } from "@/components/brand/logo";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { cn } from "@/lib/utils";

import { ON_MOUNT, useReveal } from "./reveal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Components" },
  { external: true, href: "https://github.com/CoDesign-Spa27/skecher-ui", label: "GitHub" },
] as const;

const LIFT_ON = 28;
const LIFT_OFF = 10;

const spring = { type: "spring", stiffness: 500, damping: 52 } as const;

const BAND_SHIFT = -8;

const ROW_SHIFT = 15;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const linkClassName = cn(
  "relative inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 font-urbanist text-[13.5px] leading-none",
  "text-white/60 transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "hover:text-white aria-[current=page]:text-white",
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/35",
  "sm:px-3.5 sm:text-sm",
);

export function LandingNav({ className, current = "/" }: { className?: string; current?: string }) {
  const [isLifted, setIsLifted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuPanelRef = React.useRef<HTMLDivElement>(null);
  const menuWasOpen = React.useRef(false);
  const reduceMotion = useReducedMotion();
  // Lands first, ahead of the hero copy.
  const { item, sequence } = useReveal({ delay: 0.05 });

  React.useEffect(() => {
    let frameId = 0;
    // Kept alongside the state so the hysteresis reads the value the handler
    // last decided, not one a render has yet to flush.
    let lifted = false;

    const evaluate = () => {
      frameId = 0;
      const offset = window.scrollY;
      const next = lifted ? offset > LIFT_OFF : offset > LIFT_ON;
      if (next === lifted) return;
      lifted = next;
      setIsLifted(next);
    };

    const handleScroll = () => {
      // Scroll fires far faster than the page paints; one read per frame is all
      // the state can actually use.
      if (frameId === 0) frameId = window.requestAnimationFrame(evaluate);
    };

    // Run once on mount: a reload can restore a scrolled position.
    evaluate();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  React.useEffect(() => {
    if (!isMenuOpen) {
      if (menuWasOpen.current) menuButtonRef.current?.focus();
      menuWasOpen.current = false;
      return;
    }

    menuWasOpen.current = true;
    // iOS Safari scrolls the page behind an `overflow: hidden` body, so the
    // body is pinned at its current offset and restored on close instead.
    const scrollOffset = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollOffset}px`;
    document.body.style.width = "100%";

    const focusableElements = () =>
      Array.from(
        menuPanelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const elements = focusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      // Pinning the body reports scrollY as 0, which would leave the bar merged
      // behind the closing panel; restoring it re-fires scroll and settles.
      window.scrollTo(0, scrollOffset);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  React.useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 640px)");
    const closeMenuOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeMenuOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeMenuOnDesktop);
  }, []);

  return (
    <>
      {/* Header padding plus the 40px row, per breakpoint. The spacer stands in
          for a bar that is no longer in flow, so an approximation here shifts
          the hero composition by exactly the amount it is off. */}
      <div aria-hidden="true" className="h-16 sm:h-[68px] lg:h-[72px]" />

      <motion.header
        // `initial={false}` so a reload at a scrolled position snaps to lifted
        // instead of springing in behind the user.
        animate={isLifted ? "lifted" : "merged"}
        className={cn(
          "group fixed inset-x-0 top-0 z-50 px-2 pt-6 sm:px-8 sm:pt-7 lg:px-10 lg:pt-8",
          className,
        )}
        data-state={isLifted ? "lifted" : "merged"}
        initial={false}
        transition={spring}
        // Keeps the bar behind the open panel out of the tab order and the
        // accessibility tree; the key handler only cycles focus, it cannot stop
        // focus leaving for the page underneath. Spread rather than passed as
        // `false`, because an `inert` attribute is truthy at any value and a
        // stray one would silently kill the toggle.
        {...(isMenuOpen ? { inert: true } : {})}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 sm:h-36 lg:h-40"
          variants={{
            lifted: { opacity: 1, transform: "translateY(0px)" },
            // Flattened rather than gated at the style layer: the travel is what
            // reduced motion objects to, the fade still reads.
            merged: {
              opacity: 0,
              transform: `translateY(${reduceMotion ? 0 : BAND_SHIFT}px)`,
            },
          }}
        >
          <ProgressiveBlur height="100%" position="top" />
          <div className="absolute inset-0 z-20 [background:linear-gradient(to_bottom,rgb(0_0_0/100%)_0%,rgb(10_10_10/20%)_36%,transparent_100%)]" />
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-3xl"
          variants={{
            lifted: { transform: `translateY(${reduceMotion ? 0 : ROW_SHIFT}px)` },
            merged: { transform: "translateY(0px)" },
          }}
        >
          {/* The reveal group carries its own `animate`, which stops the
              header's merged/lifted state propagating any further down. */}
          <motion.nav
            aria-label="Primary"
            className="flex items-center justify-between gap-3 px-2"
            variants={sequence}
            {...ON_MOUNT}
          >
            <motion.div variants={item}>
              <Link
                className="group/logo flex items-center gap-2.5 rounded-lg pr-1 outline-none"
                href="/"
              >
                <LogoMark className="h-10 w-10" />
                <span className="hidden font-instrument-serif text-3xl leading-none text-white sm:inline">
                  Skecher-ui
                </span>
              </Link>
            </motion.div>

            <motion.ul
              className="hidden items-center gap-0.5 rounded-xl bg-[#171717] px-1 py-1 sm:flex"
              variants={item}
            >
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {"external" in link ? (
                    <a className={linkClassName} href={link.href} rel="noreferrer" target="_blank">
                      <IconGithub aria-hidden="true" className="size-[15px]" />
                      <span className="max-sm:sr-only">{link.label}</span>
                    </a>
                  ) : (
                    <Link
                      aria-current={current === link.href ? "page" : undefined}
                      className={cn(
                        linkClassName,
                        // The lit chip only exists on the current page, so hover
                        // stays a colour change and the two never read alike.
                        current === link.href &&
                          "bg-white/10 shadow-[inset_0_0.5px_0_rgb(255_255_255/18%)]",
                      )}
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </motion.ul>

            <motion.button
              aria-controls="landing-mobile-menu"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex size-10 items-center justify-center rounded-lg bg-[#171717] text-white outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-white/35 sm:hidden [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#222]"
              onClick={() => setIsMenuOpen((open) => !open)}
              ref={menuButtonRef}
              type="button"
              variants={item}
              // `scale`, not a `transform` string: this element's reveal variant
              // animates `y`, and the two cannot both drive the transform.
              whileTap={{ scale: reduceMotion ? 1 : 0.96 }}
            >
              <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </motion.button>
          </motion.nav>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            animate={{ opacity: 1, transform: "translateY(0%)" }}
            aria-labelledby="landing-mobile-menu-title"
            aria-modal="true"
            className="fixed inset-0 z-[60] flex h-svh flex-col overflow-y-auto overscroll-contain bg-[#0a0a0a] px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white sm:hidden"
            exit={{
              opacity: 0,
              transform: reduceMotion ? "translateY(0%)" : "translateY(-1.5%)",
            }}
            id="landing-mobile-menu"
            initial={{
              opacity: 0,
              transform: reduceMotion ? "translateY(0%)" : "translateY(-1.5%)",
            }}
            ref={menuPanelRef}
            role="dialog"
            transition={{ duration: reduceMotion ? 0.18 : 0.24, ease: EASE_OUT }}
          >
            <motion.div
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              className="flex items-center justify-between"
              exit={{
                opacity: 0,
                transform: reduceMotion ? "translateY(0px)" : "translateY(-6px)",
              }}
              initial={{
                opacity: 0,
                transform: reduceMotion ? "translateY(0px)" : "translateY(-6px)",
              }}
              transition={{ delay: reduceMotion ? 0 : 0.03, duration: 0.2, ease: EASE_OUT }}
            >
              <Link
                aria-label="Skecher UI home"
                className="rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-white/35"
                href="/"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogoMark className="size-10" />
              </Link>
              <motion.button
                aria-label="Close navigation menu"
                className="inline-flex size-10 items-center justify-center rounded-lg bg-white/10 text-white outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-white/35 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/15"
                onClick={() => setIsMenuOpen(false)}
                ref={closeButtonRef}
                type="button"
                whileTap={{ scale: reduceMotion ? 1 : 0.94 }}
              >
                <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </motion.button>
            </motion.div>

            <motion.nav
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              aria-label="Mobile primary"
              className="flex flex-1 items-center"
              exit={{
                opacity: 0,
                transform: reduceMotion ? "translateY(0px)" : "translateY(8px)",
              }}
              initial={{
                opacity: 0,
                transform: reduceMotion ? "translateY(0px)" : "translateY(10px)",
              }}
              transition={{ delay: reduceMotion ? 0 : 0.04, duration: 0.22, ease: EASE_OUT }}
            >
              <ul className="w-full">
                {NAV_LINKS.map((link) => (
                  <li className="" key={link.href}>
                    {"external" in link ? (
                      <a
                        className="flex min-h-16 items-center justify-between rounded-lg px-2 font-urbanist text-2xl font-medium outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-white/35 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/5"
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                        <IconGithub aria-hidden="true" className="size-5 text-white/60" />
                      </a>
                    ) : (
                      <Link
                        aria-current={current === link.href ? "page" : undefined}
                        className={cn(
                          "flex min-h-16 items-center rounded-lg px-2 font-urbanist text-2xl font-medium text-white/65 outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-white/35",
                          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/5 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
                          current === link.href && "text-white",
                        )}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.nav>

            <motion.p
              animate={{ opacity: 1 }}
              className="font-urbanist text-sm text-white/45"
              exit={{ opacity: 0 }}
              id="landing-mobile-menu-title"
              initial={{ opacity: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.04, duration: 0.18, ease: EASE_OUT }}
            >
              Skecher UI navigation
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

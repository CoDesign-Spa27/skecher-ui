"use client";

import { motion, useReducedMotion } from "motion/react";
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
const BAR_HEIGHT = "clamp(58px,6.4vw,64px)";

const BAND_HEIGHT = "clamp(112px,14vh,168px)";

const BAR_INSET_X = "calc(clamp(12px,1.48vw,19px) + clamp(12px,1.6vw,22px))";
const BAR_INSET_TOP = "calc(clamp(12px,2.25vh,18px) + clamp(12px,1.6vw,18px))";

const linkClassName = cn(
  "relative inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 font-urbanist text-[13.5px] leading-none",
  "text-white/60 transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "hover:text-white aria-[current=page]:text-white",
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/35",
  "sm:px-3.5 sm:text-sm",
);

export function LandingNav({ className, current = "/" }: { className?: string; current?: string }) {
  const [isLifted, setIsLifted] = React.useState(false);
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

  return (
    <>
      <div aria-hidden="true" style={{ height: BAR_HEIGHT }} />

      <motion.header
        // `initial={false}` so a reload at a scrolled position snaps to lifted
        // instead of springing in behind the user.
        animate={isLifted ? "lifted" : "merged"}
        className={cn("group fixed inset-x-0 top-0 z-50", className)}
        data-state={isLifted ? "lifted" : "merged"}
        initial={false}
        style={{ paddingInline: BAR_INSET_X, paddingTop: BAR_INSET_TOP }}
        transition={spring}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10"
          style={{ height: BAND_HEIGHT }}
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
                <span className="font-instrument-serif text-3xl leading-none text-white">
                  Skecher-ui
                </span>
              </Link>
            </motion.div>

            <motion.ul
              className="flex items-center gap-0.5 rounded-xl bg-[#171717] px-1 py-1"
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
          </motion.nav>
        </motion.div>
      </motion.header>
    </>
  );
}

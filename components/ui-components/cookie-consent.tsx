"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type CookieConsentChoice = "accept" | "reject";

export type CookieConsentProps = {
  className?: string;
  style?: CSSProperties;
  title?: string;
  description?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  confirmLabel?: string;
  undoLabel?: string;
  /** Omit to hide the policy link. Supply your site's actual cookie policy URL. */
  policyHref?: string;
  policyLabel?: string;
  /** Controlled visibility. Update via onOpenChange after confirmation. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires once on Confirm. Persistence and tracking belong to the caller. */
  onConsent?: (choice: CookieConsentChoice) => void;
  /** Fires after the card has finished exiting. Useful for restoring focus. */
  onDismiss?: () => void;
};

// Matches the existing --ease-sidebar token and the Animate skill's UI ease-out.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SPLIT_DELAY = 0.04;
const SPLIT_DURATION = 0.18;
const IDENTITY = "translate(0%, 0%) rotate(0deg)";
const WHOLE =
  "M190 46 C203 39 214 45 222 51 C236 50 244 57 247 65 C260 70 262 80 255 87 C266 97 258 108 247 111 C244 122 233 125 220 124 C209 133 194 132 179 130 C165 131 154 126 150 122 C135 123 128 115 126 107 C116 102 116 94 121 86 C114 76 122 65 132 64 C136 53 145 50 156 52 C165 42 178 43 190 46Z";
const LEFT =
  "M190 46 L181 65 L192 78 L178 91 L189 111 L179 130 C165 131 154 126 150 122 C135 123 128 115 126 107 C116 102 116 94 121 86 C114 76 122 65 132 64 C136 53 145 50 156 52 C165 42 178 43 190 46Z";
const RIGHT =
  "M190 46 C203 39 214 45 222 51 C236 50 244 57 247 65 C260 70 262 80 255 87 C266 97 258 108 247 111 C244 122 233 125 220 124 C209 133 194 132 179 130 L189 111 L178 91 L192 78 L181 65Z";
const LEFT_CHIPS =
  "M137 79L146 74L152 79L144 86Z M154 105L164 100L170 105L161 112Z M163 60L171 56L177 61L169 66Z";
const RIGHT_CHIPS =
  "M209 62L219 57L226 62L216 69Z M220 98L230 93L237 99L227 105Z M201 113L209 109L215 114L207 119Z";
const LEFT_MARKS = "M128 95L135 91M150 120L155 116M165 83L169 80";
const RIGHT_MARKS = "M236 80L240 77M208 88L212 85M232 117L236 114";
const GRID =
  Array.from({ length: 17 }, (_, i) => `M${i * 24} 0V202`).join(" ") +
  " " +
  Array.from({ length: 9 }, (_, i) => `M0 ${i * 24}H380`).join(" ");
const CRUMBS = [
  {
    id: "upper-left",
    left: "48%",
    top: "37%",
    apex: "translate(-10px, -36px) rotate(-20deg)",
    landing: "translate(-18px, -24px) rotate(-45deg)",
  },
  {
    id: "upper-right",
    left: "50%",
    top: "38%",
    apex: "translate(14px, -43px) rotate(35deg)",
    landing: "translate(24px, -29px) rotate(75deg)",
  },
  {
    id: "lower",
    left: "49%",
    top: "53%",
    apex: "translate(1px, 16px) rotate(20deg)",
    landing: "translate(2px, 36px) rotate(45deg)",
  },
] as const;
 
export function CookieConsent({
  open,
  defaultOpen = true,
  onOpenChange,
  onConsent,
  onDismiss,
  ...props
}: CookieConsentProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const returnFocus = useRef<HTMLElement | null>(null);
  const visible = open ?? internalOpen;

  const close = () => {
    if (open === undefined) setInternalOpen(false);
    onOpenChange?.(false);
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        // Do not steal focus if the user has already moved elsewhere on the page.
        if (document.activeElement === document.body && returnFocus.current?.isConnected) {
          returnFocus.current.focus({ preventScroll: true });
        }
        returnFocus.current = null;
        onDismiss?.();
      }}
    >
      {visible ? (
        <CookieConsentCard
          {...props}
          key="cookie-consent"
          onConsent={onConsent}
          onComplete={close}
          onFocusFromOutside={(element) => {
            returnFocus.current = element;
          }}
        />
      ) : null}
    </AnimatePresence>
  );
}

function CookieConsentCard({
  className,
  style,
  title = "May we use cookies?",
  description = "We use cookies to remember your preferences and understand how you use this site.",
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  confirmLabel = "Confirm",
  undoLabel = "Undo choice",
  policyHref,
  policyLabel = "Cookie policy",
  onConsent,
  onComplete,
  onFocusFromOutside,
}: Omit<CookieConsentProps, "open" | "defaultOpen" | "onOpenChange" | "onDismiss"> & {
  onComplete: () => void;
  onFocusFromOutside: (element: HTMLElement) => void;
}) {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<Element | null>(null);
  const choiceRef = useRef<CookieConsentChoice | null>(null);
  const completed = useRef(false);
  const reducedMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const titleId = useId();
  const descriptionId = useId();
  const pendingTitleId = useId();
  const pendingDescriptionId = useId();

  const finishBreak = () => {
    if (isPresent && choiceRef.current && !completed.current) setReady(true);
  };

  const choose = (nextChoice: CookieConsentChoice) => {
    if (!isPresent || choiceRef.current || completed.current) return;
    choiceRef.current = nextChoice;
    pendingFocus.current = document.activeElement;
    // Freeze the actual frame before changing the artwork or controls.
    setLockedHeight(cardRef.current?.offsetHeight ?? null);
    setReady(Boolean(reducedMotion));
    setChoice(nextChoice);
  };

  const confirm = () => {
    if (!isPresent || !ready || !choiceRef.current || completed.current) return;
    completed.current = true;
    try {
      onConsent?.(choiceRef.current);
    } finally {
      onComplete();
    }
  };

  const undo = () => {
    if (!isPresent || completed.current) return;
    choiceRef.current = null;
    setChoice(null);
    setReady(false);
    setLockedHeight(null);
  };

  useEffect(() => {
    if (choice && reducedMotion) setReady(true);
  }, [choice, reducedMotion]);

  useEffect(() => {
    if (
      ready &&
      choice &&
      (document.activeElement === pendingFocus.current || document.activeElement === document.body)
    ) {
      confirmRef.current?.focus({ preventScroll: true });
    }
  }, [ready, choice]);

  const buttonClass =
    "min-h-11 min-w-0 rounded-lg border border-[#243acb] px-3 py-2 text-sm font-semibold leading-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#243acb] disabled:cursor-default";
  const displayFont = 'var(--cookie-font-display, "Space Grotesk"), sans-serif';
  const morphTransition = { duration: reducedMotion ? 0 : 0.22, ease: EASE_OUT };

  return (
    <motion.section
      ref={cardRef}
      aria-busy={choice !== null && !ready}
      aria-describedby={choice ? pendingDescriptionId : descriptionId}
      aria-labelledby={choice ? pendingTitleId : titleId}
      className={cn(
        "relative w-[380px] max-w-full overflow-hidden break-words rounded-2xl border-0 border-[#8591ce] bg-[#f5f4ea] text-[#202b72]   selection:bg-[#d8dcf0] selection:text-[#202b72]",
        className,
      )}
      style={{
        fontFamily: 'var(--cookie-font-body, "DM Sans"), sans-serif',
        ...style,
        ...(lockedHeight ? { height: lockedHeight } : {}),
      }}
      initial={{ opacity: 0, transform: reducedMotion ? "none" : "translateY(12px)" }}
      animate={{ opacity: 1, transform: reducedMotion ? "none" : "translateY(0px)" }}
      exit={{ opacity: 0, transform: reducedMotion ? "none" : "translateY(12px)" }}
      transition={{ duration: reducedMotion ? 0.12 : 0.18, ease: EASE_OUT }}
      onFocusCapture={(event) => {
        const previous = event.relatedTarget;
        if (previous instanceof HTMLElement && !event.currentTarget.contains(previous)) {
          onFocusFromOutside(previous);
        }
      }}
    >
      <motion.div
        initial={false}
        animate={{ transform: choice ? "scale(1.16)" : "scale(1)" }}
        style={{ transformOrigin: "50% 0%" }}
        transition={morphTransition}
      >
        <CookieArtwork
          breaking={choice !== null}
          reducedMotion={Boolean(reducedMotion)}
          onBreakComplete={finishBreak}
        />
      </motion.div>
      <div className="relative px-6 pt-6">
        {/* Keep the original copy in flow so the outer frame never changes height. */}
        <motion.div
          aria-hidden={choice !== null}
          initial={false}
          animate={{ opacity: choice ? 0 : 1 }}
          transition={{ duration: 0.12, ease: EASE_OUT }}
        >
          <h2
            className="text-[26px] font-semibold leading-8 tracking-[-0.03em]"
            id={titleId}
            style={{ fontFamily: displayFont }}
          >
            {title}
          </h2>
          <p className="mt-2 text-[15px] leading-[22px] text-[#4c5685]" id={descriptionId}>
            {description}
          </p>
        </motion.div>
        <motion.div
          aria-hidden={choice === null}
          className="absolute inset-x-6 top-6"
          initial={false}
          animate={{
            opacity: choice ? 1 : 0,
            transform: choice ? "translateY(28px)" : "translateY(0px)",
          }}
          transition={{ ...morphTransition, opacity: { duration: 0.12 } }}
        >
          <h2
            className="text-[26px] font-semibold leading-8 tracking-[-0.03em]"
            id={pendingTitleId}
            style={{ fontFamily: displayFont }}
          >
            {choice === "reject" ? "Reject cookies?" : "Accept cookies?"}
          </h2>
          <p className="mt-2 text-[15px] leading-[22px] text-[#4c5685]" id={pendingDescriptionId}>
            Confirm to save your preference.
          </p>
        </motion.div>
      </div>
      <div className="relative flex gap-3 px-6 pb-5 pt-5" style={{ fontFamily: displayFont }}>
        {(["reject", "accept"] as const).map((side) => {
          const isConfirm = choice === side;
          const isUndo = choice !== null && !isConfirm;
          const isPrimary = isConfirm || (choice === null && side === "accept");

          return (
            <motion.button
              key={side}
              ref={isConfirm ? confirmRef : undefined}
              aria-label={
                isUndo
                  ? undoLabel
                  : isConfirm
                    ? `${confirmLabel} ${side === "reject" ? "rejection" : "acceptance"}`
                    : undefined
              }
              layout={!reducedMotion}
              className={cn(
                buttonClass,
                "flex items-center justify-center",
                isPrimary
                  ? "bg-[#243acb] text-[#f5f4ea] [@media(hover:hover)]:enabled:hover:bg-[#1d2fa6]"
                  : "bg-[#f5f4ea] text-[#243acb] [@media(hover:hover)]:enabled:hover:bg-[#e7e8ef]",
              )}
              style={{ flex: isUndo ? "0 0 44px" : "1 1 0%", borderRadius: 8 }}
              disabled={!isPresent || completed.current || (isConfirm && !ready)}
              onClick={choice ? (isConfirm ? confirm : undo) : () => choose(side)}
              transition={morphTransition}
              type="button"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={isUndo ? "undo" : isConfirm ? "confirm" : side}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.08 }}
                >
                  {isUndo ? (
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      focusable="false"
                    >
                      <path
                        d="M5 5L13 13M13 5L5 13"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : isConfirm ? (
                    confirmLabel
                  ) : side === "reject" ? (
                    rejectLabel
                  ) : (
                    acceptLabel
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      {policyHref ? (
        <div className="relative -mt-2 px-6 pb-5 text-center">
          <a
            className="inline-flex min-h-6 items-center rounded-sm text-[13px] leading-[18px] text-[#4c5685] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#243acb]"
            href={policyHref}
          >
            {policyLabel}
          </a>
        </div>
      ) : null}
    </motion.section>
  );
}

function CookieArtwork({
  breaking,
  reducedMotion,
  onBreakComplete,
}: {
  breaking: boolean;
  reducedMotion: boolean;
  onBreakComplete: () => void;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[380/202] w-full overflow-hidden bg-[#efeee5]"
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 380 202"
        fill="none"
        focusable="false"
      >
        <path d={GRID} stroke="#D8DCF0" strokeWidth="0.8" />
        <path
          d="M85 134L185 80L292 136L190 191Z"
          fill="#D8DCF0"
          stroke="#7885C8"
          strokeWidth="1.3"
        />
        <path d="M85 134V143L190 200V191Z" fill="#A5AFE4" stroke="#7885C8" strokeWidth="1.3" />
        <path d="M190 191L292 136V145L190 200Z" fill="#BFC6E9" stroke="#7885C8" strokeWidth="1.3" />
        <ellipse cx="190" cy="143" rx="62" ry="22" fill="#8997D8" opacity="0.35" />
        <path
          d="M73 60V77M65 68H81M295 95V106M290 101H301"
          stroke="#243ACB"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M278 42L284 47L279 53L273 48Z" fill="#A5AFE4" stroke="#243ACB" strokeWidth="1.3" />
      </svg>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: breaking ? 0 : 1 }}
        transition={{ duration: 0.08, delay: breaking || reducedMotion ? 0 : SPLIT_DURATION }}
      >
        <CookieShape
          outline={WHOLE}
          chips={`${LEFT_CHIPS} ${RIGHT_CHIPS}`}
          marks={`${LEFT_MARKS}${RIGHT_MARKS}`}
        />
      </motion.div>
      {/* HTML wrappers keep transforms accelerated and scale with the SVG's viewBox. */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "40.79% 39.6%" }}
        initial={false}
        animate={{
          opacity: breaking ? 1 : 0,
          transform: breaking ? "translate(-4.47%, -3.96%) rotate(-8deg)" : IDENTITY,
        }}
        transition={{
          duration: reducedMotion ? 0 : SPLIT_DURATION,
          delay: breaking && !reducedMotion ? SPLIT_DELAY : 0,
          ease: EASE_OUT,
          opacity: { duration: 0, delay: breaking || reducedMotion ? 0 : SPLIT_DURATION },
        }}
        onAnimationComplete={() => {
          if (breaking) onBreakComplete();
        }}
      >
        <CookieShape outline={LEFT} chips={LEFT_CHIPS} marks={LEFT_MARKS} />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "58.68% 41.09%" }}
        initial={false}
        animate={{
          opacity: breaking ? 1 : 0,
          transform: breaking ? "translate(5%, -2.48%) rotate(9deg)" : IDENTITY,
        }}
        transition={{
          duration: reducedMotion ? 0 : SPLIT_DURATION,
          delay: breaking && !reducedMotion ? SPLIT_DELAY : 0,
          ease: EASE_OUT,
          opacity: { duration: 0, delay: breaking || reducedMotion ? 0 : SPLIT_DURATION },
        }}
      >
        <CookieShape outline={RIGHT} chips={RIGHT_CHIPS} marks={RIGHT_MARKS} />
      </motion.div>
      {CRUMBS.map((crumb) => (
        <motion.div
          className="absolute size-2 border border-[#243acb] bg-[#a5afe4]"
          key={crumb.id}
          style={{
            left: crumb.left,
            top: crumb.top,
            visibility: breaking && !reducedMotion ? "visible" : "hidden",
          }}
          initial={false}
          animate={{
            opacity: breaking ? [0, 1, 0] : 0,
            transform: breaking
              ? ["translate(0px, 0px) rotate(0deg)", crumb.apex, crumb.landing]
              : "translate(0px, 0px) rotate(0deg)",
          }}
          transition={{
            duration: 0.26,
            delay: SPLIT_DELAY,
            ease: EASE_OUT,
            transform: { times: [0, 0.55, 1] },
            opacity: { times: [0, 0.15, 1] },
          }}
        />
      ))}
    </div>
  );
}

function CookieShape({ outline, chips, marks }: { outline: string; chips: string; marks: string }) {
  return (
    <svg className="size-full" viewBox="0 0 380 202" fill="none" focusable="false">
      <path
        d={outline}
        transform="translate(0 13)"
        fill="#A5AFE4"
        stroke="#243ACB"
        strokeWidth="1.6"
      />
      <path d={outline} fill="#F5F4EA" stroke="#243ACB" strokeWidth="1.6" />
      <path d={chips} fill="#243ACB" />
      <path d={marks} stroke="#7885C8" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

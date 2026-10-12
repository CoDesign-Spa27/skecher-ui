"use client";

import { RefreshCw } from "lucide-react";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { useEffect, useId, useRef, useState } from "react";

import { CookieConsent, type CookieConsentChoice } from "@/components/ui-components/cookie-consent";

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--cookie-font-body" });
const displayFont = Space_Grotesk({ subsets: ["latin"], variable: "--cookie-font-display" });

export function CookieConsentPreview() {
  const [open, setOpen] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [, setChoice] = useState<CookieConsentChoice | null>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const replayRequested = useRef(false);
  const policyId = useId();

  useEffect(() => {
    if (dismissed && document.activeElement === document.body) {
      replayRef.current?.focus({ preventScroll: true });
    }
  }, [dismissed]);

  useEffect(() => {
    if (open && replayRequested.current) {
      replayRequested.current = false;
      popupRef.current?.querySelector("button")?.focus({ preventScroll: true });
    }
  }, [open]);

  return (
    <div
      className={`${bodyFont.variable} ${displayFont.variable} flex flex-col gap-5 w-full max-w-[620px]`}
      style={{ fontFamily: "var(--cookie-font-body), sans-serif" }}
    >
      <div className="flex min-h-[450px] w-full items-center justify-center" ref={popupRef}>
        <CookieConsent
          open={open}
          onOpenChange={setOpen}
          onConsent={setChoice}
          onDismiss={() => {
            setDismissed(true);
          }}
          policyHref={`#${policyId}`}
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <button
          className="inline-flex min-h-8 items-center gap-2 rounded-lg border  px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#243acb] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!dismissed}
          onClick={() => {
            replayRequested.current = true;
            setChoice(null);
            setDismissed(false);
            setOpen(true);
          }}
          ref={replayRef}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Restart
        </button>
      </div>
    </div>
  );
}

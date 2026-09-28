"use client";

import { init } from "@plausible-analytics/tracker";
import { useEffect } from "react";

let started = false;

export function PlausibleAnalytics({ domain }: { domain?: string }) {
  useEffect(() => {
    if (started || !domain) return;
    started = true;
    init({ domain });
  }, [domain]);

  return null;
}

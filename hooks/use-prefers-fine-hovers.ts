"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

export function usePrefersFineHover() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}

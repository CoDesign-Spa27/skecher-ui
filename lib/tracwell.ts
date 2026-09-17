import { createTracwell, type TracwellClient } from "tracwell";

let client: TracwellClient | undefined;

export function getTracwell(): TracwellClient | undefined {
  if (typeof document === "undefined" || process.env.NODE_ENV !== "production") {
    return undefined;
  }

  client ??= createTracwell({
    projectKey: "tw_live_3382d2be608c4c8e97845fbe1a6d0c0a",
    collectionMode: "product",
    consent: "granted",
    respectDoNotTrack: true,
  });

  return client;
}

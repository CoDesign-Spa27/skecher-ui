import { createTracwell, type TracwellClient } from "tracwell";

let client: TracwellClient | undefined;

export function getTracwell(): TracwellClient | undefined {
  const projectKey = process.env.TRACWELL_PROJECT_KEY;

  if (typeof document === "undefined" || process.env.NODE_ENV !== "production" || !projectKey) {
    return undefined;
  }

  client ??= createTracwell({
    projectKey,
    collectionMode: "product",
    consent: "granted",
    respectDoNotTrack: true,
  });

  return client;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Config = {
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  installationType: "cli" | "manual";
};

type ConfigStore = Config & {
  setConfig: (config: Partial<Config>) => void;
};

export const useConfig = create<ConfigStore>()(
  persist(
    (set) => ({
      installationType: "cli",
      packageManager: "npm",
      setConfig: (config) => set(config),
    }),
    {
      name: "config",
    },
  ),
);

"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

export type PreviewControlValue = string | number | boolean;

type SuperIslandLayoutState = {
  animated: boolean;
  manualOpen: boolean;
  previewValues: Record<string, PreviewControlValue>;
  previewOverlayRoot: HTMLDivElement | null;
  resetPreviewValues: () => void;
  setManualOpen: (open: boolean, options?: { animated?: boolean }) => void;
  setPreviewOverlayRoot: (node: HTMLDivElement | null) => void;
  setPreviewValue: (key: string, value: PreviewControlValue) => void;
};

const SuperIslandLayoutContext = React.createContext<SuperIslandLayoutState | null>(null);

export function SuperIslandLayoutProvider({ children }: { children: React.ReactNode }) {
  const [panelState, setPanelState] = React.useState({ animated: true, manualOpen: false });
  const [previewValues, setPreviewValues] = React.useState<Record<string, PreviewControlValue>>({});
  const [previewOverlayRoot, setPreviewOverlayRootState] = React.useState<HTMLDivElement | null>(
    null,
  );

  const setManualOpen = React.useCallback(
    (manualOpen: boolean, options?: { animated?: boolean }) => {
      setPanelState({ animated: options?.animated ?? true, manualOpen });
    },
    [],
  );

  const setPreviewValue = React.useCallback((key: string, value: PreviewControlValue) => {
    setPreviewValues((current) => {
      if (Object.is(current[key], value)) {
        return current;
      }

      return { ...current, [key]: value };
    });
  }, []);

  const resetPreviewValues = React.useCallback(() => setPreviewValues({}), []);
  const setPreviewOverlayRoot = React.useCallback(
    (node: HTMLDivElement | null) => setPreviewOverlayRootState(node),
    [],
  );

  const value = React.useMemo(
    () => ({
      ...panelState,
      previewOverlayRoot,
      previewValues,
      resetPreviewValues,
      setManualOpen,
      setPreviewOverlayRoot,
      setPreviewValue,
    }),
    [
      panelState,
      previewOverlayRoot,
      previewValues,
      resetPreviewValues,
      setManualOpen,
      setPreviewOverlayRoot,
      setPreviewValue,
    ],
  );

  return (
    <SuperIslandLayoutContext.Provider value={value}>{children}</SuperIslandLayoutContext.Provider>
  );
}

export function useSuperIslandLayout() {
  return React.useContext(SuperIslandLayoutContext);
}

/**
 * Keeps interactive preview props scoped to the current docs route. The hook is
 * safe outside the workbench provider so isolated previews can reuse the same
 * component and simply fall back to their defaults.
 */
export function usePreviewControl<T extends PreviewControlValue>(name: string, fallback: T) {
  const pathname = usePathname();
  const context = React.useContext(SuperIslandLayoutContext);
  const key = `${pathname}:${name}`;
  const value = (context?.previewValues[key] as T | undefined) ?? fallback;
  const setValue = React.useCallback(
    (nextValue: T) => context?.setPreviewValue(key, nextValue),
    [context, key],
  );

  return [value, setValue] as const;
}

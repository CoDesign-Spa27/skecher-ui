"use client";

import * as React from "react";

type SuperIslandLayoutState = {
  animated: boolean;
  manualOpen: boolean;
  previewOverlayRoot: HTMLDivElement | null;
  setManualOpen: (open: boolean, options?: { animated?: boolean }) => void;
  setPreviewOverlayRoot: (node: HTMLDivElement | null) => void;
};

const SuperIslandLayoutContext = React.createContext<SuperIslandLayoutState | null>(null);

export function SuperIslandLayoutProvider({ children }: { children: React.ReactNode }) {
  const [panelState, setPanelState] = React.useState({ animated: true, manualOpen: false });
  const [previewOverlayRoot, setPreviewOverlayRootState] = React.useState<HTMLDivElement | null>(
    null,
  );

  const setManualOpen = React.useCallback(
    (manualOpen: boolean, options?: { animated?: boolean }) => {
      setPanelState({ animated: options?.animated ?? true, manualOpen });
    },
    [],
  );

  const setPreviewOverlayRoot = React.useCallback(
    (node: HTMLDivElement | null) => setPreviewOverlayRootState(node),
    [],
  );

  const value = React.useMemo(
    () => ({
      ...panelState,
      previewOverlayRoot,
      setManualOpen,
      setPreviewOverlayRoot,
    }),
    [panelState, previewOverlayRoot, setManualOpen, setPreviewOverlayRoot],
  );

  return (
    <SuperIslandLayoutContext.Provider value={value}>{children}</SuperIslandLayoutContext.Provider>
  );
}

export function useSuperIslandLayout() {
  return React.useContext(SuperIslandLayoutContext);
}

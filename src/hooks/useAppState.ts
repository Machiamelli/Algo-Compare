import { useState, useCallback } from "react";
import { AppMode } from "../types";

/**
 * Hook for managing app-level state
 * Maps to electron/state/executionState.cjs execution flags
 */
export function useAppState() {
  const [appState, setAppState] = useState<AppMode>("IDLE");
  const [activeTab, setActiveTab] = useState<"preview" | "results" | "status">(
    "preview",
  );

  const transitionTo = useCallback((state: AppMode) => {
    setAppState(state);
  }, []);

  const goToTab = useCallback((tab: "preview" | "results" | "status") => {
    setActiveTab(tab);
  }, []);

  return {
    appState,
    activeTab,
    transitionTo,
    goToTab,
    setActiveTab,
  };
}

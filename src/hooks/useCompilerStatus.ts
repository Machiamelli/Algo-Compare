import { useState, useEffect, useCallback } from "react";
import { compilerService } from "../services/compilerService";
import { CompilerDetectionResult } from "../services/api";

/**
 * Hook for managing compiler detection state
 * Maps to electron/state/executionState.cjs compiler detection state
 */
export function useCompilerStatus() {
  const [status, setStatus] = useState<CompilerDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);

    const result = await compilerService.getStatus();

    if (result.success && result.data) {
      setStatus(result.data);
    }

    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);

    const result = await compilerService.refresh();

    if (result.success && result.data) {
      setStatus(result.data);
    }

    setLoading(false);
  }, []);

  // Load on mount
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return {
    status,
    loading,
    refresh,
  };
}

import { useState, useCallback, useEffect } from "react";
import { comparisonService } from "../services/comparisonService";
import { ComparisonResult, Progress, Config } from "../types";

/**
 * Hook for managing comparison execution state
 * Maps to electron/state/executionState.cjs execution state
 */
export function useComparison() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress>({
    stage: "",
    current: 0,
    total: 0,
    startTime: null,
  });
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const start = useCallback(async (config: Config) => {
    setRunning(true);
    setResult(null);
    setProgress({
      stage: "Initializing...",
      current: 0,
      total: 0,
      startTime: Date.now(),
      testsPassed: 0,
    });

    // Subscribe to progress updates
    comparisonService.onProgress((data) => {
      setProgress((prev) => {
        if (data.stage === "passed") {
          return { ...prev, testsPassed: (prev.testsPassed || 0) + 1 };
        }
        return {
          ...prev,
          stage: data.stage,
          current: data.current || prev.current,
          total: data.total || prev.total,
          mode: data.mode || prev.mode,
        };
      });
    });

    try {
      const res = await comparisonService.start({
        timeLimit: config.timeLimit,
        mode: config.mode,
      });

      // Remove listener immediately after result
      comparisonService.removeProgressListener();

      if (res.success) {
        setResult(res as any);
      } else {
        // Check if it's a comparison failure (has failureType)
        if (res.failureType) {
          setResult(res as any);
        } else {
          // System error - create a fallback result so UI can show it
          const fallbackResult: ComparisonResult = {
            success: false,
            failureType: "RUNTIME_ERROR",
            failedSlot: (res as any).failedSlot || undefined,
            error: res.error || "Comparison failed",
            stderr: (res as any).stderr || res.error || "Comparison failed",
            totalTests: 0,
            testsPassed: 0,
          };
          setResult(fallbackResult);
        }
      }
    } catch (err) {
      comparisonService.removeProgressListener();
    } finally {
      // Use double RAF to ensure UI updates smoothly
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setRunning(false);
        });
      });
    }
  }, []);

  const stop = useCallback(async () => {
    await comparisonService.stop();
    comparisonService.removeProgressListener();
    setRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      comparisonService.removeProgressListener();
    };
  }, []);

  return {
    running,
    progress,
    result,
    start,
    stop,
  };
}

import {
  getElectronAPI,
  ElectronAPI,
  ApiResponse,
  ComparisonConfig,
  ProgressData,
} from "./api";
import { ComparisonResult } from "../types";

/**
 * Comparison execution service
 * Maps to electron/handlers/executionHandlers.cjs
 */
class ComparisonService {
  private _api: ElectronAPI | null | undefined = undefined;

  private get api(): ElectronAPI | null {
    if (this._api === undefined) {
      this._api = getElectronAPI();
    }
    return this._api;
  }

  /**
   * Start comparison execution
   */
  async start(
    config: ComparisonConfig,
  ): Promise<ApiResponse<ComparisonResult>> {
    if (!this.api) {
      return { success: false, error: "Electron API not available" };
    }

    try {
      return await this.api.startComparison(config);
    } catch (error) {
      console.error("Failed to start comparison:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Stop comparison execution
   */
  async stop(): Promise<ApiResponse<void>> {
    if (!this.api) {
      return { success: false, error: "Electron API not available" };
    }

    try {
      return await this.api.stopComparison();
    } catch (error) {
      console.error("Failed to stop comparison:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (data: ProgressData) => void): void {
    if (!this.api) return;
    this.api.onComparisonProgress(callback);
  }

  /**
   * Unsubscribe from progress updates
   */
  removeProgressListener(): void {
    if (!this.api) return;
    this.api.removeComparisonProgressListener();
  }
}

export const comparisonService = new ComparisonService();

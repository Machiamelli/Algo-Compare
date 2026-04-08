import {
  getElectronAPI,
  ElectronAPI,
  ApiResponse,
  CompilerDetectionResult,
} from "./api";

/**
 * Compiler detection service
 * Maps to electron/handlers/compilerHandlers.cjs
 */
class CompilerService {
  private _api: ElectronAPI | null | undefined = undefined;

  private get api(): ElectronAPI | null {
    if (this._api === undefined) {
      this._api = getElectronAPI();
    }
    return this._api;
  }

  /**
   * Get compiler status (cached or fresh)
   */
  async getStatus(): Promise<ApiResponse<CompilerDetectionResult>> {
    if (!this.api) {
      return { success: false, error: "Electron API not available" };
    }

    try {
      return await this.api.getCompilerStatus();
    } catch (error) {
      console.error("Failed to get compiler status:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Force refresh compiler detection
   */
  async refresh(): Promise<ApiResponse<CompilerDetectionResult>> {
    if (!this.api) {
      return { success: false, error: "Electron API not available" };
    }

    try {
      return await this.api.refreshCompilers();
    } catch (error) {
      console.error("Failed to refresh compilers:", error);
      return { success: false, error: String(error) };
    }
  }
}

export const compilerService = new CompilerService();

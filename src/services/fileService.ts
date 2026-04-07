import { getElectronAPI, ElectronAPI, ApiResponse } from "./api";
import { FileData, UploadedFiles } from "../types";

/**
 * File management service
 * Maps to electron/handlers/fileHandlers.cjs
 */
class FileService {
  private _api: ElectronAPI | null | undefined = undefined;

  private get api(): ElectronAPI | null {
    if (this._api === undefined) {
      this._api = getElectronAPI();
    }
    return this._api;
  }

  /**
   * Save edited file content to temp slot
   */
  async saveEditedFile(
    filePath: string,
    content: string,
  ): Promise<ApiResponse<void>> {
    if (!this.api) {
      return { success: false, error: "Electron API not available" };
    }

    try {
      return await this.api.saveEditedFile(filePath, content);
    } catch (error) {
      console.error("Failed to save edited file:", error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Open native file dialog with remembered directory
   */
  async openFileDialog(
    slot: keyof UploadedFiles,
    extensions: string[],
  ): Promise<ApiResponse<FileData>> {
    if (!this.api) {
      return { success: false, error: "Electron API not available" };
    }

    try {
      return await this.api.openFileDialog(slot, extensions);
    } catch (error) {
      console.error("Failed to open file dialog:", error);
      return { success: false, error: String(error) };
    }
  }
}

export const fileService = new FileService();

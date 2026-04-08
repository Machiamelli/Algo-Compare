/**
 * Type-safe wrapper for Electron IPC API
 * Maps to preload.cjs contextBridge API
 */

import { ComparisonResult, FileData } from "../types";

export interface ElectronAPI {
  platform: string;

  // Detection APIs
  getCompilerStatus: () => Promise<ApiResponse<CompilerDetectionResult>>;
  refreshCompilers: () => Promise<ApiResponse<CompilerDetectionResult>>;

  // File APIs - Pass File objects directly (like original code)
  readFile: (filePath: string) => Promise<ApiResponse<string>>;
  saveEditedFile: (
    filePath: string,
    content: string,
  ) => Promise<ApiResponse<void>>;
  openFileDialog: (
    slot: string,
    extensions: string[],
  ) => Promise<ApiResponse<FileData>>;
  // Execution APIs
  startComparison: (
    config: ComparisonConfig,
  ) => Promise<ApiResponse<ComparisonResult>>;
  stopComparison: () => Promise<ApiResponse<void>>;

  // Progress listener
  onComparisonProgress: (callback: (data: ProgressData) => void) => void;
  removeComparisonProgressListener: () => void;

  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onMaximizedStatus: (callback: (status: boolean) => void) => void;
  removeMaximizedStatusListener: () => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  failureType?: string;
  totalTests?: number;
  testsPassed?: number;
}

export interface CompilerDetectionResult {
  python: CompilerInfo[];
  cpp: CompilerInfo[];
  java: CompilerInfo[];
}

export interface CompilerInfo {
  path: string;
  version: string;
}

export interface ComparisonConfig {
  timeLimit: number;
  mode: "static" | "generator";
}

export interface ProgressData {
  stage: string;
  current?: number;
  total?: number;
  mode?: string;
}

/**
 * Get typed Electron API
 */
export function getElectronAPI(): ElectronAPI | null {
  const api = (window as any).electronAPI;
  if (!api) {
    console.error("Electron API not available");
    return null;
  }
  return api as ElectronAPI;
}

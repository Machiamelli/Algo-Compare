export type AppMode = "IDLE" | "READY" | "RUNNING";

export type Language = "cpp" | "java" | "python";

export interface FileData {
  path: string;
  fileName: string;
  language: Language | null;
  size: number;
}

export interface UploadedFiles {
  testedSolution: FileData | null;
  bruteForce: FileData | null;
  testCases: FileData | null;
}

export interface Config {
  timeLimit: number;
  mode: "static" | "generator";
}

export interface Progress {
  stage: string;
  current: number;
  total: number;
  startTime: number | null;
  slot?: string;
  mode?: "static" | "generator";
  testsPassed?: number;
}

export interface ComparisonResult {
  success: boolean;
  failureType?: "TLE" | "MISMATCH" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
  testCase?: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
  stderr?: string;
  exitCode?: number;
  failedSlot?: "A" | "B" | "generator";
  totalTests?: number;
  testsPassed?: number;
}

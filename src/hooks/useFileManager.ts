import { useState, useCallback } from "react";
import { fileService } from "../services/fileService";
import { FileData, UploadedFiles } from "../types";

const EXTENSION_MAP: Record<keyof UploadedFiles, string[]> = {
  testedSolution: ["cpp", "py", "java"],
  bruteForce: ["cpp", "py", "java"],
  testCases: ["txt", "java", "py", "cpp"],
};

/**
 * Hook for managing uploaded files state
 * Maps to electron/state/executionState.cjs uploaded files state
 */
export function useFileManager() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    testedSolution: null,
    bruteForce: null,
    testCases: null,
  });
  const [previewFile, setPreviewFile] = useState<{
    slot: keyof UploadedFiles;
    data: FileData;
  } | null>(null);

  /**
   * Open native file dialog for a slot and upload the selected file.
   * Returns the result so the caller can handle errors/cancellation.
   */
  const uploadFile = useCallback(async (slot: keyof UploadedFiles) => {
    const extensions = EXTENSION_MAP[slot];
    const result = await fileService.openFileDialog(slot, extensions);

    if (result?.success && result.data) {
      setUploadedFiles((prev) => ({ ...prev, [slot]: result.data }));
      setPreviewFile({ slot, data: result.data! });
      return result;
    }

    // If cancelled, just return silently
    if (result?.error === "cancelled") {
      return result;
    }

    // Propagate error
    if (!result?.success && result?.error) {
      throw new Error(result.error);
    }

    return result;
  }, []);

  const previewSlot = useCallback(
    (slot: keyof UploadedFiles) => {
      const file = uploadedFiles[slot];
      if (file) {
        setPreviewFile({ slot, data: file });
      }
    },
    [uploadedFiles],
  );

  const isReady = useCallback(() => {
    return !!(
      uploadedFiles.testedSolution &&
      uploadedFiles.bruteForce &&
      uploadedFiles.testCases
    );
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    previewFile,
    uploadFile,
    previewSlot,
    isReady,
    setPreviewFile,
  };
}

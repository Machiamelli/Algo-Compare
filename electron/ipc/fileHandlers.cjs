const fs = require("fs").promises;
const path = require("path");
const { dialog, BrowserWindow } = require("electron");
const {
  initTempDirs,
  copyFileToSlot,
  detectLanguage,
  getTempDir,
  setUploadedFile,
} = require("../utils/index.cjs");
const { getLastDir, setLastDir } = require("../utils/store.cjs");

/**
 * Read file content for preview
 */
async function handleReadFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return {
      success: true,
      data: content,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Save edited file content back to the temp slot path
 */
async function handleSaveEditedFile(data) {
  try {
    const { filePath: targetPath, content } = data;
    // Security: only allow writing inside the temp directory
    const tempDir = getTempDir();
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(path.resolve(tempDir))) {
      return {
        success: false,
        error: "Cannot write outside temp directory",
      };
    }
    await fs.writeFile(resolved, content, "utf-8");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Open native file dialog with remembered directory.
 * @param {Object} data - { slot: string, extensions: string[] }
 * slot: "testedSolution" | "bruteForce" | "testCases"
 * extensions: e.g. ["cpp", "py", "java"]
 */
async function handleOpenFileDialog(data) {
  try {
    const { slot, extensions } = data;

    const slotMap = {
      testedSolution: {
        diskSlot: "B",
        key: "testedSolution",
        requireLanguage: true,
      },
      bruteForce: { diskSlot: "A", key: "bruteForce", requireLanguage: true },
      testCases: { diskSlot: null, key: "testCases", requireLanguage: false },
    };
    const info = slotMap[slot];
    if (!info) {
      return { success: false, error: "Invalid slot: " + slot };
    }

    const lastDir = getLastDir();
    const win = BrowserWindow.getFocusedWindow();

    const result = await dialog.showOpenDialog(win, {
      defaultPath: lastDir || undefined,
      filters: [{ name: "Source Files", extensions }],
      properties: ["openFile"],
    });

    if (result.canceled || !result.filePaths.length) {
      return { success: false, error: "cancelled" };
    }

    const selectedPath = result.filePaths[0];
    setLastDir(path.dirname(selectedPath));

    const fileName = path.basename(selectedPath);
    const size = (await fs.stat(selectedPath)).size;
    const language = detectLanguage(fileName);

    if (info.requireLanguage && !language) {
      return {
        success: false,
        error: "Unsupported file type. Use .cpp, .java, or .py files.",
      };
    }

    await initTempDirs();

    let targetPath;
    if (info.diskSlot) {
      // Slot A or B
      const copyResult = await copyFileToSlot(
        selectedPath,
        fileName,
        info.diskSlot,
      );
      if (!copyResult.success) return copyResult;
      targetPath = copyResult.path;
    } else {
      // testCases — goes to temp root
      const tempDir = getTempDir();
      targetPath = path.join(tempDir, fileName);
      await fs.copyFile(selectedPath, targetPath);
    }

    const fileInfo = {
      path: targetPath,
      fileName,
      language,
      size,
    };

    setUploadedFile(info.key, fileInfo);

    return {
      success: true,
      data: fileInfo,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleReadFile,
  handleSaveEditedFile,
  handleOpenFileDialog,
};

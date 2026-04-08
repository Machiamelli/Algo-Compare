const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const { getTempDir, getSlotDirs } = require("../utils/paths.cjs");

const execAsync = promisify(exec);

/**
 * Initialize temp directories
 */
async function initTempDirs() {
  const tempDir = getTempDir();
  const { slotA, slotB } = getSlotDirs();

  try {
    // Create temp directory if it doesn't exist
    await fs.mkdir(tempDir, { recursive: true });

    // Create slot directories
    await fs.mkdir(slotA, { recursive: true });
    await fs.mkdir(slotB, { recursive: true });

    return { success: true, tempDir, slotA, slotB };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Clean entire temp directory
 */
async function cleanTempDirs() {
  const tempDir = getTempDir();

  try {
    // Check if temp directory exists
    try {
      await fs.access(tempDir);
    } catch {
      // Directory doesn't exist, nothing to clean
      return { success: true };
    }

    // Remove entire temp directory recursively
    await fs.rm(tempDir, { recursive: true, force: true });

    console.log("✓ Temp directory cleaned:", tempDir);
    return { success: true };
  } catch (error) {
    console.error("Error cleaning temp directory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Copy uploaded file to slot directory (from source path, no binary blob)
 */
async function copyFileToSlot(sourcePath, fileName, slot) {
  const { slotA, slotB } = getSlotDirs();
  const targetDir = slot === "A" ? slotA : slotB;
  const targetPath = path.join(targetDir, fileName);

  try {
    await fs.copyFile(sourcePath, targetPath);
    return { success: true, path: targetPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Rename Java file based on class name
 * This handles the Java Option A approach: rename uploaded file to match public class name
 */
async function renameJavaFile(filePath, className) {
  try {
    const dir = path.dirname(filePath);
    const newPath = path.join(dir, `${className}.java`);

    // If already correctly named, skip
    if (filePath === newPath) {
      return { success: true, path: filePath };
    }

    await fs.rename(filePath, newPath);
    return { success: true, path: newPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file extension
 */
function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

/**
 * Normalize path by resolving symlinks and standardizing separators
 */
async function normalizePath(filePath) {
  if (!filePath) return null;
  try {
    const realPath = await fs.realpath(filePath);
    return path.normalize(realPath);
  } catch {
    return path.normalize(filePath);
  }
}

/**
 * Detect language from file extension
 */
function detectLanguage(fileName) {
  const ext = getFileExtension(fileName);

  switch (ext) {
    case ".cpp":
    case ".cc":
    case ".cxx":
      return "cpp";
    case ".java":
      return "java";
    case ".py":
      return "python";
    default:
      return null;
  }
}

module.exports = {
  initTempDirs,
  cleanTempDirs,
  copyFileToSlot,
  renameJavaFile,
  fileExists,
  detectLanguage,
  normalizePath,
  execAsync,
};

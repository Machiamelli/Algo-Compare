const path = require("path");
const { app } = require("electron");

/**
 * Get temp directory for the app.
 * Uses the system temp dir in production (ASAR is read-only),
 * and a local ./temp folder in development.
 */
function getTempDir() {
  if (app.isPackaged) {
    return path.join(app.getPath("temp"), "AlgoCompare");
  }
  return path.join(__dirname, "../../temp");
}

/**
 * Get slot directories for code execution
 */
function getSlotDirs() {
  const tempDir = getTempDir();
  return {
    slotA: path.join(tempDir, "slot1"),
    slotB: path.join(tempDir, "slot2"),
  };
}

module.exports = {
  getTempDir,
  getSlotDirs,
};

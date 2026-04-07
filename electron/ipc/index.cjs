const { ipcMain } = require("electron");
const CHANNELS = require("./channels.cjs");
const {
  handleGetCompilerStatus,
  handleRefreshCompilers,
} = require("./compilerHandlers.cjs");
const {
  handleReadFile,
  handleSaveEditedFile,
  handleOpenFileDialog,
} = require("./fileHandlers.cjs");
const {
  handleStartComparison,
  handleStopComparison,
} = require("./executionHandlers.cjs");

/**
 * Register all IPC handlers
 */
function registerIpcHandlers() {
  // ========== Compiler Detection ==========
  ipcMain.handle(CHANNELS.COMPILER.GET_STATUS, handleGetCompilerStatus);
  ipcMain.handle(CHANNELS.COMPILER.REFRESH, handleRefreshCompilers);

  // ========== File Operations ==========
  ipcMain.handle(CHANNELS.FILE.READ, (event, filePath) =>
    handleReadFile(filePath),
  );
  ipcMain.handle(CHANNELS.FILE.SAVE_EDITED, (event, data) =>
    handleSaveEditedFile(data),
  );
  ipcMain.handle(CHANNELS.FILE.OPEN_DIALOG, (event, data) =>
    handleOpenFileDialog(data),
  );

  // ========== Execution ==========
  ipcMain.handle(CHANNELS.EXECUTION.START_COMPARISON, handleStartComparison);
  ipcMain.handle(CHANNELS.EXECUTION.STOP_COMPARISON, handleStopComparison);
}

module.exports = { registerIpcHandlers };

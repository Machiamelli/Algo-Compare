const { contextBridge, ipcRenderer } = require("electron");

let progressCallback = null;
let progressHandler = null;
let maximizedHandler = null;

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,

  // Detection APIs
  getCompilerStatus: () => ipcRenderer.invoke("get-compiler-status"),
  refreshCompilers: () => ipcRenderer.invoke("refresh-compilers"),

  // File APIs — preload extracts path before sending over IPC
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  saveEditedFile: (filePath, content) =>
    ipcRenderer.invoke("save-edited-file", { filePath, content }),
  openFileDialog: (slot, extensions) =>
    ipcRenderer.invoke("open-file-dialog", { slot, extensions }),
  // Execution APIs
  startComparison: (config) => ipcRenderer.invoke("start-comparison", config),
  stopComparison: () => ipcRenderer.invoke("stop-comparison"),

  // Progress event listener — removes previous listener before adding new one
  onComparisonProgress: (callback) => {
    // Remove previous listener if any to prevent accumulation
    if (progressHandler) {
      ipcRenderer.removeListener("comparison-progress", progressHandler);
    }
    progressCallback = callback;
    progressHandler = (_event, data) => {
      if (progressCallback) {
        progressCallback(data);
      }
    };
    ipcRenderer.on("comparison-progress", progressHandler);
  },

  removeComparisonProgressListener: () => {
    if (progressHandler) {
      ipcRenderer.removeListener("comparison-progress", progressHandler);
      progressHandler = null;
    }
    progressCallback = null;
  },

  // Window controls
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  maximizeWindow: () => ipcRenderer.send("window-maximize"),
  closeWindow: () => ipcRenderer.send("window-close"),

  // Maximized status — removes previous listener before adding new one
  onMaximizedStatus: (callback) => {
    if (maximizedHandler) {
      ipcRenderer.removeListener("window-maximized-status", maximizedHandler);
    }
    maximizedHandler = (_event, status) => callback(status);
    ipcRenderer.on("window-maximized-status", maximizedHandler);
  },

  removeMaximizedStatusListener: () => {
    if (maximizedHandler) {
      ipcRenderer.removeListener("window-maximized-status", maximizedHandler);
      maximizedHandler = null;
    }
  },
});

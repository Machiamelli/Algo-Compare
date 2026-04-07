const { app, BrowserWindow } = require("electron");
const path = require("path");
const { registerIpcHandlers } = require("./ipc/index.cjs");

function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar", "build", "icon.png")
    : path.join(__dirname, "..", "build", "icon.png");

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenu(null);

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:3000");
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Notify renderer about maximize/unmaximize
  win.on("maximize", () => {
    win.webContents.send("window-maximized-status", true);
  });

  win.on("unmaximize", () => {
    win.webContents.send("window-maximized-status", false);
  });
}

const { ipcMain } = require("electron");

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  // Window control handlers
  ipcMain.on("window-minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.on("window-maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    }
  });

  ipcMain.on("window-close", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

const { cleanTempDirs } = require("./utils/fileManager.cjs");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

let isCleaning = false;
app.on("will-quit", async (e) => {
  if (isCleaning) return;
  e.preventDefault();
  isCleaning = true;
  await cleanTempDirs();
  app.quit();
});

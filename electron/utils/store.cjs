const fs = require("fs");
const path = require("path");
const { app } = require("electron");

/**
 * Lightweight JSON settings store — CJS-safe, no external deps.
 * Stores settings in the OS user data dir (e.g. ~/.config/algocompare/).
 */
function getStorePath() {
  const userDataDir = app.getPath("userData");
  return path.join(userDataDir, "algocompare-settings.json");
}

function readStore() {
  try {
    const raw = fs.readFileSync(getStorePath(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(data) {
  try {
    const storePath = getStorePath();
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write settings:", err.message);
  }
}

function getLastDir() {
  return readStore().lastOpenDir || "";
}

function setLastDir(dir) {
  const data = readStore();
  data.lastOpenDir = dir;
  writeStore(data);
}

module.exports = { getLastDir, setLastDir };

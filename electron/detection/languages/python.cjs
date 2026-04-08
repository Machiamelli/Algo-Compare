const {
  checkInPath,
  validateExecutable,
  getVersion,
  fileExists,
  readDirSafe,
  normalizePath,
} = require("../detector.cjs");
const path = require("path");
const os = require("os");

const homeDir = os.homedir();
const isWindows = process.platform === "win32";

/**
 * Detect Python installations
 */
async function detectPython() {
  const detected = [];
  const seen = new Set();

  const addIfNew = async (execPath, source) => {
    if (!execPath) return false;

    const normalizedPath = await normalizePath(execPath);
    if (seen.has(normalizedPath)) return false;

    const exists = await fileExists(normalizedPath);
    if (!exists) return false;

    const validation = await validateExecutable(normalizedPath);
    if (!validation.valid) return false;

    // Ensure it's Python 3
    if (!validation.output.toLowerCase().includes("python 3")) {
      return false;
    }

    seen.add(normalizedPath);
    const version = await getVersion(normalizedPath);
    detected.push({
      path: normalizedPath,
      version,
      source,
    });
    return true;
  };

  // 1. Check PATH first
  const python3InPath = await checkInPath("python3");
  if (python3InPath) {
    await addIfNew(python3InPath, "PATH");
  }

  const pythonInPath = await checkInPath("python");
  if (pythonInPath) {
    await addIfNew(pythonInPath, "PATH");
  }

  // 2. Platform-specific detection
  if (isWindows) {
    // Standard Python installations
    const standardPaths = [
      "C:\\Python39\\python.exe",
      "C:\\Python310\\python.exe",
      "C:\\Python311\\python.exe",
      "C:\\Python312\\python.exe",
      "C:\\Python313\\python.exe",
      path.join(
        homeDir,
        "AppData\\Local\\Programs\\Python\\Python39\\python.exe",
      ),
      path.join(
        homeDir,
        "AppData\\Local\\Programs\\Python\\Python310\\python.exe",
      ),
      path.join(
        homeDir,
        "AppData\\Local\\Programs\\Python\\Python311\\python.exe",
      ),
      path.join(
        homeDir,
        "AppData\\Local\\Programs\\Python\\Python312\\python.exe",
      ),
      path.join(
        homeDir,
        "AppData\\Local\\Programs\\Python\\Python313\\python.exe",
      ),
    ];

    for (const pyPath of standardPaths) {
      await addIfNew(pyPath, "Standard Install");
    }

    // Anaconda/Miniconda
    const condaPaths = [
      path.join(homeDir, "anaconda3\\python.exe"),
      path.join(homeDir, "miniconda3\\python.exe"),
      "C:\\ProgramData\\Anaconda3\\python.exe",
      "C:\\ProgramData\\Miniconda3\\python.exe",
    ];

    for (const condaPath of condaPaths) {
      await addIfNew(condaPath, "Anaconda/Miniconda");
    }

    // Microsoft Store Python
    const storePath = path.join(
      homeDir,
      "AppData\\Local\\Microsoft\\WindowsApps\\python3.exe",
    );
    await addIfNew(storePath, "Microsoft Store");
  } else {
    // Linux
    // Standard locations
    const standardPaths = ["/usr/bin/python3", "/usr/local/bin/python3"];

    for (const pyPath of standardPaths) {
      await addIfNew(pyPath, "System");
    }

    // pyenv installations
    const pyenvRoot = process.env.PYENV_ROOT || path.join(homeDir, ".pyenv");
    const pyenvVersionsDir = path.join(pyenvRoot, "versions");
    const pyenvVersions = await readDirSafe(pyenvVersionsDir);

    for (const ver of pyenvVersions) {
      const pyPath = path.join(pyenvVersionsDir, ver, "bin", "python3");
      await addIfNew(pyPath, "pyenv");
    }

    // Anaconda/Miniconda
    const condaPaths = [
      path.join(homeDir, "anaconda3", "bin", "python"),
      path.join(homeDir, "miniconda3", "bin", "python"),
    ];

    for (const condaPath of condaPaths) {
      await addIfNew(condaPath, "Anaconda/Miniconda");
    }
  }

  return detected;
}

module.exports = { detectPython };

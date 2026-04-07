const { execAsync, fileExists, normalizePath } = require("../utils/index.cjs");
const fs = require("fs").promises;

/**
 * Check if executable exists in PATH and return its full path
 */
async function checkInPath(executable) {
  try {
    const command =
      process.platform === "win32"
        ? `where ${executable}`
        : `which ${executable}`;

    const { stdout } = await execAsync(command, { timeout: 5000 });
    const firstPath = stdout.trim().split(/\r?\n/)[0];

    if (firstPath) {
      const exists = await fileExists(firstPath);
      if (exists) return firstPath;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate an executable by running it with optional args
 */
async function validateExecutable(execPath, args = "--version") {
  try {
    const exists = await fileExists(execPath);
    if (!exists) return { valid: false, output: "" };

    const command = args ? `"${execPath}" ${args}` : `"${execPath}"`;
    const { stdout, stderr } = await execAsync(command, { timeout: 10000 });

    return { valid: true, output: stdout || stderr };
  } catch (error) {
    // Some tools output to stderr and exit with non-zero
    if (error.stderr) {
      return { valid: true, output: error.stderr };
    }
    if (error.stdout) {
      return { valid: true, output: error.stdout };
    }
    return { valid: false, output: "" };
  }
}

/**
 * Get version string from executable
 */
async function getVersion(execPath, args = "--version") {
  try {
    const { stdout, stderr } = await execAsync(`"${execPath}" ${args}`, {
      timeout: 5000,
    });
    const output = stdout || stderr;
    const versionMatch = output.match(/(\d+\.\d+(?:\.\d+)?)/);
    return versionMatch ? versionMatch[1] : "Unknown";
  } catch {
    return "Unknown";
  }
}

/**
 * Read directory safely, returns empty array on error
 */
async function readDirSafe(dirPath) {
  try {
    const exists = await fileExists(dirPath);
    if (!exists) return [];
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

module.exports = {
  execAsync,
  validateExecutable,
  getVersion,
  fileExists,
  readDirSafe,
  checkInPath,
  normalizePath,
};

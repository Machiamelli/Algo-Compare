const {
  checkInPath,
  validateExecutable,
  getVersion,
  execAsync,
  fileExists,
  readDirSafe,
  normalizePath,
} = require("../detector.cjs");
const path = require("path");

const isWindows = process.platform === "win32";

/**
 * Detect C++ compilers (g++, clang++, MSVC)
 */
async function detectCpp() {
  const detected = [];
  const seen = new Set();

  const addIfNew = async (execPath, compiler, source, priority) => {
    if (!execPath) return false;

    const normalizedPath = await normalizePath(execPath);
    if (seen.has(normalizedPath)) return false;

    const exists = await fileExists(normalizedPath);
    if (!exists) return false;

    // MSVC cl.exe needs empty args, others use --version
    const args = compiler === "cl" ? "" : "--version";
    const validation = await validateExecutable(normalizedPath, args);
    if (!validation.valid) return false;

    seen.add(normalizedPath);

    const version =
      compiler === "cl"
        ? await getMSVCVersion(normalizedPath)
        : await getVersion(normalizedPath);

    detected.push({
      path: normalizedPath,
      version,
      compiler,
      source,
      priority,
    });
    return true;
  };

  // 1. Check for g++ in PATH
  const gppInPath = await checkInPath("g++");
  if (gppInPath) {
    await addIfNew(gppInPath, "g++", "PATH", 1);
  }

  // 2. Check for clang++ in PATH
  const clangInPath = await checkInPath("clang++");
  if (clangInPath) {
    await addIfNew(clangInPath, "clang++", "PATH", 2);
  }

  // 3. Platform-specific detection
  if (isWindows) {
    // MinGW, MSYS2, Cygwin
    const mingwPaths = [
      { path: "C:\\MinGW\\bin\\g++.exe", source: "MinGW" },
      { path: "C:\\msys64\\mingw64\\bin\\g++.exe", source: "MSYS2" },
      { path: "C:\\msys64\\ucrt64\\bin\\g++.exe", source: "MSYS2" },
      { path: "C:\\cygwin64\\bin\\g++.exe", source: "Cygwin" },
      { path: "C:\\cygwin\\bin\\g++.exe", source: "Cygwin" },
    ];

    for (const { path: gppPath, source } of mingwPaths) {
      await addIfNew(gppPath, "g++", source, 1);
    }

    // LLVM/Clang on Windows
    const clangPaths = [
      "C:\\Program Files\\LLVM\\bin\\clang++.exe",
      "C:\\Program Files (x86)\\LLVM\\bin\\clang++.exe",
    ];

    for (const clangPath of clangPaths) {
      await addIfNew(clangPath, "clang++", "LLVM", 2);
    }

    // MSVC (cl.exe)
    const msvcPath = await findMSVC();
    if (msvcPath) {
      await addIfNew(msvcPath, "cl", "MSVC", 3);
    }
  } else {
    // Linux standard locations
    const linuxPaths = [
      { path: "/usr/bin/g++", compiler: "g++", priority: 1 },
      { path: "/usr/local/bin/g++", compiler: "g++", priority: 1 },
      { path: "/usr/bin/clang++", compiler: "clang++", priority: 2 },
      { path: "/usr/local/bin/clang++", compiler: "clang++", priority: 2 },
    ];

    for (const { path: cppPath, compiler, priority } of linuxPaths) {
      await addIfNew(cppPath, compiler, "System", priority);
    }
  }

  // Sort by priority (g++ first, then clang++, then MSVC)
  detected.sort((a, b) => a.priority - b.priority);

  return detected;
}

/**
 * Find MSVC cl.exe on Windows
 */
async function findMSVC() {
  if (!isWindows) return null;

  // Try using vswhere to find Visual Studio installations
  const vswherePath =
    "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe";
  const vswhereExists = await fileExists(vswherePath);

  if (vswhereExists) {
    try {
      const { stdout } = await execAsync(
        `"${vswherePath}" -latest -property installationPath`,
        { timeout: 10000 },
      );
      const vsPath = stdout.trim();

      if (vsPath) {
        const vcToolsPath = path.join(vsPath, "VC\\Tools\\MSVC");
        const toolsets = await readDirSafe(vcToolsPath);

        if (toolsets.length > 0) {
          // Sort to get the latest version
          toolsets.sort().reverse();
          const latestToolset = toolsets[0];

          const clPath = path.join(
            vcToolsPath,
            latestToolset,
            "bin\\Hostx64\\x64\\cl.exe",
          );

          const exists = await fileExists(clPath);
          if (exists) return clPath;
        }
      }
    } catch {
      // Fall through to manual search
    }
  }

  // Fallback: Check common MSVC paths
  const commonMSVCPaths = [
    "C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Tools\\MSVC",
    "C:\\Program Files\\Microsoft Visual Studio\\2022\\Professional\\VC\\Tools\\MSVC",
    "C:\\Program Files\\Microsoft Visual Studio\\2022\\Enterprise\\VC\\Tools\\MSVC",
    "C:\\Program Files\\Microsoft Visual Studio\\2019\\Community\\VC\\Tools\\MSVC",
    "C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\VC\\Tools\\MSVC",
  ];

  for (const basePath of commonMSVCPaths) {
    const toolsets = await readDirSafe(basePath);
    if (toolsets.length === 0) continue;

    toolsets.sort().reverse();

    for (const toolset of toolsets) {
      const clPath = path.join(basePath, toolset, "bin\\Hostx64\\x64\\cl.exe");
      const exists = await fileExists(clPath);
      if (exists) return clPath;
    }
  }

  return null;
}

/**
 * Get MSVC version (cl.exe outputs to stderr when run with no args)
 */
async function getMSVCVersion(clPath) {
  try {
    // cl.exe with no args outputs version info to stderr and exits with error
    await execAsync(`"${clPath}"`, { timeout: 5000 });
    return "Unknown";
  } catch (error) {
    if (error.stderr) {
      const versionMatch = error.stderr.match(/Version\s+(\d+\.\d+\.\d+)/i);
      return versionMatch ? versionMatch[1] : "Unknown";
    }
    return "Unknown";
  }
}

module.exports = { detectCpp };

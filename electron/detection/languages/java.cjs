const {
  checkInPath,
  validateExecutable,
  execAsync,
  fileExists,
  readDirSafe,
  normalizePath,
} = require("../detector.cjs");
const path = require("path");
const os = require("os");

const homeDir = os.homedir();
const isWindows = process.platform === "win32";

/**
 * Detect Java JDK installations
 */
async function detectJava() {
  const detected = [];
  const seen = new Set();

  const addIfNew = async (javacPath, source) => {
    if (!javacPath) return false;

    const normalizedJavacPath = await normalizePath(javacPath);
    if (seen.has(normalizedJavacPath)) return false;

    const exists = await fileExists(normalizedJavacPath);
    if (!exists) return false;

    const validation = await validateExecutable(normalizedJavacPath, "-version");
    if (!validation.valid) return false;

    seen.add(normalizedJavacPath);
    const version = await getJavaVersion(normalizedJavacPath);
    const javaPath = normalizedJavacPath.replace(
      /javac(\.exe)?$/,
      isWindows ? "java.exe" : "java",
    );

    detected.push({
      path: normalizedJavacPath,
      javacPath: normalizedJavacPath,
      javaPath,
      version,
      source,
    });
    return true;
  };

  // 1. Check JAVA_HOME environment variable first
  const javaHome = process.env.JAVA_HOME;
  if (javaHome) {
    const javacPath = path.join(
      javaHome,
      "bin",
      isWindows ? "javac.exe" : "javac",
    );
    await addIfNew(javacPath, "JAVA_HOME");
  }

  // 2. Check PATH
  const javacInPath = await checkInPath("javac");
  if (javacInPath) {
    await addIfNew(javacInPath, "PATH");
  }

  // 3. Platform-specific detection
  if (isWindows) {
    const basePaths = [
      "C:\\Program Files\\Java",
      "C:\\Program Files (x86)\\Java",
      "C:\\Program Files\\Eclipse Adoptium",
      "C:\\Program Files\\Amazon Corretto",
      "C:\\Program Files\\Microsoft",
      "C:\\Program Files\\Eclipse Foundation",
    ];

    for (const basePath of basePaths) {
      const jdkDirs = await readDirSafe(basePath);

      for (const jdkDir of jdkDirs) {
        if (!jdkDir.toLowerCase().includes("jdk")) continue;

        const javacPath = path.join(basePath, jdkDir, "bin", "javac.exe");
        const source = getJavaSource(basePath, jdkDir);
        await addIfNew(javacPath, source);
      }
    }
  } else {
    // Linux: /usr/lib/jvm
    const jvmPath = "/usr/lib/jvm";
    const jdkDirs = await readDirSafe(jvmPath);

    for (const jdkDir of jdkDirs) {
      const javacPath = path.join(jvmPath, jdkDir, "bin", "javac");
      const source = getJavaSource("", jdkDir);
      await addIfNew(javacPath, source);
    }

    // Linux: /usr/java (Oracle JDK)
    const oracleJavaPath = "/usr/java";
    const oracleDirs = await readDirSafe(oracleJavaPath);

    for (const jdkDir of oracleDirs) {
      const javacPath = path.join(oracleJavaPath, jdkDir, "bin", "javac");
      await addIfNew(javacPath, "Oracle JDK");
    }
  }

  // 4. User's .jdks directory (IDE installations)
  const jdksDir = path.join(homeDir, ".jdks");
  const jdkVersions = await readDirSafe(jdksDir);

  for (const jdkDir of jdkVersions) {
    const javacPath = path.join(
      jdksDir,
      jdkDir,
      "bin",
      isWindows ? "javac.exe" : "javac",
    );
    await addIfNew(javacPath, "IDE Installation");
  }

  return detected;
}

/**
 * Determine Java source/vendor from path
 */
function getJavaSource(basePath, jdkDir) {
  const combined = (basePath + jdkDir).toLowerCase();
  if (combined.includes("adoptium") || combined.includes("temurin"))
    return "Eclipse Adoptium";
  if (combined.includes("corretto")) return "Amazon Corretto";
  if (combined.includes("microsoft")) return "Microsoft OpenJDK";
  if (combined.includes("openjdk")) return "OpenJDK";
  return "Oracle JDK";
}

/**
 * Get Java version from javac (outputs to stderr)
 */
async function getJavaVersion(javacPath) {
  try {
    const { stdout, stderr } = await execAsync(`"${javacPath}" -version`, {
      timeout: 5000,
    });
    const output = stderr || stdout;
    const versionMatch = output.match(/javac\s+(\d+(?:\.\d+)*)/i);
    return versionMatch ? versionMatch[1] : "Unknown";
  } catch (error) {
    // javac -version exits with 0 but some wrappers behave differently
    if (error.stderr) {
      const versionMatch = error.stderr.match(/javac\s+(\d+(?:\.\d+)*)/i);
      return versionMatch ? versionMatch[1] : "Unknown";
    }
    return "Unknown";
  }
}

module.exports = { detectJava };
